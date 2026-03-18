# Contributing to ClinicalSift

Thank you for your interest in contributing. ClinicalSift exists to help patients and caregivers navigate clinical trials — contributions that improve accuracy, accessibility, or usability are very welcome.

## Ground rules

1. **Mission first.** ClinicalSift is a free public-good tool. Changes that compromise user privacy, introduce ads, or gate features behind a paywall will not be accepted.
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
git clone https://github.com/notwopr/clinicalsift.git
cd clinicalsift
npm install
npm run dev        # starts on http://localhost:3000
npm run build      # production build + type-check
npm run lint       # ESLint
```

No environment variables required.

## Code style

- TypeScript everywhere — no `any` if avoidable
- Functional React components with hooks
- Keep components focused; the ranking logic lives in `src/lib/` and should stay separate from UI
- Tailwind v4 utility classes; avoid custom CSS unless necessary

## Disclaimer

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
