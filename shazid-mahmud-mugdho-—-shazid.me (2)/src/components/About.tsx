import React from 'react';
import { type SiteConfig } from '../data/siteConfig.js';

interface AboutProps {
  config: SiteConfig;
}

export const About: React.FC<AboutProps> = ({ config }) => {
  const principles = [
    {
      index: '01',
      title: 'Clarity Over Noise',
      subtitle: 'Visual & Functional Restraint',
      description:
        'Every typographic choice, spatial margin, and interaction serves a distinct purpose. Minimalism is not the absence of detail, but the deliberate removal of distraction.'
    },
    {
      index: '02',
      title: 'Maintainable Architecture',
      subtitle: 'Single Source of Truth',
      description:
        'Engineered around clean, decoupled modules and centralized configuration so evolving the platform over time remains effortless and resilient.'
    },
    {
      index: '03',
      title: 'Accessible by Default',
      subtitle: 'Universal Usability',
      description:
        'Crafted with semantic HTML, keyboard focus precision, and high-contrast optical balance so the experience reads effortlessly across every viewport.'
    }
  ];

  return (
    <section
      id="about"
      className="relative py-24 md:py-32 border-b border-white/[0.07]"
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
        {/* Section Editorial Index */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left 5 Columns: Sticky Monumental Section Header */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="font-serif-editorial italic text-3xl text-[#3978FF]">
                01.
              </span>
              <span className="text-xs font-mono text-[#8993A4]">
                Philosophy &amp; Ethos
              </span>
            </div>

            <h2
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#F4F5F7] tracking-tight leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Quiet precision in a{' '}
              <span className="font-serif-editorial italic font-normal text-[#8993A4]">
                noisy digital world.
              </span>
            </h2>

            <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#8993A4]">
              <span>Identity</span>
              <span className="text-[#F4F5F7]">{config.name}</span>
            </div>
          </div>

          {/* Right 7 Columns: Editorial Narrative + Unboxed Architectural Ledger */}
          <div className="lg:col-span-7 space-y-14">
            {/* Large Editorial Lead Statement */}
            <div className="space-y-6">
              <p className="font-display text-xl sm:text-2xl md:text-[1.65rem] font-light text-[#F4F5F7] leading-[1.45] tracking-[-0.01em]">
                <span className="text-[#3978FF] font-normal">shazid.me</span> is
                the personal monograph and digital home of {config.name}—an
                independent anchor on the open web for sharing explorations in
                software, design systems, and modern web craft.
              </p>

              <p className="text-base sm:text-lg text-[#8993A4] font-light leading-relaxed max-w-[64ch]">
                Rather than filling the screen with ornamental widgets or
                synthetic noise, this platform treats web architecture like
                editorial print: generous negative space, deliberate typographic
                hierarchy, and direct channels to connect.
              </p>
            </div>

            {/* Unboxed Architectural Ledger (Replaces Repetitive Small Cards) */}
            <div className="border-t border-white/10">
              {principles.map((item) => (
                <div
                  key={item.index}
                  className="group relative py-8 border-b border-white/10 transition-colors"
                >
                  {/* Animated Top Electric-Blue Hairline on Hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-px h-[1.5px] bg-[#3978FF] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-baseline">
                    <div className="sm:col-span-5 flex items-baseline gap-4">
                      <span className="font-mono text-xs text-[#3978FF] tabular-nums whitespace-nowrap shrink-0">
                        {item.index} /
                      </span>
                      <div>
                        <h3 className="font-display text-lg sm:text-xl font-semibold text-[#F4F5F7] group-hover:text-[#3978FF] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs font-mono text-[#8993A4] mt-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="sm:col-span-7">
                      <p className="text-sm sm:text-base text-[#8993A4] leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
