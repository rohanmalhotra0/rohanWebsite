import { Container, Section, SectionHeader } from '@/components/primitives/Section';

// Placeholder: replaced by the section build.
export default function About() {
  return (
    <Section id="about">
      <Container>
        <SectionHeader index="04" label="About" title={<>Hi, I&rsquo;m <em>Rohan</em></>} />
      </Container>
    </Section>
  );
}
