import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function assetUrl(path) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${String(path || '').replace(/^\/+/, '')}`;
}

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [breakpointPx]);

  return isMobile;
}

function PushPin({ active, size = 12, id = 'pin' }) {
  const displayColor = active ? '#0115DF' : '#A0A0A0';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]"
    >
      <defs>
        <radialGradient id={`pinGradient-${id}`} cx="40%" cy="40%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#F7F3EE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="black" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id={`topSurface-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F7F3EE" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F7F3EE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.circle cx="14" cy="16" r="7" animate={{ fill: displayColor }} fillOpacity="0.8" transition={{ duration: 0.3 }} />
      <circle cx="14" cy="16" r="7" fill={`url(#pinGradient-${id})`} />
      <motion.circle cx="14" cy="12" r="10" animate={{ fill: displayColor }} transition={{ duration: 0.3 }} />
      <circle cx="14" cy="12" r="10" fill={`url(#pinGradient-${id})`} />
      <circle cx="14" cy="12" r="9" fill={`url(#topSurface-${id})`} />
      <circle cx="11" cy="9" r="2.5" fill="#F7F3EE" fillOpacity="0.35" />
    </svg>
  );
}

function PolaroidCard({ p, index, isMobile, prefersReducedMotion, onSelect, containerRef }) {
  const ref = useRef(null);
  const justDraggedRef = useRef(false);
  const rotateX = useSpring(0, { damping: 30, stiffness: 100, mass: 2 });
  const rotateY = useSpring(0, { damping: 30, stiffness: 100, mass: 2 });
  const scale = useSpring(1, { damping: 30, stiffness: 100, mass: 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shouldReduceMotion = isMobile || prefersReducedMotion;
  const dragEnabled = true;

  const handleMouseMove = (e) => {
    if (!ref.current || isDragging || shouldReduceMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -6);
    rotateY.set((offsetX / (rect.width / 2)) * 6);
  };

  const handleMouseEnter = () => {
    if (!isDragging && !shouldReduceMotion) {
      scale.set(1.04);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      scale.set(1);
      rotateX.set(0);
      rotateY.set(0);
      setIsHovered(false);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    onSelect?.(p);
  };

  const positionStyle = {
    ...(p.left !== undefined && { left: p.left }),
    ...(p.right !== undefined && { right: p.right }),
    ...(p.top !== undefined && { top: p.top }),
    ...(p.bottom !== undefined && { bottom: p.bottom }),
  };

  return (
    <motion.div
      ref={ref}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        ...positionStyle,
        width: 'clamp(100px, 22vw, 170px)',
        zIndex: isHovered || isDragging ? 50 : index + 1,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      drag={dragEnabled}
      dragConstraints={containerRef}
      dragElastic={0.08}
      onDragStart={() => { setIsDragging(true); justDraggedRef.current = false; }}
      onDrag={() => { justDraggedRef.current = true; }}
      onDragEnd={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full rounded-sm overflow-hidden bg-[#faf8f5] pt-5 px-2 pb-4 shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
        style={{
          rotate: p.rotate ?? 0,
          rotateX,
          rotateY,
          scale,
          transformPerspective: 800,
        }}
      >
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
          <PushPin active={isHovered} size={10} id={`pin-${p.id}`} />
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
          <img
            src={typeof p.src === 'string' ? p.src : assetUrl(p.src)}
            alt={p.alt}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Horizontal staircase: cards step right with slight vertical overlap
const DEFAULT_POLAROIDS = [
  { id: 1, src: 'website-photos/me/01.png', alt: 'Rohan', left: '0%', top: '12%', rotate: -1 },
  { id: 2, src: 'website-photos/me/04.jpg', alt: 'Rohan', left: '22%', top: '5%', rotate: 1 },
  { id: 4, src: 'website-photos/me/09.png', alt: 'Rohan', left: '44%', top: '12%', rotate: -1 },
  { id: 3, src: 'website-photos/me/rohanphoto.jpg', alt: 'Rohan', left: '66%', top: '5%', rotate: 1 },
];

export default function InteractivePolaroids({ polaroids = DEFAULT_POLAROIDS }) {
  const containerRef = useRef(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected) return;
    const onEscape = (e) => e.key === 'Escape' && setSelected(null);
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full min-h-[280px] sm:min-h-[320px] md:min-h-[400px] max-w-[640px] mx-auto md:mx-0"
      >
        {polaroids.map((p, i) => (
          <PolaroidCard
            key={p.id}
            p={p}
            index={i}
            isMobile={isMobile}
            prefersReducedMotion={!!prefersReducedMotion}
            onSelect={setSelected}
            containerRef={containerRef}
          />
        ))}
      </div>

      {createPortal(
        <AnimatePresence>
          {selected && (
            <motion.div
              key="polaroid-popup"
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 9999 }}
              initial={false}
            >
              <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setSelected(null)}
              />
              <motion.div
                className="relative z-10 max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden shadow-2xl bg-[#faf8f5] p-3 pb-6"
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                  <PushPin active={true} size={14} id="popup-pin" />
                </div>
                <img
                  src={typeof selected.src === 'string' ? selected.src : assetUrl(selected.src)}
                  alt={selected.alt}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-sm"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
