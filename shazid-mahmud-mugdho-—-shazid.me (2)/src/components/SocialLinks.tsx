import React from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { siteConfig as defaultSiteConfig, type SiteConfig } from '../data/siteConfig.js';
import {
  getActiveSocialLinks,
  type ResolvedSocialLink,
  type SocialPlatformId
} from '../utils/socialLinks';

interface SocialIconProps {
  platform: SocialPlatformId;
  className?: string;
}

/**
 * Recognizable official brand vector icons + Lucide Mail icon
 */
export const SocialPlatformIcon: React.FC<SocialIconProps> = ({
  platform,
  className = 'w-5 h-5'
}) => {
  switch (platform) {
    case 'github':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      );
    case 'email':
    default:
      return <Mail className={className} aria-hidden="true" />;
  }
};

export interface SocialLinksProps {
  variant?: 'hero' | 'contact' | 'footer';
  config?: SiteConfig;
  className?: string;
}

/**
 * Reusable SocialLinks component reading from siteConfig.
 * Automatically omits empty/unconfigured links so no dead "#" icons ever render.
 */
export const SocialLinks: React.FC<SocialLinksProps> = ({
  variant = 'hero',
  config = defaultSiteConfig,
  className = ''
}) => {
  const activeLinks: ResolvedSocialLink[] = getActiveSocialLinks(config);

  if (activeLinks.length === 0) {
    return null;
  }

  if (variant === 'contact') {
    return (
      <nav
        className={`divide-y divide-white/10 border-t border-b border-white/10 ${className}`}
        aria-label="Direct social and contact channels"
      >
        {activeLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            aria-label={link.ariaLabel}
            target={link.isExternal ? '_blank' : undefined}
            rel={link.isExternal ? 'noopener noreferrer' : undefined}
            className="group flex items-center justify-between gap-4 py-4 px-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF]"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-[#8993A4] group-hover:text-[#3978FF] group-hover:border-[#3978FF]/50 transition-colors shrink-0">
                <SocialPlatformIcon platform={link.id} className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-medium text-[#F4F5F7] group-hover:text-white transition-colors">
                  {link.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-mono text-[#8993A4] group-hover:text-[#F4F5F7] truncate transition-colors">
                {link.displayValue}
              </span>
              <ArrowUpRight
                className="w-4 h-4 text-[#8993A4] group-hover:text-[#3978FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
                aria-hidden="true"
              />
            </div>
          </a>
        ))}
      </nav>
    );
  }

  if (variant === 'footer') {
    return (
      <nav
        className={`flex items-center gap-2 ${className}`}
        aria-label="Footer social media links"
      >
        {activeLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            aria-label={link.ariaLabel}
            target={link.isExternal ? '_blank' : undefined}
            rel={link.isExternal ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-[#8993A4] hover:text-[#F4F5F7] hover:border-[#3978FF] hover:bg-[#3978FF]/10 hover:-translate-y-0.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF]"
          >
            <SocialPlatformIcon platform={link.id} className="w-4 h-4" />
          </a>
        ))}
      </nav>
    );
  }

  // 'hero' variant — refined editorial social links with subtle icon & arrow
  return (
    <nav
      className={`flex flex-wrap items-center gap-6 ${className}`}
      aria-label="Personal social links"
    >
      {activeLinks.map((link) => (
        <a
          key={link.id}
          href={link.href}
          aria-label={link.ariaLabel}
          target={link.isExternal ? '_blank' : undefined}
          rel={link.isExternal ? 'noopener noreferrer' : undefined}
          className="group inline-flex items-center gap-2.5 py-2 min-h-[40px] text-[#8993A4] hover:text-[#F4F5F7] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-sm"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white/12 bg-white/[0.02] group-hover:border-[#3978FF] group-hover:bg-[#3978FF]/15 group-hover:text-[#3978FF] transition-all duration-150">
            <SocialPlatformIcon platform={link.id} className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-mono tracking-wider text-[#F4F5F7] group-hover:text-[#3978FF] transition-colors whitespace-nowrap">
            {link.label}
          </span>
          <ArrowUpRight
            className="w-3.5 h-3.5 text-[#8993A4]/60 group-hover:text-[#3978FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            aria-hidden="true"
          />
        </a>
      ))}
    </nav>
  );
};

export default SocialLinks;
