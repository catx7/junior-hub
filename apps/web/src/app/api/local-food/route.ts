import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { createLocalFoodSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';
import { moderateFields } from '@/lib/content-moderation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {
      status: 'AVAILABLE',
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.localFood.findMany({
      where,
      include: {
        vendor: {
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

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    });
  } catch (error) {
    console.error('Get local food error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only providers can post food items
    if (authUser.role !== 'PROVIDER' && authUser.role !== 'ADMIN') {
      return forbiddenResponse('Only providers can list food items');
    }

    const body = await request.json();

    const validationResult = createLocalFoodSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    // Content moderation
    const moderation = moderateFields({
      Title: validationResult.data.title,
      Description: validationResult.data.description,
    });
    if (!moderation.isClean) {
      return validationErrorResponse([{ message: moderation.reason }]);
    }

    const item = await prisma.localFood.create({
      data: {
        ...validationResult.data,
        vendorId: authUser.id,
        images: [],
        status: 'AVAILABLE',
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ ...item, price: Number(item.price) }, { status: 201 });
  } catch (error) {
    console.error('Create local food error:', error);
    return serverErrorResponse();
  }
}
