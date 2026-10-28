# Open Wearable Validation

**Measure Ground Truth. Validate With Confidence.**

The open-source suite for wearable sensors and health algorithms.

**Live:** [https://openwearablevalidation.org](https://openwearablevalidation.org)  
**GitHub:** [github.com/ross-wilkinson/open-wearable-validation](https://github.com/ross-wilkinson/open-wearable-validation)

---

G\*Power and its clones cover classical power analysis (t-tests, ANOVA) and stop there. Validation work runs on *agreement* statistics — bias, limits of agreement, variance decomposition, percentile error, and non-inferiority margins — and there has been no free, comprehensive tool for sizing and reporting studies around those. **Open Wearable Validation** is that suite.

Everything runs entirely client-side. No data is uploaded, stored, or sent anywhere.

---

## The 4 Pillars

1. **The Validation Academy** (`/academy`)  
   Interactive Wearable Validation Studios:
   - **Learning Studio:** Meridian PulseBand 2 case study following an 8-module product journey from prototyping to multi-year audits.
   - **Protocol Studio:** Study design, limits-of-agreement precision, repeated-measures ANOVA, demographic quota planning, and Monte Carlo timelines.
   - **Report Studio:** Decision scorecards, Bland-Altman agreement with subject clusters, absolute error survival distributions, and bivariate launch planes.
   - **Pitfall Explorer:** Statistical hazard explainers (RMSE/MAE distortion, Agreement vs ICC, N=5 sniff test traps).

2. **agreekit** (`/agreekit`)  
   Python agreement engine, CLI, and MCP server for exact limits of agreement, Bland-Altman variance decomposition, and paired non-inferiority testing.

3. **Health Data Catalog** (`/health-data-distributions`)  
   Normative baseline population reference distributions from CDC NHANES and SCIN datasets across diverse demographics and health metrics.

4. **Reference Device Catalog** (`/reference-device-catalog`)  
   10-dimension comparative dossiers across 12 biometric domains evaluating FDA 510(k) predicates, hardware synchronization triggers, and sample size inflation from reference noise.

---

## Interactive Protocol & Analysis Modules

| Module | Route | Question it answers |
|---|---|---|
| **Reference Standards** | `/reference-devices` | Which clinical reference standard should I validate against? |
| **Sample Size (Agreement)** | `/agreement` | How many participants do I need to prove agreement or non-inferiority? |
| **Repeated Measures** | `/repeated-measures` | How do I balance participants vs replicates with clustered data? |
| **Precision vs Sample Size** | `/precision` | At $n$ participants, how tightly is each reported quantity pinned down? |
| **Demographic Planner** | `/demographics` | What quotas per sex, age band, and Fitzpatrick/Monk skin tone ensure reachability? |
| **Timeline Simulator** | `/timeline` | How long will recruitment and data collection take (Monte Carlo simulation)? |
| **Effect Size Intervals** | `/effect-size` | What is the exact confidence interval for Cohen's d using non-central t? |
| **Report Studio** | `/report-studio` | How do I synthesize findings into FDA-defensible scorecards and bivariate launch planes? |
| **Pass by Chance?** | `/chance-kpi` | Did our algorithms pass KPIs by chance due to narrow reference dynamic range? |

---

## How the Numbers are Verified

The browser has no SciPy, so every statistical distribution — normal, Student's $t$, half-normal, Poisson, and non-central $t$ — is implemented from scratch in pure TypeScript.

Hand-rolled special functions are verified against golden values generated from SciPy across thousands of grid points. `tools/generate_fixtures.py` emits those fixtures; `tools/check_fixtures.py` verifies them in CI. SciPy and NumPy versions are pinned to guarantee strict numerical reproducibility.

---

## Development

```bash
npm install
npm run dev        # Vite dev server
npm test           # Vitest (45 test suites, 445 tests)
npm run lint       # ESLint 9
npm run typecheck  # TypeScript strict typecheck
npm run build      # Production build (Vite + tsc)
npm run preview    # Preview production build locally
npm run fixtures   # Regenerate golden fixtures (Python + SciPy)
```

---

## Deployment

The application is deployed on **Vercel** with clean URLs:
- Root base path in `vite.config.ts`: `base: '/'`
- SPA rewrites for client-side deep linking in `vercel.json`
- Router powered by `BrowserRouter` (no hash fragments)

---

## Credits

Created by **[Ross D. Wilkinson, PhD](https://scholar.google.com/citations?user=y39yme4AAAAJ&hl=en)**, former Research Scientist at Google specializing in biometric algorithm validation for Pixel Watch, with multiple FDA 510(k) clearances.
