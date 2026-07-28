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
      className="relative flex min-h-dvh w-full items-end overflow-hidden bg-[#f2f2f0] text-gray-950"
    >
      <div className="absolute inset-0 bg-[#f2f2f0]">
        <div
          className={cn(
            'absolute inset-x-0 top-0 h-3/5 transition-opacity duration-200 md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-3/5 lg:w-7/12',
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
                  spline?.setBackgroundColor?.('#f2f2f0');

                  const textNamePattern =
                    /text|title|heading|headline|word|copy|label|logo/i;

                  const sceneObjects = Array.from(
                    spline?.getAllObjects?.() || []
                  );

                  sceneObjects.forEach((object) => {
                    try {
                      if (
                        object.type === 'Text' ||
                        textNamePattern.test(object.name || '')
                      ) {
                        object.hide?.();
                        object.visible = false;
                      }
                    } catch {
                      // Keep the robot running if an exported layer is immutable.
                    }
                  });

                  setRobotReady(true);
                }}
              />
            </Suspense>
          </RobotBoundary>
        </div>
      </div>

      <div className="pointer-events-none relative z-20 mx-auto w-full max-w-7xl px-5 pb-24 pt-[55dvh] sm:px-8 md:px-12 md:pb-16 md:pt-32 lg:px-16">
        <div className="max-w-xl self-end">
          <h1 className="max-w-xl text-balance font-pixel text-[clamp(2.5rem,6.4vw,5.5rem)] font-bold leading-[0.94] text-gray-950">
            Rohan
            <span className="block text-gray-500">Malhotra</span>
          </h1>

          <div className="mt-6 min-h-9 text-xl font-medium text-gray-800 sm:text-2xl">
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

          <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-gray-600 sm:text-lg">
            {profile.summary}
          </p>

          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Explore the work
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#/resume"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white/80 px-5 py-3 text-sm font-semibold text-gray-950 shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <FileText className="size-4" aria-hidden="true" />
              View Resume
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 px-2 py-3 text-sm font-semibold text-gray-600 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
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
