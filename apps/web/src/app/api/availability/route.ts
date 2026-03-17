import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';
import { withLogging } from '@/lib/api-handler';
import '@/lib/db';

const createSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6).nullable().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  specificDate: z.string().datetime().nullable().optional(),
  isAvailable: z.boolean().default(true),
});

// GET - List availability slots for a user
export const GET = withLogging(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return validationErrorResponse([{ message: 'userId is required' }]);
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: { userId, isAvailable: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ data: slots });
  },
  { route: '/api/availability' }
);

// POST - Create availability slot
export const POST = withLogging(
  async (request: NextRequest) => {
    const user = await authenticate(request);
    if (!user) return unauthorizedResponse();

    try {
      const body = await request.json();
      const validation = createSlotSchema.safeParse(body);
      if (!validation.success) return validationErrorResponse(validation.error.errors);

      const data = validation.data;

      const slot = await prisma.availabilitySlot.create({
        data: {
          userId: user.id,
          dayOfWeek: data.dayOfWeek ?? null,
          startTime: data.startTime,
          endTime: data.endTime,
          specificDate: data.specificDate ? new Date(data.specificDate) : null,
          isAvailable: data.isAvailable,
        },
      });

      return NextResponse.json({ data: slot }, { status: 201 });
    } catch (error) {
      return serverErrorResponse();
    }
  },
  { route: '/api/availability' }
);
