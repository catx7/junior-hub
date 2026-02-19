import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { z } from 'zod';
import {
  authenticate,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

const registerSchema = z.object({
  childName: z.string().min(2).max(100),
  childAge: z.number().int().min(0).max(18),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const event = await prisma.kidsEvent.findUnique({
      where: { id },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      return notFoundResponse('Event');
    }

    // Check if event is full
    if (event._count.registrations >= event.maxParticipants) {
      return NextResponse.json(
        { error: { code: 'EVENT_FULL', message: 'This event is full' } },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: authUser.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_REGISTERED',
            message: 'You are already registered for this event',
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    // Check if child age is within event range
    const { childAge } = validationResult.data;
    if (childAge < event.ageRangeMin || childAge > event.ageRangeMax) {
      return NextResponse.json(
        {
          error: {
            code: 'AGE_OUT_OF_RANGE',
            message: `This event is for children aged ${event.ageRangeMin}-${event.ageRangeMax} years`,
          },
        },
        { status: 400 }
      );
    }

    // Create registration and update participant count
    const [registration] = await prisma.$transaction([
      prisma.eventRegistration.create({
        data: {
          eventId: id,
          userId: authUser.id,
          ...validationResult.data,
        },
        include: {
          event: {
            select: {
              title: true,
              date: true,
              time: true,
              location: true,
            },
          },
        },
      }),
      prisma.kidsEvent.update({
        where: { id },
        data: {
          currentParticipants: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Register for event error:', error);
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

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: authUser.id,
        },
      },
    });

    if (!registration) {
      return notFoundResponse('Registration');
    }

    // Delete registration and decrement participant count
    await prisma.$transaction([
      prisma.eventRegistration.delete({
        where: { id: registration.id },
      }),
      prisma.kidsEvent.update({
        where: { id },
        data: {
          currentParticipants: { decrement: 1 },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel registration error:', error);
    return serverErrorResponse();
  }
}
