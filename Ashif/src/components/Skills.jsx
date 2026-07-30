import { Highlighter } from '@/components/ui/highlighter';
import { GridPattern } from '@/components/ui/grid-pattern';
import { VelocityText } from './ScrollVelocity';
import {
  Cpp,
  Docker,
  Git,
  Javascript,
  Node,
  Postman,
  PyTorch,
  Python,
  ReactLogo,
  Sql,
  Typescript,
} from './SkillLogos';

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
    <section
      id="skills"
      className="relative w-full scroll-mt-24 overflow-hidden bg-white py-16 text-black sm:py-24"
    >
      <GridPattern
        width={48}
        height={48}
        className="fill-gray-300/20 stroke-gray-300/55 [mask-image:radial-gradient(620px_circle_at_center,white,transparent)]"
      />

      <div className="container relative z-10 mx-auto px-4 text-center sm:px-8">
        <div className="mb-8 inline-block sm:mb-12">
          <h2 className="underline-wavy-yellow inline-block text-balance font-pixel text-3xl font-bold sm:text-5xl">
            <Highlighter action="underline" color="#FFD700">
              My Tech Stack
            </Highlighter>
          </h2>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-screen-lg flex-col gap-4">
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16"
          style={{
            background:
              'linear-gradient(to right, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0))',
            filter: 'blur(6px)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16"
          style={{
            background:
              'linear-gradient(to left, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0))',
            filter: 'blur(6px)',
          }}
          aria-hidden="true"
        />

        <VelocityText baseVelocity={-45} numCopies={4}>
          {skillsRow1.map((logo, index) => (
            <div key={index} className="mx-3 size-16 text-gray-600 sm:mx-4 sm:size-20">
              {logo}
            </div>
          ))}
        </VelocityText>

        <VelocityText baseVelocity={45} numCopies={4}>
          {skillsRow2.map((logo, index) => (
            <div key={index} className="mx-3 size-16 text-gray-600 sm:mx-4 sm:size-20">
              {logo}
            </div>
          ))}
        </VelocityText>
      </div>
    </section>
  );
}
