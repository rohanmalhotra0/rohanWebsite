import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, FileText } from 'lucide-react';
import RotatingText from './RotatingText';
import { assetUrl, profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const ROBOT_SCENE = new URL('../../../scene.splinecode', import.meta.url).href;
// Self-hosted copy of @splinetool/modelling-wasm; keep its version in sync with
// @splinetool/runtime (pinned in package.json) so Spline never falls back to unpkg.
const SPLINE_WASM_PATH = new URL(assetUrl('spline-wasm'), document.baseURI).href;

// Start the scene and wasm downloads alongside the Spline bundle instead of
// waiting for the runtime to request them one after another.
function preload(href, type) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'fetch';
  link.type = type;
  link.crossOrigin = 'anonymous';
  link.href = href;
  document.head.appendChild(link);
}
preload(ROBOT_SCENE, 'application/octet-stream');
preload(`${SPLINE_WASM_PATH}/process.wasm`, 'application/wasm');

const splineModule = import('@splinetool/react-spline');
const Spline = lazy(() => splineModule);

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
        {/* Still frame of the robot's first pose; the camera scales with height, so
            height-fit + centered lines it up with the live scene while it loads. */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-14 h-[40dvh] overflow-hidden transition-opacity duration-500 sm:top-0 sm:h-1/2 md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-3/5 lg:w-7/12',
            robotReady ? 'opacity-0' : 'opacity-100'
          )}
        >
          <img
            src={assetUrl('robot-poster.webp')}
            alt=""
            width="1678"
            height="1800"
            fetchPriority="high"
            decoding="async"
            className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2"
          />
        </div>
        <div
          className={cn(
            'absolute inset-x-0 top-14 h-[40dvh] transition-opacity duration-500 sm:top-0 sm:h-1/2 md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-3/5 lg:w-7/12',
            robotReady ? 'opacity-100' : 'opacity-0'
          )}
        >
          <RobotBoundary>
            <Suspense fallback={null}>
              <Spline
                scene={ROBOT_SCENE}
                wasmPath={SPLINE_WASM_PATH}
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

      <div className="pointer-events-none relative z-20 mx-auto w-full max-w-7xl px-4 pb-16 pt-[43dvh] sm:px-8 sm:pb-20 sm:pt-[50dvh] md:px-12 md:pb-16 md:pt-32 lg:px-16">
        <div className="max-w-xl self-end">
          <h1 className="max-w-xl text-balance font-pixel text-[clamp(2.5rem,6.4vw,5.5rem)] font-bold leading-[0.94] text-gray-950">
            Rohan
            <span className="block text-gray-500">Malhotra</span>
          </h1>

          <div className="mt-4 min-h-8 text-lg font-medium text-gray-800 sm:mt-6 sm:min-h-9 sm:text-2xl">
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

          <p className="mt-4 max-w-lg text-pretty text-[15px] leading-6 text-gray-600 sm:mt-5 sm:text-lg sm:leading-7">
            {profile.summary}
          </p>

          <div className="pointer-events-auto mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
            <a
              href="#projects"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-black px-3 py-3 text-[13px] font-semibold text-white shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:gap-2 sm:px-5 sm:text-sm"
            >
              Explore the work
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#/resume"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-300 bg-white/80 px-3 py-3 text-[13px] font-semibold text-gray-950 shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:gap-2 sm:px-5 sm:text-sm"
            >
              <FileText className="size-4" aria-hidden="true" />
              View Resume
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 px-1 py-3 text-[13px] font-semibold text-gray-600 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:gap-2 sm:px-2 sm:text-sm"
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
