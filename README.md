# Rohan Malhotra — Portfolio

Personal portfolio for **Rohan Malhotra** (New York, NY) at [`rohanm.org`](https://rohanm.org).

- **Theme**: Mathematics × Computer Science — Systems. Infrastructure. Applied Research.
- **App location**: the Vite + React app lives in `Ashif/`.

## Local development

```bash
cd Ashif
npm install
npm run dev
```

## RohanGPT configuration

RohanGPT can run in one of two modes:

- **Recommended (no client key exposure)**: set `VITE_ROHANGPT_API_URL` to your serverless endpoint that returns `{ "response": "..." }`.
- **Direct OpenAI (exposes key in client bundle)**: set `VITE_OPENAI_API_KEY` (and optionally `VITE_OPENAI_MODEL`).

Create `Ashif/.env.local`:

```bash
VITE_ROHANGPT_API_URL=
VITE_OPENAI_API_KEY=
VITE_OPENAI_MODEL=gpt-4o-mini
```

## Deployment (GitHub Pages)

This repo includes a GitHub Actions workflow that:

- Installs dependencies in `Ashif/`
- Builds the static site to `Ashif/dist`
- Deploys to GitHub Pages

Custom domain is configured via `Ashif/public/CNAME` (currently `rohanm.org`).

