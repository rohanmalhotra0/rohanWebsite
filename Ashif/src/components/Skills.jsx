import React from 'react';
import { Highlighter } from "@/components/ui/highlighter";
import { VelocityText } from './ScrollVelocity';
import { Cpp, Docker, Git, Javascript, Node, Postman, PyTorch, Python, ReactLogo, Sql, Typescript } from './SkillLogos';
import { Highlighter } from "@/components/ui/highlighter";
import { GridPattern } from "@/components/ui/grid-pattern";

const skillsRow1 = [
  <Cpp key="cpp" />,
  <Python key="python" />,
  <Git key="git" />,
  <Docker key="docker" />,
];

const skillsRow2 = [
  <PyTorch key="pytorch" />,
  <Sql key="sql" />,
  <ReactLogo key="react" />,
  <Node key="node" />,
  <Javascript key="js" />,
  <Typescript key="ts" />,
  <Postman key="postman" />,
];

export default function Skills() {
  return (
    <section id="skills" className="relative w-full bg-white text-black py-24 overflow-hidden">
      <GridPattern
        width={48}
        height={48}
        className="fill-gray-300/20 stroke-gray-300/55 [mask-image:radial-gradient(620px_circle_at_center,white,transparent)]"
      />

      <div className="relative z-10 container mx-auto text-center">
        <div className="inline-block mb-12">
          <h2 className="text-5xl font-bold font-pixel inline-block">
            <Highlighter action="underline" color="#FFD700">
              My Tech Stack
            </Highlighter>
          </h2>
        </div>
      </div>
      <div className="relative z-10 max-w-screen-lg mx-auto flex flex-col gap-4">
        {/* Left Blur */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10"
             style={{
               background: 'linear-gradient(to right, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0))',
               filter: 'blur(6px)'
             }}
        />
        {/* Right Blur */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10"
             style={{
               background: 'linear-gradient(to left, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0))',
               filter: 'blur(6px)'
             }}
        />
        <VelocityText baseVelocity={-45} numCopies={4}>
          {skillsRow1.map((logo, index) => (
            <div key={index} className="w-20 h-20 text-gray-600 mx-4">
              {logo}
            </div>
          ))}
        </VelocityText>
        <VelocityText baseVelocity={45} numCopies={4}>
          {skillsRow2.map((logo, index) => (
            <div key={index} className="w-20 h-20 text-gray-600 mx-4">
              {logo}
            </div>
          ))}
        </VelocityText>
      </div>
    </section>
  );
}