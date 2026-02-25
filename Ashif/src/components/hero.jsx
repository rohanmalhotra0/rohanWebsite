import React from 'react';
import Spline from '@splinetool/react-spline';
import { ArrowRight } from 'lucide-react';
import RotatingText from './RotatingText';

const assetUrl = (path) =>
  `${import.meta.env.BASE_URL || '/'}${String(path || '').replace(/^\/+/, '')}`;

/**
 * A modern, minimal hero section component.
 */
export default function Hero() {
  const focusAreas = [
    'Systems',
    'Infrastructure',
    'Applied Research',
    'Concurrency',
    'Distributed Systems',
    'Numerical Computing',
  ];
  const greetings = [
    "Hello, I'm",
    "Hola, soy",
    "Hallo, ich bin",
    "Olá, eu sou",
    "Привет, я",
    "こんにちは、私は",
    "مرحباً، أنا",
  ];

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* 1. Spline Background */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <Spline
          scene="https://prod.spline.design/9xuF1oRA5poA131s/scene.splinecode"
          aria-label="Interactive 3D animation"
          onLoad={(spline) => {
            const candidates = [
              'ROBOT',
              'Robot',
              'robot',
              'Text',
              'text',
              'BackgroundText',
              'backgroundText',
              'Title',
              'title',
            ];
            candidates.forEach((name) => {
              try {
                const obj = spline?.findObjectByName?.(name);
                if (obj) obj.visible = false;
              } catch {
                // ignore
              }
            });
          }}
        />
      </div>

      {/* 2. Overlay Content */}
      {/* Content is aligned to the center */}
      <div className="relative z-20 flex items-center justify-center w-full h-full p-8 text-center bg-black/20 pointer-events-none sm:p-16 md:p-24">
        <div className="max-w-3xl pointer-events-auto">
          <h1 className="font-pixel inline-flex items-baseline justify-center gap-x-3 font-bold text-white whitespace-nowrap leading-none text-[clamp(1.6rem,6vw,4.75rem)] [text-shadow:_0_3px_5px_rgb(0_0_0_/_40%)]">
            <RotatingText
              texts={greetings}
              rotationInterval={3200}
              splitBy="characters"
              staggerDuration={0.06}
              staggerFrom="first"
              mainClassName="inline-flex items-baseline leading-none"
              splitLevelClassName="overflow-hidden"
              elementLevelClassName="leading-none"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-140%", opacity: 0 }}
            />
            <span className="leading-none">Rohan</span>
          </h1>
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-center">
              <div className="text-lg text-white/90 md:text-xl lg:text-2xl [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                Mathematics &amp; Computer Science @ NYU Courant
              </div>
            </div>
            <div className="flex justify-center">
              <RotatingText
                texts={focusAreas}
                mainClassName="text-base text-white/85 md:text-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]"
                splitLevelClassName="overflow-hidden"
                staggerDuration={0.08}
                staggerFrom="last"
              />
            </div>
            <p className="text-sm leading-relaxed text-white/85 md:text-base">
              Engineer focused on mathematical systems, concurrency, and real-time computation. I build tools that translate theory into reliable infrastructure.
            </p>
          </div>
        
          {/* Call-to-action buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <a
              href="#projects"
              onClick={e => {
                e.preventDefault();
                setTimeout(() => {
                  const el = document.getElementById('projects');
                  if (el) {
                    el.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                      inline: 'nearest'
                    });
                  }
                }, 100);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-black transition-all duration-300 bg-white rounded-lg shadow-lg pointer-events-auto hover:bg-gray-200 hover:scale-105"
            >
              View My Work
              <ArrowRight size={20} />
            </a>
            <a
              href={assetUrl('website-photos/misc/resume.pdf')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white transition-all duration-300 bg-transparent border border-white rounded-lg shadow-lg pointer-events-auto hover:bg-white hover:text-black hover:scale-105"
            >
              View Resume
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}