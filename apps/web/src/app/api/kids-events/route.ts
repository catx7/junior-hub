import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { z } from 'zod';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';
import { moderateFields } from '@/lib/content-moderation';

const createEventSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  category: z.string(),
  ageRangeMin: z.number().int().min(0).max(18),
  ageRangeMax: z.number().int().min(0).max(18),
  date: z.coerce.date(),
  time: z.string(),
  location: z.string().min(3).max(200),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxParticipants: z.number().int().min(1).max(1000),
  price: z.number().min(0).max(10000),
  image: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {
      date: { gte: new Date() }, // Only future events
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

    const events = await prisma.kidsEvent.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only providers (and admins) can create events
    if (authUser.role !== 'PROVIDER' && authUser.role !== 'ADMIN') {
      return forbiddenResponse('Only providers can create events');
    }

    const body = await request.json();

    const validationResult = createEventSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    // Content moderation: block contact info
    const moderation = moderateFields({
      Title: validationResult.data.title,
      Description: validationResult.data.description,
    });
    if (!moderation.isClean) {
      return validationErrorResponse([{ message: moderation.reason }]);
    }

    const event = await prisma.kidsEvent.create({
      data: {
        ...validationResult.data,
        organizerId: authUser.id,
        currentParticipants: 0,
      },
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return serverErrorResponse();
  }
}
