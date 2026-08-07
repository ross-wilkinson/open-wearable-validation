# Validation Study Designer

A browser-based toolkit for designing measurement-validation studies — the kind
run to prove a wearable, sensor, or algorithm is accurate enough.

**Live:** https://ross-wilkinson.github.io/validation-study-designer/

G\*Power and its clones cover classical power analysis (t-tests, ANOVA) and stop
there. Validation work runs on *agreement* statistics — bias, limits of
agreement, percentile error — and there is no free tool for sizing a study
around those. This is that calculation.

Everything runs client-side. No data is uploaded, stored, or sent anywhere.

## Modules

| Module | Question it answers |
|---|---|
| **Precision vs sample size** | At n subjects, how tightly is each reported quantity pinned down? |
| **Sample size for agreement** | How many subjects to reach a stated accuracy threshold? Plus an equivalence test. |
| **Demographic planner** | Minimum *and maximum* subjects per segment — the cap is what makes the floor reachable. |
| **Timeline simulator** | Monte Carlo over study phases, with a distribution choice per phase. |
| **Effect size intervals** | Cohen's d confidence intervals from the non-central t, not a normal approximation. |

Plus two explainers: *Misled by RMSE and MAE*, and *Agreement is not ICC*.

## How the numbers are verified

The browser has no SciPy, so every distribution — normal, Student t,
half-normal, Poisson, non-central t — is implemented from scratch in
TypeScript. Hand-rolled special functions are subtly wrong by default, so each
is tested against golden values generated from SciPy across thousands of grid
points. `tools/generate_fixtures.py` emits those fixtures; `tools/check_fixtures.py`
regenerates them in CI and fails if any committed value drifted, which is the only
way a quietly edited expected value gets caught. It compares values rather than
file bytes, at per-array tolerances that mirror the test consuming each array —
a guard stricter than the test it guards reports differences that cannot change
any outcome, and across two operating systems there are thousands of those.
SciPy and NumPy are pinned to exact versions so the reference implementation
changes only in a commit that says it is changing.

Two places where the reference turned out to be the less accurate side are
documented in the code and graded against exact arithmetic instead:
`scipy.special.betaln` (which cancels for lopsided arguments) and `nct.cdf`
(which returns NaN in the deep tail).

## Development

```sh
npm install
npm run dev        # dev server
npm test           # vitest
npm run lint
npm run typecheck
npm run build
npm run preview    # serves dist/ at the real base path
npm run fixtures   # regenerate golden fixtures (needs Python + SciPy)
```

`base` in `vite.config.ts` must match the GitHub repository name.

## Credits

Built by [Ross D. Wilkinson, PhD](https://scholar.google.com/citations?user=y39yme4AAAAJ&hl=en).
The methods are ported from working notebooks written for real validation
studies. Where those notebooks contained errors, they were corrected rather than
ported, and each module says which — see `HOWTO.md`.
