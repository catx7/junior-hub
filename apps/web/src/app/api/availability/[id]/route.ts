import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';
import { withLogging } from '@/lib/api-handler';
import '@/lib/db';

const updateSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6).nullable().optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  specificDate: z.string().datetime().nullable().optional(),
  isAvailable: z.boolean().optional(),
});

// PATCH - Update availability slot
export const PATCH = withLogging(
  async (request: NextRequest, context) => {
    const { id } = context.params;
    const user = await authenticate(request);
    if (!user) return unauthorizedResponse();

    const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
    if (!slot) return notFoundResponse('Availability slot');
    if (slot.userId !== user.id) return forbiddenResponse();

    try {
      const body = await request.json();
      const validation = updateSlotSchema.safeParse(body);
      if (!validation.success) return validationErrorResponse(validation.error.errors);

      const updated = await prisma.availabilitySlot.update({
        where: { id },
        data: {
          ...validation.data,
          specificDate:
            validation.data.specificDate !== undefined
              ? validation.data.specificDate
                ? new Date(validation.data.specificDate)
                : null
              : undefined,
        },
      });

      return NextResponse.json({ data: updated });
    } catch (error) {
      return serverErrorResponse();
    }
  },
  { route: '/api/availability/[id]' }
);

// DELETE - Remove availability slot
export const DELETE = withLogging(
  async (request: NextRequest, context) => {
    const { id } = context.params;
    const user = await authenticate(request);
    if (!user) return unauthorizedResponse();

    const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
    if (!slot) return notFoundResponse('Availability slot');
    if (slot.userId !== user.id) return forbiddenResponse();

    await prisma.availabilitySlot.delete({ where: { id } });

    return NextResponse.json({ success: true });
  },
  { route: '/api/availability/[id]' }
);
