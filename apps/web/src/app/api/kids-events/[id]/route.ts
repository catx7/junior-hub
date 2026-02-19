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

const updateEventSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(2000).optional(),
  category: z.string().optional(),
  ageRangeMin: z.number().int().min(0).max(18).optional(),
  ageRangeMax: z.number().int().min(0).max(18).optional(),
  date: z.coerce.date().optional(),
  time: z.string().optional(),
  location: z.string().min(3).max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxParticipants: z.number().int().min(1).max(1000).optional(),
  price: z.number().min(0).max(10000).optional(),
  image: z.string().url().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const event = await prisma.kidsEvent.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      return notFoundResponse('Event');
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Get event error:', error);
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

    const event = await prisma.kidsEvent.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!event) {
      return notFoundResponse('Event');
    }

    if (event.organizerId !== authUser.id && authUser.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validationResult = updateEventSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const updatedEvent = await prisma.kidsEvent.update({
      where: { id },
      data: validationResult.data,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
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

    const event = await prisma.kidsEvent.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!event) {
      return notFoundResponse('Event');
    }

    if (event.organizerId !== authUser.id && authUser.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    await prisma.kidsEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return serverErrorResponse();
  }
}
