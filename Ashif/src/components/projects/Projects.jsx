import { Container, Section, SectionHeader } from '@/components/primitives/Section';

// Placeholder: replaced by the section build.
export default function Projects() {
  return (
    <Section id="projects">
      <Container>
        <SectionHeader index="02" label="Projects" title={<>Things I&rsquo;ve <em>built</em></>} />
      </Container>
    </Section>
  );
}
