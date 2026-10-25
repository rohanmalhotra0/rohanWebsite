import About from '@/components/about/About';
import PhotoDeck from '@/components/about/PhotoDeck';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import Reveal from '@/components/primitives/Reveal';
import { photos } from '@/data/portfolioData';

// photos[0] is the portrait, shown at the top of the page.
const deck = photos.slice(1);

export default function AboutPage() {
  return (
    <>
      <About />
      <Section id="photos" className="mt-20 sm:mt-28">
        <Container>
          <SectionHeader
            title="Photos"
            description="Off the clock. Drag or swipe the top print away to see the next, or open it full screen."
          />
          <Reveal className="mt-12 sm:mt-16">
            <PhotoDeck photos={deck} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
