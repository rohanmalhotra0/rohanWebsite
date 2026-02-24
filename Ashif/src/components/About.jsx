import React from 'react';
import ScrollReveal from './ScrollReveal';
import { Highlighter } from "@/components/ui/highlighter";

export default function About({ scrollContainerRef }) {
  return (
    <section id="about" className="w-full min-h-screen bg-white text-black p-8 sm:p-16 md:p-24 flex items-center justify-center">
      <div className="max-w-4xl text-center">
        <div className="mb-12 flex justify-center">
                    <h2 className="text-5xl font-bold font-pixel underline-wavy-yellow inline-block">
                        <Highlighter action="underline" color="#FFD700">
                            About Me 😊
                        </Highlighter>
                    </h2>
        </div>  
        <ScrollReveal
          scrollContainerRef={scrollContainerRef}
          baseOpacity={0}
          enableBlur={true}
          baseRotation={1.2}
          blurStrength={10}
          containerClassName="my-12"
          textClassName="font-sans text-base sm:text-lg md:text-xl"
        >
         I enjoy working with motion, interaction, and web aesthetics — exploring how small details, smooth transitions, and creative visuals can shape a better experience. A lot of my work revolves around experimenting with layouts, animation, and timing, and finding that balance where things not only look good but also feel natural to use. From early visual ideas to refined interfaces, I like focusing on flow, usability, and the tiny moments that make a project feel cohesive and intentional. The goal is always the same — create experiences that feel smooth, engaging, and meaningful rather than just functional.
        </ScrollReveal>
      </div>
    </section>
  );
}