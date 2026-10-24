import { profile } from '@/data/portfolioData';

// Placeholder: replaced by the hero build.
export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh items-end pb-24">
      <div className="container-page">
        <h1 className="text-7xl font-semibold tracking-[-0.05em]">{profile.name}</h1>
        <p className="mt-4 text-lg text-muted">{profile.headline}</p>
      </div>
    </section>
  );
}
