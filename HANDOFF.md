# Handoff: build the Validation Study Designer

You are picking this up cold. Read this whole file before touching code.

---

## 1. What we're building

A browser-based toolkit for **designing measurement-validation studies** — the kind
run to prove a wearable, sensor, or algorithm is accurate enough.

It answers one practical question in several parts:

> *I'm validating a device. How many subjects do I need, what demographic spread,
> how long will it take, and what precision will I actually achieve?*

**Why this is worth building:** G\*Power and its clones cover classical power analysis
(t-tests, ANOVA) and stop there. Validation work runs on *agreement* statistics —
bias, limits of agreement, percentile error — and there is no free tool for sizing a
study around those. Practitioners do it in spreadsheets, badly.

Audience: wearable startups, sports-science labs, clinical validation teams, CROs.

The author (Ross Wilkinson) spent 3.5 years as a Research Scientist at Google doing
exactly this work for Pixel Watch, including two FDA submissions. The methods below
are his working notebooks from that period and earlier.

## 2. Source material

Nine Jupyter notebooks in `C:\Users\wilki\Downloads\`. **Read each before porting the
method it contains** — they carry the reasoning, not just the formulas.

| Notebook | Role |
|---|---|
| `Comparison of precision-based methods for sample size determination.ipynb` | **Flagship module.** Greenwood + Bland-Altman precision vs n |
| `Sample_Size_Estimation.ipynb` | LoA precision vs threshold; equivalence-test n |
| `Calculate_Target_Demographic_Ranges.ipynb` | Demographic segment planner |
| `Modeling timelines and subject characteristics.ipynb` | Study-duration Monte Carlo |
| `Measurement Error vs Replicates.ipynb` | Fragment (29 lines) — folds into module 1 |
| `gPower_statistics.ipynb` | **Mostly do not port** — see §6. Salvage the Cohen's d CI only |
| `Misled by RMSE and MAE.ipynb` | Explainer page |
| `Agreement vs ICC.ipynb` | Explainer page |
| `Simulated LMEM in R and Python.ipynb` | Out of scope for v1. Incomplete (marked `!!!TBC!!!`) |

## 3. Modules to build

### 3.1 Precision vs sample size — build this first

The core chart. For a given n, plot the margin of error around four different
estimands simultaneously:

```
Greenwood variance of a percentile estimate:
    f_p    = halfnorm.pdf(halfnorm.ppf(p))
    var_p  = (p * (1 - p)) / (n * f_p**2)
    margin = t.ppf(ci, df=n-1) * sqrt(var_p)          # ci = 0.975 for 95%

Bland-Altman precision:
    se        = 1 / sqrt(n)
    margin_bias = t.ppf(ci, df=n-1) * se
    margin_loa  = 1.71 * t.ppf(ci, df=n-1) * se
