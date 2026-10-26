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
  // Free Telegram forward (existing bot secrets, already set in Pages dashboard).
  // Used only as a notification copy; the mail fallback below is preserved,
  // so a message still reaches hello@shazid.me via the visitor's mail app.
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
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
  waitUntil?: (promise: Promise<unknown>) => void;
}): Promise<Response> => {
  const { request, env, waitUntil } = context;

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

  // 4. Telegram forward (free) + mail fallback preserved.
  // The visitor still sees the "Send via Email App" / "Copy" fallback, so the
  // message also reaches hello@shazid.me by mail. Telegram is only an extra
  // instant copy, never a replacement for mail.
  let telegram = false;
  try {
    const token = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const safeMessage = message.length > 3500 ? message.slice(0, 3500) + '…' : message;
      const text =
        '✉️ New contact message — shazid.me\n' +
        `From: ${name} <${email}>\n` +
        `Subject: ${subject}\n\n` +
        safeMessage +
        `\n\n(Reply by email to ${email})`;
      const send = fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text })
      }).catch(() => {});
      telegram = true;
      if (waitUntil) waitUntil(send);
      else await send;
    }
  } catch {
    telegram = false;
  }

  // 5. Safe fallback when Cloudflare Email Service binding is not yet configured
  return jsonResponse(
    {
      ok: false,
      code: 'EMAIL_SERVICE_NOT_CONFIGURED',
      telegram,
      error:
        'Email service not configured. Please send your message directly to hello@shazid.me using the option below.'
    },
    503
  );
};
