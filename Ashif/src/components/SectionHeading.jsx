import { Highlighter } from '@/components/ui/highlighter';
import { cn } from '@/lib/utils';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow ? (
        <p className="mb-3 font-pixel text-xs font-bold text-gray-500">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-3xl font-bold text-gray-950 sm:text-5xl">
        <Highlighter action="underline" color="#FDE047">
          {title}
        </Highlighter>
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-[15px] leading-6 text-gray-600 sm:mt-5 sm:text-lg sm:leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}
