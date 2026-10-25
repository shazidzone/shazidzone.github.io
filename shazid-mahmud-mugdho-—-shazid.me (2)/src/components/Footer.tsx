import React from 'react';
import { type SiteConfig } from '../data/siteConfig.js';
import { SocialLinks } from './SocialLinks';

interface FooterProps {
  config: SiteConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-[#090B10] border-t border-white/[0.08]">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs font-mono text-[#8993A4]">
          <a
            href="#top"
            className="font-display text-sm font-semibold text-[#F4F5F7] hover:text-[#3978FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-xs"
          >
            shazid.me
          </a>
          <span className="hidden sm:inline text-white/20" aria-hidden="true">
            /
          </span>
          <span>
            © {currentYear} {config.name}. Crafted with restraint.
          </span>
        </div>

        {/* Footer Compact Row of Social Icons */}
        <SocialLinks variant="footer" config={config} />
      </div>
    </footer>
  );
};

export default Footer;
