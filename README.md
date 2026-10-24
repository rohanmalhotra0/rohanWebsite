# Rohan Malhotra — Portfolio

Source for [rohanm.org](https://rohanm.org): applied AI, robotics, and
quantitative systems. The app lives in [`Ashif`](./Ashif) and deploys to GitHub
Pages from `main` (see `.github/workflows/github-pages.yml`).

## Local development

```bash
cd Ashif
npm ci
npm run dev       # http://localhost:5173
npm run lint
npm run build     # outputs Ashif/dist
```

## Stack

- React 19 + Vite 7, Tailwind CSS v4, `motion` for UI animation.
- Raw WebGL for the hero particle field. No 3D library; it loads after first
  paint and pauses when off-screen.
- Geist, Geist Mono, and Instrument Serif, self-hosted through Fontsource.

## Structure

```
Ashif/src
├── App.jsx                  # page shell + #/resume route
├── index.css                # design tokens (dark/light), utilities
├── data/portfolioData.js    # all content: profile, experience, projects, research…
├── components/
│   ├── primitives/          # Section, SectionHeader, Reveal, Button, Tag
│   ├── theme/               # ThemeProvider (dark default, circular reveal toggle)
│   ├── nav/                 # floating navbar + ⌘K command palette
│   ├── hero/                # WebGL particle hero
│   ├── experience/  projects/  research/  about/  education/
│   ├── rohangpt/            # chat UI
│   ├── contact/  footer/
│   └── resume/              # printable résumé view at #/resume
├── services/rohangptService.js
└── lib/ hooks/
```

## Editing content

Almost everything on the page comes from `Ashif/src/data/portfolioData.js`.
Add a project there and it shows up in the projects section, the archive, the
command palette, and RohanGPT's quick answers.

Images live in `Ashif/public/img` as optimized WebP. Originals are kept in
`Ashif/public/website-photos`. Use `assetUrl('img/…')` for public files so the
relative `base` keeps working on GitHub Pages.

## RohanGPT

Common questions are answered instantly from the local profile data. Open-ended
questions need a server endpoint (the Netlify function in `netlify-api/`):

```bash
VITE_ROHANGPT_API_URL=https://your-server.example/api/chat
```

The frontend never bundles an API key.
