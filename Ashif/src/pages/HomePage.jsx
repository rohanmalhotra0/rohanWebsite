import Hero from '@/components/hero/Hero';
import AtAGlance from '@/components/home/AtAGlance';
import ExperienceSnapshot from '@/components/home/ExperienceSnapshot';
import HomeCta from '@/components/home/HomeCta';
import SelectedWork from '@/components/home/SelectedWork';

/** The robot, the headline numbers, and a short preview of each page. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <AtAGlance />
      <SelectedWork />
      <ExperienceSnapshot />
      <HomeCta />
    </>
  );
}
