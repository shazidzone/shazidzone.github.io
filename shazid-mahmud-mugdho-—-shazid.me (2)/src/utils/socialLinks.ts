import { siteConfig as defaultSiteConfig, type SiteConfig } from '../data/siteConfig.js';

export type SocialPlatformId = 'github' | 'email' | 'facebook' | 'instagram' | 'whatsapp';

export interface ResolvedSocialLink {
  id: SocialPlatformId;
  label: string;
  href: string;
  ariaLabel: string;
  displayValue: string;
  isExternal: boolean;
}

export interface SocialPlatformStatus {
  id: SocialPlatformId;
  label: string;
  configured: boolean;
  href: string | null;
  configKeyPath: string;
  placeholderHint: string;
}

/**
 * Formats a WhatsApp configuration value into an official https://wa.me/ click-to-chat URL.
 * Returns null if the input is empty, whitespace, "#" or contains no valid digits/wa.me path.
 * Never invents phone numbers or usernames.
 */
export function normalizeWhatsAppUrl(rawInput: string | undefined | null): string | null {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const trimmed = rawInput.trim();
  if (!trimmed || trimmed === '#') return null;

  // If already a full wa.me or api.whatsapp.com URL
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(trimmed)) {
    // Ensure there's an actual phone number or path after wa.me/
    const afterSlash = trimmed.replace(/^https?:\/\/(wa\.me|api\.whatsapp\.com)\/?/i, '').trim();
    if (!afterSlash) return null;
    return trimmed;
  }

  // If user provided wa.me/<number> without protocol
  if (/^wa\.me\//i.test(trimmed)) {
    const afterSlash = trimmed.replace(/^wa\.me\/+/i, '').trim();
    if (!afterSlash) return null;
    return `https://wa.me/${afterSlash}`;
  }

  // Otherwise treat as international phone number (e.g. "+880 17XX-XXXXXX" -> "88017XXXXXXXX")
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  if (digitsOnly.length < 7) {
    return null;
  }
  return `https://wa.me/${digitsOnly}`;
}

/**
 * Validates and normalizes a raw social link or email string for a given platform.
 * Returns null if empty, "#" or invalid so unconfigured links are never rendered.
 */
export function normalizeSocialUrl(
  platform: SocialPlatformId,
  rawInput: string | undefined | null
): string | null {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const trimmed = rawInput.trim();
  if (!trimmed || trimmed === '#') return null;

  if (platform === 'email') {
    if (trimmed.toLowerCase().startsWith('mailto:')) {
      const address = trimmed.slice(7).trim();
      return address.includes('@') ? `mailto:${address}` : null;
    }
    return trimmed.includes('@') ? `mailto:${trimmed}` : null;
  }

  if (platform === 'whatsapp') {
    return normalizeWhatsAppUrl(trimmed);
  }

  // External web profiles: github, facebook, instagram
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Support domain-prefixed URLs without protocol (e.g. "github.com/shazidzone")
  if (
    trimmed.startsWith('github.com/') ||
    trimmed.startsWith('facebook.com/') ||
    trimmed.startsWith('fb.com/') ||
    trimmed.startsWith('instagram.com/')
  ) {
    return `https://${trimmed}`;
  }

  return null;
}

/**
 * Extracts a human-readable handle or display string for Contact cards.
 */
export function formatDisplayValue(platform: SocialPlatformId, href: string, rawInput: string): string {
  if (platform === 'email') {
    return href.replace(/^mailto:/i, '');
  }
  if (platform === 'whatsapp') {
    const digits = href.replace(/^https?:\/\/wa\.me\//i, '').split('?')[0];
    return digits ? `wa.me/${digits}` : rawInput.trim();
  }
  try {
    const url = new URL(href);
    const cleanPath = url.pathname.replace(/^\/+|\/+$/g, '');
    return cleanPath ? `${url.hostname.replace(/^www\./, '')}/${cleanPath}` : url.hostname;
  } catch {
    return rawInput.trim();
  }
}

/**
 * Returns only the configured, valid social links from siteConfig.
 * Empty or missing links are automatically excluded so no dead "#" icons ever render.
 */
export function getActiveSocialLinks(config: SiteConfig = defaultSiteConfig): ResolvedSocialLink[] {
  const ownerName = config.name || 'Shazid Mahmud Mugdho';

  const rawEntries: Array<{
    id: SocialPlatformId;
    label: string;
    rawValue: string | undefined;
    ariaLabel: string;
  }> = [
    {
      id: 'github',
      label: 'GitHub',
      rawValue: config.github || config.socialLinks?.github,
      ariaLabel: `${ownerName} on GitHub`
    },
    {
      id: 'facebook',
      label: 'Facebook',
      rawValue: config.socialLinks?.facebook,
      ariaLabel: `${ownerName} on Facebook`
    },
    {
      id: 'instagram',
      label: 'Instagram',
      rawValue: config.socialLinks?.instagram,
      ariaLabel: `${ownerName} on Instagram`
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      rawValue: config.socialLinks?.whatsapp,
      ariaLabel: `Chat with ${ownerName} on WhatsApp`
    },
    {
      id: 'email',
      label: 'Email',
      rawValue: config.email || config.socialLinks?.email,
      ariaLabel: `Send an email to ${ownerName} (${config.email || 'hello@shazid.me'})`
    }
  ];

  const resolved: ResolvedSocialLink[] = [];

  for (const entry of rawEntries) {
    const href = normalizeSocialUrl(entry.id, entry.rawValue);
    if (!href) continue;

    resolved.push({
      id: entry.id,
      label: entry.label,
      href,
      ariaLabel: entry.ariaLabel,
      displayValue: formatDisplayValue(entry.id, href, entry.rawValue || ''),
      isExternal: entry.id !== 'email'
    });
  }

  return resolved;
}

/**
 * Returns the configuration status of all 5 supported platforms for the configuration inspector.
 */
export function getAllSocialPlatformStatuses(
  config: SiteConfig = defaultSiteConfig
): SocialPlatformStatus[] {
  const definitions: Array<{
    id: SocialPlatformId;
    label: string;
    raw: string | undefined;
    configKeyPath: string;
    placeholderHint: string;
  }> = [
    {
      id: 'github',
      label: 'GitHub',
      raw: config.github || config.socialLinks?.github,
      configKeyPath: 'siteConfig.github',
      placeholderHint: 'https://github.com/shazidzone'
    },
    {
      id: 'email',
      label: 'Email',
      raw: config.email || config.socialLinks?.email,
      configKeyPath: 'siteConfig.email',
      placeholderHint: 'hello@shazid.me'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      raw: config.socialLinks?.facebook,
      configKeyPath: 'siteConfig.socialLinks.facebook',
      placeholderHint: 'https://facebook.com/your-profile'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      raw: config.socialLinks?.instagram,
      configKeyPath: 'siteConfig.socialLinks.instagram',
      placeholderHint: 'https://instagram.com/your-handle'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      raw: config.socialLinks?.whatsapp,
      configKeyPath: 'siteConfig.socialLinks.whatsapp',
      placeholderHint: 'https://wa.me/8801XXXXXXXXX'
    }
  ];

  return definitions.map((def) => {
    const href = normalizeSocialUrl(def.id, def.raw);
    return {
      id: def.id,
      label: def.label,
      configured: Boolean(href),
      href,
      configKeyPath: def.configKeyPath,
      placeholderHint: def.placeholderHint
    };
  });
}
