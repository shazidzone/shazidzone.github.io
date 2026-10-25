import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContactPayload,
  SlidingWindowRateLimiter,
  buildRawMimeEmail,
  CONTACT_LIMITS
} from './contactValidation';

test('validateContactPayload accepts valid contact submission and normalizes fields', () => {
  const result = validateContactPayload({
    name: '  Alex Rahman ',
    email: 'Alex@Example.com ',
    subject: ' Collaboration Inquiry ',
    message: 'Hello Shazid, I would love to discuss a web project with you.',
    website: ''
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.sanitized?.name, 'Alex Rahman');
  assert.equal(result.sanitized?.email, 'alex@example.com');
  assert.equal(result.sanitized?.subject, 'Collaboration Inquiry');
});

test('validateContactPayload rejects honeypot spam submissions', () => {
  const result = validateContactPayload({
    name: 'Spam Bot',
    email: 'bot@spam.example',
    subject: 'Cheap SEO',
    message: 'Visit our website right now for offers!',
    website: 'https://spambot.example'
  });

  assert.equal(result.valid, false);
  assert.equal(result.isSpam, true);
});

test('validateContactPayload enforces field presence and length limits', () => {
  const emptyResult = validateContactPayload({
    name: 'A',
    email: 'invalid-email',
    subject: 'x'.repeat(CONTACT_LIMITS.SUBJECT_MAX + 5),
    message: 'Too short'
  });

  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.name);
  assert.ok(emptyResult.errors.email);
  assert.ok(emptyResult.errors.subject);
  assert.ok(emptyResult.errors.message);
});

test('validateContactPayload rejects messages with excessive URLs', () => {
  const spamLinksMessage =
    'Check out https://a.com https://b.com https://c.com https://d.com https://e.com today!';
  const result = validateContactPayload({
    name: 'Link Spammer',
    email: 'spam@example.com',
    message: spamLinksMessage
  });

  assert.equal(result.valid, false);
  assert.equal(result.isSpam, true);
});

test('SlidingWindowRateLimiter blocks requests exceeding limit within window', () => {
  const limiter = new SlidingWindowRateLimiter(3, 60_000);
  const ip = '203.0.113.10';
  const start = 1_000_000;

  assert.equal(limiter.check(ip, start).allowed, true);
  assert.equal(limiter.check(ip, start + 1000).allowed, true);
  assert.equal(limiter.check(ip, start + 2000).allowed, true);

  const fourth = limiter.check(ip, start + 3000);
  assert.equal(fourth.allowed, false);
  assert.ok(fourth.retryAfterSeconds > 0);

  // After window expires, allowed again
  assert.equal(limiter.check(ip, start + 61_000).allowed, true);
});

test('buildRawMimeEmail formats RFC 5322 message headers safely', () => {
  const mime = buildRawMimeEmail({
    fromAddress: 'contact@shazid.me',
    toAddress: 'hello@shazid.me',
    senderName: 'Alex Rahman',
    senderEmail: 'alex@example.com',
    subject: 'Hello from shazid.me',
    message: 'Testing the contact form.'
  });

  assert.ok(mime.includes('To: <hello@shazid.me>'));
  assert.ok(mime.includes('Reply-To: "Alex Rahman" <alex@example.com>'));
  assert.ok(mime.includes('Subject: [shazid.me] Hello from shazid.me'));
  assert.ok(mime.includes('Testing the contact form.'));
});
