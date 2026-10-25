import { cn } from '@/lib/utils';
import { categoryColor } from './projectData';

/** A small square in the category's palette color, before its name. Decorative. */
export default function CategoryDot({ category, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-2 shrink-0 rounded-[2px]', className)}
      style={{ backgroundColor: categoryColor(category) }}
    />
  );
}
