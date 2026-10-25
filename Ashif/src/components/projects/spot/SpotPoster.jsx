import { boxEdges, edgePath, toyBox } from './scene';

// The Spot video's poster: what the robot's camera saw, the pink toy in the
// model's box, drawn like the story's frames. Decorative; the card's title
// says what the video is.

const TOY = { x: 468, y: 168, angle: -18, scale: 3.4 };
const BOX = toyBox(TOY, 14);
const EDGES = boxEdges(BOX, 0);
const mono = { fontFamily: 'var(--font-mono)' };

export default function SpotPoster() {
  return (
    <svg
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="spot-poster-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.1" fill="var(--line-strong)" />
        </pattern>
      </defs>
      <rect width="640" height="360" fill="url(#spot-poster-dots)" opacity="0.8" />

      <g stroke="var(--subtle)" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M24 52V24H52" />
        <path d="M588 24H616V52" />
        {/* No bracket bottom left: the card's title sits there. */}
        <path d="M616 308V336H588" />
      </g>
      <circle cx="43" cy="43" r="5.5" fill="var(--mark)" />
      <text x="55" y="49" fontSize="17" fontWeight="700" fill="var(--fg)" style={mono}>
        LIVE
      </text>

      <g transform={`translate(${TOY.x} ${TOY.y}) rotate(${TOY.angle}) scale(${TOY.scale})`}>
        <rect x="-15" y="-3.4" width="30" height="6.8" fill="var(--toy)" />
        <circle cx="15" cy="4.5" r="5" fill="var(--toy)" />
        <circle cx="15" cy="-4.5" r="5" fill="var(--toy)" />
        <circle cx="-15" cy="4.5" r="5" fill="var(--toy)" />
        <circle cx="-15" cy="-4.5" r="5" fill="var(--toy)" />
        <circle cx="-16" cy="-6" r="1.8" fill="#fff" opacity="0.5" />
      </g>
      {EDGES.map((edge, i) => (
        <path key={i} d={edgePath(edge)} fill="none" stroke="var(--mark)" strokeWidth="4" strokeLinecap="round" />
      ))}
      <g transform={`translate(${BOX.x0 - 2} ${BOX.y0 - 29})`}>
        <rect width="112" height="27" rx="3" fill="var(--accent)" />
        <text x="8" y="20" fontSize="18" fontWeight="700" fill="var(--accent-ink)" style={mono}>
          toy
        </text>
        <text x="104" y="20" fontSize="18" fontWeight="700" textAnchor="end" fill="var(--accent-ink)" style={mono}>
          0.91
        </text>
      </g>
    </svg>
  );
}