```

Plot `margin` against n (5…200) for: bias, 95% LoAs, 50th percentile, 90th
percentile. Y-axis is in units of SD. Let the user set the percentiles and the
confidence level.

This is the thing that doesn't exist elsewhere. Make it good.

### 3.2 Sample size for agreement / equivalence

From `Sample_Size_Estimation.ipynb`. User sets an accuracy threshold as a fraction of
measurement SD; solve for the n where LoA precision drops below it:

```
precision(n) = 1.96 * sqrt(3 / n)
```

Also contains an equivalence-test sample size function — port `sample_size_4_equivalence`.

### 3.3 Demographic segment planner

From `Calculate_Target_Demographic_Ranges.ipynb`. Small but carries a non-obvious
insight worth surfacing prominently in the UI: **you must cap the maximum per segment,
not just set a minimum**, or you can never hit your target in the rarest segment.

```
perc_max = (1 - perc_min/100) / (n_segments - 1)
n_min    = n_sample * perc_min/100
n_max    = n_sample * perc_max
```

The notebook has three worked examples (sex, age, Monk skin tone) — reuse them as
presets. **See §7 before shipping the Monk skin tone example.**

### 3.4 Study timeline Monte Carlo

From `Modeling timelines and subject characteristics.ipynb`. Simulate total study
duration by sampling each phase (ethics review, recruitment, data collection,
analysis) and summing.

**Improve on the notebook here.** It models durations as Poisson, which forces
variance = mean — a 28-day phase gets an SD of only 5.3 days, unrealistically tight
for anything involving an IRB. Offer a distribution choice per phase (Poisson,
gamma, lognormal, or three-point PERT). That single change makes the tool
meaningfully better than the source material.

### 3.5 Effect size confidence intervals

Salvaged from `gPower_statistics.ipynb` cells 13–14 and `cohens_d_ci`. Cohen's d CIs
via the **non-central t** distribution rather than a normal approximation — most
people get this wrong.

```
nc     = d * sqrt(n)
bounds = nct.ppf([alpha/2, 1 - alpha/2], df=n-1, nc=nc)
```

⚠️ **Verify before porting:** the notebook prints these bounds directly as a "CI for
Cohen's d", but they're on the *t* scale. Since `d = t / sqrt(n)` for a one-sample or
paired design, the d-scale interval should be `nct.ppf(...) / sqrt(n)`. The notebook
appears to be missing that rescaling — its printed CI would be ~√44 ≈ 6.6× too wide.
Confirm against a reference (e.g. the `MBESS` R package) before implementing.

### 3.6 Explainer pages

Two static pages, ported from the notebooks of the same names. Both have a real thesis
and a clean demonstration — keep the prose, make the figure interactive.

- **Misled by RMSE and MAE** — device errors are heavy-tailed, so RMSE/MAE violate
  their own normality assumption. Demo: Student t with df=1.3 vs a normal with matched
  SD → *identical RMSE*, wildly different coverage. Interactive: slider on df, watch
  RMSE hold constant while the % of values within it collapses. Recommendation: report
  percentiles (P50/P68/P95) instead.
- **Agreement vs ICC** — two datasets with *identical* paired differences produce
  wildly different ICCs, because ICC is hostage to between-subject variance. The
  notebook has both datasets ready to use.

## 4. The critical architecture decision: statistics in the browser

The notebooks lean on `scipy.stats` and `statsmodels`. Neither exists in JS. You need:

| distribution | needed for | difficulty |
|---|---|---|
| normal — pdf/cdf/ppf | everywhere | easy |
| Student t — cdf/ppf | all CIs, power | easy |
| half-normal — pdf/ppf | Greenwood (§3.1) | easy |
| Poisson — pmf/sampling | timeline MC (§3.4) | easy |
| **non-central t — ppf** | Cohen's d CI (§3.5) | **hard** |
| F / non-central F | ANOVA power (optional) | medium |

**Recommended approach — a tested TS stats core.**

1. Evaluate `@stdlib/stats` first (modular, tree-shakeable, broad distribution
   coverage). Confirm whether it ships non-central t; do not assume it does.
2. For anything missing — non-central t especially — implement the CDF (Algorithm
   AS 243 / Lenth 1989 series) and invert numerically by bisection or Brent's method
   for the ppf.
3. **Golden tests are mandatory.** Before writing any TS, run the SciPy calls across a
   grid of inputs and dump expected values to JSON fixtures. Commit them. Every TS
   distribution function gets tested against SciPy's answers. This is the whole
   safety net — the tool is worthless if the numbers are subtly wrong, and subtly
   wrong is the default outcome when hand-rolling distributions.

**Fallback:** Pyodide runs real SciPy in the browser via WASM and removes all
numerical risk. But it's a ~10 MB download and it undercuts the point of the project
as a portfolio piece. Take it only if non-central t proves genuinely intractable.

## 5. Stack

Mirror `C:\repos\cycling-sim` — same author, same conventions, and its
`HOWTO.md` is a milestone-by-milestone build guide worth reading.

React 19 · TypeScript · Vite · Tailwind · Recharts · React Router (HashRouter, for
GitHub Pages) · Vitest + React Testing Library · ESLint + Prettier · GitHub Actions →
Pages.

Keep the stats core pure, typed, and UI-free in `src/stats/`, with modules in
`src/modules/`. Charts are heavy here — consider a Web Worker for the Monte Carlo
(§3.4) and the percentile sweeps so the UI doesn't jank.

## 6. Do not port the gPower widget

`gPower_statistics.ipynb` looks like the most app-shaped notebook. It isn't. Its
`ipywidgets` G\*Power clone is a stub:

- only 2 of the test × analysis combinations are implemented
- most declared outputs (noncentrality, critical F, numerator/denominator DF, actual
  power) are created as empty `Label()`s and never populated
- **it has a real bug**: the "One-sample t-test" branch calls `TTestIndPower()`, the
  *independent*-samples solver — wrong distribution, wrong answer

If classical power analysis is wanted later, rebuild it against `statsmodels`
semantics from scratch. Salvage only §3.5 from this notebook.

## 7. Two things to check with Ross before shipping

**Provenance.** `Calculate_Target_Demographic_Ranges.ipynb` is authored
`wilkinsonross@` — Google's internal username format — and dated Oct 8 2022, during
his employment there. The Monk skin tone modeling in the timelines notebook is the
same situation. The Monk Skin Tone Scale is publicly published by Google and the
arithmetic is generic, so there probably isn't an issue, but these artifacts were
produced as part of his job. **Confirm clearance before either goes public.** The
other seven notebooks read as personal methodological work.

**Known bugs in the source notebooks** — fix during the port, don't propagate:

1. `Sample_Size_Estimation.ipynb` cell 7 — the `sd` list is never reset inside the
   outer loop, so it accumulates across every n while still being divided by `10000`.
   `over`/`under` climb past 100% and the plotted result is wrong. This one fails
   silently; it looks fine.
2. `gPower_statistics.ipynb` cell 4 — `TTestIndPower()` used for the one-sample test.
3. `Comparison of precision-based methods…` cells 4–5 — cell 4 is pseudocode that
   won't execute; cell 5 uses `^` (XOR) where `**` was intended.
4. Possible missing `/sqrt(n)` in the Cohen's d CI — see §3.5.

## 8. Milestones

**M0 — Golden fixtures.** Set up a Python script that emits JSON fixtures from
SciPy/statsmodels across an input grid for every distribution in §4, plus expected
outputs for each module's worked examples. This gates everything else.

**M1 — Scaffold.** Vite + React 19 + TS + Tailwind + Vitest, mirroring cycling-sim.
CI green on an empty app.

**M2 — Stats core.** Implement §4's distributions in `src/stats/`. Every function
tested against the M0 fixtures. Do not proceed until green.

**M3 — Module 1** (§3.1, precision vs sample size). The flagship. Ship it as a
standalone usable page before building anything else.

**M4 — Modules 2 + 3** (§3.2, §3.3). Both are small once the stats core exists.

**M5 — Module 4** (§3.4, timeline MC). Web Worker. Distribution choice per phase.

**M6 — Module 5** (§3.5, effect size CIs) — after resolving the rescaling question.

**M7 — Explainer pages** (§3.6). Prose from the notebooks, figures interactive.

**M8 — CI/CD.** Copy cycling-sim's `.github/workflows/deploy.yml`. Deploy to Pages.
One-time manual step: repo Settings → Pages → Source = "GitHub Actions".

## 9. Ask Ross

1. Clearance on the two Google-era notebooks (§7)?
2. Is the Cohen's d CI missing `/sqrt(n)`, or is the t-scale interval intended (§3.5)?
3. Preferred name for the deployed tool?
4. Should the explainer pages carry his byline and link to his publications?
