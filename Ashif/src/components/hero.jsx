import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, FileText, Gauge } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import RotatingText from './RotatingText';
import { heroStats, profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const Spline = lazy(() => import('@splinetool/react-spline'));
const ROBOT_SCENE = new URL('../../../scene.splinecode', import.meta.url).href;
const MotionDiv = motion.div;

class RobotBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Hero() {
  const sectionRef = useRef(null);
  const splineRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [mountRobot, setMountRobot] = useState(false);
  const [robotReady, setRobotReady] = useState(false);
  const [robotFailed, setRobotFailed] = useState(false);
  const [robotSkipped, setRobotSkipped] = useState(false);

  useEffect(() => {
    const saveData = navigator.connection?.saveData;
    const compactScreen = window.matchMedia('(max-width: 767px)').matches;
    if (saveData || reduceMotion || compactScreen) {
      setRobotSkipped(true);
      return undefined;
    }

    const schedule = window.requestIdleCallback
      ? window.requestIdleCallback(() => setMountRobot(true), { timeout: 250 })
      : window.setTimeout(() => setMountRobot(true), 80);

    return () => {
      if (window.cancelIdleCallback && typeof schedule === 'number') {
        window.cancelIdleCallback(schedule);
      } else {
        window.clearTimeout(schedule);
      }
    };
  }, [reduceMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const app = splineRef.current;
        if (!app) return;
        if (entry.isIntersecting && document.visibilityState === 'visible') {
          app.play?.();
        } else {
          app.stop?.();
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const focusAreas = [
    'Robotics engineer',
    'Quantitative developer',
    'Applied AI builder',
    'Systems researcher',
  ];

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-dvh w-full items-end overflow-hidden bg-[#050505] text-white"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(#1f1f1f_1px,transparent_1px),linear-gradient(90deg,#1f1f1f_1px,transparent_1px)] bg-[size:44px_44px] opacity-35" />
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-200',
            robotReady ? 'opacity-100' : 'opacity-0'
          )}
        >
          {mountRobot ? (
            <RobotBoundary onError={() => setRobotFailed(true)}>
              <Suspense fallback={null}>
                <Spline
                  scene={ROBOT_SCENE}
                  renderOnDemand
                  aria-label="Interactive 3D robot"
                  onLoad={(spline) => {
                    splineRef.current = spline;
                    [
                      'ROBOT',
                      'Robot',
                      'robot',
                      'Text',
                      'text',
                      'BackgroundText',
                      'Title',
                    ].forEach((name) => {
                      try {
                        const object = spline?.findObjectByName?.(name);
                        if (object && /text|title/i.test(name)) object.visible = false;
                      } catch {
                        // Spline object labels vary between scene exports.
                      }
                    });
                    setRobotReady(true);
                  }}
                />
              </Suspense>
            </RobotBoundary>
          ) : null}
        </div>
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <div className="relative z-20 mx-auto grid w-full max-w-7xl gap-12 px-5 pb-24 pt-32 sm:px-8 md:px-12 md:pb-16 lg:px-16 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="max-w-4xl self-end">
          <MotionDiv
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-3 py-2 text-xs font-medium text-white/85"
          >
            <span className="size-2 rounded-full bg-yellow-300" aria-hidden="true" />
            Currently building at IBM · Dallas / New York
          </MotionDiv>

          <h1 className="max-w-4xl text-balance font-pixel text-[clamp(2.8rem,8vw,7.2rem)] font-bold leading-[0.94] text-white">
            Rohan
            <span className="block text-white/55">Malhotra.</span>
          </h1>

          <div className="mt-6 min-h-9 text-xl font-medium text-white sm:text-2xl">
            <RotatingText
              texts={focusAreas}
              rotationInterval={2800}
              splitBy="words"
              staggerDuration={0.03}
              mainClassName="inline-flex"
              splitLevelClassName="overflow-hidden"
              elementLevelClassName="text-balance"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
            />
          </div>

          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
            {profile.summary}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore the work
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#/resume"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/35 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <FileText className="size-4" aria-hidden="true" />
              View Resume
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 px-2 py-3 text-sm font-semibold text-white/75 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              GitHub
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="w-full max-w-md self-end rounded-2xl border border-white/15 bg-black/55 p-4 shadow-lg xl:justify-self-end">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <span className="font-pixel text-xs text-white/65">LIVE PROFILE</span>
            <Gauge className="size-4 text-yellow-300" aria-hidden="true" />
          </div>
          <dl className="mt-3 space-y-1">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-baseline justify-between gap-4 rounded-lg px-2 py-2"
              >
                <dt className="text-xs text-white/55">{stat.label}</dt>
                <dd className="tabular-nums text-sm font-semibold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-black">
            <span
              className={cn(
                'size-2 rounded-full',
                robotReady
                  ? 'bg-emerald-500'
                  : robotSkipped || robotFailed
                    ? 'bg-gray-400'
                    : 'animate-pulse bg-yellow-400'
              )}
              aria-hidden="true"
            />
            {robotReady
              ? 'Robot ready — drag to interact'
              : robotSkipped
                ? 'Robot optimized for desktop'
              : robotFailed
                ? 'Robot in low-power mode'
                : 'Warming up the robot…'}
          </div>
        </aside>
      </div>
    </section>
  );
}
