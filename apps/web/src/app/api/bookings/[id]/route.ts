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

const updateBookingSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  cancellationReason: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Get single booking
export const GET = withLogging(
  async (request: NextRequest, context) => {
    const { id } = context.params;
    const user = await authenticate(request);
    if (!user) return unauthorizedResponse();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        job: { select: { id: true, title: true, category: true, location: true } },
        client: { select: { id: true, name: true, avatar: true, phone: true } },
        provider: { select: { id: true, name: true, avatar: true, phone: true } },
      },
    });

    if (!booking) return notFoundResponse('Booking');
    if (booking.clientId !== user.id && booking.providerId !== user.id) return forbiddenResponse();

    return NextResponse.json({ data: { ...booking, totalPrice: Number(booking.totalPrice) } });
  },
  { route: '/api/bookings/[id]' }
);

// PATCH - Update booking status
export const PATCH = withLogging(
  async (request: NextRequest, context) => {
    const { id } = context.params;
    const user = await authenticate(request);
    if (!user) return unauthorizedResponse();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        job: { select: { id: true, title: true } },
        client: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
      },
    });

    if (!booking) return notFoundResponse('Booking');
    if (booking.clientId !== user.id && booking.providerId !== user.id) return forbiddenResponse();

    try {
      const body = await request.json();
      const validation = updateBookingSchema.safeParse(body);
      if (!validation.success) return validationErrorResponse(validation.error.errors);

      const { status, cancellationReason, notes } = validation.data;
      const updateData: any = {};

      if (status) {
        // Validate status transitions
        const validTransitions: Record<string, string[]> = {
          PENDING: ['CONFIRMED', 'CANCELLED'],
          CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
          IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
        };

        const allowed = validTransitions[booking.status] || [];
        if (!allowed.includes(status)) {
          return NextResponse.json(
            {
              error: {
                code: 'CONFLICT',
                message: `Cannot transition from ${booking.status} to ${status}`,
              },
            },
            { status: 409 }
          );
        }

        // Only provider can confirm; either party can cancel
        if (status === 'CONFIRMED' && booking.providerId !== user.id) {
          return forbiddenResponse('Only the provider can confirm bookings');
        }

        updateData.status = status;
        if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
        if (status === 'COMPLETED') updateData.completedAt = new Date();
        if (status === 'CANCELLED') {
          updateData.cancelledAt = new Date();
          updateData.cancellationReason = cancellationReason;
        }

        // Notify the other party
        const notifyUserId = user.id === booking.clientId ? booking.providerId : booking.clientId;
        await prisma.notification.create({
          data: {
            type: 'JOB_STATUS_CHANGED',
            title: `Booking ${status.toLowerCase()}`,
            body: `${user.name} ${status === 'CONFIRMED' ? 'confirmed' : status === 'COMPLETED' ? 'completed' : status === 'CANCELLED' ? 'cancelled' : 'updated'} the booking for: ${booking.job.title}`,
            data: { bookingId: booking.id, jobId: booking.job.id, status },
            userId: notifyUserId,
            jobId: booking.job.id,
          },
        });
      }

      if (notes !== undefined) updateData.notes = notes;

      const updated = await prisma.booking.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ data: { ...updated, totalPrice: Number(updated.totalPrice) } });
    } catch (error) {
      return serverErrorResponse();
    }
  },
  { route: '/api/bookings/[id]' }
);
