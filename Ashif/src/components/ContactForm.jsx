import { createElement } from 'react';
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { profile } from '@/data/portfolioData';

const links = [
  { label: 'Email', href: `mailto:${profile.email}`, Icon: Mail },
  { label: 'LinkedIn', href: profile.linkedin, Icon: Linkedin },
  { label: 'GitHub', href: profile.github, Icon: Github },
];

export default function ContactForm() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-24 overflow-hidden bg-[#f7f7f5] px-5 pb-36 pt-24 sm:px-8 md:px-12 lg:px-16 lg:pb-40 lg:pt-32"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(#e4e4e4_1px,transparent_1px),linear-gradient(90deg,#e4e4e4_1px,transparent_1px)] bg-[size:44px_44px] opacity-60"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="09 / CONTACT"
          title="Let’s build something difficult."
          description="The best fit is a team working on applied AI, robotics, quantitative systems, developer infrastructure, or a problem that refuses to stay inside one category."
        />

        <div className="mt-14 grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="bg-[#111] p-7 text-white sm:p-9">
            <p className="font-pixel text-xs text-yellow-300">NEW YORK, NY</p>
            <h3 className="mt-5 text-balance text-2xl font-semibold">
              Open to ambitious engineering conversations.
            </h3>
            <p className="mt-3 text-pretty text-sm leading-6 text-white/60">
              Send a note about the team, the technical problem, and what success would look like.
            </p>
            <ul className="mt-8 space-y-2">
              {links.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                    className="flex min-h-11 items-center justify-between rounded-lg border border-white/15 px-3 py-2 text-sm text-white/75 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                  >
                    <span className="inline-flex items-center gap-3">
                      {createElement(Icon, {
                        className: 'size-4',
                        'aria-hidden': true,
                      })}
                      {label}
                    </span>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <form
            action="https://formspree.io/f/xrbwdkqb"
            method="POST"
            className="p-7 sm:p-9"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-gray-900">Name</span>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-900">Email</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                  placeholder="you@company.com"
                />
              </label>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-gray-900">What are you building?</span>
              <textarea
                name="message"
                rows="6"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-950 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                placeholder="A little context goes a long way…"
              />
            </label>
            <button
              type="submit"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5"
            >
              Send message
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
