# Rohan Malhotra — Portfolio

An interactive React portfolio for Rohan Malhotra, focused on applied AI,
robotics, quantitative systems, research, and production engineering.

The application lives in [`Ashif`](./Ashif) and is deployed to
[rohanm.org](https://rohanm.org) through GitHub Pages.

## Local development

```bash
cd Ashif
npm ci
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
```

## Content architecture

- `Ashif/src/data/portfolioData.js` is the shared source for profile,
  experience, project, research, skill, and résumé content.
- `Ashif/public/website-photos/photo-manifest.json` gives every displayed
  media asset a canonical label and descriptive alt text.
- `Ashif/public/website-photos/resume/Rohan_Malhotra_Resume_2026.pdf` is the
  canonical downloadable résumé.
- `scene.splinecode` is bundled locally and lazy-loaded after the initial page
  shell; mobile and reduced-motion visitors receive the lightweight hero.

## RohanGPT

Common portfolio questions are answered instantly from the verified local
profile. Broader live-model questions require a server endpoint:

```bash
VITE_ROHANGPT_API_URL=https://your-server.example/api/chat
```

The frontend does not accept or bundle an OpenAI API key.
