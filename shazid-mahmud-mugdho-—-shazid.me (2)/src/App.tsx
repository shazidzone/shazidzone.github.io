/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { siteConfig } from './data/siteConfig.js';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Interests } from './components/Interests';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('about');

  useEffect(() => {
    const sectionIds = ['about', 'projects', 'interests', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F5F7] flex flex-col selection:bg-[#3978FF]/30 selection:text-[#F4F5F7]">
      <Navbar activeSection={activeSection} />

      <main className="flex-1">
        <Hero config={siteConfig} />
        <About config={siteConfig} />
        <Projects config={siteConfig} />
        <Interests />
        <Contact config={siteConfig} />
      </main>

      <Footer config={siteConfig} />
    </div>
  );
}
