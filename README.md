# Clifton

<!-- Replace this line with your actual logo once ready: -->
<!-- ![Clifton](public/logo.svg) -->

**Find and rank clinical trials — automatically matched to a patient's profile.**

> **Why "Clifton"?** The name is a portmanteau of **Cli**nical and si**ft** — *Clinical* + *sift* → *Clift* → *Clifton*. It was originally built to search for Alzheimer's trials for a family member.

Clifton pulls every actively recruiting interventional trial from [ClinicalTrials.gov](https://clinicaltrials.gov) in real time and ranks them by how well they fit a specific patient: eligibility likelihood, odds of receiving active treatment, travel distance, procedural burden, and personal preferences.

It was built because searching ClinicalTrials.gov manually — filtering, reading eligibility criteria, cross-referencing medications and comorbidities — takes hours per search and has to be repeated every few weeks as new trials open. Clifton does that work in seconds.

> **Not medical advice.** Clifton helps you discover and compare trials; it does not provide medical guidance. Always consult a qualified healthcare provider before making any treatment decisions.

---

## Live demo

[clifton.vercel.app](https://clifton.vercel.app) *(update this link after deploying)*

---

## Features

- **Profile-based ranking** — enter age, sex, comorbidities, current medications, and preferences once; the app scores every trial against that profile
- **Three-dimension scoring** — Eligibility (40%) · Treatment Access (20%) · Preference Match (40%)
- **Dealbreaker system** — mark delivery methods, procedures, or free-form conditions as dealbreakers; excluded trials stay visible so you can reconsider
- **Distance-sorted sites** — every trial site ranked by drive distance from your ZIP code, with contacts shown inline
- **New trial detection** — on each re-search, trials that weren't present last time are highlighted with a NEW badge
- **Auto-check on load** — if the last search is more than a week old, the app re-runs it automatically when you open the page
- **Export action plan** — star your top trials, then export as a formatted PDF (print), copy to clipboard, or download as `.txt`
- **Fully private** — your profile never leaves your browser; no account, no tracking, no server-side storage
- **Dark / light mode** — toggle in the top-right corner; preference is saved locally
- **Free and open source** — MIT license

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI components | shadcn/ui v4 (base-ui) |
| Styling | Tailwind CSS v4 |
| Data source | ClinicalTrials.gov v2 REST API (free, no auth) |
| Geocoding | zippopotam.us (free, no auth) |
| Storage | Browser `localStorage` only |
| Hosting | Vercel free tier |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn / bun

### Run locally

```bash
git clone https://github.com/notwopr/clifton.git
cd clifton
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required. The app calls ClinicalTrials.gov and zippopotam.us directly — both are free and require no API keys.

### Build for production

```bash
npm run build
npm start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/notwopr/clifton)

No environment variables needed. The free tier is sufficient.

---

## Architecture

```
src/
  app/
    page.tsx              # Landing page
    search/page.tsx       # Main search + results page (client)
    api/trials/route.ts   # Edge route — proxies ClinicalTrials.gov (1hr cache)
    globals.css           # Tailwind v4 theme + color variables
    layout.tsx            # Root layout with header + dark mode
  components/
    profile/              # 4-step profile wizard (condition, demographics, history, preferences)
    results/              # ResultsPanel, TrialCard, ScoreBar
    ThemeToggle.tsx       # Dark/light mode toggle
    ui/                   # shadcn/ui primitives
  lib/
    types.ts              # All TypeScript types + defaults
    clinicaltrials.ts     # ClinicalTrials.gov API client
    eligibility.ts        # Data extraction (delivery methods, procedures, locations, distances)
    ranking.ts            # Scoring engine (eligibility, treatment access, preference match)
    storage.ts            # localStorage helpers (profile + trial snapshots)
public/
  logo.svg                # Full wordmark logo (navbar, light mode)
  logo-dark.svg           # Wordmark logo variant for dark backgrounds
  icon.svg                # Square icon/logomark only (app icon, favicon source)
  og-image.png            # Social sharing preview (1200×630)
```

### Data flow

1. User fills in profile (saved to `localStorage` on every change)
2. On search: zip → lat/lon via zippopotam.us, then fetch up to 200 recruiting interventional trials via `/api/trials` (proxied edge route with 1hr cache)
3. Each study is scored across three dimensions; dealbreakers collapse composite score to 0 but keep trial visible
4. Results sorted: non-dealbreakers by composite score desc, then dealbreakers by eligibility score desc
5. NCT IDs saved to `localStorage` snapshot; next search highlights new arrivals

---

## Privacy

- No user data is sent to any server operated by Clifton
- Profile data is stored only in your browser's `localStorage`
- The only outbound requests are to ClinicalTrials.gov (condition + keywords) and zippopotam.us (ZIP code → coordinates)
- No analytics, no cookies, no tracking of any kind

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

Bug reports and pull requests are welcome. Please open an issue before starting significant work so we can discuss approach.

---

## Disclaimer

Clifton is an independent tool and is **not affiliated with** ClinicalTrials.gov, the NIH, the FDA, or any pharmaceutical company or clinical research organization.

Trial data is sourced from ClinicalTrials.gov and may not be complete or current. Eligibility scoring is heuristic and **will not catch every exclusion criterion** — always read the full protocol and speak with a qualified investigator before enrolling.

**This is not medical advice.**

---

## Donations

Clifton is and will always be free. If it has helped you or someone you love, consider supporting Alzheimer's research:

- [Alzheimer's Association](https://www.alz.org/help-support/i-want-to-help/donate)
- [BrightFocus Foundation](https://www.brightfocus.org/alzheimers-disease/donate)
- [Alzheimer's Research UK](https://www.alzheimersresearchuk.org/donate/)

To support the ongoing development of Clifton:

- [Ko-fi](https://ko-fi.com/notwopr)

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
