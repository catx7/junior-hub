// ===========================================
// LocalServices Shared Types
// ===========================================

// User Types
export type UserRole = 'USER' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firebaseUid: string;
  name: string;
  avatar: string | null;
  phone: string | null;
  bio: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  role: UserRole;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: Date;
}

export interface CurrentUser extends User {
  token?: string;
}

// Job Types
export type JobStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ServiceCategory = 'BABYSITTING' | 'HOUSE_CLEANING' | 'LOCAL_FOOD' | 'OTHER';

export interface Job {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  budget: number;
  currency: string;
  status: JobStatus;
  location: string;
  latitude: number;
  longitude: number;
  scheduledAt: Date | null;
  completedAt: Date | null;
  posterId: string;
  providerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobWithRelations extends Job {
  poster: UserProfile;
  provider: UserProfile | null;
  images: JobImage[];
  offerCount: number;
  isPromoted: boolean;
  distance?: number;
}

export interface JobImage {
  id: string;
  url: string;
  publicId: string;
  order: number;
  jobId: string;
  createdAt: Date;
}

// Offer Types
export interface Offer {
  id: string;
  price: number;
  message: string;
  isAccepted: boolean;
  jobId: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferWithProvider extends Offer {
  provider: UserProfile;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  comment: string;
  jobId: string;
  authorId: string;
  targetId: string;
  createdAt: Date;
}

export interface ReviewWithRelations extends Review {
  author: UserProfile;
  job: { id: string; title: string };
}

// Conversation Types
export interface Conversation {
  id: string;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithDetails extends Conversation {
  job: { id: string; title: string };
  participant: UserProfile;
  lastMessage: Message | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  imageUrl: string | null;
  isRead: boolean;
  conversationId: string;
  senderId: string;
  createdAt: Date;
}

export interface MessageWithSender extends Message {
  sender: UserProfile;
}

// Promotion Types
export type PromotionTier = 'BASIC' | 'PREMIUM' | 'FEATURED';

export interface Promotion {
  id: string;
  jobId: string;
  userId: string;
  tier: PromotionTier;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

// Notification Types
export type NotificationType =
  | 'NEW_OFFER'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'NEW_MESSAGE'
  | 'JOB_STATUS_CHANGED'
  | 'NEW_REVIEW';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  userId: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface JobFilters {
  category?: ServiceCategory;
  status?: JobStatus;
  minBudget?: number;
  maxBudget?: number;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: 'createdAt' | 'budget' | 'distance';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileForm {
  name: string;
  phone?: string;
  bio?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface JobForm {
  title: string;
  description: string;
  category: ServiceCategory;
  budget: number;
  currency: string;
  location: string;
  latitude: number;
  longitude: number;
  scheduledAt?: Date;
}

export interface OfferForm {
  price: number;
  message: string;
}

export interface ReviewForm {
  rating: number;
  comment: string;
}
