export interface ContactFormPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /** Honeypot field: must remain empty for legitimate human submissions */
  website?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<'name' | 'email' | 'subject' | 'message' | 'form', string>>;
  sanitized?: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
  isSpam?: boolean;
}

export const CONTACT_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MAX: 254,
  SUBJECT_MAX: 150,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 5000,
  MAX_URLS_IN_MESSAGE: 4
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Strips control characters (except newlines and tabs in message bodies) and trims whitespace.
 */
export function sanitizeSingleLine(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[\r\n\t\x00-\x1F\x7F]+/g, ' ').trim();
}

export function sanitizeMultiLine(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\r\n/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Shared client + server validation & spam inspection for contact form payloads.
 */
export function validateContactPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') {
    return {
      valid: false,
      errors: { form: 'Invalid request payload.' }
    };
  }

  const payload = raw as Record<string, unknown>;

  // 1. Honeypot check (bots frequently fill hidden "website" field)
  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    return {
      valid: false,
      isSpam: true,
      errors: { form: 'Submission rejected by spam protection.' }
    };
  }

  const name = sanitizeSingleLine(payload.name);
  const email = sanitizeSingleLine(payload.email).toLowerCase();
  const rawSubject = sanitizeSingleLine(payload.subject);
  const message = sanitizeMultiLine(payload.message);

  const errors: ValidationResult['errors'] = {};

  // Name validation
  if (!name) {
    errors.name = 'Please enter your name.';
  } else if (name.length < CONTACT_LIMITS.NAME_MIN) {
    errors.name = `Name must be at least ${CONTACT_LIMITS.NAME_MIN} characters.`;
  } else if (name.length > CONTACT_LIMITS.NAME_MAX) {
    errors.name = `Name cannot exceed ${CONTACT_LIMITS.NAME_MAX} characters.`;
  }

  // Sender email validation
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (email.length > CONTACT_LIMITS.EMAIL_MAX || !EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Subject validation
  if (rawSubject.length > CONTACT_LIMITS.SUBJECT_MAX) {
    errors.subject = `Subject cannot exceed ${CONTACT_LIMITS.SUBJECT_MAX} characters.`;
  }

  // Message validation
  if (!message) {
    errors.message = 'Please enter a message.';
  } else if (message.length < CONTACT_LIMITS.MESSAGE_MIN) {
    errors.message = `Message must be at least ${CONTACT_LIMITS.MESSAGE_MIN} characters.`;
  } else if (message.length > CONTACT_LIMITS.MESSAGE_MAX) {
    errors.message = `Message cannot exceed ${CONTACT_LIMITS.MESSAGE_MAX} characters.`;
  } else {
    // Check for excessive URL spam
    const urlMatches = message.match(/https?:\/\/[^\s]+/gi) || [];
    if (urlMatches.length > CONTACT_LIMITS.MAX_URLS_IN_MESSAGE) {
      return {
        valid: false,
        isSpam: true,
        errors: {
          message: `Please limit your message to at most ${CONTACT_LIMITS.MAX_URLS_IN_MESSAGE} links.`
        }
      };
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const subject = rawSubject || `New message from ${name} via shazid.me`;

  return {
    valid: true,
    errors: {},
    sanitized: {
      name,
      email,
      subject,
      message
    }
  };
}

/**
 * Simple sliding-window in-memory rate limiter for server-side IP protection.
 */
export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly hits = new Map<string, number[]>();

  constructor(maxRequests = 5, windowMs = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
    const timestamps = (this.hits.get(key) || []).filter((t) => now - t < this.windowMs);
    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((this.windowMs - (now - oldest)) / 1000));
      this.hits.set(key, timestamps);
      return { allowed: false, retryAfterSeconds };
    }
    timestamps.push(now);
    this.hits.set(key, timestamps);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Builds a raw RFC 5322 MIME email message for Cloudflare Email Routing (`cloudflare:email`).
 */
export function buildRawMimeEmail(params: {
  fromAddress: string;
  toAddress: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  messageIdDomain?: string;
}): string {
  const dateHeader = new Date().toUTCString();
  const domain = params.messageIdDomain || 'shazid.me';
  const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2, 10)}@${domain}>`;
  const safeFromName = params.senderName.replace(/["<>\\]/g, '').trim() || 'Website Visitor';

  const lines = [
    `From: "${safeFromName} (via shazid.me)" <${params.fromAddress}>`,
    `To: <${params.toAddress}>`,
    `Reply-To: "${safeFromName}" <${params.senderEmail}>`,
    `Subject: [shazid.me] ${params.subject}`,
    `Date: ${dateHeader}`,
    `Message-ID: ${msgId}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    `You received a new contact form submission on shazid.me:`,
    '--------------------------------------------------------',
    `Name:    ${params.senderName}`,
    `Email:   ${params.senderEmail}`,
    `Subject: ${params.subject}`,
    `Date:    ${dateHeader}`,
    '--------------------------------------------------------',
    '',
    params.message,
    ''
  ];

  return lines.join('\r\n');
}
