# Clifton

<img alt="Clifton" src="public/logo-readme.svg" width="160">

**Find and rank clinical trials — automatically matched to a patient's profile.**

> 🦭 **Clifton is free and always will be.** Each AI-enhanced search costs ~$0.05–0.10 to run. If it helps you or someone you love, [help keep Clifton's tusks shiny](https://ko-fi.com/notwopr) or [donate to Alzheimer's research](https://www.alz.org/help-support/i-want-to-help/donate).

**Clifton** (**cli**nical trial si**ft**er) pulls every actively recruiting interventional trial from [ClinicalTrials.gov](https://clinicaltrials.gov) in real time, uses Google Gemini AI to normalize your condition, expand synonyms, and score each trial for relevance, eligibility, and fit — then ranks them by how well they match a specific patient: eligibility likelihood, odds of receiving active treatment, travel distance, procedural burden, and personal preferences.

It was built because searching ClinicalTrials.gov manually — filtering, reading eligibility criteria, cross-referencing medications and comorbidities — takes hours per search and has to be repeated every few weeks as new trials open. Clifton does that work in seconds.

> **Not medical advice.** Clifton helps you discover and compare trials; it does not provide medical guidance. Always consult a qualified healthcare provider before making any treatment decisions.

---

## Live

[clifton-topaz.vercel.app](https://clifton-topaz.vercel.app)

---

## Features

- **AI-enhanced matching** — Google Gemini normalizes your condition, expands synonyms, and scores each trial for relevance, comorbidity conflicts, medication conflicts, dealbreakers, and must-haves
- **Plain-English summaries** — Clifton rewrites each trial's description in patient-friendly language
- **"Why it might work"** — AI hypothesis drawing on published research and prior trials for each treatment
- **Profile-based ranking** — enter age, sex, comorbidities, current medications, and preferences once; the app scores every trial against that profile
- **Three-dimension scoring** — Eligibility (40%) · Treatment Access (20%) · Preference Match (40%)
- **Dealbreaker system** — mark delivery methods, procedures, or free-form conditions as dealbreakers; excluded trials stay visible so you can reconsider
- **Distance-sorted sites** — every trial site ranked by drive distance from your ZIP code, with contacts shown inline
- **New trial detection** — on each re-search, trials that weren't present last time are highlighted with a NEW badge
- **24-hour results cache** — results are cached locally; re-searching within 24h with an unchanged profile returns instantly without hitting the API
- **Export** — star your top trials, then export as PDF (print), `.txt`, CSV, or copy to clipboard
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
| AI | Google Gemini 2.5 Flash Lite |
| Data source | ClinicalTrials.gov v2 REST API (free, no auth) |
| Geocoding | zippopotam.us (free, no auth) |
| Storage | Browser `localStorage` only |
| Hosting | Vercel |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn / bun
- Google AI API key (free tier available at [aistudio.google.com](https://aistudio.google.com))

### Run locally

```bash
git clone https://github.com/notwopr/clifton.git
cd clifton
npm install
```

Create a `.env.local` file:

```
GOOGLE_AI_API_KEY=your_key_here
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

AI features require the API key. Without it the app falls back to deterministic ranking.

### Build for production

```bash
npm run build
npm start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/notwopr/clifton)

Add `GOOGLE_AI_API_KEY` as an environment variable in your Vercel project settings before deploying.

---

## Architecture

```
src/
  app/
    page.tsx              # Landing page
    search/page.tsx       # Main search + results page (client)
    api/trials/route.ts   # Edge route — proxies ClinicalTrials.gov
    api/ai/route.ts       # Edge route — Gemini AI (enrich-query, score-trials)
    globals.css           # Tailwind v4 theme + color variables
    layout.tsx            # Root layout with header
  components/
    profile/              # 4-step profile wizard (condition, demographics, history, preferences)
    results/              # ResultsPanel, TrialCard
    ThemeToggle.tsx       # Dark/light mode toggle
    ui/                   # shadcn/ui primitives
  lib/
    types.ts              # All TypeScript types + defaults
    clinicaltrials.ts     # ClinicalTrials.gov API client
    eligibility.ts        # Data extraction (delivery methods, procedures, locations, distances)
    ranking.ts            # Scoring engine (eligibility, treatment access, preference match, AI integration)
    storage.ts            # localStorage helpers (profiles, trial snapshots, results cache)
public/
  logo.svg                # Full wordmark logo
  logo-dark.svg           # Wordmark logo variant for dark backgrounds
  icon.svg                # Square icon/logomark
  og-image.png            # Social sharing preview (1200×630)
```

### Data flow

1. User fills in profile (saved to `localStorage` on every change)
2. On search: check 24h results cache — if profile unchanged and cache fresh, return immediately
3. Otherwise: zip → lat/lon via zippopotam.us; Gemini normalizes condition + expands synonyms
4. Fetch up to 500 recruiting interventional trials via `/api/trials`
5. All trials batched in parallel to Gemini for AI scoring (relevance, conflicts, summaries, hypotheses)
6. Each study scored across three dimensions; AI scores boost (never reduce) deterministic scores
7. Dealbreakers collapse composite score to 0 but keep trial visible
8. Results sorted: non-dealbreakers by composite score desc, then dealbreakers by eligibility score desc
9. NCT IDs saved to `localStorage` snapshot; next search highlights new arrivals

---

## Privacy

- Profile data and results are stored only in your browser's `localStorage`
- Health data (age, conditions, medications, comorbidities) is sent to Google Gemini AI for scoring — **no names or personally identifying information**
- The only other outbound requests are to ClinicalTrials.gov and zippopotam.us
- No analytics, no cookies, no tracking of any kind

---

## Contributing

Bug reports and pull requests are welcome. Please open an issue before starting significant work so we can discuss approach.

---

## Disclaimer

Clifton is an independent tool and is **not affiliated with** ClinicalTrials.gov, the NIH, the FDA, Google, or any pharmaceutical company or clinical research organization.

Trial data is sourced from ClinicalTrials.gov and may not be complete or current. Eligibility scoring is heuristic and **will not catch every exclusion criterion** — always read the full protocol and speak with a qualified investigator before enrolling.

**This is not medical advice.**

---

## Support Clifton

Clifton is free and always will be. Each AI-enhanced search costs ~$0.05–0.10 in API fees to run.

| | |
|---|---|
| 🦭 [Help keep Clifton's tusks shiny](https://ko-fi.com/notwopr) | Support ongoing development via Ko-fi |
| ❤️ [Alzheimer's Association](https://www.alz.org/help-support/i-want-to-help/donate) | Donate directly to the research |

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
