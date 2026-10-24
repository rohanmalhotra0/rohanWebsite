import { ArrowRight, ArrowUpRight, Check, Copy, FileText, Github, Linkedin } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import { Container, Eyebrow, Section } from '@/components/primitives/Section';
import { profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import ContactForm from './ContactForm';
import useCopyToClipboard from './useCopyToClipboard';

const links = [
  {
    label: 'LinkedIn',
    detail: 'in/rohanamal',
    href: profile.linkedin,
    icon: Linkedin,
    external: true,
  },
  {
    label: 'GitHub',
    detail: '@rohanmalhotra0',
    href: profile.github,
    icon: Github,
    external: true,
  },
  { label: 'Résumé', detail: 'View online', href: '#/resume', icon: FileText },
];

const COPY_LABELS = { idle: 'Copy', copied: 'Copied', failed: 'Copy failed' };

function EmailBlock() {
  const { status, copy } = useCopyToClipboard();
  const copied = status === 'copied';

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Email</p>
      <a
        href={`mailto:${profile.email}`}
        className="group mt-3 inline-block break-all text-[1.65rem] font-semibold leading-tight tracking-[-0.035em] text-fg sm:text-4xl"
      >
        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_2px]">
          {profile.email}
        </span>
      </a>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copy(profile.email)}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.98]',
            copied
              ? 'border-accent-strong/40 bg-accent/10 text-accent-strong'
              : 'border-line-strong bg-surface/70 text-fg hover:bg-surface-2'
          )}
        >
          {copied ? (
            <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          <span aria-hidden="true">{COPY_LABELS[status]}</span>
          <span className="sr-only">
            {copied ? 'Email address copied' : 'Copy email address'}
          </span>
        </button>
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted transition-colors duration-200 hover:bg-fg/5 hover:text-fg"
        >
          Open mail app
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </div>
      {/* Announces the copy result without moving focus. */}
      <p className="sr-only" aria-live="polite">
        {status === 'copied' ? 'Copied to clipboard' : status === 'failed' ? 'Could not copy' : ''}
      </p>
    </div>
  );
}

export default function Contact() {
  return (
    <Section id="contact">
      <Container>
        <Reveal className="max-w-4xl">
          <Eyebrow index="07" label="Contact" />
          <h2 className="mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-fg sm:text-7xl lg:text-8xl">
            Let&rsquo;s build something <em>together</em>.
          </h2>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted sm:text-lg sm:leading-8">
            I&rsquo;m interested in applied AI, robotics, quantitative systems, and developer
            tools. Send me a note if the work overlaps.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="card relative mt-14 overflow-hidden sm:mt-16">
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            {/* Direct channels */}
            <div className="relative flex flex-col justify-between gap-12 p-6 sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-accent/10 blur-3xl light:bg-accent/25"
              />
              <div className="relative">
                <EmailBlock />
              </div>

              <ul className="relative border-t border-line">
                {links.map(({ label, detail, href, icon, external }) => {
                  const Icon = icon;
                  return (
                  <li key={label} className="border-b border-line">
                    <a
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noreferrer' : undefined}
                      className="group flex min-h-14 items-center gap-4 text-fg"
                    >
                      <Icon aria-hidden="true" className="size-4 text-subtle transition-colors group-hover:text-fg" />
                      <span className="text-[15px] font-medium">{label}</span>
                      <span className="ml-auto truncate font-mono text-xs text-subtle transition-colors group-hover:text-muted">
                        {detail}
                      </span>
                      {external ? (
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-subtle transition-[transform,color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                        />
                      ) : (
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-subtle transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-fg"
                        />
                      )}
                      {external ? <span className="sr-only">(opens in a new tab)</span> : null}
                    </a>
                  </li>
                  );
                })}
              </ul>
            </div>

            {/* Form */}
            <div className="border-t border-line bg-surface-2/40 p-6 sm:p-10 lg:border-l lg:border-t-0">
              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
                Or leave a note
              </p>
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
