import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { authenticate, unauthorizedResponse } from '@/lib/auth-middleware';

// GDPR Art. 20 - Right to Data Portability
// Returns all user data in structured JSON format
export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Fetch all user data
    const [user, jobs, offers, reviews, messages, consents, events, clothes, foodListings] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: authUser.id },
          select: {
            id: true,
            email: true,
            name: true,
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
        }),
        prisma.job.findMany({
          where: { posterId: authUser.id },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            jobType: true,
            budget: true,
            currency: true,
            status: true,
            location: true,
            scheduledAt: true,
            createdAt: true,
          },
        }),
        prisma.offer.findMany({
          where: { providerId: authUser.id },
          select: {
            id: true,
            price: true,
            message: true,
            isAccepted: true,
            isRejected: true,
            createdAt: true,
            job: { select: { title: true } },
          },
        }),
        prisma.review.findMany({
          where: { OR: [{ authorId: authUser.id }, { targetId: authUser.id }] },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            authorId: true,
            targetId: true,
            job: { select: { title: true } },
          },
        }),
        prisma.message.findMany({
          where: { senderId: authUser.id },
          select: {
            id: true,
            content: true,
            createdAt: true,
            conversation: {
              select: {
                participants: {
                  select: { user: { select: { name: true } } },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1000, // Limit to prevent huge exports
        }),
        prisma.consent.findMany({
          where: { userId: authUser.id },
          select: {
            type: true,
            version: true,
            granted: true,
            grantedAt: true,
            revokedAt: true,
          },
        }),
        prisma.eventRegistration.findMany({
          where: { userId: authUser.id },
          select: {
            childName: true,
            childAge: true,
            notes: true,
            createdAt: true,
            event: { select: { title: true, date: true } },
          },
        }),
        prisma.clothesItem.findMany({
          where: { sellerId: authUser.id },
          select: {
            title: true,
            description: true,
            category: true,
            size: true,
            price: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.localFood.findMany({
          where: { vendorId: authUser.id },
          select: {
            title: true,
            description: true,
            category: true,
            price: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      exportFormat: 'GDPR Data Export - JuniorHub',
      profile: user,
      consents,
      jobsPosted: jobs,
      offersSubmitted: offers.map((o) => ({
        ...o,
        price: Number(o.price),
      })),
      reviews: reviews.map((r) => ({
        ...r,
        type: r.authorId === authUser.id ? 'written' : 'received',
      })),
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        sentAt: m.createdAt,
      })),
      eventRegistrations: events,
      clothesListings: clothes.map((c) => ({
        ...c,
        price: c.price ? Number(c.price) : null,
      })),
      foodListings: foodListings.map((f) => ({
        ...f,
        price: Number(f.price),
      })),
    };

    // Log the export for audit
    await prisma.auditLog.create({
      data: {
        actorId: authUser.id,
        action: 'user.data_export',
        targetType: 'User',
        targetId: authUser.id,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
      },
    });

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="juniorhub-data-export-${authUser.id}.json"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to export data' } },
      { status: 500 }
    );
  }
}
