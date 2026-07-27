import { createElement } from 'react';
import { Github, Home, Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Dock, DockIcon } from '@/components/ui/dock';
import { profile } from '@/data/portfolioData';

const socials = [
  { name: 'LinkedIn', url: profile.linkedin, Icon: Linkedin },
  { name: 'GitHub', url: profile.github, Icon: Github },
  { name: 'Email', url: `mailto:${profile.email}`, Icon: Mail },
];

function DockLink({ name, href, Icon, onClick }) {
  return (
    <DockIcon>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={href}
            onClick={onClick}
            target={href.startsWith('mailto:') || href.startsWith('#') ? undefined : '_blank'}
            rel={href.startsWith('mailto:') || href.startsWith('#') ? undefined : 'noreferrer'}
            aria-label={name}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'size-11 rounded-full'
            )}
          >
            {createElement(Icon, {
              className: 'size-5',
              'aria-hidden': true,
            })}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </DockIcon>
  );
}

export default function SocialMagnet() {
  return (
    <div className="social-magnet fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 hidden -translate-x-1/2 sm:block">
      <TooltipProvider>
        <Dock className="border border-black/10 bg-white/95 shadow-lg">
          <DockLink
            name="Home"
            href="#top"
            Icon={Home}
            onClick={(event) => {
              event.preventDefault();
              document.querySelector('#top')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <Separator orientation="vertical" className="h-8" />
          {socials.map((social) => (
            <DockLink
              key={social.name}
              name={social.name}
              href={social.url}
              Icon={social.Icon}
            />
          ))}
        </Dock>
      </TooltipProvider>
    </div>
  );
}
