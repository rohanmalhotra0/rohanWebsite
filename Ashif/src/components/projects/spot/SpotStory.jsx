import { useEffect, useRef, useState } from 'react';
import SpotStage from './SpotStage';
import { sceneAt, THRESHOLD } from './scene';

// The Spot case study's "How it works", told as you scroll: a sticky
// illustration (SpotStage) plays one beat per step while that step's text
// travels up the screen. A step's progress is how far its text has moved
// between two lines (see `lines`); the beats add up to `s`, 0–6. The last
// step is a small safety demo you can press.
//
// Without JavaScript the illustration shows the end of the fetch and the
// steps read as a list. With reduced motion, each step snaps the picture to
// that beat's end, and nothing loops.

const IDS = ['label', 'train', 'evaluate', 'connect', 'fetch', 'safety'];
// The frame the server renders: Spot holding up the toy, every step done.
const FIRST_FRAME = sceneAt(5, 0);
// Where the victory dance begins.
const DANCE = 4.8;

const approach = (value, goal, rate) =>
  value < goal ? Math.min(goal, value + rate) : Math.max(goal, value - rate);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The two lines a step's text travels between, in viewport pixels. */
function lines(sticky) {
  const vh = window.innerHeight;
  if (window.matchMedia('(min-width: 64rem)').matches) return { from: vh * 0.8, to: vh * 0.3 };
  // Below lg the picture is pinned to the top: from near the bottom of the
  // screen up to the picture's lower edge.
  const bottom = sticky.getBoundingClientRect().bottom;
  return { from: vh * 0.92, to: Math.min(bottom + 12, vh * 0.6) };
}

/** What the live region says after a press. */
function announce(which, { hidden, killed }) {
  if (which === 'killed') {
    if (killed) return 'Kill-switch pressed. Spot stops and powers down.';
    return hidden
      ? 'Kill-switch released, but Spot still can’t see the toy, so it stays powered down.'
      : 'Kill-switch released. Spot powers back up.';
  }
  if (hidden) {
    return killed
      ? 'Toy hidden. Confidence falls under 70%; Spot is already stopped by the kill-switch.'
      : 'Toy hidden. Confidence falls under 70%, so Spot powers down.';
  }
  return killed
    ? 'Toy back in view, but the kill-switch is still pressed.'
    : 'Toy back in view. Confidence is over 70% again, so Spot powers back up.';
}

