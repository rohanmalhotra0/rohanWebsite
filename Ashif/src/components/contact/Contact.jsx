import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import { profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import ContactForm from './ContactForm';

// Each link is a tile in one of the palette's blocks (or on paper), with a
// big outlined arrow that says where it goes: out to another site, to a
// page here, or down to a file.
const LINKS = [
  { label: 'LinkedIn', href: profile.linkedin, external: true, tone: 'block-b', move: 'out' },
  { label: 'GitHub', href: profile.github, external: true, tone: 'block-a', move: 'out' },
  // The pair reads as "the page" and "the file".
  { label: 'Résumé', href: '/resume/', tone: 'paper', move: 'right' },
  { label: 'Download résumé (PDF)', href: profile.resumeUrl, download: true, tone: 'block-c', move: 'down' },
];
const ARROWS = { out: ArrowUpRight, right: ArrowRight, down: ArrowDown };
const TONES = {
  'block-a': 'grain mesh block-a',
  'block-b': 'grain mesh block-b',
  'block-c': 'grain mesh block-c',
  paper: 'border border-line bg-surface text-fg',
};

function Tile({ label, href, external, download, tone, move }) {
  const Arrow = ARROWS[move];
  // A long label keeps its first word big and the rest small under it.
  const [first, ...rest] = label.split(' ');
  return (
    // The tile's block re-points --accent-strong to its own ink, so the focus
    // ring (drawn on the page, around the tile) takes the page's from here.
    <li className="[--focus:var(--accent-strong)] @container">
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        download={download || undefined}
        data-move={move}
        className={cn(
          'contact-tile group relative flex aspect-square flex-col overflow-hidden rounded-[1.75rem] p-[10cqi]',
          'transition-[translate] duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]',
          TONES[tone]
        )}
      >
        <span className="relative type-display text-[length:14.5cqi] leading-[0.95]">
          {first}
          {rest.length ? (
            <>
              {' '}
              <span className="mt-[3cqi] block font-sans text-[length:max(0.875rem,8.5cqi)] font-medium leading-tight tracking-normal text-muted">
                {rest.join(' ')}
              </span>
            </>
          ) : null}
        </span>
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
        <span aria-hidden="true" className="absolute bottom-[7cqi] right-[7cqi] size-[46cqi]">
          <Arrow absoluteStrokeWidth strokeWidth={2} className="tile-arrow size-full" />
          <Arrow absoluteStrokeWidth strokeWidth={2} className="tile-arrow tile-arrow-next size-full" />
        </span>
      </a>
    </li>
  );
}

/**
 * The message form's postcard: a card in an airmail border that sits at a
 * slight angle on wide screens and straightens up while you write on it.
 */
function Postcard({ children }) {
  return (
    <div
      className={cn(
        'airmail rounded-2xl p-2 shadow-[0_28px_60px_-28px_rgb(0_0_0/0.45)]',
        'transition-[rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:-rotate-[1.25deg] lg:focus-within:rotate-0'
      )}
    >
      <div className="relative rounded-[0.625rem] bg-surface p-5 sm:p-8">{children}</div>
    </div>
  );
}

/**
 * The other ways to reach me as tiles, and the message form as a postcard.
 * The email address is in the page's header block (ContactPage).
 */
export default function Contact({ className }) {
  return (
    // md: the four tiles in a row over the postcard. lg: two by two beside it,
    // centred on its height.
    <div className={cn('grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-8', className)}>
      <Reveal className="lg:col-span-5">
        <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 lg:grid-cols-2">
          {LINKS.map((link) => (
            <Tile key={link.label} {...link} />
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.08} className="lg:col-span-7 lg:pt-2">
        <Postcard>
          <ContactForm />
        </Postcard>
      </Reveal>
    </div>
  );
}
