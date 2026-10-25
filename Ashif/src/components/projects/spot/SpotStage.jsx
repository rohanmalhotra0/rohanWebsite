import { memo, useImperativeHandle, useRef } from 'react';
import {
  boxEdges,
  CONFETTI_COUNT,
  DECOY,
  edgePath,
  edgePoint,
  FOOT_R,
  GROUND,
  METER,
  THRESHOLD,
  VIEW_H,
  VIEW_W,
} from './scene';

// The illustration for the Spot story. React renders it once, from one frame
// of the scene; after that the story calls `apply(scene)` every frame and
// only the attributes that changed are written, so scrolling never
// re-renders React. `frame()` is the single source for both.

const CHIP = { x: 300, y: 42 };
const VIEWFINDER = { x0: 356, y0: 150, x1: 616, y1: 304 };
const TAG_W = 106;
const TAG_H = 26;
const TONES = ['var(--toy)', 'var(--spot)', 'var(--accent)', 'var(--fg)'];
const METER_MARK = METER.x0 + THRESHOLD * (METER.x1 - METER.x0);

const f1 = (n) => (Math.round(n * 10) / 10).toString();
const pad4 = (n) => String(n).padStart(4, '0');

const leg = (l) => ({
  thigh: { x1: f1(l.hip.x), y1: f1(l.hip.y), x2: f1(l.knee.x), y2: f1(l.knee.y) },
  shin: { x1: f1(l.knee.x), y1: f1(l.knee.y), x2: f1(l.foot.x), y2: f1(l.foot.y) },
  knee: { cx: f1(l.knee.x), cy: f1(l.knee.y) },
  foot: { cx: f1(l.foot.x), cy: f1(l.foot.y) },
  hip: { cx: f1(l.hip.x), cy: f1(l.hip.y) },
});

