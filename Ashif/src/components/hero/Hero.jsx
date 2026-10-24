import { profile } from '@/data/portfolioData';

// Placeholder: replaced by the hero build.
export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh items-end pb-20">
      <div className="container-page">
        <h1 className="type-display text-7xl">{profile.name}</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">{profile.summary}</p>
      </div>
    </section>
  );
}
