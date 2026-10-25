import { Container, PageHeader } from '@/components/primitives/Section';
import RohanGPT from '@/components/rohangpt/RohanGPT';
import { routeById } from '@/routes';

export default function ChatPage() {
  return (
    <>
      <PageHeader
        route={routeById('chat')}
        title="Ask about my work"
        description="This chat answers from my résumé and project notes. If something isn’t in them, it says so."
      />
      <Container className="pb-20 sm:pb-28">
        <RohanGPT className="mt-12 sm:mt-16" />
      </Container>
    </>
  );
}