/** Every dynamic attribute, keyed by element. `text` sets the text content; `style` sets CSS properties. */
function frame(sc) {
  const j = sc.joints;
  const edges = boxEdges(sc.box, 1 - sc.morph, sc.boxSeed);
  const pen = sc.draw > 0 && sc.draw < 1;
  const edgeIndex = Math.min(3, Math.floor(sc.draw * 4));
  const penAt = edgePoint(edges[edgeIndex], Math.min(1, sc.draw * 4 - edgeIndex));
  // --mark, not --accent: thin lines on the stage need 3:1 in every palette.
  const boxStroke =
    sc.morph >= 1
      ? 'var(--mark)'
      : `color-mix(in oklab, var(--mark) ${Math.round(sc.morph * 100)}%, var(--fg))`;
  const boxOpacity = sc.boxOn ? sc.toyShown : 0;

  const back = { x: sc.spotX - 30, y: sc.spotY - 26 };
  const wire = [CHIP.x, CHIP.y + 18, CHIP.x, CHIP.y + 80, back.x, back.y - 90, back.x, back.y];
  const wireD = `M${wire[0]} ${wire[1]}C${wire[2]} ${wire[3]} ${f1(wire[4])} ${f1(wire[5])} ${f1(wire[6])} ${f1(wire[7])}`;

  const above = sc.conf >= THRESHOLD;
  const meterW = METER.x1 - METER.x0;
  const legs = j.legs.map(leg);
  // The face camera, for the power-up ring: (71, -3) in the body's frame.
  const tilt = (sc.pitch * Math.PI) / 180;
  const lens = {
    x: sc.spotX + 71 * Math.cos(tilt) + 3 * Math.sin(tilt),
    y: sc.spotY + 71 * Math.sin(tilt) - 3 * Math.cos(tilt),
  };
  const open = j.jawOpen * 24;

  return {
    hudPhotos: { opacity: f1(sc.hudPhotos), text: `IMG ${pad4(sc.photo)} / 0898` },
    hudLive: { opacity: f1(sc.hudLive) },
    chip: { opacity: f1(sc.chip), transform: `translate(0 ${f1((1 - sc.chip) * -10)})` },
    flash: { opacity: f1(sc.flash * 0.45) },
    decoy: { opacity: f1(sc.decoy) },
    decoyBox: { opacity: f1(sc.decoyBox) },
    toy: {
      opacity: f1(sc.toyShown),
      transform: `translate(${f1(sc.toy.x)} ${f1(sc.toy.y)}) rotate(${f1(sc.toy.angle)}) scale(${sc.toy.scale})`,
    },
    ...Object.fromEntries(
      edges.map((e, i) => [
        `edge${i}`,
        {
          d: edgePath(e),
          'stroke-dashoffset': f1(1 - Math.min(1, Math.max(0, sc.draw * 4 - i))),
          'stroke-width': f1(2.5 + sc.morph * 0.5),
          opacity: f1(boxOpacity),
          style: { stroke: boxStroke },
        },
      ])
    ),
    pen: { opacity: pen ? '1' : '0', transform: `translate(${f1(penAt.x)} ${f1(penAt.y)})` },
    handLabel: {
      opacity: f1(sc.handLabel * boxOpacity),
      transform: `translate(${f1(sc.box.x0)} ${f1(sc.box.y0 - 9)})`,
    },
    tag: {
      opacity: f1(sc.tag * boxOpacity),
      // Kept inside the picture when the box nears its right edge.
      transform: `translate(${f1(Math.min(sc.box.x0 - 1.5, VIEW_W - TAG_W - 4))} ${f1(sc.box.y0 - TAG_H - 2)})`,
    },
    tagConf: { text: sc.confOn ? sc.conf.toFixed(2) : '' },
    meter: { opacity: f1(sc.meter) },
    meterFill: {
      width: f1(Math.max(0, sc.conf) * meterW),
      style: { fill: above ? 'var(--mark)' : 'var(--subtle)' },
    },
    meterMark: { style: { fill: above ? 'var(--fg)' : 'var(--subtle)' } },
    meterValue: { text: `${Math.round(sc.conf * 100)}%` },
    wire: { d: wireD, 'stroke-dashoffset': f1(1 - sc.wire), opacity: sc.wire > 0 ? '1' : '0' },
    packets: { d: wireD, opacity: f1(sc.packets) },
    grpc: { opacity: f1(sc.grpc) },
    shadow: { cx: f1(sc.spotX), rx: f1(78 + sc.power * 6), opacity: f1(0.09 + sc.power * 0.03) },
    body: { transform: `translate(${f1(sc.spotX)} ${f1(sc.spotY)}) rotate(${f1(sc.pitch)})` },
    lens: { style: { fill: sc.power > 0.5 ? 'var(--mark)' : 'var(--subtle)' } },
    ...Object.fromEntries(
      legs.flatMap((l, i) => [
        [`thigh${i}`, l.thigh],
        [`shin${i}`, l.shin],
        [`knee${i}`, l.knee],
        [`foot${i}`, l.foot],
        [`hip${i}`, l.hip],
      ])
    ),
    upper: { x1: f1(j.shoulder.x), y1: f1(j.shoulder.y), x2: f1(j.elbow.x), y2: f1(j.elbow.y) },
    fore: { x1: f1(j.elbow.x), y1: f1(j.elbow.y), x2: f1(j.wrist.x), y2: f1(j.wrist.y) },
    shoulder: { cx: f1(j.shoulder.x), cy: f1(j.shoulder.y) },
    elbow: { cx: f1(j.elbow.x), cy: f1(j.elbow.y) },
    jaw: { transform: `translate(${f1(j.wrist.x)} ${f1(j.wrist.y)}) rotate(${f1(j.jawAngle)})` },
    jawTop: { transform: `rotate(${f1(-open)} 2 0)` },
    jawBottom: { transform: `rotate(${f1(open)} 2 0)` },
    estop: { opacity: f1(sc.estop), transform: `translate(${f1(sc.spotX)} ${f1(sc.spotY - 74)})` },
    crossRing: {
      r: f1(5 + sc.crossRing * 22),
      opacity: f1(sc.crossRing > 0 && sc.crossRing < 1 ? (1 - sc.crossRing) * 0.9 : 0),
    },
    wakeRing: {
      cx: f1(lens.x),
      cy: f1(lens.y),
      r: f1(4 + sc.wakeRing * 46),
      opacity: f1(sc.wakeRing > 0 && sc.wakeRing < 1 ? (1 - sc.wakeRing) * 0.85 : 0),
    },
    confetti: { opacity: sc.confetti.length ? '1' : '0' },
    ...Object.fromEntries(
      Array.from({ length: CONFETTI_COUNT }, (_, i) => {
        const c = sc.confetti[i];
        const attrs = c
          ? { transform: `translate(${f1(c.x)} ${f1(c.y)}) rotate(${f1(c.angle)})`, opacity: f1(c.opacity) }
          : { opacity: '0' };
        return [`bit${i}`, attrs];
      })
    ),
  };
}

