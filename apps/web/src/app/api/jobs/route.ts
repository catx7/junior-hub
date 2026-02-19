import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@localservices/database';
import { createJobSchema, jobFiltersSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
} from '@/lib/auth-middleware';
import { moderateFields } from '@/lib/content-moderation';
import { withLogging } from '@/lib/api-handler';
import '@/lib/db'; // registers query logging middleware

export const GET = withLogging(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate filters
    const validationResult = jobFiltersSchema.safeParse(params);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const filters = validationResult.data;
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    // Build where clause - exclude LOCAL_FOOD (now standalone)
    const where: Prisma.JobWhereInput = {
      category: { not: 'LOCAL_FOOD' },
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.jobType) {
      where.jobType = filters.jobType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.minBudget || filters.maxBudget) {
      where.budget = {};
      if (filters.minBudget) {
        where.budget.gte = filters.minBudget;
      }
      if (filters.maxBudget) {
        where.budget.lte = filters.maxBudget;
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.posterId) {
      where.posterId = filters.posterId;
    }

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    // Build order by
    const orderBy: Prisma.JobOrderByWithRelationInput = {};
    if (filters.sort === 'budget') {
      orderBy.budget = filters.order || 'desc';
    } else {
      orderBy.createdAt = filters.order || 'desc';
    }

    // Execute query
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          poster: {
            select: {
              id: true,
              name: true,
              avatar: true,
              rating: true,
              reviewCount: true,
            },
          },
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          promotion: {
            where: {
              isActive: true,
              endDate: { gte: new Date() },
            },
          },
          _count: {
            select: { offers: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    // Transform results
    const data = jobs.map((job) => ({
      ...job,
      budget: Number(job.budget),
      offerCount: job._count.offers,
      isPromoted: !!job.promotion,
      _count: undefined,
      promotion: undefined,
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  },
  { route: '/api/jobs' }
);

export const POST = withLogging(
  async (request: NextRequest) => {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validationResult = createJobSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const data = validationResult.data;

    // Block LOCAL_FOOD category (now standalone)
    if (data.category === 'LOCAL_FOOD') {
      return forbiddenResponse('Local food has its own marketplace. Use /local-food instead.');
    }

    // Role-based access: providers can post SERVICE_OFFERING, anyone can post SERVICE_REQUEST
    if (data.jobType === 'SERVICE_OFFERING') {
      if (authUser.role !== 'PROVIDER' && authUser.role !== 'ADMIN') {
        return forbiddenResponse('Only providers can post service offerings');
      }
    }

    // Content moderation: block contact info in title/description
    const moderation = moderateFields({
      Title: data.title,
      Description: data.description,
    });
    if (!moderation.isClean) {
      return validationErrorResponse([{ message: moderation.reason }]);
    }

    const job = await prisma.job.create({
      data: {
        ...data,
        status: 'OPEN',
        posterId: authUser.id,
      },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json(
      {
        ...job,
        budget: Number(job.budget),
      },
      { status: 201 }
    );
  },
  { route: '/api/jobs' }
);
