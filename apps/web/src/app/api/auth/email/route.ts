import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { verifyIdToken, getUser } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Firebase authentication token required',
          },
        },
        { status: 401 }
      );
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(token);
    } catch {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired authentication token',
          },
        },
        { status: 401 }
      );
    }

    // Get Firebase user details
    const firebaseUser = await getUser(decodedToken.uid);

    // Check if user exists by Firebase UID
    let user = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    });

    let isNewUser = false;

    if (!user) {
      // Check by email
      user = await prisma.user.findUnique({
        where: { email: firebaseUser.email! },
      });

      if (user) {
        // Update existing user with Firebase UID
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: firebaseUser.uid },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: firebaseUser.email!,
            name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
            firebaseUid: firebaseUser.uid,
            avatar: firebaseUser.photoURL || null,
            isVerified: firebaseUser.emailVerified,
          },
        });
        isNewUser = true;

        // Create welcome notification with verification info
        await prisma.notification.create({
          data: {
            type: 'WELCOME',
            title: 'Welcome to JuniorHub!',
            body: 'To work on childcare or babysitting jobs, you need to complete identity verification. Go to Settings to get verified and unlock all features.',
            data: { action: 'verification' },
            userId: user.id,
          },
        });
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
      isNewUser,
    });
  } catch (error) {
    console.error('Email auth error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication failed',
        },
      },
      { status: 500 }
    );
  }
}
