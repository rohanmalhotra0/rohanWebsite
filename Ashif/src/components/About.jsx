import React from 'react';
import ScrollReveal from './ScrollReveal';
import { Highlighter } from "@/components/ui/highlighter";

export default function About({ scrollContainerRef }) {
  return (
    <section
      id="about"
      className="w-full min-h-screen bg-white text-black p-8 sm:p-16 md:p-24 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full">
        <div className="mb-12 flex justify-center text-center">
          <h2 className="text-5xl font-bold font-pixel underline-wavy-yellow inline-block">
            <Highlighter action="underline" color="#FFD700">
              About
            </Highlighter>
          </h2>
        </div>

        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-12">
          <div className="w-full max-w-[220px] sm:max-w-[240px] md:max-w-[280px] flex-shrink-0">
            <img
              src="/website-photos/headshot.png"
              alt="Rohan Malhotra headshot"
              loading="lazy"
              decoding="async"
              className="w-full aspect-square object-cover rounded-2xl shadow-lg border border-gray-200"
            />
          </div>

          <div className="flex-1">
            <ScrollReveal
              scrollContainerRef={scrollContainerRef}
              baseOpacity={0}
              enableBlur={true}
              baseRotation={1.2}
              blurStrength={10}
              containerClassName="my-0"
              textSizeClassName="text-xs sm:text-sm md:text-base"
              textClassName="font-sans leading-relaxed text-center md:text-left font-normal"
            >
              Rohan Malhotra is a Mathematics and Computer Science student at NYU Courant. His work spans algorithms and systems engineering, concurrency and multithreaded programming, statistical modeling and applied mathematics, real-time data pipelines, and research-driven software design. He builds structured systems grounded in mathematical reasoning and practical implementation.
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}