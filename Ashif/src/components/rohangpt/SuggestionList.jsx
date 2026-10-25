import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUGGESTIONS } from './prompts';

/** Suggested questions as plain text rows between hairlines. */
export default function SuggestionList({ onAsk, labelledBy, className }) {
  return (
    <ul aria-labelledby={labelledBy} className={cn('border-t border-line', className)}>
      {SUGGESTIONS.map((question) => (
        <li key={question} className="border-b border-line">
          <button
            type="button"
            onClick={() => onAsk(question)}
            className="group flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left text-[15px] leading-6 text-muted transition-colors duration-150 hover:text-fg focus-visible:text-fg"
          >
            <span className="text-pretty">{question}</span>
            <ArrowRight
              aria-hidden="true"
              strokeWidth={1.75}
              className="size-4 shrink-0 -translate-x-1 text-subtle opacity-0 transition-[opacity,translate,color] duration-200 ease-out group-hover:translate-x-0 group-hover:text-accent-strong group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
