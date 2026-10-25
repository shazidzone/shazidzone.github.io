import React from 'react';
import { siteConfig } from '../data/siteConfig.js';

interface NavbarProps {
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const navItems = [
    { id: 'about', label: 'About', href: '#about' },
    { id: 'projects', label: 'Selected Work', href: '#projects' },
    { id: 'interests', label: 'Disciplines', href: '#interests' },
    { id: 'contact', label: 'Contact', href: '#contact' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090B10]/85 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-[#F4F5F7] hover:text-[#3978FF] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-xs"
        >
          shazid.me
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-9 text-sm font-medium text-[#8993A4]"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-xs ${
                  isActive
                    ? 'text-[#F4F5F7]'
                    : 'text-[#8993A4] hover:text-[#F4F5F7]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-[#3978FF] transition-transform duration-150 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <a
            href="#contact"
            aria-label={`Contact ${siteConfig.name}`}
            className="inline-flex items-center justify-center px-5 py-2.5 min-h-[40px] text-xs font-medium tracking-wide text-[#F4F5F7] bg-[#3978FF] hover:bg-[#2A66EE] rounded-full shadow-[0_0_25px_-5px_rgba(57,120,255,0.55)] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090B10]"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
