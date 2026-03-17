import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@localservices/database';
import { providerFiltersSchema } from '@localservices/shared';
import { validationErrorResponse } from '@/lib/auth-middleware';
import { withLogging } from '@/lib/api-handler';
import '@/lib/db';

// Haversine distance formula in SQL for geo-spatial search
function haversineDistanceSQL(lat: number, lng: number): Prisma.Sql {
  return Prisma.sql`(
    6371 * acos(
      cos(radians(${lat})) * cos(radians("User"."latitude")) *
      cos(radians("User"."longitude") - radians(${lng})) +
      sin(radians(${lat})) * sin(radians("User"."latitude"))
    )
  )`;
}

export const GET = withLogging(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validationResult = providerFiltersSchema.safeParse(params);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const filters = validationResult.data;
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    // Build where clause - only users with PROVIDER role who have a profile
    const where: Prisma.UserWhereInput = {
      role: 'PROVIDER',
      providerProfile: { isNot: null },
    };

    // Text search on user name, bio, or provider headline
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { bio: { contains: filters.search, mode: 'insensitive' } },
        { providerProfile: { headline: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    // Rating filter
    if (filters.minRating) {
      where.rating = { gte: filters.minRating };
    }

    // Provider profile filters
    const profileWhere: Prisma.ProviderProfileWhereInput = {};

    if (filters.minRate || filters.maxRate) {
      profileWhere.hourlyRate = {};
      if (filters.minRate) profileWhere.hourlyRate.gte = filters.minRate;
      if (filters.maxRate) profileWhere.hourlyRate.lte = filters.maxRate;
    }

    if (filters.minExperience) {
      profileWhere.yearsExperience = { gte: filters.minExperience };
    }

    if (filters.languages) {
      const langs = filters.languages.split(',').map((l) => l.trim());
      profileWhere.languages = { hasSome: langs };
    }

    if (filters.certifications) {
      const certs = filters.certifications.split(',').map((c) => c.trim());
      profileWhere.certifications = { hasSome: certs };
    }

    if (filters.specialNeeds) {
      profileWhere.specialNeeds = true;
    }

    if (Object.keys(profileWhere).length > 0) {
      where.providerProfile = { ...((where.providerProfile as object) || {}), ...profileWhere };
    }

    // Category filter - check if provider has jobs in this category
    if (filters.category) {
      where.jobsPosted = {
        some: {
          category: filters.category,
          jobType: 'SERVICE_OFFERING',
        },
      };
    }

    // Geo-spatial filtering with Haversine (raw query for distance)
    const useGeo = filters.lat !== undefined && filters.lng !== undefined;
    const radius = filters.radius || 50; // default 50km

    // Build order by
    let orderBy: Prisma.UserOrderByWithRelationInput = {};
    switch (filters.sort) {
      case 'rating':
        orderBy = { rating: filters.order || 'desc' };
        break;
      case 'experience':
        orderBy = { providerProfile: { yearsExperience: filters.order || 'desc' } };
        break;
      case 'rate':
        orderBy = { providerProfile: { hourlyRate: filters.order || 'asc' } };
        break;
      case 'lastActive':
        orderBy = { lastActiveAt: filters.order || 'desc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    // If using geo filter, we need a different approach for distance-based filtering
    if (useGeo && filters.sort === 'distance') {
      // Use raw query for distance-based sorting and filtering
      const distanceSQL = haversineDistanceSQL(filters.lat!, filters.lng!);

      // Get provider IDs within radius using raw SQL
      const nearbyProviders = await prisma.$queryRaw<{ id: string; distance: number }[]>`
        SELECT "User"."id", ${distanceSQL} AS distance
        FROM "User"
        WHERE "User"."role" = 'PROVIDER'
          AND "User"."latitude" IS NOT NULL
          AND "User"."longitude" IS NOT NULL
          AND ${distanceSQL} <= ${radius}
        ORDER BY distance ASC
        LIMIT ${limit} OFFSET ${skip}
      `;

      const nearbyIds = nearbyProviders.map((p) => p.id);
      const distanceMap = new Map(
        nearbyProviders.map((p) => [p.id, Math.round(p.distance * 10) / 10])
      );

      if (nearbyIds.length === 0) {
        return NextResponse.json({
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      // Fetch full provider data for nearby IDs
      const providers = await prisma.user.findMany({
        where: { ...where, id: { in: nearbyIds } },
        select: providerSelect,
      });

      // Sort by distance and add distance field
      const data = nearbyIds
        .map((id) => providers.find((p) => p.id === id))
        .filter(Boolean)
        .map((provider) => transformProvider(provider!, distanceMap.get(provider!.id)));

      // Get total count within radius
      const totalResult = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count
        FROM "User"
        WHERE "User"."role" = 'PROVIDER'
          AND "User"."latitude" IS NOT NULL
          AND "User"."longitude" IS NOT NULL
          AND ${distanceSQL} <= ${radius}
      `;
      const total = Number(totalResult[0]?.count || 0);

      return NextResponse.json({
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Standard query (no distance sorting)
    if (useGeo) {
      // Still filter by radius, but don't sort by distance
      where.latitude = { not: null };
      where.longitude = { not: null };
      // Approximate bounding box filter (1 degree ~ 111km)
      const degreeRange = radius / 111;
      where.latitude = { gte: filters.lat! - degreeRange, lte: filters.lat! + degreeRange };
      where.longitude = { gte: filters.lng! - degreeRange, lte: filters.lng! + degreeRange };
    }

    const [providers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: providerSelect,
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate distances if geo is available
    const data = providers.map((provider) => {
      let distance: number | undefined;
      if (useGeo && provider.latitude && provider.longitude) {
        distance = haversineDistance(
          filters.lat!,
          filters.lng!,
          provider.latitude,
          provider.longitude
        );
      }
      return transformProvider(provider, distance);
    });

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  },
  { route: '/api/providers' }
);

// Select fields for provider queries
const providerSelect = {
  id: true,
  name: true,
  avatar: true,
  bio: true,
  address: true,
  latitude: true,
  longitude: true,
  rating: true,
  reviewCount: true,
  isVerified: true,
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
      specialNeeds: true,
      responseTimeMin: true,
      responseRate: true,
      photos: true,
    },
  },
} satisfies Prisma.UserSelect;

type ProviderQueryResult = Prisma.UserGetPayload<{ select: typeof providerSelect }>;

function transformProvider(provider: ProviderQueryResult, distance?: number) {
  return {
    id: provider.id,
    name: provider.name,
    avatar: provider.avatar,
    bio: provider.bio,
    address: provider.address,
    rating: provider.rating,
    reviewCount: provider.reviewCount,
    isVerified: provider.isVerified,
    lastActiveAt: provider.lastActiveAt,
    memberSince: provider.createdAt,
    distance,
    profile: provider.providerProfile
      ? {
          headline: provider.providerProfile.headline,
          yearsExperience: provider.providerProfile.yearsExperience,
          hourlyRate: provider.providerProfile.hourlyRate
            ? Number(provider.providerProfile.hourlyRate)
            : null,
          currency: provider.providerProfile.currency,
          languages: provider.providerProfile.languages,
          certifications: provider.providerProfile.certifications,
          ageRangeMin: provider.providerProfile.ageRangeMin,
          ageRangeMax: provider.providerProfile.ageRangeMax,
          specialNeeds: provider.providerProfile.specialNeeds,
          responseTimeMin: provider.providerProfile.responseTimeMin,
          responseRate: provider.providerProfile.responseRate,
          photos: provider.providerProfile.photos,
        }
      : null,
  };
}

// Haversine distance calculation in JS (for non-raw-query cases)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
