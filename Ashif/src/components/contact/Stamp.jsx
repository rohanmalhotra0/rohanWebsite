import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * The postmark: two rings with the site's address around them, the day the
 * message went out in the middle, and wavy cancel lines running off to the
 * left. Only drawn after a send, so the date is the visitor's own.
 */
function Postmark({ className }) {
  const ring = useId();
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();
  return (
    <svg viewBox="-110 0 230 120" className={cn('postmark text-mark', className)} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <circle cx="60" cy="60" r="44" strokeWidth="3" />
        <circle cx="60" cy="60" r="27" strokeWidth="1.5" />
        {/* On phones the thanks wraps under them, so they'd cross it. */}
        <g className="max-sm:hidden">
          {[34, 48, 62, 76, 90].map((y) => (
            <path key={y} d={`M-106 ${y} q 9 -7 18 0 t 18 0 t 18 0 t 18 0 t 18 0`} strokeWidth="3" />
          ))}
        </g>
      </g>
      <defs>
        <path id={ring} d="M 60 60 m -35.5 0 a 35.5 35.5 0 1 1 71 0 a 35.5 35.5 0 1 1 -71 0" />
      </defs>
      <g fill="currentColor" style={{ fontFamily: 'var(--font-mono)' }}>
        <text fontSize="9.5" fontWeight="700" letterSpacing="2.4">
          <textPath href={`#${ring}`}>ROHANM.ORG · ROHANM.ORG ·</textPath>
        </text>
        <text x="60" y="58" textAnchor="middle" fontSize="11.5" fontWeight="700">
          {day}
        </text>
        <text x="60" y="72" textAnchor="middle" fontSize="11.5" fontWeight="700">
          {now.getFullYear()}
        </text>
      </g>
    </svg>
  );
}

/**
 * The postcard's stamp: the home page's robot in the current palette (CSS
 * picks the poster; see the Contact section of index.css), postmarked once
 * sent. The poster loads once the stamp nears the screen (data-near), so it
 * never competes with the page's first paint.
 */
export default function Stamp({ sent, className }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return undefined;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        setNear(true);
      },
      { rootMargin: '400px 0px' }
    );
    seen.observe(element);
    return () => seen.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-near={near || undefined}
      className={cn('pointer-events-none select-none', className)}
    >
      <div className="stamp size-full rotate-3">
        <div className="stamp-art" />
      </div>
      {sent ? (
        <Postmark className="absolute -left-[118%] top-[18%] w-[230%] -rotate-12 opacity-90" />
      ) : null}
    </div>
  );
}
