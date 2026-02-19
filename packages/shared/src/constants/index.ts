// ===========================================
// LocalServices Constants
// ===========================================

// Service Categories
export const SERVICE_CATEGORIES = {
  BABYSITTING: {
    id: 'BABYSITTING',
    label: 'Babysitting',
    labelKey: 'categories.babysitting',
    icon: '👶',
    color: '#FF6B6B',
    commissionRate: 0.1,
  },
  HOUSE_CLEANING: {
    id: 'HOUSE_CLEANING',
    label: 'House Cleaning',
    labelKey: 'categories.houseCleaning',
    icon: '🏠',
    color: '#4ECDC4',
    commissionRate: 0.12,
  },
  LOCAL_FOOD: {
    id: 'LOCAL_FOOD',
    label: 'Local Food',
    labelKey: 'categories.localFood',
    icon: '🍽️',
    color: '#FFE66D',
    commissionRate: 0.15,
  },
  OTHER: {
    id: 'OTHER',
    label: 'Other',
    labelKey: 'categories.other',
    icon: '⋯',
    color: '#95A5A6',
    commissionRate: 0.1,
  },
} as const;

// Job categories (for job creation - excludes LOCAL_FOOD which is now standalone)
export const JOB_CATEGORIES = {
  BABYSITTING: SERVICE_CATEGORIES.BABYSITTING,
  HOUSE_CLEANING: SERVICE_CATEGORIES.HOUSE_CLEANING,
  OTHER: SERVICE_CATEGORIES.OTHER,
} as const;

// Local Food Categories (standalone marketplace)
export const LOCAL_FOOD_CATEGORIES = [
  'Prepared Meals',
  'Baked Goods',
  'Produce',
  'Preserves',
  'Dairy',
  'Beverages',
  'Other',
] as const;

// Job Statuses
export const JOB_STATUSES = {
  DRAFT: {
    id: 'DRAFT',
    labelKey: 'jobStatus.draft',
    color: '#95A5A6',
  },
  OPEN: {
    id: 'OPEN',
    labelKey: 'jobStatus.open',
    color: '#2ECC71',
  },
  IN_PROGRESS: {
    id: 'IN_PROGRESS',
    labelKey: 'jobStatus.inProgress',
    color: '#3498DB',
  },
  COMPLETED: {
    id: 'COMPLETED',
    labelKey: 'jobStatus.completed',
    color: '#9B59B6',
  },
  CANCELLED: {
    id: 'CANCELLED',
    labelKey: 'jobStatus.cancelled',
    color: '#E74C3C',
  },
} as const;

// Promotion Tiers
export const PROMOTION_TIERS = {
  BASIC: {
    id: 'BASIC',
    labelKey: 'promotions.basic',
    price: 4.99,
    duration: 7,
    features: ['highlighted'],
  },
  PREMIUM: {
    id: 'PREMIUM',
    labelKey: 'promotions.premium',
    price: 9.99,
    duration: 7,
    features: ['highlighted', 'topOfCategory', 'badge'],
  },
  FEATURED: {
    id: 'FEATURED',
    labelKey: 'promotions.featured',
    price: 19.99,
    duration: 7,
    features: ['highlighted', 'topOfCategory', 'badge', 'homepage'],
  },
} as const;

// Supported Currencies
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  RON: { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
} as const;

// Supported Locales
export const LOCALES = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  ro: { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
} as const;

export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = Object.keys(LOCALES) as (keyof typeof LOCALES)[];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_JOB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CLOUDINARY_FOLDER: 'localservices',
} as const;

// Map
export const MAP = {
  DEFAULT_ZOOM: 13,
  DEFAULT_RADIUS: 25, // km
  MAX_RADIUS: 500, // km
  DEFAULT_CENTER: {
    lat: 40.7128, // New York
    lng: -74.006,
  },
} as const;

// Rating
export const RATING = {
  MIN: 1,
  MAX: 5,
} as const;

// API
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  RATE_LIMIT: {
    AUTH: 10, // per minute
    JOBS: 20, // per hour
    MESSAGES: 60, // per minute
    IMAGES: 30, // per hour
    GENERAL: 100, // per minute
  },
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  TYPING: 'typing',
  NOTIFICATION: 'notification',
} as const;

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  JOBS: '/jobs',
  JOB_DETAIL: (id: string) => `/jobs/${id}`,
  JOB_CREATE: '/jobs/new',
  JOB_EDIT: (id: string) => `/jobs/${id}/edit`,
  MESSAGES: '/messages',
  CONVERSATION: (id: string) => `/messages/${id}`,
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  USER_PROFILE: (id: string) => `/users/${id}`,
  SETTINGS: '/settings',
} as const;

// Mobile Routes (React Navigation)
export const MOBILE_ROUTES = {
  AUTH: {
    WELCOME: 'Welcome',
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
  },
  MAIN: {
    HOME: 'Home',
    BROWSE: 'Browse',
    POST: 'Post',
    MESSAGES: 'Messages',
    PROFILE: 'Profile',
  },
  STACK: {
    JOB_DETAIL: 'JobDetail',
    JOB_CREATE: 'JobCreate',
    JOB_EDIT: 'JobEdit',
    CONVERSATION: 'Conversation',
    USER_PROFILE: 'UserProfile',
    PROFILE_EDIT: 'ProfileEdit',
    SETTINGS: 'Settings',
  },
} as const;

// Social Auth Providers
export const AUTH_PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
} as const;

// Theme Colors (Airbnb-inspired)
export const COLORS = {
  primary: '#FF5A5F',
  primaryDark: '#E04850',
  primaryLight: '#FF8589',
  secondary: '#00A699',
  secondaryDark: '#008F84',
  secondaryLight: '#00C2B3',
  background: '#FFFFFF',
  backgroundSecondary: '#F7F7F7',
  surface: '#FFFFFF',
  text: '#222222',
  textSecondary: '#717171',
  textTertiary: '#B0B0B0',
  border: '#EBEBEB',
  borderDark: '#DDDDDD',
  error: '#C13515',
  warning: '#E07912',
  success: '#008A05',
  info: '#428BFF',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

// Typography (for mobile)
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
