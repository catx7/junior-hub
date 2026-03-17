import { z } from 'zod';

// ===========================================
// LocalServices Validation Schemas
// ===========================================

// Auth Validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// User Validators
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .nullable(),
  bio: z.string().max(500).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

// Job Validators
export const serviceCategorySchema = z.enum([
  'BABYSITTING',
  'HOUSE_CLEANING',
  'LOCAL_FOOD',
  'OTHER',
]);

export const jobStatusSchema = z.enum(['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const jobTypeSchema = z.enum(['SERVICE_REQUEST', 'SERVICE_OFFERING']);
export const pricingTypeSchema = z.enum(['FIXED', 'HOURLY', 'PER_LOCATION']);

export const createJobSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .trim(),
  category: serviceCategorySchema,
  jobType: jobTypeSchema.default('SERVICE_REQUEST'),
  pricingType: pricingTypeSchema.default('FIXED'),
  budget: z
    .number()
    .positive('Budget must be positive')
    .max(100000, 'Budget exceeds maximum')
    .optional()
    .nullable(),
  currency: z.string().length(3).default('USD'),
  location: z.string().min(3, 'Location must be at least 3 characters').max(200).trim(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  scheduledAt: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : val),
    z.coerce.date().optional().nullable()
  ),
});

export const updateJobSchema = createJobSchema.partial();

export const updateJobStatusSchema = z.object({
  status: jobStatusSchema,
});

// Offer Validators
export const createOfferSchema = z.object({
  price: z.number().positive('Price must be positive').max(100000, 'Price exceeds maximum'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters')
    .trim(),
});

// Review Validators
export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be at most 1000 characters')
    .trim(),
});

// Message Validators
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000).trim(),
});

// Booking Request Validators (for service offerings)
export const createBookingRequestSchema = z.object({
  preferredDate: z.coerce.date(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters')
    .trim(),
});

// Local Food Validators
export const createLocalFoodSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .trim(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive').max(10000, 'Price exceeds maximum'),
  pickupOnly: z.boolean().default(false),
  pickupLocation: z.string().max(200).optional(),
  deliveryAvailable: z.boolean().default(false),
  deliveryArea: z.string().max(200).optional(),
  location: z.string().min(3, 'Location must be at least 3 characters').max(200).trim(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const createFoodOrderSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive('Quantity must be positive')
    .max(100, 'Maximum 100 items per order'),
  orderType: z.enum(['DELIVERY', 'PICKUP']),
  deliveryAddress: z.string().max(200).optional(),
  pickupLocation: z.string().max(200).optional(),
  message: z.string().max(500).optional(),
});

// Job Filters Validators
export const jobFiltersSchema = z.object({
  category: serviceCategorySchema.optional(),
  jobType: jobTypeSchema.optional(),
  status: jobStatusSchema.optional(),
  minBudget: z.coerce.number().positive().optional(),
  maxBudget: z.coerce.number().positive().optional(),
  search: z.string().max(100).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(500).optional(),
  sort: z.enum(['createdAt', 'budget', 'distance']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  posterId: z.string().optional(),
  providerId: z.string().optional(),
});

// Promotion Validators
export const promotionTierSchema = z.enum(['BASIC', 'PREMIUM', 'FEATURED']);

export const createPromotionSchema = z.object({
  tier: promotionTierSchema,
  autoRenew: z.boolean().optional().default(false),
});

// File Upload Validators
export const imageUploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'Must be a file'),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
});

// Provider Search Validators
export const providerFiltersSchema = z.object({
  category: serviceCategorySchema.optional(),
  search: z.string().max(100).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(500).optional(),
  minRate: z.coerce.number().positive().optional(),
  maxRate: z.coerce.number().positive().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  languages: z.string().optional(), // comma-separated: "ro,en,hu"
  certifications: z.string().optional(), // comma-separated: "first_aid,cpr"
  specialNeeds: z.coerce.boolean().optional(),
  sort: z.enum(['rating', 'experience', 'rate', 'distance', 'lastActive']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// Pagination Validators
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// Verification Request Validators
export const createVerificationRequestSchema = z.object({
  motivation: z
    .string()
    .min(20, 'Please describe why you want to become a provider (at least 20 characters)')
    .max(2000, 'Motivation must be at most 2000 characters')
    .trim(),
  documentUrl: z.string().url('Invalid document URL').optional(),
  backgroundCheckUrl: z
    .string()
    .url('Invalid background check document URL')
    .optional()
    .describe(
      'Certificat de cazier judiciar (max 6 months old) - required for childcare services per Legea 272/2004'
    ),
  backgroundCheckDeclaration: z
    .boolean()
    .optional()
    .describe('User declares they are not listed on the sex offender registry per Legea 118/2019'),
});

export const updateVerificationStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  notes: z.string().max(2000).optional().default(''),
});

// Type exports from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type JobFiltersInput = z.infer<typeof jobFiltersSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateVerificationRequestInput = z.infer<typeof createVerificationRequestSchema>;
export type UpdateVerificationStatusInput = z.infer<typeof updateVerificationStatusSchema>;
export type CreateBookingRequestInput = z.infer<typeof createBookingRequestSchema>;
export type CreateLocalFoodInput = z.infer<typeof createLocalFoodSchema>;
export type CreateFoodOrderInput = z.infer<typeof createFoodOrderSchema>;
export type ProviderFiltersInput = z.infer<typeof providerFiltersSchema>;
