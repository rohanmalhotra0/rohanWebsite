import { profile } from '@/data/portfolioData';

// Placeholder: replaced by the résumé build.
export default function ResumeView() {
  return (
    <main className="container-page py-16">
      <a href="#top" className="text-sm text-muted">← Back to portfolio</a>
      <h1 className="mt-6 text-4xl font-semibold">{profile.name}</h1>
    </main>
  );
}
