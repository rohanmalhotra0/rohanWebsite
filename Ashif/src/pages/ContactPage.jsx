import Contact from '@/components/contact/Contact';
import EmailLine from '@/components/contact/EmailLine';
import { Container, PageHeader } from '@/components/primitives/Section';
import { routeById } from '@/routes';

const route = routeById('contact');

export default function ContactPage() {
  return (
    <>
      {/* The address is the page's main way in, so it's in the block, as big as it fits. */}
      <PageHeader route={route}>
        <EmailLine size="xl" className="relative mt-10 sm:mt-14 lg:mt-16" />
      </PageHeader>
      <Container className="pb-20 sm:pb-28">
        <Contact className="mt-8 sm:mt-10" />
      </Container>
    </>
  );
}
