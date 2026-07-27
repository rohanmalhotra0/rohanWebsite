import { FileText, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const links = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Research', href: '#research' },
  { label: 'RohanGPT', href: '#rohangpt' },
  { label: 'Contact', href: '#contact' },
];

function scrollToHash(event, href) {
  if (!href.startsWith('#') || href.startsWith('#/')) return;
  event.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Navbar({ variant = 'dark' }) {
  const dark = variant === 'dark';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5',
        dark ? 'text-white' : 'text-black'
      )}
    >
      <nav
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between rounded-xl border px-3 py-2 shadow-sm',
          dark
            ? 'border-white/15 bg-black/80'
            : 'border-black/10 bg-white/95'
        )}
        aria-label="Primary navigation"
      >
        <a
          href="#top"
          onClick={(event) => scrollToHash(event, '#top')}
          className="rounded-md px-2 py-2 font-pixel text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          aria-label="Rohan Malhotra — back to top"
        >
          RM
          <span className="text-yellow-300">.</span>
        </a>

        <div className="hidden items-center gap-1 xl:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => scrollToHash(event, link.href)}
              className={cn(
                'rounded-md px-3 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
                dark ? 'text-white/70 hover:text-white' : 'text-black/65 hover:text-black'
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#/resume"
            className={cn(
              'inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2',
              dark
                ? 'bg-white text-black focus-visible:outline-white'
                : 'bg-black text-white focus-visible:outline-black'
            )}
          >
            <FileText className="size-4" aria-hidden="true" />
            View Resume
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-lg border xl:hidden',
                  dark
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-black/15 text-black hover:bg-black/5'
                )}
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {links.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <a
                    href={link.href}
                    onClick={(event) => scrollToHash(event, link.href)}
                    className="min-h-10 cursor-pointer"
                  >
                    {link.label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
