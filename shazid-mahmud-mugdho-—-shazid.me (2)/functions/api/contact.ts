import {
  validateContactPayload,
  SlidingWindowRateLimiter,
  buildRawMimeEmail
} from '../../src/utils/contactValidation';

export interface Env {
  /**
   * Single email provider: Cloudflare Email Service (`send_email` binding)
   * Configured in wrangler.toml:
   * [[send_email]]
   * name = "CONTACT_EMAIL"
   * destination_address = "hello@shazid.me"
   */
  CONTACT_EMAIL?: {
    send: (message: unknown) => Promise<void>;
  };
  CONTACT_SENDER_EMAIL?: string;
  CONTACT_RECIPIENT_EMAIL?: string;
}

const rateLimiter = new SlidingWindowRateLimiter(5, 15 * 60 * 1000);

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  });
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  // 1. Rate limiting per client IP
  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown-ip';

  const rateStatus = rateLimiter.check(clientIp);
  if (!rateStatus.allowed) {
    return jsonResponse(
      {
        ok: false,
        code: 'RATE_LIMITED',
        error: `Too many messages sent recently. Please wait ${rateStatus.retryAfterSeconds} seconds before trying again.`
      },
      429,
      { 'Retry-After': String(rateStatus.retryAfterSeconds) }
    );
  }

  // 2. Parse & validate JSON body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse(
      {
        ok: false,
        code: 'INVALID_JSON',
        error: 'Invalid JSON request payload.'
      },
      400
    );
  }

  const validation = validateContactPayload(rawBody);
  if (!validation.valid || !validation.sanitized) {
    return jsonResponse(
      {
        ok: false,
        code: validation.isSpam ? 'SPAM_REJECTED' : 'VALIDATION_ERROR',
        error:
          validation.errors.form ||
          validation.errors.name ||
          validation.errors.email ||
          validation.errors.subject ||
          validation.errors.message ||
          'Please check the form fields and try again.',
        fieldErrors: validation.errors
      },
      validation.isSpam ? 400 : 422
    );
  }

  const { name, email, subject, message } = validation.sanitized;
  const recipientEmail = env.CONTACT_RECIPIENT_EMAIL || 'hello@shazid.me';
  const senderEmail = env.CONTACT_SENDER_EMAIL || 'contact@shazid.me';

  // 3. Deliver via Cloudflare Email Service (send_email binding) if configured
  if (env.CONTACT_EMAIL && typeof env.CONTACT_EMAIL.send === 'function') {
    try {
      const rawMime = buildRawMimeEmail({
        fromAddress: senderEmail,
        toAddress: recipientEmail,
        senderName: name,
        senderEmail: email,
        subject,
        message
      });

      const emailModuleName = 'cloudflare:email';
      const { EmailMessage } = (await import(/* @vite-ignore */ emailModuleName)) as {
        EmailMessage: new (from: string, to: string, raw: ReadableStream | string) => unknown;
      };

      const emailMessage = new EmailMessage(senderEmail, recipientEmail, rawMime);
      await env.CONTACT_EMAIL.send(emailMessage);

      return jsonResponse({
        ok: true,
        provider: 'cloudflare-email',
        message: 'Your message has been delivered to hello@shazid.me.'
      });
    } catch (err) {
      console.error('Cloudflare Email delivery failed:', err);
      return jsonResponse(
        {
          ok: false,
          code: 'DELIVERY_FAILED',
          error:
            'The email service encountered an error while delivering your message. Please email hello@shazid.me directly.'
        },
        502
      );
    }
  }

  // 4. Safe fallback when Cloudflare Email Service binding is not yet configured
  return jsonResponse(
    {
      ok: false,
      code: 'EMAIL_SERVICE_NOT_CONFIGURED',
      error:
        'Email service not configured. Please send your message directly to hello@shazid.me using the option below.'
    },
    503
  );
};
