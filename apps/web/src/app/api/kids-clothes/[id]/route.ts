import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { z } from 'zod';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

const updateClothesItemSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  gender: z.enum(['Boy', 'Girl', 'Unisex']).optional(),
  condition: z.enum(['Like New', 'Good', 'Fair']).optional(),
  type: z.enum(['Sell', 'Donate']).optional(),
  price: z.number().min(0).max(10000).optional().nullable(),
  originalPrice: z.number().min(0).max(10000).optional().nullable(),
  images: z.array(z.string()).min(1).max(5).optional(),
  location: z.string().min(3).max(200).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  status: z.enum(['AVAILABLE', 'CLAIMED', 'COMPLETED']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const item = await prisma.clothesItem.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
          },
        },
        claimedBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!item) {
      return notFoundResponse('Item');
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Get clothes item error:', error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const item = await prisma.clothesItem.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!item) {
      return notFoundResponse('Item');
    }

    if (item.sellerId !== authUser.id && authUser.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validationResult = updateClothesItemSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const updatedItem = await prisma.clothesItem.update({
      where: { id },
      data: validationResult.data,
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Update clothes item error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const item = await prisma.clothesItem.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!item) {
      return notFoundResponse('Item');
    }

    if (item.sellerId !== authUser.id && authUser.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    await prisma.clothesItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete clothes item error:', error);
    return serverErrorResponse();
  }
}
