import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { z } from 'zod';
import {
  authenticate,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';
import { moderateFields } from '@/lib/content-moderation';

const createClothesItemSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  category: z.string(),
  size: z.string(),
  gender: z.enum(['Boy', 'Girl', 'Unisex']),
  condition: z.enum(['Like New', 'Good', 'Fair']),
  type: z.enum(['Sell', 'Donate']),
  price: z.number().min(0).max(10000).optional().nullable(),
  originalPrice: z.number().min(0).max(10000).optional().nullable(),
  images: z.array(z.string().url()).max(5).optional().default([]),
  location: z.string().min(3).max(200),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {
      status: 'AVAILABLE',
    };

    if (type && type !== 'All') {
      where.type = type;
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.clothesItem.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get clothes items error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    const validationResult = createClothesItemSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    // Content moderation: block contact info in title/description
    const moderation = moderateFields({
      Title: validationResult.data.title,
      Description: validationResult.data.description,
    });
    if (!moderation.isClean) {
      return validationErrorResponse([{ message: moderation.reason }]);
    }

    const item = await prisma.clothesItem.create({
      data: {
        ...validationResult.data,
        sellerId: authUser.id,
        status: 'AVAILABLE',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Create clothes item error:', error);
    return serverErrorResponse();
  }
}
