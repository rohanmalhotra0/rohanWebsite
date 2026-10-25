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
- three.js for the hero: a procedurally modeled Spot-style robot that fetches a
  toy wherever you click. It's code-split, loads after first paint behind a
  static poster, and pauses when off-screen.
- Mona Sans (text) through Fontsource, and Hubot Sans (display) as two static
  cuts made by `Ashif/scripts/subset-hubot.py` (42 KB instead of the 93 KB
  variable file). Code and key caps use the system monospace font.
- Light and dark themes. The site opens in light mode until a visitor picks one.

## Structure

```
Ashif/src
├── App.jsx                  # page shell + #/resume route
├── index.css                # design tokens (dark/light), utilities
├── data/portfolioData.js    # all content: profile, experience, projects, research…
├── components/
│   ├── primitives/          # Section, SectionHeader, Reveal, Button, TechList
│   ├── theme/               # ThemeProvider (light/dark, circular reveal toggle)
│   ├── nav/                 # navbar + ⌘K command palette
│   ├── hero/                # three.js robot fetch demo
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

Images live in `Ashif/public/img` as optimized WebP. Full-size originals are
kept, undeployed, in `Ashif/source-images`. Papers are in `Ashif/public/papers`
and logos in `Ashif/public/website-photos`. Use `assetUrl('img/…')` for public
files so the relative `base` keeps working on GitHub Pages.

The downloadable résumé, `Ashif/public/Rohan_Malhotra_Resume.pdf`, is a copy of
`resumes/pdf/Rohan_Malhotra_Resume_General.pdf`. After rebuilding the résumés,
copy it over again. The `#/resume` page is generated from the site data and
prints on one Letter page.

## RohanGPT

Common questions are answered instantly from the local profile data. Open-ended
questions need a server endpoint (the Netlify function in `netlify-api/`):

```bash
VITE_ROHANGPT_API_URL=https://your-server.example/api/chat
```

The frontend never bundles an API key.
