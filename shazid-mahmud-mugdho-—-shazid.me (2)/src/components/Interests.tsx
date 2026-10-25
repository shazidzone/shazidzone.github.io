import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface DisciplineItem {
  id: string;
  index: string;
  title: string;
  category: string;
  editorialNote: string;
  summary: string;
  keywords: string[];
}

export const Interests: React.FC = () => {
  const interests: DisciplineItem[] = [
    {
      id: 'web-interfaces',
      index: '01',
      title: 'Modern Web Interfaces',
      category: 'Design & Frontend',
      editorialNote: 'Optical balance, dark-mode contrast & fluid responsiveness.',
      summary:
        'Crafting fast, responsive, and accessible web interfaces where typographic scale, subtle lighting, and micro-interactions elevate everyday usability.',
      keywords: ['Typography', 'Dark UI', 'Responsive Systems']
    },
    {
      id: 'clean-code',
      index: '02',
      title: 'Clean Code & Modularity',
      category: 'Software Architecture',
      editorialNote: 'Single sources of truth & decoupled logic.',
      summary:
        'Structuring applications around clear boundaries and deterministic modules so configurations, validations, and UI views stay simple to reason about.',
      keywords: ['TypeScript', 'Modular State', 'Zero Bloat']
    },
    {
      id: 'digital-identity',
      index: '03',
      title: 'Personal Digital Identity',
      category: 'Open Web',
      editorialNote: 'An independent home on shazid.me.',
      summary:
        'Maintaining a self-hosted personal domain as a permanent, verifiable anchor across platforms—free from algorithmic feed clutter.',
      keywords: ['shazid.me', 'Open Web', 'Direct Ownership']
    },
    {
      id: 'continuous-exploration',
      index: '04',
      title: 'Continuous Exploration',
      category: 'Curiosity & Craft',
      editorialNote: 'Iterative refinement & emerging web standards.',
      summary:
        'Exploring modern edge runtimes, developer tooling, and minimalist design systems at the intersection of engineering and creative direction.',
      keywords: ['Edge Compute', 'Web Standards', 'Craft']
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeItem = interests[activeIndex] || interests[0];

  return (
    <section
      id="interests"
      className="py-24 md:py-32 border-b border-white/[0.07] bg-editorial-grid"
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="font-serif-editorial italic text-3xl text-[#3978FF]">
              03.
            </span>
            <span className="text-xs font-mono text-[#8993A4]">
              Disciplines &amp; Focus Areas
            </span>
          </div>

          <h2
            className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#F4F5F7] tracking-tight leading-[1.12]"
            style={{ textWrap: 'balance' }}
          >
            Areas of curiosity &amp;{' '}
            <span className="font-serif-editorial italic font-normal text-[#8993A4]">
              creative focus.
            </span>
          </h2>
        </div>

        {/* Interactive Split Matrix: Left Typographic Index + Right Focal Inspection Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left 7 Columns: Unboxed Interactive Hairline Index */}
          <div
            className="lg:col-span-7 border-t border-white/10"
            role="tablist"
            aria-label="Areas of curiosity and focus"
          >
            {interests.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`group w-full text-left py-7 border-b border-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] ${
                    isSelected ? 'opacity-100' : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-5">
                      <span
                        className={`font-mono text-xs tabular-nums transition-colors ${
                          isSelected ? 'text-[#3978FF]' : 'text-[#8993A4]'
                        }`}
                      >
                        {item.index}
                      </span>
                      <div>
                        <h3
                          className={`font-display text-xl sm:text-2xl font-semibold tracking-tight transition-colors ${
                            isSelected ? 'text-[#F4F5F7]' : 'text-[#8993A4] group-hover:text-[#F4F5F7]'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="mt-1 font-serif-editorial italic text-base sm:text-lg text-[#8993A4]">
                          {item.editorialNote}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline text-xs font-mono text-[#8993A4]">
                        {item.category}
                      </span>
                      <ArrowUpRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected
                            ? 'text-[#3978FF] translate-x-0.5 -translate-y-0.5'
                            : 'text-[#8993A4]'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 5 Columns: Sticky Architectural Focal Stage */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div
              role="tabpanel"
              className="relative rounded-2xl bg-gradient-to-b from-[#141925] to-[#0B0E15] border border-white/[0.09] p-8 sm:p-10 overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3978FF] to-transparent"
              />

              <div className="flex items-center justify-between text-xs font-mono text-[#8993A4] pb-6 border-b border-white/[0.08]">
                <span>Discipline · {activeItem.index}</span>
                <span className="text-[#3978FF]">{activeItem.category}</span>
              </div>

              <div className="mt-8">
                <p className="font-serif-editorial italic text-4xl text-[#3978FF]">
                  {activeItem.index}.
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#F4F5F7]">
                  {activeItem.title}
                </h3>
                <p className="mt-4 text-sm sm:text-base text-[#8993A4] font-light leading-relaxed">
                  {activeItem.summary}
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-2 text-xs font-mono text-[#8993A4]">
                {activeItem.keywords.map((kw, i) => (
                  <React.Fragment key={kw}>
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <span className="text-[#F4F5F7]">{kw}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Interests;
