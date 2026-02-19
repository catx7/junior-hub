/**
 * Content moderation utilities.
 * Blocks phone numbers, email addresses, and website URLs
 * to prevent off-platform communication.
 */

// Romanian phone: 07XX XXX XXX (with any chars between digits)
// Also catches international format +40 7XX XXX XXX
const ROMANIAN_PHONE_RE =
  /(?:\+?\s*4\s*0\s*)?0?\s*7\s*[0-9]\s*[0-9]\s*[^a-zA-Z0-9]*[0-9]\s*[^a-zA-Z0-9]*[0-9]\s*[^a-zA-Z0-9]*[0-9]\s*[^a-zA-Z0-9]*[0-9]\s*[^a-zA-Z0-9]*[0-9]/i;

// US phone: (xxx) xxx-xxxx or xxx-xxx-xxxx or +1xxxxxxxxxx etc.
const US_PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

// General international format: + followed by 8-15 digits (with optional separators)
const INTL_PHONE_RE = /\+\d[\d\s.\-()]{7,18}\d/;

// Email addresses
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+\s*@\s*[a-zA-Z0-9.\-]+\s*\.\s*[a-zA-Z]{2,}/;

// URLs / websites
const URL_RE = /(?:https?:\/\/|www\.)[^\s]+/i;

// Domain-like patterns: word.com, word.ro, word.net etc.
const DOMAIN_RE =
  /[a-zA-Z0-9\-]+\s*\.\s*(?:com|org|net|io|ro|eu|info|biz|co|me|app|dev|xyz|site|online|shop|store)\b/i;

// Social media handles/references
const SOCIAL_RE =
  /(?:facebook|instagram|whatsapp|telegram|viber|snapchat|tiktok|twitter|linkedin|signal)\s*[.:@\/]\s*\S+/i;

// "call me", "text me", "my number" followed by digits
const CONTACT_HINT_RE =
  /(?:call|text|suna|nr\.?\s*tel|telefon|numar|whatsapp|messenger)\s*(?:me|ma|:)?\s*(?:at|la|pe)?\s*[\s:.-]*\d/i;

interface ModerationResult {
  isClean: boolean;
  reason?: string;
}

export function moderateContent(text: string): ModerationResult {
  if (ROMANIAN_PHONE_RE.test(text)) {
    return {
      isClean: false,
      reason: 'Phone numbers are not allowed. Please use in-app messaging.',
    };
  }

  if (US_PHONE_RE.test(text)) {
    return {
      isClean: false,
      reason: 'Phone numbers are not allowed. Please use in-app messaging.',
    };
  }

  if (INTL_PHONE_RE.test(text)) {
    return {
      isClean: false,
      reason: 'Phone numbers are not allowed. Please use in-app messaging.',
    };
  }

  if (EMAIL_RE.test(text)) {
    return {
      isClean: false,
      reason: 'Email addresses are not allowed. Please use in-app messaging.',
    };
  }

  if (URL_RE.test(text)) {
    return {
      isClean: false,
      reason: 'Website links are not allowed. Please use in-app messaging.',
    };
  }

  if (DOMAIN_RE.test(text)) {
    return {
      isClean: false,
      reason: 'Website addresses are not allowed. Please use in-app messaging.',
    };
  }

  if (SOCIAL_RE.test(text)) {
    return {
      isClean: false,
      reason: 'Social media contact info is not allowed. Please use in-app messaging.',
    };
  }

  if (CONTACT_HINT_RE.test(text)) {
    return {
      isClean: false,
      reason: 'Sharing contact details is not allowed. Please use in-app messaging.',
    };
  }

  return { isClean: true };
}

/**
 * Checks multiple text fields and returns the first moderation violation found.
 */
export function moderateFields(
  fields: Record<string, string | undefined | null>
): ModerationResult {
  for (const [field, text] of Object.entries(fields)) {
    if (!text) continue;
    const result = moderateContent(text);
    if (!result.isClean) {
      return { isClean: false, reason: `${field}: ${result.reason}` };
    }
  }
  return { isClean: true };
}
