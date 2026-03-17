/**
 * Client-side image utilities — Cloudinary transforms, avatar colors, category placeholders.
 */

// ─── Cloudinary URL Transforms ──────────────────────────────

type ImageVariant = 'thumb' | 'card' | 'detail' | 'full';

const variantConfig: Record<ImageVariant, { width: number; height?: number; crop?: string }> = {
  thumb: { width: 100, height: 100, crop: 'fill' },
  card: { width: 400, crop: 'scale' },
  detail: { width: 800, crop: 'scale' },
  full: { width: 1200, crop: 'scale' },
};

export function cloudinaryUrl(url: string, variant: ImageVariant = 'card'): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  const config = variantConfig[variant];
  const transforms = [
    `w_${config.width}`,
    config.height ? `h_${config.height}` : null,
    config.crop ? `c_${config.crop}` : null,
    'f_auto',
    'q_auto',
  ]
    .filter(Boolean)
    .join(',');

  return url.replace(/\/upload\//, `/upload/${transforms}/`);
}

// ─── Avatar Color from Name ─────────────────────────────────

const AVATAR_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#7c2d12',
  '#4f46e5',
  '#0d9488',
];

export function avatarColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Category Placeholder Images ────────────────────────────

const CATEGORY_PLACEHOLDERS: Record<string, { bg: string; label: string }> = {
  BABYSITTING: { bg: '#ede9fe', label: 'Babysitting' },
  HOUSE_CLEANING: { bg: '#ecfdf5', label: 'Curatenie' },
  LOCAL_FOOD: { bg: '#fff7ed', label: 'Mancare' },
  OTHER: { bg: '#f0f9ff', label: 'Servicii' },
};

export function getCategoryPlaceholder(category: string): string {
  const config = CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS.OTHER;
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="${config.bg}" width="400" height="300"/>
      <text x="200" y="165" text-anchor="middle" font-family="system-ui" font-size="18" fill="#6b7280">${config.label}</text>
    </svg>`
  )}`;
}
