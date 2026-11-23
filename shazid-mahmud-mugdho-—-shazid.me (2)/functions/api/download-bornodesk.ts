import { SlidingWindowRateLimiter } from '../../src/utils/contactValidation';

// SHA-256 of the BornoDesk download password (same password as the PingKalm
// download page, set by the site owner).
// The password itself is never stored in code or in the repository.
const PASSWORD_SHA256_HEX =
  'e0bebd22819993425814866b62701e2919ea26f1370499c1037b53b9d49c2c8a';

// BornoDesk v1.0.0 is 80 MB — too large for GitHub's 25 MB web upload and
// Cloudflare Pages' 25 MB file cap, so the APK lives as a GitHub Release
// asset instead of public/downloads/.
const DOWNLOAD_URL =
  'https://github.com/shazidzone/shazidzone.github.io/releases/download/bornodesk-v1.0.0/BornoDesk-v1.0.apk';
const FILE_NAME = 'BornoDesk-v1.0.apk';
const FILE_SIZE = '80 MB';
const FILE_VERSION = '1.0.0';

// 10 attempts per IP per 15 minutes — same window style as the contact form.
const rateLimiter = new SlidingWindowRateLimiter(10, 15 * 60 * 1000);

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

async function sha256Hex(value: string): Promise<string> {
  const data = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return [...new Uint8Array(data)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const onRequestPost = async (context: {
  request: Request;
}): Promise<Response> => {
  const { request } = context;

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
        error: `Too many attempts. Please wait ${rateStatus.retryAfterSeconds} seconds before trying again.`
      },
      429,
      { 'Retry-After': String(rateStatus.retryAfterSeconds) }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, code: 'INVALID_JSON', error: 'Invalid request.' },
      400
    );
  }

  const password = (rawBody as { password?: unknown } | null)?.password;
  if (typeof password !== 'string' || password.length === 0) {
    return jsonResponse(
      {
        ok: false,
        code: 'MISSING_PASSWORD',
        error: 'Please enter the download password.'
      },
      400
    );
  }

  const submittedHash = await sha256Hex(password);
  if (submittedHash !== PASSWORD_SHA256_HEX) {
    return jsonResponse(
      {
        ok: false,
        code: 'WRONG_PASSWORD',
        error: 'Incorrect password. Please try again.'
      },
      401
    );
  }

  return jsonResponse({
    ok: true,
    url: DOWNLOAD_URL,
    filename: FILE_NAME,
    size: FILE_SIZE,
    version: FILE_VERSION
  });
};
