import { cn } from '@/lib/utils';
import { logoFrame } from './logos';

const IMG = { alt: '', loading: 'lazy', decoding: 'async', draggable: false };

/** A crop of the source image, scaled so the crop box fills `width`% of the tile. */
function CroppedLogo({ src, frame }) {
  const [x, y, w, h] = frame.crop;
  const [naturalWidth, naturalHeight] = frame.size;

  return (
    <span
      className="relative block overflow-hidden"
      style={{ width: `${frame.width}%`, aspectRatio: `${w} / ${h}` }}
    >
      <img
        {...IMG}
        src={src}
        width={naturalWidth}
        height={naturalHeight}
        className="absolute max-w-none mix-blend-multiply"
        style={{
          width: `${(naturalWidth / w) * 100}%`,
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
        }}
      />
    </span>
  );
}

/**
 * Company logo on a small paper tile. Logos are drawn for white backgrounds,
 * so the tile stays light in both themes; multiply blending melts each file's
 * own white into the tile. Decorative: the company name sits right beside it.
 */
export default function CompanyLogo({ company, src, className }) {
  const frame = logoFrame(company);

  return (
    <span
      className={cn(
        'relative isolate grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-surface dark:bg-fg',
        className
      )}
    >
      {frame.crop ? (
        <CroppedLogo src={src} frame={frame} />
      ) : (
        <img
          {...IMG}
          src={src}
          width={frame.size?.[0]}
          height={frame.size?.[1]}
          className={cn(
            'mix-blend-multiply',
            frame.cover ? 'size-full object-cover' : 'h-auto object-contain'
          )}
          style={frame.cover ? undefined : { width: `${frame.width}%` }}
        />
      )}
      {/* Hairline drawn over the image so full-bleed logos keep a crisp edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-fg/10 ring-inset"
      />
    </span>
  );
}
