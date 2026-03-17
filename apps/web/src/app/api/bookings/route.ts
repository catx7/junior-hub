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

const createBookingSchema = z.object({
  jobId: z.string().min(1),
  providerId: z.string().min(1),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  notes: z.string().optional(),
});

// GET - List bookings for current user
export const GET = withLogging(
  async (request: NextRequest) => {
    const user = await authenticate(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'client' or 'provider'

    const where: any = {};
    if (role === 'provider') {
      where.providerId = user.id;
    } else if (role === 'client') {
      where.clientId = user.id;
    } else {
      where.OR = [{ clientId: user.id }, { providerId: user.id }];
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { startDateTime: 'desc' },
      include: {
        job: { select: { id: true, title: true, category: true } },
        client: { select: { id: true, name: true, avatar: true } },
        provider: { select: { id: true, name: true, avatar: true } },
      },
    });

    const data = bookings.map((b) => ({
      ...b,
      totalPrice: Number(b.totalPrice),
    }));

    return NextResponse.json({ data });
  },
  { route: '/api/bookings' }
);

// POST - Create a booking
export const POST = withLogging(
  async (request: NextRequest) => {
    const user = await authenticate(request);
    if (!user) return unauthorizedResponse();

    try {
      const body = await request.json();
      const validation = createBookingSchema.safeParse(body);
      if (!validation.success) return validationErrorResponse(validation.error.errors);

      const { jobId, providerId, startDateTime, endDateTime, notes } = validation.data;

      // Verify the job exists
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, budget: true, currency: true },
      });

      if (!job) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Job not found' } },
          { status: 404 }
        );
      }

      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      const duration = Math.round((end.getTime() - start.getTime()) / 60000); // minutes

      const booking = await prisma.booking.create({
        data: {
          jobId,
          clientId: user.id,
          providerId,
          startDateTime: start,
          endDateTime: end,
          duration,
          totalPrice: job.budget || 0,
          currency: job.currency,
          notes,
          status: 'PENDING',
        },
        include: {
          job: { select: { id: true, title: true } },
          provider: { select: { id: true, name: true } },
        },
      });

      // Notify provider
      await prisma.notification.create({
        data: {
          type: 'NEW_OFFER',
          title: 'New booking request',
          body: `${user.name} requested a booking for: ${booking.job.title}`,
          data: { bookingId: booking.id, jobId },
          userId: providerId,
          jobId,
        },
      });

      return NextResponse.json(
        { data: { ...booking, totalPrice: Number(booking.totalPrice) } },
        { status: 201 }
      );
    } catch (error) {
      return serverErrorResponse();
    }
  },
  { route: '/api/bookings' }
);
