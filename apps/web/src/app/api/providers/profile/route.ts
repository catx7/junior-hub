import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { authenticate, unauthorizedResponse, validationErrorResponse } from '@/lib/auth-middleware';
import { withLogging } from '@/lib/api-handler';
import { z } from 'zod';
import '@/lib/db';

const createProviderProfileSchema = z.object({
  headline: z.string().max(100).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  hourlyRate: z.number().positive().max(10000).optional(),
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  ageRangeMin: z.number().int().min(0).max(18).optional(),
  ageRangeMax: z.number().int().min(0).max(18).optional(),
  maxChildren: z.number().int().min(1).max(20).optional(),
  hasCar: z.boolean().optional(),
  hasDriverLicense: z.boolean().optional(),
  serviceRadius: z.number().int().positive().max(500).optional(),
  specialNeeds: z.boolean().optional(),
  smokingStatus: z.enum(['non_smoker', 'smoker']).optional(),
  petsOk: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
});

// POST - Create or update provider profile
export const POST = withLogging(
  async (request: NextRequest) => {
    const authUser = await authenticate(request);
    if (!authUser) return unauthorizedResponse();

    const body = await request.json();
    const validation = createProviderProfileSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const { categories, ...profileData } = validation.data;

    // Upsert provider profile
    const providerProfile = await prisma.providerProfile.upsert({
      where: { userId: authUser.id },
      create: {
        userId: authUser.id,
        ...profileData,
        hourlyRate: profileData.hourlyRate ?? undefined,
      },
      update: {
        ...profileData,
        hourlyRate: profileData.hourlyRate ?? undefined,
      },
    });

    // Update user role to PROVIDER if not already
    await prisma.user.update({
      where: { id: authUser.id },
      data: { role: 'PROVIDER' },
    });

    return NextResponse.json({ data: providerProfile }, { status: 200 });
  },
  { route: '/api/providers/profile' }
);

// GET - Get current user's provider profile
export const GET = withLogging(
  async (request: NextRequest) => {
    const authUser = await authenticate(request);
    if (!authUser) return unauthorizedResponse();

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: authUser.id },
    });

    if (!providerProfile) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    return NextResponse.json({ data: providerProfile }, { status: 200 });
  },
  { route: '/api/providers/profile' }
);
