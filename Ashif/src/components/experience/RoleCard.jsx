import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Tag } from '@/components/primitives/Tag';
import { cn } from '@/lib/utils';
import { EASE, splitFigures } from './timeline';
import useSpotlight from './useSpotlight';

const MotionDiv = motion.div;

const META = 'font-mono text-[11px] uppercase leading-5 tracking-[0.16em] text-subtle';

// Soft wash that follows the cursor across the card.
const SPOTLIGHT_FILL = {
  background:
    'radial-gradient(520px circle at var(--mx, 50%) var(--my, 0px), color-mix(in oklab, var(--fg) 5%, transparent), transparent 65%)',
};

// Accent glow on the 1px border only: a padded layer masked down to its padding box.
const SPOTLIGHT_RIM = {
  padding: 1,
  background:
    'radial-gradient(280px circle at var(--mx, 50%) var(--my, 0px), color-mix(in oklab, var(--accent-strong) 70%, transparent), transparent 70%)',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
};

const PANEL = {
  open: { height: 'auto', opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

/** Spotlight layers; only rendered on hover-capable devices and only visible on hover. */
function Spotlight() {
  const layer =
    'pointer-events-none absolute rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100';
  return (
    <>
      <span aria-hidden="true" className={cn(layer, 'inset-0 -z-10')} style={SPOTLIGHT_FILL} />
      <span aria-hidden="true" className={cn(layer, '-inset-px')} style={SPOTLIGHT_RIM} />
    </>
  );
}

/** Renders text with standalone figures (898, 99.5%, 500,000) subtly emphasized. */
function Figures({ text }) {
  return splitFigures(text).map((part, i) =>
    i % 2 ? (
      <span key={i} className="font-medium tabular-nums text-fg">
        {part}
      </span>
    ) : (
      part
    )
  );
}

/** Key number callout. "36.7% → 95.0%" gets a quieter arrow. */
function Metric({ value, label }) {
  const [from, to] = value.split('→').map((part) => part.trim());

  return (
    <div className="mt-5 flex flex-col gap-1.5 rounded-xl border border-line bg-surface-2/60 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-5">
      <p className="shrink-0 text-[26px] font-semibold leading-none tracking-[-0.035em] text-accent-strong tabular-nums sm:text-[28px]">
        {to ? (
          <>
            {from}
            <span aria-hidden="true" className="mx-1.5 align-[0.12em] text-[0.7em] font-normal text-subtle">
              →
            </span>
            <span className="sr-only"> to </span>
            {to}
          </>
        ) : (
          value
        )}
      </p>
      <p className="text-[13px] leading-5 text-muted sm:border-l sm:border-line sm:pl-5">{label}</p>
    </div>
  );
}

/**
 * One role: title, company/location/date, summary, metric, tags, and an
 * expandable list of highlights.
 */
export default function RoleCard({ role, defaultOpen = false, spotlight = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const ref = useSpotlight(spotlight);
  const id = useId();
  const titleId = `${id}title`;
  const panelId = `${id}highlights`;
  // Some entries reuse the date text as the location ("Earlier experience").
  const location = role.location && role.location !== role.date ? role.location : null;
  const count = role.highlights?.length ?? 0;

  return (
    <article
      ref={ref}
      aria-labelledby={titleId}
      className={cn(
        'card group relative isolate px-[var(--pad)] pt-[var(--pad)] transition-colors duration-300 hover:border-line-strong',
        count ? 'pb-1' : 'pb-[var(--pad)]'
      )}
    >
      {spotlight ? <Spotlight /> : null}

      <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h3
          id={titleId}
          className="text-pretty text-lg font-semibold leading-7 tracking-[-0.02em] text-fg sm:text-xl"
        >
          {role.role}
        </h3>
        <p className={cn(META, 'order-first mb-1 sm:order-none sm:mb-0 sm:shrink-0')}>{role.date}</p>
      </header>
      <p className={cn(META, 'mt-1')}>
        <span className="text-muted">{role.company}</span>
        {location ? (
          <>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            {location}
          </>
        ) : null}
      </p>

      <p className="mt-4 text-pretty text-[15px] leading-7 text-muted">{role.summary}</p>

      {role.metric ? <Metric {...role.metric} /> : null}

      {role.tags?.length ? (
        <ul aria-label="Tools and topics" className="mt-5 flex flex-wrap gap-1.5">
          {role.tags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
      ) : null}

      {count ? (
        <div className="mt-5 border-t border-line">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="group/toggle flex min-h-12 w-full items-center justify-between gap-4 text-left"
          >
            <span className={cn(META, 'transition-colors group-hover/toggle:text-fg')}>
              Highlights <span className="ml-1 text-muted tabular-nums">{String(count).padStart(2, '0')}</span>
            </span>
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-full border border-line text-muted transition-colors group-hover/toggle:border-line-strong group-hover/toggle:text-fg"
            >
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-300 ease-out-expo',
                  open && 'rotate-180'
                )}
              />
            </span>
          </button>

          <MotionDiv
            id={panelId}
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={PANEL}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.25 } }
            }
            inert={!open}
            className="overflow-hidden"
          >
            <ul className="space-y-3 pb-[calc(var(--pad)-4px)] pt-1">
              {role.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-[14.5px] leading-6 text-muted">
                  <span aria-hidden="true" className="mt-3 h-px w-2.5 shrink-0 bg-line-strong" />
                  <span className="text-pretty">
                    <Figures text={highlight} />
                  </span>
                </li>
              ))}
            </ul>
          </MotionDiv>
        </div>
      ) : null}
    </article>
  );
}
