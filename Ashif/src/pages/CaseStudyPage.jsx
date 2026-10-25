import CaseStudy from '@/components/projects/CaseStudy';
import { useRoute } from '@/lib/router';

/** A project's own page; routes.js makes one for each project with a `caseStudy`. */
export default function CaseStudyPage() {
  const { route } = useRoute();
  return <CaseStudy slug={route.project} />;
}
