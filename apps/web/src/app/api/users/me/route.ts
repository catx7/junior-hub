import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { updateProfileSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        bio: true,
        address: true,
        latitude: true,
        longitude: true,
        role: true,
        isVerified: true,
        rating: true,
        reviewCount: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: validationResult.data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        bio: true,
        address: true,
        latitude: true,
        longitude: true,
        role: true,
        isVerified: true,
        rating: true,
        reviewCount: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return serverErrorResponse();
  }
}
