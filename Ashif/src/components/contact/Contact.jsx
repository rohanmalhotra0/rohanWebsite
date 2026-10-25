import { ArrowUpRight } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { profile } from '@/data/portfolioData';
import ContactForm from './ContactForm';
import EmailLine from './EmailLine';

const INTRO =
  'I’m interested in applied AI, robotics, quantitative systems, and developer tools. Send me a note if the work overlaps.';

const LINKS = [
  { label: 'LinkedIn', href: profile.linkedin, external: true },
  { label: 'GitHub', href: profile.github, external: true },
  // The pair reads as "the page" and "the file".
  { label: 'Résumé', href: '#/resume' },
  { label: 'Download résumé (PDF)', href: profile.resumeUrl, download: true },
];

function ContactLinks({ className }) {
  return (
    <ul className={className}>
      {LINKS.map(({ label, href, external, download }) => (
        <li key={label} className="border-b border-line first:border-t">
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            download={download || undefined}
            className="group flex min-h-12 items-center gap-1.5 text-[15px] font-medium text-fg"
          >
            <span className="underline decoration-transparent decoration-1 underline-offset-[0.22em] transition-[text-decoration-color] duration-150 group-hover:decoration-accent">
              {label}
            </span>
            {external ? (
              <>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 text-subtle transition-[translate,color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                />
                <span className="sr-only"> (opens in a new tab)</span>
              </>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Contact() {
  return (
    <Section id="contact">
      <Container>
        <SectionHeader title="Contact" description={INTRO} />
        {/* Everything ends on a column line. md: stacked, the list stops at column 7 (one gutter
            before the description) and the form spans the full grid. lg: form from column 8. */}
        <div className="mt-12 grid gap-14 sm:mt-16 md:grid-cols-12 md:gap-x-8">
          <Reveal className="md:col-span-12 md:grid md:grid-cols-subgrid md:content-start lg:col-span-7">
            <EmailLine className="md:col-span-12 lg:col-span-7" />
            <ContactLinks className="mt-8 sm:mt-10 md:col-span-7 lg:col-span-4" />
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-12 lg:col-span-5 lg:col-start-8">
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
