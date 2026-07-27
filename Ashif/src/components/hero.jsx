import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, FileText } from 'lucide-react';
import RotatingText from './RotatingText';
import { profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const Spline = lazy(() => import('@splinetool/react-spline'));
const ROBOT_SCENE = new URL('../../../scene.splinecode', import.meta.url).href;

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
  const [robotReady, setRobotReady] = useState(false);

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
      className="relative flex min-h-dvh w-full items-end overflow-hidden bg-[#8d8d89] text-white"
    >
      <div className="absolute inset-0">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(#b5b5b1_1px,transparent_1px),linear-gradient(90deg,#b5b5b1_1px,transparent_1px)] bg-[size:44px_44px] opacity-45"
          aria-hidden="true"
        />
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-200',
            robotReady ? 'opacity-100' : 'opacity-0'
          )}
        >
          <RobotBoundary>
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
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-black/45"
          aria-hidden="true"
        />
      </div>

      <div className="pointer-events-none relative z-20 mx-auto w-full max-w-7xl px-5 pb-24 pt-32 sm:px-8 md:px-12 md:pb-16 lg:px-16">
        <div className="max-w-4xl self-end">
          <h1 className="max-w-4xl text-balance font-pixel text-[clamp(2.55rem,7vw,6.2rem)] font-bold leading-[0.94] text-white">
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

          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
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
      </div>
    </section>
  );
}
