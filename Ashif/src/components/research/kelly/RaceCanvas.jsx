import { useEffect, useRef } from 'react';
import { RUIN } from './kelly';
import { multiple, powerLabel } from './format';

// The race: the bankrolls betting on the same coin flips, drawn live on a
// log scale, one bet at a time. The floor is ruin (1% of where it started):
// a line that reaches it stops at an ✕. The top grows with the bankrolls as
// the race goes, so it doesn't give the ending away. New numbers reshape the
// lines in place; a new `runKey` starts the race over.

const PAD = { left: 50, right: 78, top: 14, bottom: 28 };
const BETS_PER_SECOND = 20;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Decades to show: from the ruin line up past the highest bankroll so far. */
function rangeOf(paths, upto) {
  let hi = 1;
  for (const path of paths) {
    const end = Math.min(upto, path.length - 1);
    for (let t = 0; t <= end; t++) if (path[t] > hi) hi = path[t];
  }
  return { top: Math.min(12, Math.max(1, Math.ceil(Math.log10(hi) + 0.15))), bottom: Math.log10(RUIN) };
}

/** The bet at which a bankroll is first ruined, or -1. */
const ruinedAt = (path) => path.findIndex((w) => w <= RUIN);

export default function RaceCanvas({ paths, colors, names, dashes = [], runKey, paused, onStep, onFinish, label, className }) {
  const canvasRef = useRef(null);
  const view = useRef({ paths, range: null, goal: null, step: 0, started: false, done: false, raf: 0, last: 0 });
  const callbacks = useRef({ onStep, onFinish, paused, colors, names, dashes });
  callbacks.current = { onStep, onFinish, paused, colors, names, dashes };

  useEffect(() => {
    const canvas = canvasRef.current;
    const v = view.current;
    if (!canvas) return undefined;

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const style = getComputedStyle(canvas);
      const color = (name) => style.getPropertyValue(name).trim();
      const mono = color('--font-mono') || 'monospace';
      const plotW = width - PAD.left - PAD.right;
      const plotH = height - PAD.top - PAD.bottom;
      const { bottom, top } = v.range;
      const steps = v.paths[0].length - 1;
      const x = (t) => PAD.left + (t / steps) * plotW;
      const y = (w) => PAD.top + ((top - Math.log10(Math.max(w, 1e-9))) / (top - bottom)) * plotH;
      const shown = Math.min(steps, Math.floor(v.step));

      // Decades, the ×1 start line, and the ruin line.
      ctx.font = `11px ${mono}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';
      const every = top - bottom > 6 ? 2 : 1;
      for (let e = Math.ceil(bottom); e <= Math.floor(top); e++) {
        const yy = y(10 ** e);
        const ruinLine = e === -2;
        ctx.strokeStyle = ruinLine ? color('--stop') : e === 0 ? color('--subtle') : color('--line');
        ctx.lineWidth = 1;
        ctx.setLineDash(e === 0 || ruinLine ? [4, 4] : []);
        ctx.beginPath();
        ctx.moveTo(PAD.left, yy);
        ctx.lineTo(PAD.left + plotW, yy);
        ctx.stroke();
        if (e % every === 0 || e === 0 || ruinLine) {
          ctx.fillStyle = ruinLine ? color('--muted') : e === 0 ? color('--fg') : color('--subtle');
          ctx.fillText(ruinLine ? 'ruin' : powerLabel(e), PAD.left - 8, yy);
        }
      }
      ctx.setLineDash([]);
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = color('--subtle');
      ctx.fillText('0', PAD.left, height - PAD.bottom + 9);
      ctx.textAlign = 'right';
      ctx.fillText(`${steps} bets`, PAD.left + plotW, height - PAD.bottom + 9);

      // The bankrolls so far.
      const { colors: tones, names: labels, dashes: patterns } = callbacks.current;
      const heads = [];
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      v.paths.forEach((path, i) => {
        const tone = color(tones[i].replace(/^var\((.*)\)$/, '$1'));
        const ruin = ruinedAt(path);
        const end = ruin >= 0 ? Math.min(shown, ruin) : shown;
        ctx.strokeStyle = tone;
        ctx.lineWidth = 2.25;
        ctx.setLineDash(patterns[i] ?? []);
        ctx.beginPath();
        ctx.moveTo(x(0), y(path[0]));
        for (let t = 1; t <= end; t++) ctx.lineTo(x(t), y(Math.max(path[t], RUIN)));
        ctx.stroke();
        ctx.setLineDash([]);
        const isOut = ruin >= 0 && shown >= ruin;
        const hx = x(end);
        const hy = y(Math.max(path[end], RUIN));
        if (isOut) {
          // The ✕ where it went broke.
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(hx - 5, hy - 5);
          ctx.lineTo(hx + 5, hy + 5);
          ctx.moveTo(hx + 5, hy - 5);
          ctx.lineTo(hx - 5, hy + 5);
          ctx.stroke();
        } else {
          ctx.fillStyle = tone;
          ctx.beginPath();
          ctx.arc(hx, hy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        heads.push({ x: hx, y: hy, tone, dash: patterns[i], text: `${labels[i]} ${isOut ? 'ruined' : multiple(path[end])}` });
      });

      // Labels beside the heads, nudged apart so they don't collide: a short
      // stroke of the line's color, then the words in the text color.
      ctx.font = `600 12px ${mono}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const order = heads.map((h, i) => i).sort((a, b) => heads[a].y - heads[b].y);
      let prev = -Infinity;
      for (const i of order) {
        heads[i].ly = Math.max(heads[i].y, prev + 15);
        prev = heads[i].ly;
      }
      const SWATCH = 12;
      for (const h of heads) {
        const textWidth = ctx.measureText(h.text).width;
        const lx = Math.min(h.x + 9, width - textWidth - SWATCH - 6);
        ctx.fillStyle = color('--surface');
        ctx.globalAlpha = 0.85;
        ctx.fillRect(lx - 3, h.ly - 8, textWidth + SWATCH + 10, 16);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = h.tone;
        ctx.lineWidth = 3;
        ctx.setLineDash(h.dash ? [4, 2] : []);
        ctx.beginPath();
        ctx.moveTo(lx, h.ly);
        ctx.lineTo(lx + SWATCH - 2, h.ly);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = color('--fg');
        ctx.fillText(h.text, lx + SWATCH + 3, h.ly);
      }
    };

    const frame = (now) => {
      v.raf = 0;
      const dt = Math.min(0.1, (now - (v.last || now)) / 1000);
      v.last = now;
      const steps = v.paths[0].length - 1;
      let moving = false;
      v.goal = rangeOf(v.paths, Math.floor(v.step));
      if (reducedMotion()) v.range = { ...v.goal };
      for (const key of ['bottom', 'top']) {
        const gap = v.goal[key] - v.range[key];
        if (Math.abs(gap) > 0.002) {
          v.range[key] += gap * (1 - Math.exp(-dt * 12));
          moving = true;
        } else v.range[key] = v.goal[key];
      }
      if (v.started && !v.done && !callbacks.current.paused) {
        const before = Math.floor(v.step);
        v.step = Math.min(steps, v.step + dt * BETS_PER_SECOND);
        if (Math.floor(v.step) !== before) callbacks.current.onStep?.(Math.floor(v.step));
        if (v.step >= steps) {
          v.done = true;
          callbacks.current.onFinish?.();
        } else moving = true;
      }
      draw();
      if (moving) v.raf = requestAnimationFrame(frame);
    };

    v.kick = () => {
      if (!v.raf) {
        v.last = 0;
        v.raf = requestAnimationFrame(frame);
      }
    };
    v.restart = () => {
      v.done = false;
      if (reducedMotion()) {
        v.step = v.paths[0].length - 1;
        v.done = true;
        callbacks.current.onStep?.(Math.floor(v.step));
        callbacks.current.onFinish?.();
      } else {
        v.step = 0;
        callbacks.current.onStep?.(0);
      }
      v.kick();
    };

    const resize = new ResizeObserver(() => v.range && draw());
    resize.observe(canvas);

    // The race starts the first time it comes into view.
    const start = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        start.disconnect();
        v.started = true;
        v.restart();
      },
      { threshold: 0.4 }
    );
    start.observe(canvas);

    const theme = new MutationObserver(() => v.range && draw());
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });

    return () => {
      resize.disconnect();
      start.disconnect();
      theme.disconnect();
      // Clear the id too, so a later mount (Strict Mode, a remount) can start
      // its own frames.
      if (v.raf) cancelAnimationFrame(v.raf);
      v.raf = 0;
    };
  }, []);

  // New numbers: reshape the lines in place and ease the axis.
  useEffect(() => {
    const v = view.current;
    v.paths = paths;
    v.goal = rangeOf(paths, Math.floor(v.step));
    if (!v.range || reducedMotion()) v.range = { ...v.goal };
    v.kick?.();
  }, [paths]);

  // A new race, or play after a pause.
  const lastKey = useRef(runKey);
  useEffect(() => {
    const v = view.current;
    if (lastKey.current !== runKey) {
      lastKey.current = runKey;
      if (v.started) v.restart();
    }
  }, [runKey]);
  useEffect(() => {
    if (!paused) view.current.kick?.();
  }, [paused]);

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
}
