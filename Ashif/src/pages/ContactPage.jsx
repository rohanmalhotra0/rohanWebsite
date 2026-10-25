import Contact from '@/components/contact/Contact';
import EmailLine from '@/components/contact/EmailLine';
import { Container, PageHeader } from '@/components/primitives/Section';
import { profile } from '@/data/portfolioData';
import { routeById } from '@/routes';

const route = routeById('contact');

// The address in the header block: display type as big as one line allows,
// from its length (--chars) at 0.73em a character (the face measures 0.715).
// The copy button goes under it on phones and beside it from sm, solid so the
// block's outlined numeral doesn't run through it.
const ADDRESS = {
  text: 'type-display text-[length:calc(100cqi/(var(--chars)*0.73))] sm:text-[length:min(5.5rem,calc((100cqi-4.5rem)/(var(--chars)*0.73)))]',
  button: 'lg:size-14',
  box: 'bg-bg group-hover:bg-[color-mix(in_srgb,var(--fg)_7%,var(--bg))] lg:size-14 lg:rounded-xl',
};

export default function ContactPage() {
  return (
    <>
      {/* The address is the page's main way in, so it's in the block, as big as it fits. */}
      <PageHeader route={route}>
        <div className="relative mt-10 sm:mt-14 lg:mt-16" style={{ '--chars': profile.email.length }}>
          <EmailLine textClassName={ADDRESS.text} buttonClassName={ADDRESS.button} boxClassName={ADDRESS.box} />
        </div>
      </PageHeader>
      <Container className="pb-20 sm:pb-28">
        <Contact className="mt-8 sm:mt-10" />
      </Container>
    </>
  );
}
