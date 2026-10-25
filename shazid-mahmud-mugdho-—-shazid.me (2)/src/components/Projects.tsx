import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { type SiteConfig } from '../data/siteConfig.js';

interface ProjectsProps {
  config: SiteConfig;
}

type CategoryFilter = 'all' | 'identity' | 'github' | 'upcoming';

interface WorkItem {
  id: string;
  index: string;
  category: CategoryFilter;
  categoryLabel: string;
  statusLabel: string;
  title: string;
  editorialSubtitle: string;
  description: string;
  meta: string[];
  href?: string;
  ctaLabel?: string;
  isExternal?: boolean;
  visualType: 'identity-system' | 'github-constellation' | 'upcoming-blueprint';
}

export const Projects: React.FC<ProjectsProps> = ({ config }) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const items: WorkItem[] = [
    {
      id: 'shazid-me-web',
      index: '01',
      category: 'identity',
      categoryLabel: 'Web Identity',
      statusLabel: 'Live Platform',
      title: 'shazid.me — Personal Brand Monograph',
      editorialSubtitle: 'Bespoke Dark Editorial System & Full-Stack Architecture',
      description:
        'A custom-engineered personal brand platform built around dark-mode optical typography, centralized social link resolution, and Cloudflare edge architecture.',
      meta: ['React 19', 'Tailwind CSS', 'Cloudflare Pages', 'Editorial Design'],
      href: config.domain,
      ctaLabel: 'Visit shazid.me',
      isExternal: true,
      visualType: 'identity-system'
    },
    {
      id: 'github-shazidzone',
      index: '02',
      category: 'github',
      categoryLabel: 'Code & Repositories',
      statusLabel: 'Public Profile',
      title: 'GitHub — @shazidzone',
      editorialSubtitle: 'Open-Source Explorations & Software Engineering',
      description:
        'Public code repositories, modular web utilities, and ongoing software engineering experiments maintained directly on GitHub.',
      meta: ['GitHub', 'TypeScript', 'Web Systems', 'Open Source'],
      href: config.github,
      ctaLabel: 'Explore @shazidzone on GitHub',
      isExternal: true,
      visualType: 'github-constellation'
    },
    {
      id: 'future-builds',
      index: '03',
      category: 'upcoming',
      categoryLabel: 'In Progress',
      statusLabel: 'Upcoming',
      title: 'Upcoming Web & Software Builds',
      editorialSubtitle: 'Next-Generation Interfaces & Technical Documentation',
      description:
        'New web applications, developer tools, and documented case studies are actively being crafted and will be published here upon release.',
      meta: ['Architecture', 'Minimalist UI', 'Documentation'],
      href: '#contact',
      ctaLabel: 'Inquire or Collaborate',
      isExternal: false,
      visualType: 'upcoming-blueprint'
    }
  ];

  const filteredItems =
    filter === 'all' ? items : items.filter((item) => item.category === filter);

  const filterButtons: Array<{ id: CategoryFilter; label: string }> = [
    { id: 'all', label: 'All Works (03)' },
    { id: 'identity', label: 'Web Identity' },
    { id: 'github', label: 'GitHub' },
    { id: 'upcoming', label: 'Upcoming' }
  ];

  const renderShowcasePreview = (item: WorkItem) => {
    if (item.visualType === 'identity-system') {
      return (
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#121723] via-[#0B0E17] to-[#090B10] border border-white/[0.09] p-6 sm:p-8 flex flex-col justify-between group-hover:border-[#3978FF]/50 transition-colors duration-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 blur-[80px]"
            style={{
              background: 'radial-gradient(circle, #3978FF 0%, transparent 70%)'
            }}
          />

          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#8993A4] pb-4 border-b border-white/[0.07]">
            <span>Design System Specimen · shazid.me</span>
            <span className="text-[#3978FF]">Editorial Monograph</span>
          </div>

          <div className="relative z-10 my-auto py-4 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-7 space-y-2">
              <p className="text-xs font-mono text-[#8993A4]">
                Typographic Pairing
              </p>
              <p className="font-display text-2xl sm:text-4xl font-semibold text-[#F4F5F7] tracking-tight">
                Outfit <span className="text-[#3978FF]">+</span>{' '}
                <span className="font-serif-editorial italic font-normal text-[#8993A4]">
                  Cormorant
                </span>
              </p>
              <p className="text-xs font-mono text-[#8993A4]">
                #090B10 · #151922 · #3978FF · #F4F5F7
              </p>
            </div>

            <div className="col-span-5 flex justify-end">
              <div className="w-full max-w-[160px] space-y-2 p-3.5 rounded-xl bg-[#090B10]/90 border border-white/10">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8993A4]">
                  <span>Contrast</span>
                  <span className="text-[#3978FF]">AAA</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-4/5 bg-[#3978FF] rounded-full" />
                </div>
                <div className="pt-1 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#090B10] border border-white/20" />
                  <span className="w-3 h-3 rounded-full bg-[#151922] border border-white/20" />
                  <span className="w-3 h-3 rounded-full bg-[#3978FF]" />
                  <span className="w-3 h-3 rounded-full bg-[#F4F5F7]" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#8993A4] pt-4 border-t border-white/[0.07]">
            <span>https://shazid.me</span>
            <span className="inline-flex items-center gap-1 text-[#F4F5F7] group-hover:text-[#3978FF] transition-colors">
              <span>Inspect Platform</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      );
    }

    if (item.visualType === 'github-constellation') {
      return (
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F1420] via-[#090B10] to-[#121826] border border-white/[0.09] p-6 sm:p-8 flex flex-col justify-between group-hover:border-[#3978FF]/50 transition-colors duration-200">
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#8993A4] pb-4 border-b border-white/[0.07]">
            <span>github.com/shazidzone</span>
            <span className="text-[#3978FF]">Public Repositories</span>
          </div>

          <div className="relative z-10 my-auto py-2 flex items-center justify-center">
            <svg
              viewBox="0 0 480 150"
              className="w-full h-auto"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="40"
                y1="75"
                x2="440"
                y2="75"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <path
                d="M 80 75 C 140 75, 150 30, 210 30 L 330 30 C 370 30, 380 75, 410 75"
                stroke="#3978FF"
                strokeWidth="1.75"
                fill="none"
              />
              <path
                d="M 140 75 C 180 75, 190 120, 250 120 L 350 120"
                stroke="rgba(137,147,164,0.45)"
                strokeWidth="1.25"
                strokeDasharray="4 4"
                fill="none"
              />
              <circle cx="80" cy="75" r="5" fill="#090B10" stroke="#F4F5F7" strokeWidth="2" />
              <circle cx="210" cy="30" r="5" fill="#3978FF" />
              <circle cx="330" cy="30" r="5" fill="#3978FF" />
              <circle cx="250" cy="120" r="4" fill="#8993A4" />
              <circle cx="410" cy="75" r="6" fill="#3978FF" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#8993A4] pt-4 border-t border-white/[0.07]">
            <span>Handle · @shazidzone</span>
            <span className="inline-flex items-center gap-1 text-[#F4F5F7] group-hover:text-[#3978FF] transition-colors">
              <span>Open GitHub Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#111520] via-[#090B10] to-[#0D111A] border border-white/[0.09] p-6 sm:p-8 flex flex-col justify-between group-hover:border-[#3978FF]/50 transition-colors duration-200">
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#8993A4] pb-4 border-b border-white/[0.07]">
          <span>Upcoming Releases · shazid.me</span>
          <span className="text-[#3978FF]">In Development</span>
        </div>

        <div className="relative z-10 my-auto py-4 flex flex-col items-start justify-center">
          <p className="font-serif-editorial italic text-2xl sm:text-3xl text-[#F4F5F7]">
            “Form follows clarity.”
          </p>
          <p className="mt-2 text-xs font-mono text-[#8993A4]">
            New web applications and architectural write-ups in preparation.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#8993A4] pt-4 border-t border-white/[0.07]">
          <span>Status · Iterating</span>
          <span className="inline-flex items-center gap-1 text-[#F4F5F7] group-hover:text-[#3978FF] transition-colors">
            <span>Inquire for Collaboration</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <section
      id="projects"
      className="py-24 md:py-32 border-b border-white/[0.07]"
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
        {/* Section Header + Segmented Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-14 border-b border-white/10">
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="font-serif-editorial italic text-3xl text-[#3978FF]">
                02.
              </span>
              <span className="text-xs font-mono text-[#8993A4]">
                Selected Works &amp; Archive
              </span>
            </div>

            <h2
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#F4F5F7] tracking-tight leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Digital presence &amp;{' '}
              <span className="font-serif-editorial italic font-normal text-[#8993A4]">
                ongoing explorations.
              </span>
            </h2>
          </div>

          {/* Interactive Filter Controls */}
          <div
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#151922] border border-white/[0.08] rounded-full self-start"
            role="group"
            aria-label="Filter projects by category"
          >
            {filterButtons.map((btn) => {
              const active = filter === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setFilter(btn.id)}
                  className={`px-4 py-2 min-h-[36px] text-xs font-mono rounded-full transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] ${
                    active
                      ? 'bg-[#3978FF] text-[#F4F5F7] shadow-[0_0_20px_-4px_rgba(57,120,255,0.6)]'
                      : 'text-[#8993A4] hover:text-[#F4F5F7]'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-Width Large-Format Editorial Showcases */}
        <div className="divide-y divide-white/10">
          {filteredItems.map((item, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <article
                key={item.id}
                className="group py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
              >
                {/* Narrative & Unboxed Metadata Column */}
                <div
                  className={`lg:col-span-5 flex flex-col justify-between ${
                    isReversed ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2.5 text-xs font-mono text-[#8993A4]">
                      <span className="text-[#3978FF] tabular-nums">
                        {item.index}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#F4F5F7]">{item.statusLabel}</span>
                    </div>

                    <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold text-[#F4F5F7] tracking-tight leading-snug group-hover:text-[#3978FF] transition-colors">
                      {item.title}
                    </h3>

                    <p className="mt-2 font-serif-editorial italic text-lg sm:text-xl text-[#8993A4]">
                      {item.editorialSubtitle}
                    </p>

                    <p className="mt-5 text-sm sm:text-base text-[#8993A4] font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.08]">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#8993A4] mb-6">
                      {item.meta.map((tag, index) => (
                        <React.Fragment key={tag}>
                          {index > 0 && <span aria-hidden="true">·</span>}
                          <span>{tag}</span>
                        </React.Fragment>
                      ))}
                    </div>

                    {item.href && (
                      <a
                        href={item.href}
                        target={item.isExternal ? '_blank' : undefined}
                        rel={item.isExternal ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 text-xs font-mono text-[#F4F5F7] group-hover:text-[#3978FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-xs"
                      >
                        <span>{item.ctaLabel}</span>
                        <ArrowUpRight
                          className="w-4 h-4 text-[#3978FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          aria-hidden="true"
                        />
                      </a>
                    )}
                  </div>
                </div>

                {/* Large 7-Column Interactive Showcase Preview */}
                <div
                  className={`lg:col-span-7 ${
                    isReversed ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.isExternal ? '_blank' : undefined}
                      rel={item.isExternal ? 'noopener noreferrer' : undefined}
                      aria-label={`${item.title} — ${item.ctaLabel}`}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-2xl"
                    >
                      {renderShowcasePreview(item)}
                    </a>
                  ) : (
                    renderShowcasePreview(item)
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;
