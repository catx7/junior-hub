import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { createJobSchema, jobFiltersSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
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

    // Build where clause
    const where: Prisma.JobWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
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
  } catch (error) {
    console.error('List jobs error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Create job error:', error);
    return serverErrorResponse();
  }
}
