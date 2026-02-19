import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { createFoodOrderSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';
import { moderateContent } from '@/lib/content-moderation';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const item = await prisma.localFood.findUnique({
      where: { id: params.id },
      select: { vendorId: true, status: true, price: true, title: true },
    });

    if (!item) {
      return notFoundResponse('Food item');
    }

    if (item.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'This item is not currently available' } },
        { status: 403 }
      );
    }

    // Cannot order own item
    if (item.vendorId === authUser.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Cannot order your own food item' } },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validationResult = createFoodOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    // Content moderation on message
    if (validationResult.data.message) {
      const moderation = moderateContent(validationResult.data.message);
      if (!moderation.isClean) {
        return validationErrorResponse([{ message: moderation.reason }]);
      }
    }

    const totalPrice = Number(item.price) * validationResult.data.quantity;

    const order = await prisma.foodOrder.create({
      data: {
        ...validationResult.data,
        foodItemId: params.id,
        customerId: authUser.id,
        totalPrice,
        status: 'PENDING',
      },
    });

    // Create conversation between customer and vendor
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: authUser.id } } },
          { participants: { some: { userId: item.vendorId } } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: authUser.id }, { userId: item.vendorId }],
          },
        },
      });
    }

    // Create initial message with order details
    const orderTypeLabel = validationResult.data.orderType === 'DELIVERY' ? 'Delivery' : 'Pickup';
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: authUser.id,
        content: `🍽️ Food Order: ${item.title}\n\nQuantity: ${validationResult.data.quantity}\nType: ${orderTypeLabel}\nTotal: $${totalPrice.toFixed(2)}${validationResult.data.message ? `\n\nNote: ${validationResult.data.message}` : ''}`,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Notify vendor
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'New food order',
        body: `${authUser.name} ordered ${validationResult.data.quantity}x ${item.title}`,
        data: { foodItemId: params.id, orderId: order.id, conversationId: conversation.id },
        userId: item.vendorId,
      },
    });

    return NextResponse.json(
      {
        ...order,
        totalPrice: Number(order.totalPrice),
        conversationId: conversation.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create food order error:', error);
    return serverErrorResponse();
  }
}