function Pipeline({ steps, nodeRefs, barRefs, onPick }) {
  return (
    <nav aria-label="Pipeline steps" className="border-b border-line px-2.5 py-2 sm:px-4 sm:py-2.5">
      <ol className="flex items-center">
        {steps.map((step, i) => (
          <li key={step.title} className={i < steps.length - 1 ? 'flex flex-1 items-center' : 'flex items-center'}>
            <a
              ref={(el) => void (nodeRefs.current[i] = el)}
              href={`#story-${IDS[i]}`}
              onClick={(event) => onPick(event, i)}
              data-state="done"
              className="spot-node flex min-h-8 items-center gap-1.5 rounded-full px-1.5 text-[12px] font-medium sm:px-2.5 sm:text-[13px]"
            >
              <span aria-hidden="true" className="spot-node-dot size-1.5 shrink-0 rounded-full max-[400px]:hidden" />
              {step.title}
            </a>
            {i < steps.length - 1 ? (
              <span
                ref={(el) => void (barRefs.current[i] = el)}
                aria-hidden="true"
                className="spot-bar mx-0.5 min-w-1.5 flex-1 rounded-full"
                style={{ '--fill': 1 }}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function SpotStory({ steps, safety }) {
  const stageRef = useRef(null);
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const textRefs = useRef([]);
  const itemRefs = useRef([]);
  const nodeRefs = useRef([]);
  const barRefs = useRef([]);
  const wakeRef = useRef(null);
  // The safety demo: what the buttons asked for. The loop eases toward it.
  const control = useRef({ hidden: false, killed: false });
  const [demo, setDemo] = useState({ hidden: false, killed: false });
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    const section = sectionRef.current;
    if (!stage || !sticky || !section) return undefined;
    const still = reducedMotion();

    let shown = -1;
    let target = 0;
    let dirty = true;
    let raf = 0;
    let visible = false;
    let last = performance.now();
    let time = 0;
    let navStep = null;
    let burstAt = null;
    const live = { hide: 0, kill: 0, power: 1 };

    const measure = () => {
      const { from, to } = lines(sticky);
      let s = 0;
      for (const el of textRefs.current) {
        if (el) s += Math.min(1, Math.max(0, (from - el.getBoundingClientRect().top) / (from - to)));
      }
      return s;
    };

    const paintNav = (s) => {
      const step = Math.min(IDS.length, Math.floor(s + 1e-6));
      if (navStep !== step) {
        navStep = step;
        nodeRefs.current.forEach((node, i) => {
          if (!node) return;
          const state = i < step ? 'done' : i === step ? 'active' : 'todo';
          node.dataset.state = state;
          if (state === 'active') node.setAttribute('aria-current', 'step');
          else node.removeAttribute('aria-current');
        });
        itemRefs.current.forEach((item, i) => {
          if (item) item.dataset.active = String(i === step);
        });
      }
      barRefs.current.forEach((bar, i) => {
        if (bar) bar.style.setProperty('--fill', Math.min(1, Math.max(0, s - i)).toFixed(3));
      });
    };

    // One frame. `schedule` false draws without asking for the next one.
    const frame = (now, schedule = true) => {
      raf = 0;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      time += dt;
      if (dirty) {
        target = measure();
        dirty = false;
      }

      // Scrolling back above the demo resets it.
      const demoState = control.current;
      if (target < 5 && (demoState.hidden || demoState.killed)) {
        control.current = { hidden: false, killed: false };
        setDemo(control.current);
        setAnnouncement('');
      }
      const { hidden, killed } = control.current;

      const goal = still ? Math.min(IDS.length, Math.floor(target) + 1) : target;
      const before = shown;
      if (shown < 0 || still) shown = goal;
      else {
        shown += (goal - shown) * (1 - Math.exp(-dt * 9));
        if (Math.abs(goal - shown) < 0.0005) shown = goal;
      }
      // Confetti each time the dance begins on the way down.
      if (shown < DANCE) burstAt = null;
      else if (before >= 0 && before < DANCE && !still) burstAt = time;

      const rate = still ? 1 : dt;
      live.hide = approach(live.hide, hidden ? 1 : 0, rate / 0.6);
      live.kill = approach(live.kill, killed ? 1 : 0, rate / 0.2);
      // Spot powers down on the kill-switch, or once confidence drops under 70%.
      const on = !killed && 0.91 * (1 - live.hide * 0.97) >= THRESHOLD;
      live.power = approach(live.power, on ? 1 : 0, rate / (on ? 0.9 : 0.45));

      stage.apply(sceneAt(shown, time, live, still, burstAt == null ? null : time - burstAt));
      // With reduced motion the picture shows a beat's end, but the step
      // being read is still the one in progress.
      paintNav(still ? Math.min(IDS.length, Math.floor(target) + 0.5) : shown);

      // Keep drawing while anything moves: the picture catching up with the
      // scroll, the demo easing, or the live parts (flicker, dance).
      const settling =
        shown !== goal || live.hide !== (hidden ? 1 : 0) || live.kill !== (killed ? 1 : 0) || live.power !== (on ? 1 : 0);
      const lively = !still && shown >= 2.1;
      if (schedule && visible && (settling || lively || dirty)) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      dirty = true;
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    wakeRef.current = wake;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      // Off screen, the CSS loops (connectors, packets) pause too.
      sticky.dataset.live = String(visible);
      if (visible) wake();
    });
    observer.observe(section);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    // Match the picture to the scroll position before the first paint.
    frame(performance.now(), false);

    return () => {
      wakeRef.current = null;
      observer.disconnect();
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const pick = (event, i) => {
    const text = textRefs.current[i];
    const sticky = stickyRef.current;
    if (!text || !sticky) return;
    event.preventDefault();
    // Land with that step's beat mostly played.
    const { from, to } = lines(sticky);
    const top = text.getBoundingClientRect().top;
    window.scrollBy({ top: top - (from - 0.8 * (from - to)), behavior: reducedMotion() ? 'auto' : 'smooth' });
    text.querySelector('h3')?.focus({ preventScroll: true });
  };

  const toggle = (which) => {
    const next = { ...control.current, [which]: !control.current[which] };
    control.current = next;
    setDemo(next);
    setAnnouncement(announce(which, next));
    wakeRef.current?.();
  };

  const story = [...steps, { title: 'Safety', headline: 'No toy, no motion', text: safety }];

  return (
    <section ref={sectionRef} aria-labelledby="story-title" className="lg:grid lg:grid-cols-12 lg:gap-x-12">
      <header className="max-w-2xl pb-8 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:pb-0">
        <p className="text-sm text-subtle">How it works</p>
        <h2 id="story-title" className="type-heading mt-3 text-balance text-3xl text-fg sm:text-4xl">
          Teaching Spot to fetch
        </h2>
        <p className="mt-4 text-pretty text-base leading-7 text-muted">
          Scroll to run the pipeline, from the first hand-drawn box to the victory dance.
        </p>
      </header>

      <div className="max-lg:contents lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
        <div
          ref={stickyRef}
          className="sticky top-14 z-10 -mx-4 bg-bg px-4 pb-2 pt-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-bg after:to-transparent sm:mx-0 sm:px-0 lg:top-0 lg:flex lg:h-svh lg:items-center lg:bg-transparent lg:p-0 lg:after:hidden"
        >
          <figure className="w-full overflow-hidden rounded-xl border border-line bg-surface">
            <Pipeline steps={steps} nodeRefs={nodeRefs} barRefs={barRefs} onPick={pick} />
            <SpotStage ref={stageRef} initial={FIRST_FRAME} />
            <figcaption className="border-t border-line px-3 py-2 text-[12px] leading-4 text-subtle sm:px-4">
              Illustration. The real demo is in the video above.
            </figcaption>
          </figure>
        </div>
      </div>

      <ol className="pt-[40svh] lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:pt-[40svh]">
        {story.map((step, i) => (
          <li
            key={step.title}
            id={`story-${IDS[i]}`}
            ref={(el) => void (itemRefs.current[i] = el)}
            data-active="false"
            className="group min-h-[62svh] scroll-mt-[23rem] last:min-h-[70svh] lg:min-h-[72svh] lg:scroll-mt-[30svh]"
          >
            <div ref={(el) => void (textRefs.current[i] = el)}>
              <p className="flex items-center gap-2 font-mono text-[13px] text-subtle">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-fg transition-colors duration-200 group-data-[active=true]:bg-accent group-data-[active=true]:text-accent-ink">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {step.title}
              </p>
              <h3 tabIndex={-1} className="type-heading mt-3 text-balance text-2xl text-fg outline-none sm:text-3xl">
                {step.headline}
              </h3>
              <p className="mt-3 max-w-[34rem] text-pretty text-[15px] leading-7 text-muted sm:text-base">{step.text}</p>
              {IDS[i] === 'safety' ? (
                <div className="mt-5">
                  <p className="text-sm font-medium text-fg">Try it:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-pressed={demo.hidden}
                      onClick={() => toggle('hidden')}
                      className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-fg transition-colors duration-150 hover:border-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
                    >
                      Hide the toy
                    </button>
                    <button
                      type="button"
                      aria-pressed={demo.killed}
                      onClick={() => toggle('killed')}
                      className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-fg transition-colors duration-150 hover:border-stop aria-pressed:border-stop aria-pressed:bg-stop aria-pressed:text-white"
                    >
                      Kill-switch
                    </button>
                  </div>
                  <p aria-live="polite" className="mt-3 min-h-12 max-w-[34rem] text-sm leading-6 text-muted">
                    {announcement}
                  </p>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
