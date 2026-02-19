import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.localFood.findUnique({
      where: { id: params.id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
            createdAt: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!item) {
      return notFoundResponse('Food item');
    }

    return NextResponse.json({
      ...item,
      price: Number(item.price),
      orderCount: item._count.orders,
      _count: undefined,
    });
  } catch (error) {
    console.error('Get local food item error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const item = await prisma.localFood.findUnique({
      where: { id: params.id },
      select: { vendorId: true },
    });

    if (!item) {
      return notFoundResponse('Food item');
    }

    if (item.vendorId !== authUser.id && authUser.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    await prisma.localFood.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete local food error:', error);
    return serverErrorResponse();
  }
}
