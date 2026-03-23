# Contributing to Clifton

> 🦭 **Clifton is free to use and always will be.** Each AI-enhanced search costs ~$0.05–0.10 to run. If you find it useful, [help keep Clifton's tusks shiny](https://ko-fi.com/notwopr).

Thank you for your interest in contributing. Clifton exists to help patients and caregivers navigate clinical trials — contributions that improve accuracy, accessibility, or usability are very welcome.

## Ground rules

1. **Mission first.** Clifton is a free public-good tool. Changes that compromise user privacy, introduce ads, or gate features behind a paywall will not be accepted.
2. **No server-side user data.** The zero-server, localStorage-only architecture is intentional. Changes that send user profiles or medical history to an external server (other than ClinicalTrials.gov for the search query itself) require a very compelling case.
3. **Not medical advice.** Do not add language that could be interpreted as medical guidance. The app surfaces data; it does not make recommendations.
4. **Open an issue first** before starting significant work (new features, architectural changes). A quick discussion can save a lot of wasted effort.

## How to contribute

### Reporting bugs

Open a GitHub issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and OS

### Suggesting features

Open a GitHub issue with the feature idea and the use case it solves. Issues tagged `good first issue` or `help wanted` are good starting points.

### Submitting a pull request

1. Fork the repo and create a branch from `main`
2. Run `npm install` and make sure `npm run build` passes with no errors
3. Keep changes focused — one feature or fix per PR
4. Test manually in both light and dark mode
5. If you've changed the ranking logic, explain the reasoning in the PR description
6. Submit the PR with a clear title and description

### Good areas for contribution

- **Additional conditions** — the search logic is condition-agnostic, but improving condition-specific synonym suggestions in Step 1
- **Internationalisation** — distance units (km), non-US ZIP geocoding providers, non-English UI
- **Accessibility** — keyboard navigation, screen reader improvements, colour contrast
- **Ranking improvements** — better eligibility heuristics, improved delivery method / procedure detection patterns
- **Test coverage** — unit tests for the ranking engine and eligibility parser
- **Documentation** — clearer explanations of how scoring works

## Development setup

```bash
git clone https://github.com/notwopr/clifton.git
cd clifton
npm install
npm run dev        # starts on http://localhost:3000
npm run build      # production build + type-check
npm run lint       # ESLint
```

Create a `.env.local` file in the project root:

```
GOOGLE_AI_API_KEY=your_key_here
```

Get a free key at [aistudio.google.com](https://aistudio.google.com). The free tier (Gemini 2.5 Flash Lite) is sufficient for local development. Without the key the app falls back to deterministic ranking — AI features (summaries, hypotheses, relevance scoring) will be disabled.

The model is configured in `src/app/api/ai/route.ts` (`GEMINI_MODEL` constant). Any Gemini model that supports JSON output mode can be substituted.

## Code style

- TypeScript everywhere — no `any` if avoidable
- Functional React components with hooks
- Keep components focused; the ranking logic lives in `src/lib/` and should stay separate from UI
- Tailwind v4 utility classes; avoid custom CSS unless necessary

## AI API cost estimates

Each search makes two types of Gemini API calls:

| Call | When | Approx. tokens |
|---|---|---|
| `enrich-query` | Once per search | ~600 input, ~100 output |
| `score-trials` | Batches of 75 trials, run in parallel | ~28,000 input + ~18,000 output per batch |

For a typical large condition (e.g. Alzheimer's, ~500 trials across 7 batches):

| | Tokens | Cost at Gemini 2.5 Flash Lite rates |
|---|---|---|
| Input | ~200,000 | ~$0.020 |
| Output | ~120,000 | ~$0.048 |
| **Total** | | **~$0.05–0.10 per search** |

Smaller conditions with fewer trials cost proportionally less (~$0.01–0.03). Gemini 2.5 Flash Lite pricing: $0.10/1M input tokens, $0.40/1M output tokens. Verify current rates at [ai.google.dev/pricing](https://ai.google.dev/pricing).

## Support the project

Clifton runs on AI API calls that cost real money. If you use Clifton and want to help keep it running:

- 🦭 [Ko-fi — help keep Clifton's tusks shiny](https://ko-fi.com/notwopr)
- ❤️ [Alzheimer's Association](https://www.alz.org/help-support/i-want-to-help/donate)

## Disclaimer

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
