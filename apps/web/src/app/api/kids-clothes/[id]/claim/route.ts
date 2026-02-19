import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const item = await prisma.clothesItem.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        sellerId: true,
        title: true,
      },
    });

    if (!item) {
      return notFoundResponse('Item');
    }

    if (item.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: { code: 'ITEM_NOT_AVAILABLE', message: 'This item is no longer available' } },
        { status: 400 }
      );
    }

    if (item.sellerId === authUser.id) {
      return NextResponse.json(
        { error: { code: 'OWN_ITEM', message: 'You cannot claim your own item' } },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.clothesItem.update({
      where: { id },
      data: {
        status: 'CLAIMED',
        claimedById: authUser.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Claim item error:', error);
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
      select: {
        id: true,
        status: true,
        claimedById: true,
      },
    });

    if (!item) {
      return notFoundResponse('Item');
    }

    if (item.status !== 'CLAIMED') {
      return NextResponse.json(
        { error: { code: 'NOT_CLAIMED', message: 'This item is not claimed' } },
        { status: 400 }
      );
    }

    if (item.claimedById !== authUser.id) {
      return NextResponse.json(
        { error: { code: 'NOT_YOUR_CLAIM', message: 'You did not claim this item' } },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.clothesItem.update({
      where: { id },
      data: {
        status: 'AVAILABLE',
        claimedById: null,
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Unclaim item error:', error);
    return serverErrorResponse();
  }
}
