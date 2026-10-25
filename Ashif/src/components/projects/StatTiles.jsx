import { useEffect, useRef } from 'react';

// Big numbers on bold tiles that count up the first time they scroll into
// view. The markup always holds the real values, so prerendered and no-JS
// pages show them; numbers already on screen when the page loads stay put,
// and reduced motion skips the count.

const TILES = [
  'bg-toy text-on-bright',
  'bg-accent text-accent-ink',
  'bg-spot text-on-bright',
  'bg-fg text-bg',
];

const COUNT_MS = 1400;
const STAGGER_MS = 110;
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/** '99.4%' → { value: 99.4, decimals: 1, suffix: '%' }; null when it isn't a number. */
function parse(text) {
  const match = /^(\d+(?:\.(\d+))?)(.*)$/.exec(String(text));
  return match ? { value: Number(match[1]), decimals: match[2]?.length ?? 0, suffix: match[3] } : null;
}

const format = (n, p) => `${n.toFixed(p.decimals)}${p.suffix}`;

export default function StatTiles({ stats, className = '' }) {
  const listRef = useRef(null);
  const numberRefs = useRef([]);

  useEffect(() => {
    const list = listRef.current;
    if (
      !list ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }
    const rect = list.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return undefined;

    const numbers = numberRefs.current;
    const parsed = stats.map((stat) => parse(stat.value));
    numbers.forEach((el, i) => {
      if (el && parsed[i]) el.textContent = format(0, parsed[i]);
    });

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now) => {
          let running = false;
          numbers.forEach((el, i) => {
            if (!el || !parsed[i]) return;
            const t = Math.max(0, Math.min(1, (now - start - i * STAGGER_MS) / COUNT_MS));
            if (t < 1) running = true;
            el.textContent = t < 1 ? format(parsed[i].value * easeOutExpo(t), parsed[i]) : stats[i].value;
          });
          raf = running ? requestAnimationFrame(step) : 0;
        };
        raf = requestAnimationFrame(step);
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    observer.observe(list);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      numbers.forEach((el, i) => {
        if (el) el.textContent = stats[i].value;
      });
    };
  }, [stats]);

  return (
    <dl ref={listRef} className={`grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 ${className}`}>
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative flex flex-col-reverse justify-end overflow-hidden rounded-xl px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7 ${TILES[i % TILES.length]}`}
        >
          <span aria-hidden="true" className="spot-brackets pointer-events-none absolute inset-2.5 opacity-35" />
          <dt className="mt-2 text-sm font-medium leading-5 sm:text-[15px]">{stat.label}</dt>
          <dd className="type-display whitespace-nowrap text-[clamp(2.3rem,9vw,4.25rem)] lg:text-[clamp(2.5rem,4.6vw,4.25rem)]">
            <span aria-hidden="true" ref={(el) => void (numberRefs.current[i] = el)}>
              {stat.value}
            </span>
            <span className="sr-only">{stat.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
