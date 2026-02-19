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

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    if (authUser.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const userId = params.id;
    const body = await request.json();

    const validationResult = updateRoleSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return notFoundResponse('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: validationResult.data.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    return serverErrorResponse();
  }
}
