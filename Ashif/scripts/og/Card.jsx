import SpotPoster from '@/components/projects/spot/SpotPoster';
import { breakEven, kelly, perBet } from '@/components/research/kelly/kelly';
import { projects } from '@/data/portfolioData';
import { BLOCK_CLASS, notFoundRoute, ogCard, routeNumber, routes } from '@/routes';
import { cn } from '@/lib/utils';

// A 1200×630 link-preview card (og:image) in the Spot palette, built from the
// site's own blocks, fonts and drawings. Sizes are inline styles, so these
// cards add nothing to the site's CSS. Every line of text is 48 px or more:
// a feed shows the card at about a third of its size.

const SITE = 'rohanm.org';
const PAD = 64;
// The home card's lab panel starts here; "Malhotra" (about 5.22em wide) runs
// ~100 px onto it, like the hero's.
const PANEL_LEFT = 620;
const NAME_SIZE = 126;
// One size for every block card's name: the size that fits the longest
// (Experience), so the cards read as a set.
const TITLE_SIZE = 150;
// Who he is, at a glance: the hero's intro in short lines that fit beside
// the lab at 48 px.
const CONTEXT = ['Math & CS', 'NYU Courant', 'IBM · Kalshi'];
// The research page's default bet: a 50¢ contract you give a 60% chance.
const KELLY = { p: 0.6, c: 0.5 };

function Frame({ className, children }) {
  return (
    <div className={className} style={{ position: 'relative', width: 1200, height: 630, overflow: 'hidden' }}>
      {children}
    </div>
  );
}

