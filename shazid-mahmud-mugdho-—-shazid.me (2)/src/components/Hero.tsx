import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { type SiteConfig } from '../data/siteConfig.js';
import { SocialLinks } from './SocialLinks';

interface HeroProps {
  config: SiteConfig;
}

export const Hero: React.FC<HeroProps> = ({ config }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: relX * 14, y: relY * 14 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const nameParts = config.name.trim().split(' ');
  const lastWord = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstWords =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : config.name;

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/[0.07] bg-editorial-grid"
    >
      {/* Ambient Electric-Blue Studio Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[8%] w-[560px] h-[560px] rounded-full opacity-25 blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(57,120,255,0.65) 0%, rgba(57,120,255,0.08) 55%, transparent 75%)'
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[5%] w-[420px] h-[420px] rounded-full opacity-15 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(57,120,255,0.5) 0%, transparent 70%)'
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 sm:px-10">
        {/* Top Editorial Horizon Line */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-12 border-b border-white/[0.07] text-xs font-mono text-[#8993A4]">
          <span>00. Personal Monograph</span>
          <span className="hidden sm:inline text-white/25" aria-hidden="true">
            —
          </span>
          <span>Digital Identity &amp; Web Architecture</span>
          <a
            href={config.domain}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#3978FF] hover:text-[#F4F5F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-xs"
          >
            <span>shazid.me</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        {/* Asymmetrical 12-Column Studio Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left 7 Columns: Monumental Editorial Typography & Story */}
          <div className="lg:col-span-7 z-10">
            <h1
              className="font-display text-5xl sm:text-6xl xl:text-[5.25rem] font-semibold tracking-[-0.03em] text-[#F4F5F7] leading-[0.98]"
              style={{ textWrap: 'balance' }}
            >
              <span className="block">{firstWords}</span>
              {lastWord && (
                <span className="mt-1 flex flex-wrap items-baseline gap-x-4">
                  <span>{lastWord}</span>
                  <span className="font-serif-editorial italic font-normal text-3xl sm:text-4xl xl:text-5xl text-[#8993A4] tracking-normal">
                    — digital craft.
                  </span>
                </span>
              )}
            </h1>

            <p className="mt-8 text-base sm:text-lg md:text-xl text-[#8993A4] font-light leading-[1.7] max-w-[56ch]">
              An independent digital space dedicated to thoughtful web
              architecture, minimalist interfaces, and enduring software
              craft—designed with{' '}
              <span className="text-[#F4F5F7] font-normal">
                clarity, restraint, and intent
              </span>
              .
            </p>

            {/* Primary Actions */}
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="#contact"
                className="group inline-flex items-center gap-3 px-7 py-4 min-h-[48px] text-sm font-medium text-[#F4F5F7] bg-[#3978FF] hover:bg-[#2A66EE] rounded-full shadow-[0_0_35px_-5px_rgba(57,120,255,0.65)] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090B10]"
              >
                <span>Initiate Conversation</span>
                <ArrowUpRight
                  className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  aria-hidden="true"
                />
              </a>

              <a
                href="#projects"
                className="group inline-flex items-center gap-2.5 px-6 py-4 min-h-[48px] text-sm font-medium text-[#F4F5F7] hover:text-[#3978FF] border-b border-white/20 hover:border-[#3978FF] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-xs"
              >
                <span>Explore Selected Work</span>
                <ArrowDownRight
                  className="w-4 h-4 text-[#8993A4] group-hover:text-[#3978FF] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"
                  aria-hidden="true"
                />
              </a>
            </div>

            {/* Unboxed Architectural Social Strip */}
            <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <span className="text-xs font-mono text-[#8993A4]/80 shrink-0">
                Verified Channels
              </span>
              <SocialLinks variant="hero" config={config} />
            </div>
          </div>

          {/* Right 5 Columns: Sculptural Architectural Light Monolith */}
          <div
            className="lg:col-span-5 relative flex items-center justify-center lg:justify-end"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full max-w-[440px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/[0.09] bg-gradient-to-b from-[#131824] via-[#0B0E16] to-[#090B10] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] flex flex-col justify-between p-7 sm:p-8">
              {/* Top Specular Edge */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3978FF]/70 to-transparent"
              />

              {/* Top Monolith Coordinates */}
              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#8993A4]">
                <span>Edition · 2026</span>
                <span className="text-[#3978FF]">shazid.me</span>
              </div>

              {/* Interactive Geometric Light Sculpture (SVG) */}
              <div
                className="relative my-auto flex items-center justify-center transition-transform duration-200 ease-out"
                style={{
                  transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)`
                }}
              >
                <svg
                  viewBox="0 0 360 360"
                  className="w-full h-auto max-w-[300px]"
                  fill="none"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="cobaltGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#3978FF" stopOpacity="0.48" />
                      <stop offset="55%" stopColor="#3978FF" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#090B10" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="monolithFaceA" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E2638" />
                      <stop offset="100%" stopColor="#0B0E15" />
                    </linearGradient>
                    <linearGradient id="monolithFaceB" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#151C2B" />
                      <stop offset="100%" stopColor="#07090E" />
                    </linearGradient>
                    <linearGradient id="cobaltEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#70A0FF" />
                      <stop offset="50%" stopColor="#3978FF" />
                      <stop offset="100%" stopColor="#090B10" />
                    </linearGradient>
                  </defs>

                  <circle cx="180" cy="180" r="155" fill="url(#cobaltGlow)" />

                  <circle
                    cx="180"
                    cy="180"
                    r="142"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="180"
                    cy="180"
                    r="112"
                    stroke="rgba(57,120,255,0.22)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  <ellipse
                    cx="180"
                    cy="180"
                    rx="148"
                    ry="54"
                    transform="rotate(-28 180 180)"
                    stroke="rgba(57,120,255,0.32)"
                    strokeWidth="1"
                  />

                  <polygon
                    points="180,46 266,98 180,150 94,98"
                    fill="url(#monolithFaceA)"
                    stroke="rgba(255,255,255,0.16)"
                    strokeWidth="1"
                  />
                  <polygon
                    points="94,98 180,150 180,296 94,244"
                    fill="url(#monolithFaceB)"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                  <polygon
                    points="180,150 266,98 266,244 180,296"
                    fill="url(#monolithFaceA)"
                    stroke="rgba(57,120,255,0.35)"
                    strokeWidth="1"
                  />

                  <line
                    x1="180"
                    y1="46"
                    x2="180"
                    y2="296"
                    stroke="url(#cobaltEdge)"
                    strokeWidth="2.2"
                  />
                  <circle cx="180" cy="150" r="3.5" fill="#70A0FF" />
                  <circle cx="180" cy="46" r="2.5" fill="#3978FF" />
                </svg>
              </div>

              {/* Bottom Monolith Signature Caption */}
              <div className="relative z-10 pt-5 border-t border-white/[0.08] flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif-editorial italic text-xl text-[#F4F5F7] leading-none">
                    Architecture of Restraint
                  </p>
                  <p className="mt-1.5 text-xs font-mono text-[#8993A4]">
                    {config.email}
                  </p>
                </div>
                <a
                  href={config.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#3978FF] hover:text-[#F4F5F7] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-xs"
                >
                  <span>@shazidzone</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
