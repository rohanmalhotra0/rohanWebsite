import Contact from '@/components/contact/Contact';
import { Container, PageHeader } from '@/components/primitives/Section';
import { routeById } from '@/routes';

const route = routeById('contact');

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact" description={route.description} />
      <Container className="pb-20 sm:pb-28">
        <Contact className="mt-12 sm:mt-16" />
      </Container>
    </>
  );
}
