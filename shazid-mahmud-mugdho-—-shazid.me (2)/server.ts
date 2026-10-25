import express from 'express';
import path from 'path';
import {
  validateContactPayload,
  SlidingWindowRateLimiter
} from './src/utils/contactValidation';

const PORT = 3000;
const app = express();

// Trust proxy headers for accurate IP rate limiting
app.set('trust proxy', true);
app.use(express.json({ limit: '32kb' }));

const contactRateLimiter = new SlidingWindowRateLimiter(5, 15 * 60 * 1000);

app.post('/api/contact', async (req, res) => {
  const clientIp =
    (req.headers['cf-connecting-ip'] as string) ||
    req.ip ||
    req.socket.remoteAddress ||
    'unknown-ip';

  const rateStatus = contactRateLimiter.check(clientIp);
  if (!rateStatus.allowed) {
    res.setHeader('Retry-After', String(rateStatus.retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      code: 'RATE_LIMITED',
      error: `Too many messages sent recently. Please wait ${rateStatus.retryAfterSeconds} seconds before trying again.`
    });
  }

  const validation = validateContactPayload(req.body);
  if (!validation.valid || !validation.sanitized) {
    return res.status(validation.isSpam ? 400 : 422).json({
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
    });
  }

  // In local / AI Studio preview mode, Cloudflare's `send_email` Worker binding is not present.
  // Return an explicit 503 EMAIL_SERVICE_NOT_CONFIGURED response without requiring any secrets.
  return res.status(503).json({
    ok: false,
    code: 'EMAIL_SERVICE_NOT_CONFIGURED',
    error:
      'Email service not configured. Please send your message directly to hello@shazid.me using the option below.'
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
