import { cn } from '@/lib/utils';
import { categoryColor } from './projectData';

/**
 * The projects as one bar split by category, each part as wide as its share
 * and in its category's color: what kind of work the list is, at a glance.
 * Follows the search, like the filter's counts. A click on a part picks that
 * category; the filter below is the same choice for keyboards and screen
 * readers, so the bar itself stays out of their way.
 */
export default function CategoryStrip({ options, value, onChange, className }) {
  const parts = options.filter((option) => option.value !== 'all' && option.count > 0);
  const total = parts.reduce((sum, option) => sum + option.count, 0);
  if (!total) return null;

  return (
    <div aria-hidden="true" className={cn('flex h-3 gap-[3px] sm:h-3.5', className)}>
      {parts.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            tabIndex={-1}
            title={`${option.label}: ${option.count}`}
            onClick={() => onChange(active ? 'all' : option.value)}
            style={{ flexGrow: option.count, backgroundColor: categoryColor(option.value) }}
            className={cn(
              'h-full min-w-2 basis-0 cursor-pointer rounded-full transition-[opacity,transform] duration-200 ease-out hover:scale-y-125',
              value !== 'all' && !active && 'opacity-30'
            )}
          />
        );
      })}
    </div>
  );
}
