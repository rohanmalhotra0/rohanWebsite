import { Container, Section, SectionHeader } from '@/components/primitives/Section';

// Placeholder: replaced by the section build.
export default function Contact() {
  return (
    <Section id="contact">
      <Container>
        <SectionHeader index="07" label="Contact" title={<>Let&rsquo;s <em>talk</em></>} />
      </Container>
    </Section>
  );
}
