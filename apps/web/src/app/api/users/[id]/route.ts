import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        address: true,
        rating: true,
        reviewCount: true,
        isVerified: true,
        role: true,
        lastActiveAt: true,
        createdAt: true,
        providerProfile: {
          select: {
            headline: true,
            yearsExperience: true,
            hourlyRate: true,
            currency: true,
            languages: true,
            certifications: true,
            ageRangeMin: true,
            ageRangeMax: true,
            maxChildren: true,
            hasCar: true,
            hasDriverLicense: true,
            serviceRadius: true,
            specialNeeds: true,
            smokingStatus: true,
            petsOk: true,
            photos: true,
            responseTimeMin: true,
            responseRate: true,
          },
        },
        _count: {
          select: {
            jobsPosted: true,
            jobsAccepted: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format response
    const response: Record<string, unknown> = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      location: user.address,
      rating: user.rating,
      reviewCount: user.reviewCount,
      isVerified: user.isVerified,
      role: user.role,
      lastActiveAt: user.lastActiveAt?.toISOString() || null,
      memberSince: user.createdAt.toISOString(),
      jobsPosted: user._count.jobsPosted,
      jobsCompleted: user._count.jobsAccepted,
    };

    // Include provider profile if exists
    if (user.providerProfile) {
      const pp = user.providerProfile;
      response.providerProfile = {
        headline: pp.headline,
        yearsExperience: pp.yearsExperience,
        hourlyRate: pp.hourlyRate ? Number(pp.hourlyRate) : null,
        currency: pp.currency,
        languages: pp.languages,
        certifications: pp.certifications,
        ageRangeMin: pp.ageRangeMin,
        ageRangeMax: pp.ageRangeMax,
        maxChildren: pp.maxChildren,
        hasCar: pp.hasCar,
        hasDriverLicense: pp.hasDriverLicense,
        serviceRadius: pp.serviceRadius,
        specialNeeds: pp.specialNeeds,
        smokingStatus: pp.smokingStatus,
        petsOk: pp.petsOk,
        photos: pp.photos,
        responseTimeMin: pp.responseTimeMin,
        responseRate: pp.responseRate,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
