import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { verifyIdToken, getUser } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID token is required',
          },
        },
        { status: 400 }
      );
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(idToken);
    const firebaseUser = await getUser(decodedToken.uid);

    // Check if user exists
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
    console.error('Social auth error:', error);
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