// JSX wants camelCase where setAttribute wants the SVG name.
const CAMEL = { 'stroke-dashoffset': 'strokeDashoffset', 'stroke-width': 'strokeWidth' };

function propsOf(attrs) {
  const props = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key !== 'text') props[CAMEL[key] ?? key] = value;
  }
  return props;
}

function write(el, attrs) {
  const last = (el.__last ??= {});
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'style') {
      for (const [prop, v] of Object.entries(value)) {
        if (last[`style.${prop}`] !== v) el.style[prop] = last[`style.${prop}`] = v;
      }
    } else if (last[key] !== value) {
      last[key] = value;
      if (key === 'text') el.textContent = value;
      else el.setAttribute(key, value);
    }
  }
}

const mono = { fontFamily: 'var(--font-mono)' };

function SpotStage({ initial, ref }) {
  const els = useRef({});
  const first = frame(initial);
  // ref callback per element, plus its first-frame props.
  const at = (key) => ({ ref: (el) => void (els.current[key] = el), ...propsOf(first[key]) });
  const text = (key) => first[key].text;

  useImperativeHandle(
    ref,
    () => ({
      apply(scene) {
        const next = frame(scene);
        for (const [key, attrs] of Object.entries(next)) {
          const el = els.current[key];
          if (el) write(el, attrs);
        }
      },
    }),
    []
  );

  const nearLeg = (i) => (
    <g key={i}>
      <line {...at(`thigh${i}`)} stroke="var(--spot)" strokeWidth="15" strokeLinecap="round" />
      <line {...at(`shin${i}`)} stroke="var(--spot-dark)" strokeWidth="7" strokeLinecap="round" />
      <circle {...at(`knee${i}`)} r="7" fill="var(--spot-dark)" />
      <circle {...at(`foot${i}`)} r={FOOT_R + 0.5} fill="var(--spot-dark)" />
      <circle {...at(`hip${i}`)} r="9.5" fill="var(--spot-dark)" />
    </g>
  );
  const farLeg = (i) => (
    <g key={i} opacity="0.9">
      <line
        {...at(`thigh${i}`)}
        style={{ stroke: 'color-mix(in oklab, var(--spot) 70%, #000)' }}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <line {...at(`shin${i}`)} stroke="var(--spot-dark)" strokeWidth="6.5" strokeLinecap="round" />
      <circle {...at(`knee${i}`)} r="6" fill="var(--spot-dark)" />
      <circle {...at(`foot${i}`)} r={FOOT_R} fill="var(--spot-dark)" />
      <circle {...at(`hip${i}`)} r="8" fill="var(--spot-dark)" />
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="block h-auto w-full select-none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="spot-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.1" fill="var(--line-strong)" />
        </pattern>
      </defs>

      {/* The room: a dotted wall and the floor. */}
      <rect x="0" y="0" width={VIEW_W} height={GROUND} fill="url(#spot-dots)" opacity="0.7" />
      <rect x="0" y={GROUND} width={VIEW_W} height={VIEW_H - GROUND} fill="var(--surface-2)" opacity="0.55" />
      <line x1="0" y1={GROUND} x2={VIEW_W} y2={GROUND} stroke="var(--line-strong)" strokeWidth="1.5" />

      {/* What the camera sees. */}
      <g stroke="var(--subtle)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d={`M${VIEWFINDER.x0} ${VIEWFINDER.y0 + 18}V${VIEWFINDER.y0}H${VIEWFINDER.x0 + 18}`} />
        <path d={`M${VIEWFINDER.x1 - 18} ${VIEWFINDER.y0}H${VIEWFINDER.x1}V${VIEWFINDER.y0 + 18}`} />
        <path d={`M${VIEWFINDER.x1} ${VIEWFINDER.y1 - 18}V${VIEWFINDER.y1}H${VIEWFINDER.x1 - 18}`} />
        <path d={`M${VIEWFINDER.x0 + 18} ${VIEWFINDER.y1}H${VIEWFINDER.x0}V${VIEWFINDER.y1 - 18}`} />
      </g>

      {/* HUD: the photo count while labelling, then LIVE. */}
      <text {...at('hudPhotos')} x="22" y="35" fontSize="20" fill="var(--subtle)" style={mono}>
        {text('hudPhotos')}
      </text>
      <g {...at('hudLive')}>
        <circle cx="29" cy="28" r="6.5" fill="var(--mark)" />
        <text x="43" y="35" fontSize="20" fontWeight="700" fill="var(--fg)" style={mono}>
          LIVE
        </text>
      </g>

      {/* The trained model. */}
      <g {...at('chip')}>
        <rect x={CHIP.x - 58} y={CHIP.y - 19} width="116" height="38" rx="9" fill="var(--fg)" />
        <text x={CHIP.x} y={CHIP.y + 7} fontSize="20" fontWeight="700" textAnchor="middle" fill="var(--bg)" style={mono}>
          YOLO11
        </text>
      </g>

      {/* The wire to the robot: the line draws in, then frames flow along it. */}
      <path {...at('wire')} pathLength="1" strokeDasharray="1" fill="none" stroke="var(--line-strong)" strokeWidth="2.5" />
      <path
        {...at('packets')}
        className="spot-packets"
        fill="none"
        stroke="var(--mark)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="0.1 22"
      />
      {/* Beside the wire's first stretch, which always drops straight down. */}
      <text {...at('grpc')} x={CHIP.x + 12} y={CHIP.y + 52} fontSize="18" fill="var(--subtle)" style={mono}>
        gRPC
      </text>

      {/* The other pink thing, and the model ruling it out. */}
      <g {...at('decoy')}>
        <circle cx={DECOY.x} cy={DECOY.y} r={DECOY.r} fill="var(--toy)" />
        <path
          d={`M${DECOY.x - DECOY.r} ${DECOY.y}a${DECOY.r} ${DECOY.r * 0.45} 0 0 0 ${DECOY.r * 2} 0`}
          fill="none"
          stroke="var(--bg)"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <circle cx={DECOY.x - 4} cy={DECOY.y - 5} r="3" fill="#fff" opacity="0.45" />
      </g>
      <g {...at('decoyBox')}>
        <rect
          x={DECOY.x - DECOY.r - 7}
          y={DECOY.y - DECOY.r - 7}
          width={DECOY.r * 2 + 14}
          height={DECOY.r * 2 + 14}
          fill="none"
          stroke="var(--subtle)"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        <text x={DECOY.x - DECOY.r - 7} y={DECOY.y - DECOY.r - 14} fontSize="18" fill="var(--subtle)" style={mono}>
          0.11
        </text>
      </g>

      {/* Spot's shadow, then the far legs, body, near legs and arm. */}
      <ellipse {...at('shadow')} cy={GROUND + 4} ry="5" fill="var(--fg)" />
      {farLeg(2)}
      {farLeg(3)}
      <g {...at('body')}>
        <path
          d="M-78 -24H56Q62 -24 66 -20L84 -4V10Q84 18 76 18H-72Q-80 18 -82 10L-84 -12Q-84 -24 -78 -24Z"
          fill="var(--spot)"
        />
        <path d="M-78 -24H56Q62 -24 66 -20L67 -19H-83Q-83 -24 -78 -24Z" fill="#fff" opacity="0.22" />
        <path d="M-74 8H62V18H-72Q-79 18 -81 10Z" fill="var(--spot-dark)" />
        <path d="M60 -24Q63 -23 66 -20L84 -4V10Q84 18 76 18H60Z" fill="var(--spot-dark)" />
        <circle {...at('lens')} cx="71" cy="-3" r="2.8" />
        <circle cx="78" cy="3" r="2.4" fill="var(--subtle)" />
        <rect x="22" y="-36" width="22" height="9" rx="3" fill="var(--spot-dark)" />
      </g>
      {nearLeg(0)}
      {nearLeg(1)}
      <circle {...at('wakeRing')} fill="none" stroke="var(--mark)" strokeWidth="2.5" />

      {/* The toy, then the box drawn round it. */}
      <g {...at('toy')}>
        <rect x="-15" y="-3.4" width="30" height="6.8" fill="var(--toy)" />
        <circle cx="15" cy="4.5" r="5" fill="var(--toy)" />
        <circle cx="15" cy="-4.5" r="5" fill="var(--toy)" />
        <circle cx="-15" cy="4.5" r="5" fill="var(--toy)" />
        <circle cx="-15" cy="-4.5" r="5" fill="var(--toy)" />
        <circle cx="-16" cy="-6" r="1.8" fill="#fff" opacity="0.5" />
      </g>

      <line {...at('upper')} stroke="var(--spot-dark)" strokeWidth="10" strokeLinecap="round" />
      <line {...at('fore')} stroke="var(--spot)" strokeWidth="10" strokeLinecap="round" />
      <circle {...at('shoulder')} r="8" fill="var(--spot-dark)" />
      <circle {...at('elbow')} r="7.5" fill="var(--spot-dark)" />
      <g {...at('jaw')}>
        <circle r="6.5" fill="var(--spot-dark)" />
        <path {...at('jawTop')} d="M2 -5H17L19 -2" fill="none" stroke="var(--spot-dark)" strokeWidth="4.5" strokeLinecap="round" />
        <path {...at('jawBottom')} d="M2 5H17L19 2" fill="none" stroke="var(--spot-dark)" strokeWidth="4.5" strokeLinecap="round" />
      </g>

      {/* The victory dance's confetti. */}
      <g {...at('confetti')}>
        {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
          <rect
            key={i}
            {...at(`bit${i}`)}
            x={i % 3 ? -2.5 : -3.5}
            y={i % 3 ? -6 : -3.5}
            width={i % 3 ? 5 : 7}
            height={i % 3 ? 12 : 7}
            rx="1"
            style={{ fill: TONES[i % TONES.length] }}
          />
        ))}
      </g>

      <rect {...at('flash')} x={VIEWFINDER.x0} y={VIEWFINDER.y0} width={VIEWFINDER.x1 - VIEWFINDER.x0} height={VIEWFINDER.y1 - VIEWFINDER.y0} fill="var(--surface)" />

      {[0, 1, 2, 3].map((i) => (
        <path key={i} {...at(`edge${i}`)} pathLength="1" strokeDasharray="1" fill="none" strokeLinecap="round" />
      ))}
      <text {...at('handLabel')} fontSize="20" fontStyle="italic" fill="var(--fg)">
        toy
      </text>
      <g {...at('pen')}>
        <path d="M-9 0H-4M4 0H9M0 -9V-4M0 4V9" stroke="var(--fg)" strokeWidth="1.75" strokeLinecap="round" />
        <circle r="2.5" fill="var(--fg)" />
      </g>
      <g {...at('tag')}>
        <rect width={TAG_W} height={TAG_H} rx="3" fill="var(--accent)" />
        <text x="7" y="19" fontSize="18" fontWeight="700" fill="var(--accent-ink)" style={mono}>
          toy
        </text>
        <text {...at('tagConf')} x={TAG_W - 7} y="19" fontSize="18" fontWeight="700" textAnchor="end" fill="var(--accent-ink)" style={mono}>
          {text('tagConf')}
        </text>
      </g>

      {/* Confidence along the bottom, with the 70% line. */}
      <g {...at('meter')}>
        <text x={METER.x0} y={METER.y - 9} fontSize="17" fill="var(--subtle)" style={mono}>
          confidence
        </text>
        <text {...at('meterValue')} x={METER.x1} y={METER.y - 9} fontSize="19" fontWeight="700" textAnchor="end" fill="var(--fg)" style={mono}>
          {text('meterValue')}
        </text>
        {/* An outlined track, so the fill sits on the stage (3:1 in every palette). */}
        <rect x={METER.x0} y={METER.y} width={METER.x1 - METER.x0} height={METER.h} rx={METER.h / 2} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
        <rect {...at('meterFill')} x={METER.x0} y={METER.y} height={METER.h} rx={METER.h / 2} />
        <g {...at('meterMark')}>
          <rect x={METER_MARK - 1} y={METER.y - 4} width="2" height={METER.h + 8} />
          <text x={METER_MARK} y={METER.y - 9} fontSize="17" textAnchor="middle" style={mono}>
            70%
          </text>
        </g>
        <circle {...at('crossRing')} cx={METER_MARK} cy={METER.y + METER.h / 2} fill="none" stroke="var(--mark)" strokeWidth="2.5" />
      </g>

      {/* The kill-switch, pressed. */}
      <g {...at('estop')}>
        <rect x="-54" y="-17" width="108" height="34" rx="17" fill="var(--stop)" />
        <text y="7" fontSize="18" fontWeight="700" textAnchor="middle" fill="#fff" style={mono}>
          E-STOP
        </text>
      </g>
    </svg>
  );
}

export default memo(SpotStage, () => true);
