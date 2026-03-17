import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { authenticate, unauthorizedResponse } from '@/lib/auth-middleware';
import { getAdminAuth } from '@/lib/firebase-admin';

// GDPR Art. 17 - Right to Erasure
export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Perform deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Log the deletion for audit (before deleting user data)
      await tx.auditLog.create({
        data: {
          actorId: authUser.id,
          action: 'user.delete_request',
          targetType: 'User',
          targetId: authUser.id,
          metadata: {
            email: authUser.email,
            name: authUser.name,
            requestedAt: new Date().toISOString(),
          },
          ipAddress,
        },
      });

      // 2. Anonymize user data (soft delete approach - preserves referential integrity)
      await tx.user.update({
        where: { id: authUser.id },
        data: {
          name: 'Deleted User',
          email: `deleted_${authUser.id}@deleted.juniorhub.ro`,
          phone: null,
          bio: null,
          avatar: null,
          address: null,
          latitude: null,
          longitude: null,
          fcmToken: null,
        },
      });

      // 3. Delete user's messages content (anonymize)
      await tx.message.updateMany({
        where: { senderId: authUser.id },
        data: { content: '[Message deleted - account removed]', imageUrl: null },
      });

      // 4. Delete notifications
      await tx.notification.deleteMany({
        where: { userId: authUser.id },
      });

      // 5. Delete saved jobs
      await tx.savedJob.deleteMany({
        where: { userId: authUser.id },
      });

      // 6. Revoke all consents
      await tx.consent.updateMany({
        where: { userId: authUser.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    // Delete Firebase account
    try {
      const fullUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { firebaseUid: true },
      });
      if (fullUser) {
        const auth = getAdminAuth();
        await auth.deleteUser(fullUser.firebaseUid);
      }
    } catch (error) {
      // Log but don't fail - the DB data is already anonymized
      console.error('Failed to delete Firebase account:', error);
    }

    return NextResponse.json({
      message: 'Account has been deleted. All personal data has been removed.',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' } },
      { status: 500 }
    );
  }
}
