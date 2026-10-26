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
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  // Free automatic mail via Resend (server-friendly HTTPS API).
  // Resend account must be signed up with hello@shazid.me so the test sender
  // onboarding@resend.dev may deliver to that same address without a verified
  // domain. The key lives only as a Pages secret, never in code.
  RESEND_API_KEY?: string;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function forwardTelegram(
  env: Env,
  waitUntil: ((promise: Promise<unknown>) => void) | undefined,
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    const token = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return false;
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
    if (waitUntil) waitUntil(send);
    else await send;
    return true;
  } catch {
    return false;
  }
}

async function sendViaResend(
  env: Env,
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const html =
      `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>` +
      `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` +
      `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Shazid.me Contact <onboarding@resend.dev>',
        to: ['hello@shazid.me'],
        reply_to: email,
        subject: `Contact: ${subject}`,
        html,
        text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`
      })
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { id?: string };
    return Boolean(data.id);
  } catch {
    return false;
  }
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

  // 4. Automatic mail via Resend (free) + Telegram copy.
  // If Resend succeeds, the visitor sees success and no fallback is needed:
  // mail has already reached hello@shazid.me automatically, and Telegram
  // carries an instant copy. If Resend is not configured or fails, fall
  // through to the Telegram + manual mail fallback below.
  const resendOk = await sendViaResend(env, name, email, subject, message);
  const telegram = await forwardTelegram(env, waitUntil, name, email, subject, message);
  if (resendOk) {
    return jsonResponse({
      ok: true,
      provider: 'resend',
      telegram,
      message: 'Your message has been delivered to hello@shazid.me.'
    });
  }

  // 5. Safe fallback when no automatic mail provider is configured yet.
  // The visitor still sees "Send via Email App" / "Copy", so the message
  // can still reach hello@shazid.me by mail, and Telegram already carries
  // a copy when its secrets are set.
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
