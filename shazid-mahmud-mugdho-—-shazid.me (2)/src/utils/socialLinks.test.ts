import test from 'node:test';
import assert from 'node:assert/strict';
import { siteConfig } from '../data/siteConfig.js';
import {
  getActiveSocialLinks,
  getAllSocialPlatformStatuses,
  normalizeSocialUrl,
  normalizeWhatsAppUrl
} from './socialLinks';

test('default siteConfig contains confirmed personal details and empty unprovided social links', () => {
  assert.equal(siteConfig.name, 'Shazid Mahmud Mugdho');
  assert.equal(siteConfig.domain, 'https://shazid.me');
  assert.equal(siteConfig.email, 'hello@shazid.me');
  assert.equal(siteConfig.github, 'https://github.com/shazidzone');
  assert.equal(siteConfig.socialLinks.facebook, '');
  assert.equal(siteConfig.socialLinks.instagram, '');
  assert.equal(siteConfig.socialLinks.whatsapp, '');
});

test('getActiveSocialLinks returns only GitHub and Email for default siteConfig and hides empty links', () => {
  const active = getActiveSocialLinks(siteConfig);
  assert.equal(active.length, 2);

  const ids = active.map((item) => item.id);
  assert.deepEqual(ids, ['github', 'email']);

  const github = active.find((item) => item.id === 'github')!;
  assert.equal(github.href, 'https://github.com/shazidzone');
  assert.equal(github.isExternal, true);

  const email = active.find((item) => item.id === 'email')!;
  assert.equal(email.href, 'mailto:hello@shazid.me');
  assert.equal(email.isExternal, false);
});

test('empty or hash links never produce clickable # URLs', () => {
  assert.equal(normalizeSocialUrl('facebook', ''), null);
  assert.equal(normalizeSocialUrl('instagram', '   '), null);
  assert.equal(normalizeSocialUrl('whatsapp', '#'), null);
  assert.equal(normalizeWhatsAppUrl(''), null);
  assert.equal(normalizeWhatsAppUrl('https://wa.me/'), null);
});

test('when Facebook, Instagram, and WhatsApp are added to siteConfig, they automatically appear', () => {
  const customConfig = {
    ...siteConfig,
    socialLinks: {
      facebook: 'https://facebook.com/shazid.example',
      instagram: 'https://instagram.com/shazid.example',
      whatsapp: '+880 1711-000000'
    }
  };

  const active = getActiveSocialLinks(customConfig);
  assert.equal(active.length, 5);
  assert.deepEqual(
    active.map((i) => i.id),
    ['github', 'facebook', 'instagram', 'whatsapp', 'email']
  );

  const whatsapp = active.find((i) => i.id === 'whatsapp')!;
  assert.equal(whatsapp.href, 'https://wa.me/8801711000000');
  assert.equal(whatsapp.isExternal, true);
});

test('getAllSocialPlatformStatuses reports accurate configured states', () => {
  const statuses = getAllSocialPlatformStatuses(siteConfig);
  assert.equal(statuses.length, 5);
  const configuredIds = statuses.filter((s) => s.configured).map((s) => s.id);
  assert.deepEqual(configuredIds, ['github', 'email']);
});
