import { GraduationCap, MapPin } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { assetUrl } from '@/data/portfolioData';

const coursework = [
  'Algorithms',
  'Operating Systems',
  'Computer Organization',
  'Data Structures',
  'Machine Learning',
  'Software Engineering',
  'Linear Algebra',
  'Probability & Statistics',
  'Real Analysis',
  'Differential Equations',
  'Numerical Methods',
];

export default function Education() {
  return (
    <section
      id="education"
      className="relative scroll-mt-24 overflow-hidden bg-[#f7f7f5] px-5 py-24 sm:px-8 md:px-12 lg:px-16 lg:py-32"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(#e4e4e4_1px,transparent_1px),linear-gradient(90deg,#e4e4e4_1px,transparent_1px)] bg-[size:44px_44px] opacity-60"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="06 / EDUCATION"
          title="What I’m studying at NYU."
          description="I’m finishing an accelerated Computer Science degree with a Mathematics minor, and I use the coursework directly in my research and engineering work."
        />

        <article className="mt-14 grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="border-b border-gray-200 bg-gray-100 p-7 text-gray-950 lg:border-b-0 lg:border-r">
            <figure>
              <img
                src={assetUrl(
                  'website-photos/Work%20Logos/new_york_university_logo.jpeg'
                )}
                alt=""
                className="size-20 rounded-xl bg-white object-contain p-2"
              />
              <figcaption className="mt-4 text-sm font-semibold">
                New York University
              </figcaption>
            </figure>
            <p className="mt-8 font-pixel text-xs text-gray-500">2024 — 2027</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="size-4" aria-hidden="true" />
              New York, NY
            </p>
          </div>

          <div className="p-7 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Courant Institute of Mathematical Sciences
                </p>
                <h3 className="mt-2 text-balance text-3xl font-semibold text-gray-950">
                  B.A. Computer Science · Mathematics minor
                </h3>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right">
                <p className="tabular-nums text-xl font-semibold text-gray-950">3.7 / 4.0</p>
                <p className="mt-1 text-xs text-gray-500">Current GPA</p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-5">
                <GraduationCap className="size-5 text-gray-950" aria-hidden="true" />
                <h4 className="mt-4 font-semibold text-gray-950">Accelerated path</h4>
                <p className="mt-2 text-pretty text-sm leading-6 text-gray-600">
                  Completing the degree in three years, with expected graduation in May 2027.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="font-pixel text-xs text-gray-500">GRADUATE WORK</p>
                <h4 className="mt-4 font-semibold text-gray-950">
                  Mathematical Techniques for CS Applications
                </h4>
                <p className="mt-2 text-pretty text-sm leading-6 text-gray-600">
                  Advanced mathematical tools for algorithms, modeling, and computation.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-950">Selected coursework</h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {coursework.map((course) => (
                  <li
                    key={course}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                  >
                    {course}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
