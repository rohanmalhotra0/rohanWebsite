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
  toy you drag into place or throw with a click, then dances with it. It's
  code-split, loads after first paint behind a static poster, pauses when
  off-screen, and stays on the poster (with a "Run demo" button) on software
  WebGL or very slow devices.
- Mona Sans (text) through Fontsource, and Hubot Sans (display) as two static
  cuts made by `Ashif/scripts/subset-hubot.py` (42 KB instead of the 93 KB
  variable file). Code and key caps use the system monospace font.
- Light and dark themes. The site opens in light mode until a visitor picks one.
- Videos (`LiteYouTube`) are a plain card until someone presses play, then a
  youtube-nocookie player loads in the same 16:9 box. Nothing is fetched from
  YouTube before that click, and with JavaScript off the card is a link.
- Separate pages with real URLs: `/`, `/experience/`, `/projects/`,
  `/research/`, `/about/`, `/chat/`, `/contact/`, and `/resume/`. A small
  router (`Ashif/src/lib/router.js`, `RouterProvider.jsx`) turns clicks on
  plain `<a href="/projects/">` links into in-place page changes with a short
  crossfade, remembers scroll positions for Back, and moves focus to the new
  page's heading. Each page's code is its own chunk, fetched on hover and
  when the browser is idle. Old one-page links (`/#projects`, `/#/resume`,
  `/#project/<slug>`) are redirected by `index.html`.
- `npm run build` also renders every page on the server
  (`Ashif/src/entry-server.jsx`) and writes each one to its own HTML file with
  its own title and description (`Ashif/scripts/prerender.mjs`), plus
  `404.html` and `sitemap.xml`. Pages paint before any JavaScript runs; React
  then hydrates them. Anything the first render shows has to come out the same
  on the server and in the browser, so values only the browser knows (theme,
  time, saved drafts) are read after mount or through `useSyncExternalStore`
  with a server snapshot.

## Structure

```
Ashif/src
├── App.jsx                  # theme + router + the current page
├── routes.js                # every page: URL, title, description, nav label
├── pages/                   # one component per page (HomePage, ProjectsPage…)
├── index.css                # design tokens (dark/light), utilities
├── data/portfolioData.js    # all content: profile, experience, projects, research…
├── components/
│   ├── layout/              # SiteLayout, the "Next page" link, load progress bar
│   ├── primitives/          # Section, PageHeader, SectionHeader, Reveal, Button
│   ├── theme/               # ThemeProvider (light/dark, circular reveal toggle)
│   ├── nav/                 # navbar, mobile menu, ⌘K command palette
│   ├── hero/                # three.js robot fetch demo
│   ├── home/                # home page previews: numbers, selected work, …
│   ├── about/               # About intro + PhotoDeck (the draggable photo pile)
│   ├── experience/  projects/  research/  education/
│   ├── rohangpt/            # chat UI
│   ├── contact/  footer/
│   └── resume/              # printable résumé view at /resume/
├── services/rohangptService.js
└── lib/ hooks/              # router, theme, small window events
```

## Editing content

Almost everything on the site comes from `Ashif/src/data/portfolioData.js`.
Add a project there and it shows up on the Projects page, the archive, the
command palette, and RohanGPT's quick answers. `selectedWork` picks the three
projects on the home page, and the photos in `photos` (after the portrait)
make up the pile on the About page.

To add a page, create `Ashif/src/pages/<Name>Page.jsx` and add an entry to
`Ashif/src/routes.js`; the build prerenders it, and a `label` puts it in the
navbar, footer, and command palette.

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