/** The hero: the robot in its lab, and the end of the name in the lab's ink. */
function HomeCard() {
  const split = `${PANEL_LEFT - PAD}px`;
  return (
    <Frame className="bg-bg">
      <div
        className="hero-lab"
        style={{ position: 'absolute', left: PANEL_LEFT, right: 0, top: 28, bottom: 28, borderRadius: '56px 0 0 56px', overflow: 'hidden' }}
      >
        <img
          src="/img/hero/robot-spot-light.webp"
          alt=""
          style={{ position: 'absolute', left: '50%', top: '50%', width: 760, height: 760, transform: 'translate(-50%, -40%)' }}
        />
      </div>
      <div style={{ position: 'absolute', left: PAD, top: 60, bottom: 60, width: PANEL_LEFT - PAD - 24, display: 'flex', flexDirection: 'column' }}>
        <p
          className="type-display"
          style={{
            margin: 0,
            width: 'min-content',
            fontSize: NAME_SIZE,
            lineHeight: 0.92,
            background: `linear-gradient(90deg, var(--fg) ${split}, var(--lab-ink) ${split})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Rohan Malhotra
        </p>
        <p data-fit="" style={{ margin: '28px 0 0', fontSize: 48, lineHeight: 1.15, fontWeight: 500, color: 'var(--fg)' }}>
          {CONTEXT.map((line) => (
            <span key={line} style={{ display: 'block', whiteSpace: 'nowrap' }}>
              {line}
            </span>
          ))}
        </p>
        <p className="font-mono" style={{ margin: 'auto 0 0', fontSize: 48, color: 'var(--muted)' }}>
          {SITE}
        </p>
      </div>
    </Frame>
  );
}

/** A page's header block: tagline, name, outlined number. */
function BlockCard({ route }) {
  const number = routeNumber(route)?.replace(/^0/, '');
  return (
    <Frame className="bg-bg">
      <div
        className={cn('grain mesh', BLOCK_CLASS[route.block])}
        style={{ position: 'absolute', inset: 28, borderRadius: 56, overflow: 'hidden', padding: '60px 72px' }}
      >
        {number ? (
          <span
            aria-hidden="true"
            className="type-display"
            style={{ position: 'absolute', right: 8, bottom: -96, fontSize: 520, lineHeight: 1, color: 'transparent', opacity: 0.4, WebkitTextStroke: '3px var(--on-block)' }}
          >
            {number}
          </span>
        ) : null}
        <p className="font-mono text-on-block-muted" style={{ position: 'relative', margin: 0, fontSize: 48, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {route.tagline}
        </p>
        <p data-fit="" className="type-display" style={{ position: 'relative', margin: '24px 0 0', fontSize: TITLE_SIZE, lineHeight: 0.95, whiteSpace: 'nowrap' }}>
          {route.label}
        </p>
        <p className="text-on-block-muted" style={{ position: 'absolute', left: 72, bottom: 56, margin: 0, fontSize: 48, fontWeight: 500 }}>
          {SITE}
        </p>
      </div>
    </Frame>
  );
}

/**
 * The Kelly paper's hook, and its growth curve: growth per bet against the
 * share of money bet, peaking at the Kelly bet and diving below zero past
 * break-even. No axis labels: a feed shows the card too small for them.
 */
function KellyHump({ width, height }) {
  const { p, c } = KELLY;
  const best = kelly(p, c);
  const end = Math.min(0.95, breakEven(p, c) * 1.3);
  const peak = perBet(p, c, best);
  // Headroom above the peak for its label; the dive leaves through the bottom.
  const [top, bottom] = [peak * 1.9, -peak * 1.1];
  const x = (f) => (f / end) * width;
  const y = (v) => ((top - v) / (top - bottom)) * height;
  const points = Array.from({ length: 121 }, (_, i) => {
    const f = (i / 120) * end;
    return `${x(f).toFixed(1)},${y(perBet(p, c, f)).toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ overflow: 'hidden' }}>
      <line x1="0" x2={width} y1={y(0)} y2={y(0)} stroke="var(--on-block)" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="12 12" />
      <polyline points={points.join(' ')} fill="none" stroke="var(--on-block)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(best)} cy={y(peak)} r="16" fill="var(--on-block)" />
      <text x={x(best)} y={y(peak) - 36} textAnchor="middle" fontSize="48" fill="var(--on-block)" style={{ fontFamily: 'var(--font-mono)' }}>
        bet {Math.round(best * 100)}%
      </text>
    </svg>
  );
}

function ResearchCard({ route }) {
  return (
    <Frame className="bg-bg">
      <div
        className={cn('grain mesh', BLOCK_CLASS[route.block])}
        style={{ position: 'absolute', inset: 28, borderRadius: 56, overflow: 'hidden', padding: '60px 72px' }}
      >
        <p className="font-mono text-on-block-muted" style={{ position: 'relative', margin: 0, fontSize: 48, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          My Kelly paper
        </p>
        <p className="type-display" style={{ position: 'relative', margin: '24px 0 0', fontSize: 88, lineHeight: 0.95 }}>
          {['How much', 'would you', 'bet?'].map((line) => (
            <span key={line} style={{ display: 'block', whiteSpace: 'nowrap' }}>
              {line}
            </span>
          ))}
        </p>
        <p className="text-on-block-muted" style={{ position: 'absolute', left: 72, bottom: 56, margin: 0, fontSize: 48, fontWeight: 500 }}>
          {SITE}
        </p>
        <div style={{ position: 'absolute', right: 72, top: 150 }}>
          <KellyHump width={430} height={300} />
        </div>
      </div>
    </Frame>
  );
}

/**
 * A case study: the drawing of what the robot's camera saw, and the title
 * in the corner the drawing leaves free (left of the toy's box).
 */
function CaseCard({ route }) {
  const project = projects.find((p) => p.slug === route.project);
  return (
    <Frame className="bg-surface">
      <SpotPoster />
      <div style={{ position: 'absolute', left: PAD, bottom: 56, maxWidth: 620 }}>
        <p className="font-mono" style={{ margin: 0, fontSize: 48, color: 'var(--muted)' }}>
          Case study
        </p>
        <p className="type-display" style={{ margin: '12px 0 20px', fontSize: 88, lineHeight: 0.95, color: 'var(--fg)' }}>
          {project.title}
        </p>
        <p className="font-mono" style={{ margin: 0, fontSize: 48, color: 'var(--fg)' }}>
          {SITE}
        </p>
      </div>
    </Frame>
  );
}

export default function Card({ id }) {
  const route = [...routes, notFoundRoute].find((r) => ogCard(r).id === id);
  if (route.project) return <CaseCard route={route} />;
  if (route.id === 'research') return <ResearchCard route={route} />;
  if (route.label) return <BlockCard route={route} />;
  return <HomeCard />;
}
