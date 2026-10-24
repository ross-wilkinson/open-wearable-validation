# Directive 01: Human-Subject Research Landing Page & Validation Ecosystem Portal

| Directive ID | `01-human-subject-research-landing-page` |
|---|---|
| **Status** | Approved for Implementation |
| **Author** | Directive Expert & Biostatistical Context Specialist |
| **Target Milestone** | Phase 1 Front-Door Transformation |
| **Primary Scope** | `src/pages/HomePage.tsx`, `src/pages/HomePage.test.tsx`, `src/app/navigation.ts`, `src/app/App.test.tsx` |
| **Invariants Protected** | `src/stats/*` numerical core, `src/modules/*` workflows, `src/app/study/*` shared plan context |

---

## 1. Rationale & Problem Statement

### 1.1 The Clinical, Scientific, and Regulatory Context
Validation studies for medical devices, physiological wearables, optical biosensors (photoplethysmography / PPG), and digital health algorithms face a rigorous methodological barrier. To secure FDA clearance (such as 510(k) or De Novo pathways under 21 CFR 870/868/882), CE mark certification under EU MDR (2017/745), or scientific credibility in clinical literature, manufacturers must establish empirical agreement against recognized gold standards:
- **ISO 80601-2-61:2019** (Pulse Oximeters): Mandates controlled hypoxia desaturation studies down to 70% $\mathrm{S_aO_2}$, testing at least 10 human subjects with a minimum of 200 paired data points, stratified across skin pigmentation levels (requiring at least 2 darkly pigmented participants or Monk Skin Tone scale coverage), with an Root Mean Square Error ($A_{\mathrm{rms}}$) target typically $\le 3.0\%$ or $\le 3.5\%$.
- **ISO 81060-2:2018 / 2019** (Intermittent Automated Non-Invasive Sphygmomanometers): Mandates paired clinical investigations involving $\ge 85$ human participants across age and arm circumference brackets, evaluating mean bias ($\le \pm 5\text{ mmHg}$) and standard deviation of differences ($\le 8\text{ mmHg}$) against reference auscultation or arterial lines.
- **IEEE 1708-2014 / 2019** (Cuffless Blood Pressure Measurement Devices): Establishes rigorous baseline, recalibration, and continuous wear agreement criteria.
- **CTA-2065 & CTA-2070** (Consumer Technology Association): Establish human-subject testing protocols for physical activity, step counts, energy expenditure, and nocturnal sleep architecture (polysomnography / PSG epoch agreement).
- **FDA Diversity Action Plans** (FDORA Section 3601): Mandates proactive enrollment targets across sex, age, race, ethnicity, and physiological characteristics (such as skin pigmentation), penalizing protocols that fail to demonstrate equitable demographic representation.

### 1.2 The Methodological Traps in Wearable Validation
Despite these regulatory frameworks, validation protocols routinely fail due to five pervasive biostatistical errors:
1. **The Classical Power Analysis Fallacy (The G*Power Trap):** Clinical teams attempt to size validation studies using classical null-hypothesis significance testing ($H_0: \mu_1 = \mu_2$, $t$-tests, ANOVA). This asks whether a difference can be detected, rather than whether two measurement modalities *agree within an acceptable clinical tolerance* (Bland & Altman 1986). A large sample size in a $t$-test will flag clinically meaningless trivial differences as "statistically significant" ($p < 0.05$), while a small sample size provides zero assurance about the width of the limits of agreement.
2. **The Unit-of-Analysis Failure (Pseudo-Replication):** Wearables collect continuous high-frequency time series (e.g., heart rate per second, SpO2 per minute, sleep epochs per 30 seconds). Analyzing $N \times M$ data points as if they were independent observations violates basic statistical independence, collapses standard errors, and artificially inflates degrees of freedom (Bland & Altman 2007, Zou 2013). Studies must be sized and analyzed accounting for within-subject versus between-subject variance components.
3. **The Correlation & ICC Illusion:** High Pearson correlation ($r > 0.95$) indicates linear association, not agreement; a device that consistently reads $20\text{ mmHg}$ higher than reference has $r = 1.0$. Intraclass correlation (ICC) is hostage to between-subject biological variance: recruiting a wildly heterogeneous cohort artificially drives ICC toward $1.0$, masking unacceptable measurement error (Bland & Altman 1986, 1999).
4. **Heavy-Tailed Errors vs Gaussian RMSE:** Optical sensor artifacts (motion, poor coupling, peripheral vasoconstriction) produce heavy-tailed, non-Gaussian error distributions. Under heavy tails (e.g., Student-$t$ with low degrees of freedom), RMSE and MAE give false impressions of error bounds. Sizing must consider empirical error percentiles ($P_{50}, P_{90}, P_{95}$) alongside mean bias (Greenwood 1974).
5. **Demographic Quota Exhaustion:** Setting recruitment minimums without enforcing segment caps causes fast-recruiting demographic strata to fill study capacity before hard-to-recruit strata reach their regulatory thresholds, resulting in study halts, protocol deviations, or massive budget overruns.

### 1.3 The Triad of Open-Science Validation Tooling
Validation Study Designer does not operate in isolation. It forms the center of a three-pillar open-source research pipeline:
```
  +--------------------------------------------------------------------------+
  | 1. UPSTREAM: Health Data Distributions (Pre-Study Normative Baselines)   |
  |    https://ross-wilkinson.github.io/health-data-distributions/           |
  |    - Curated population percentiles from public surveys (NHANES, UKB)   |
  |    - Empirical distributions for vitals, resting pulse, BP, Monk tones  |
  |    - Parameterizes biological variance (sigma) and demographic quotas   |
  +--------------------------------------------------------------------------+
                                      |
                                      v
  +--------------------------------------------------------------------------+
  | 2. DESIGN PORTAL: Validation Study Designer (Interactive Sizing & Plan)  |
  |    https://ross-wilkinson.github.io/validation-study-designer/           |
  |    - Bland-Altman LoA precision sizing & Carkeet non-central t inversion |
  |    - TOST equivalence boundaries & ISO 80601-2-61 Arms sizing           |
  |    - Capped demographic segment quotas & Monte Carlo timeline modeling  |
  |    - Cohesive cross-module Study Plan context                            |
  +--------------------------------------------------------------------------+
                                      |
                                      v
  +--------------------------------------------------------------------------+
  | 3. DOWNSTREAM: agreekit (Post-Collection Statistical Analysis)           |
  |    https://github.com/ross-wilkinson/agreekit                            |
  |    - Clustered agreement analysis for repeated-measures validation data  |
  |    - Decomposes between-subject and within-subject variance              |
  |    - Reports effective sample size (n_eff), exact LoA CIs, Arms, and     |
  |      transparent regulatory methods text                                 |
  +--------------------------------------------------------------------------+
```

### 1.4 Mission of Directive 01
The landing page of Validation Study Designer (`src/pages/HomePage.tsx`) currently presents a narrow entry point focused almost exclusively on a single question: *"How many participants does your validation study need?"*. While foundational, this undersells the portal's complete scope.

Directive 01 transforms the landing page into a comprehensive **"One-Stop Shop for Human-Subject Research"** for clinical research directors, biomedical engineers, regulatory affairs managers, and physiological data scientists. It provides:
1. An authoritative **Hero** framing human-subject study design and clinical device validation.
2. An elegant, prominent **Ecosystem Bridge** highlighting the sibling tools `Health Data Distributions` (pre-study normative lookup) and `agreekit` (downstream clustered analysis).
3. A structured **Study Design Matrix / Pathways** categorizing methodologies by study question and data structure (Single-Sample Paired, Paired Repeated Measures, TOST Equivalence, Demographic Stratification, Timeline Forecasting).
4. Concrete **Practical Study Presets / Profiles** for hallmark clinical protocols ($S_p O_2$ hypoxia desaturation, continuous exercise HR, non-invasive blood pressure, nocturnal sleep staging).
5. Expanded **"Am I in the right place?"** and **"What an answer looks like"** showcases representing the multi-dimensional decisions of a human-subject investigation.

---

## 2. Precise Mathematical & Statistical Specification

The landing page must articulate, cite, and link to the exact biostatistical formulations implemented across the toolkit.

### 2.1 Bland-Altman Limits of Agreement & Precision Sizing
For $n$ independent human participants, let $y_{1i}$ denote the device measurement and $y_{2i}$ denote the reference measurement on subject $i$. The paired difference is $d_i = y_{1i} - y_{2i}$.
The sample mean bias $\bar{d}$ and sample variance $s_d^2$ are:
$$\bar{d} = \frac{1}{n} \sum_{i=1}^n d_i, \qquad s_d^2 = \frac{1}{n-1} \sum_{i=1}^n (d_i - \bar{d})^2$$
The estimated 95% Limits of Agreement (LoA) are:
$$\mathrm{LoA}_{\mathrm{lower}} = \bar{d} - 1.96 s_d, \qquad \mathrm{LoA}_{\mathrm{upper}} = \bar{d} + 1.96 s_d$$
The standard error of the mean bias is:
$$\operatorname{SE}(\bar{d}) = \frac{s_d}{\sqrt{n}}$$
The asymptotic standard error of the estimated limits of agreement (Bland & Altman 1986, 1999) is:
$$\operatorname{SE}(\mathrm{LoA}) \approx s_d \sqrt{\frac{1}{n} + \frac{1.96^2}{2(n-1)}} \approx s_d \sqrt{\frac{3}{n}}$$
The half-width margin of error at confidence level $1-\alpha$ (e.g., $95\%$ confidence with $t_{0.975, n-1}$) is:
$$\operatorname{ME}_{\mathrm{LoA}} \approx 1.71 \cdot t_{1-\alpha/2, n-1} \cdot \frac{s_d}{\sqrt{n}}$$
**Exact Non-Central $t$ Formulation (Carkeet 2015):** The limits of agreement are quantiles of a normal distribution $\bar{d} \pm k s_d$. Exact two-sided confidence intervals for the limits of agreement are obtained using the non-central $t$-distribution with degrees of freedom $\nu = n - 1$ and non-centrality parameter $\delta = \pm 1.96 \sqrt{n}$. Sizing for agreement requires finding the minimum $n$ such that the confidence interval width falls below a pre-specified clinical margin.

### 2.2 Paired Repeated Measures & Clustered Variance (Bland & Altman 2007, Zou 2013)
When each participant $i$ contributes $m_i$ repeated observations over time (e.g., continuous HR monitoring during exercise, or 24-hour ambulatory monitoring), differences are clustered within subjects:
$$d_{ij} = \mu + \alpha_i + \epsilon_{ij}, \quad \alpha_i \sim \mathcal{N}(0, \sigma_b^2), \quad \epsilon_{ij} \sim \mathcal{N}(0, \sigma_w^2)$$
where $\sigma_b^2$ is between-subject variance and $\sigma_w^2$ is within-subject measurement error variance.
The total variance of differences is:
$$\sigma_d^2 = \sigma_b^2 + \sigma_w^2$$
The intraclass correlation coefficient for differences is:
$$\rho = \frac{\sigma_b^2}{\sigma_b^2 + \sigma_w^2}$$
For a balanced design with $m$ measurements across $n$ subjects ($N = n \cdot m$ total readings):
$$\operatorname{Var}(\bar{d}) = \frac{\sigma_b^2 + \sigma_w^2 / m}{n} = \frac{\sigma_d^2}{n \cdot m} \left[1 + (m - 1)\rho\right]$$
The design effect (DEFF) and effective sample size ($n_{\mathrm{eff}}$) are:
$$\mathrm{DEFF} = 1 + (m - 1)\rho, \qquad n_{\mathrm{eff}} = \frac{N}{\mathrm{DEFF}} = \frac{n \cdot m}{1 + (m - 1)\rho}$$
*Critical Design Implication:* Sizing a continuous sensor study cannot be solved by collecting 10,000 readings on 4 subjects. Sizing the limits of agreement and between-subject bias is bounded by subject degrees of freedom ($n-1$). Downstream analysis must be executed in `agreekit` to prevent catastrophic pseudo-replication.

### 2.3 Root Mean Square Error ($A_{\mathrm{rms}}$) Formulation (ISO 80601-2-61)
The standardized pulse oximetry accuracy metric $A_{\mathrm{rms}}$ across $N$ paired data points is defined as:
$$A_{\mathrm{rms}} = \sqrt{\frac{1}{N} \sum_{i=1}^N (S_p O_{2,i} - S_a O_{2,i})^2} = \sqrt{\bar{d}^2 + \left(\frac{N-1}{N}\right) s_d^2}$$
When the bias is negligible ($\bar{d} \approx 0$), $A_{\mathrm{rms}} \approx s_d$. Sizing requires bounding both the mean bias and the dispersion of errors relative to the acceptance ceiling (e.g., $A_{\mathrm{rms}} \le 3.0\%$).

### 2.4 Demographic Segment Quota Feasibility (Segment Maximum Capping)
For a target total sample size $n$ partitioned into $K$ categorical strata (e.g., $K=10$ Monk Skin Tone categories, or age brackets):
If a regulatory standard or protocol requires each segment $k \in \{1,\dots,K\}$ to achieve at least proportion $p_{\min}$ ($n_{\min} = \lceil n \cdot p_{\min} \rceil$), the maximum allowable proportion in any single segment cannot exceed:
$$p_{\max} = \frac{1 - p_{\min}}{K - 1}$$
$$n_{\max} = \left\lfloor n \cdot \frac{1 - p_{\min}}{K - 1} \right\rfloor$$
*Theorem:* If any segment recruits more than $n_{\max}$ participants, it is mathematically impossible for all remaining $K-1$ segments to achieve $p_{\min}$ without expanding the total sample size beyond $n$. Uncapped recruitment guarantees study overrun.

### 2.5 Two One-Sided Tests (TOST) Equivalence
For an equivalence margin $[-\delta, +\delta]$, null hypotheses $H_{01}: \mu_d \le -\delta$ and $H_{02}: \mu_d \ge +\delta$ are tested at significance level $\alpha$. Sizing requires:
$$n \approx \frac{(z_{1-\alpha} + z_{1-\beta/2})^2 \sigma_d^2}{(\delta - |\mu_d|)^2}$$
with exact non-central $t$ inversion applied for small-to-moderate sample sizes.

---

## 3. Scope & Target Layout

### 3.1 Modified and New Files
1. `src/app/navigation.ts`
   - Add typed data structures and constants for:
     - `ECOSYSTEM_LINKS`: Structured links and metadata for `Health Data Distributions` and `agreekit`.
     - `STUDY_PATHWAYS`: Structured taxonomy of validation study types, target questions, key estimands, and recommended modules.
     - `STUDY_PRESETS`: Practical clinical validation study profiles ($S_p O_2$, Continuous HR, NIBP, Sleep Staging) with regulatory references, device categories, and quick links.
   - Maintain full backwards compatibility for `MODULE_ROUTES`, `EXPLAINER_ROUTES`, `ModuleRoute`, and `ModuleStatus`.
2. `src/pages/HomePage.tsx`
   - Complete architectural overhaul into the "One-Stop Shop for Human-Subject Research" portal.
   - Implement the visual hierarchy:
     1. Hero Section (Elevated human-subject validation framing + quick CTA buttons).
     2. Ecosystem Bridge (3-card interactive banner connecting pre-study distributions, study design, and post-study analysis).
     3. Study Design Pathways (Matrix mapping study questions/data structures to analytical modules).
     4. Practical Study Presets (4 clickable hallmark clinical/wearable protocols).
     5. "Am I in the right place?" Question Index (Updated to cover clinical, engineering, and regulatory questions).
     6. "What an answer looks like" Multi-Dimensional Showcase (Sample size, precision, demographic quota feasibility, timeline).
     7. Core Module Grid (`MODULE_ROUTES`).
     8. Methodological Foundations & Explainer Previews (`EXPLAINER_ROUTES`).
     9. "Why not G*Power" Epilogue & Methodological References.
3. `src/pages/HomePage.test.tsx` (New file)
   - Comprehensive component tests verifying:
     - Rendering of elevated hero and semantic headings.
     - Presence, structure, and attributes of sibling ecosystem links (correct URLs, `target="_blank"`, `rel="noreferrer"`).
     - Rendering of all study design pathways and internal links.
     - Rendering of all practical study presets with regulatory citations.
     - Rendering of core module cards and explainer cards.
     - Verification of ARIA landmarks and keyboard navigation.
4. `src/app/App.test.tsx`
   - Update heading assertions to match the broadened hero heading while maintaining the full test suite green.

---

## 4. Architectural & Content Specifications for `HomePage.tsx`

### 4.1 Hero Section
- **Badge / Eyebrow:** "Human-Subject Study Design & Biostatistics Platform"
- **Primary Heading ($h1$):** "Design Rigorous Human-Subject Validation Studies"
- **Sub-Headline:** "Size your cohort, balance demographic quotas, forecast timelines, and satisfy regulatory standards for wearable sensors, medical devices, and physiological algorithms."
- **Lead Text:**
  > "Proving a measurement technology is accurate enough requires more than a power calculation. It demands clinical agreement statistics, clustered variance modeling, defensible demographic stratification, and realistic timeline forecasting — before enrolling your first participant."
- **CTA Action Group:**
  - `Primary Action`: "Start with sample size" $\rightarrow$ `/agreement` (High-contrast `bg-ink text-plane`).
  - `Secondary Action`: "I already have an $n$" $\rightarrow$ `/precision` (`border border-hairline`).
  - `Pathway Jump`: "Explore study pathways" $\rightarrow$ anchor `#study-pathways`.
  - `Presets Jump`: "Browse study presets" $\rightarrow$ anchor `#study-presets`.

### 4.2 Ecosystem Bridge: The Three-Pillar Research Lifecycle
Render a prominent, high-craft 3-column section (`aria-labelledby="ecosystem-heading"`) visually connecting the research pipeline:
1. **Upstream: Normative Population Data (`Health Data Distributions`)**
   - *Eyebrow:* Pre-Study Reference
   - *Title:* Population Distributions
   - *URL:* `https://ross-wilkinson.github.io/health-data-distributions/` (External link, opens in new tab, `rel="noreferrer"`)
   - *Badge:* "Pre-Study Norms"
   - *Description:* Look up empirical percentiles and standard deviations ($\sigma$) across vitals, resting heart rate, pulse pressure, and demographic distributions (NHANES, UK Biobank, Monk Skin Tone Scale) to parameterize your study assumptions.
   - *Action Link:* "Explore population norms ↗"
2. **Current Portal: Study Design & Sizing (`Validation Study Designer`)**
   - *Eyebrow:* Active Toolkit
   - *Title:* Validation Study Designer
   - *Badge:* "Design & Sizing"
   - *Description:* Interactive biostatistical calculators for Bland-Altman LoA precision, TOST equivalence bounds, capped demographic recruitment quotas, and Monte Carlo timeline risk modeling.
   - *Action Link:* "Plan your protocol ↓"
3. **Downstream: Clustered Statistical Analysis (`agreekit`)**
   - *Eyebrow:* Post-Study Analysis
   - *Title:* agreekit
   - *URL:* `https://github.com/ross-wilkinson/agreekit` (External link, opens in new tab, `rel="noreferrer"`)
   - *Badge:* "Statistical Analysis"
   - *Description:* The open-source Python analysis counterpart. Ingests repeated-measures validation data, prevents pseudo-replication by accounting for within-subject clustering, and outputs exact LoAs, $A_{\mathrm{rms}}$, and regulatory methods text.
   - *Action Link:* "View analysis package ↗"

### 4.3 Study Design Matrix & Methodological Pathways
Render a structured grid (`id="study-pathways"`, `aria-labelledby="pathways-heading"`) mapping study questions and data structures to statistical solutions:

| Pathway | Primary Question | Key Estimands & Challenges | Target Module |
|---|---|---|---|
| **Single-Sample Paired** | "How many participants do I need for a single spot-check reading per person?" | Mean bias $\bar{d}$, Bland-Altman LoAs $\bar{d} \pm 1.96 s_d$, Carkeet exact non-central $t$ CIs. | `/agreement` & `/precision` |
| **Paired Repeated Measures** | "How do I size a study with continuous sensor data or multiple tests per subject?" | Clustered variance $\sigma_b^2 + \sigma_w^2$, Design Effect $\mathrm{DEFF} = 1 + (m-1)\rho$, effective sample size $n_{\mathrm{eff}}$. | `/precision` & `agreekit` |
| **Equivalence & Non-Inferiority** | "How many subjects do I need to prove my device is non-inferior to reference?" | Schuirmann Two One-Sided Tests (TOST), clinical margin $[-\delta, +\delta]$, power $1-\beta$. | `/agreement` |
| **Demographic Stratification** | "How do I set recruitment targets across skin tones, sexes, and ages?" | Segment capping $p_{\max} = \frac{1 - p_{\min}}{K - 1}$, preventing recruitment starvation in rare groups. | `/demographics` |
| **Timeline & Risk Modeling** | "When will this study actually finish, and what is the risk of delay?" | Stochastic Monte Carlo, multi-phase convolution, heavy-tailed Gamma / PERT / Log-Normal distributions. | `/timeline` |

### 4.4 Practical Study Presets / Profiles
Render 4 interactive protocol cards (`id="study-presets"`, `aria-labelledby="presets-heading"`) representing gold-standard human-subject studies:
1. **Pulse Oximeter ($S_p O_2$) Hypoxia Desaturation Study**
   - *Standard:* ISO 80601-2-61:2019 / FDA 510(k) Guidance
   - *Profile:* Controlled nitrogen-induced desaturation down to 70% $\mathrm{S_aO_2}$ with co-oximetry blood gas reference.
   - *Requirements:* $\ge 10$ subjects, $\ge 200$ paired points, Monk Skin Tone Scale stratification (≥2 darkly pigmented subjects), target $A_{\mathrm{rms}} \le 3.0\%$.
   - *Recommended Toolkit:* Demographics Planner (Monk scale preset) $\rightarrow$ Agreement Sizing $\rightarrow$ `agreekit` ($A_{\mathrm{rms}}$).
   - *Primary Link:* `/demographics`
2. **Continuous Exercise Heart Rate Protocol**
   - *Standard:* CTA-2065 / Sports Science Validation
   - *Profile:* Graded treadmill or cycle ergometer protocol with 12-lead ECG Holter reference across resting, steady-state, high-intensity, and recovery intervals.
   - *Requirements:* High replicate density ($m > 1,000$ seconds/subject), clustered variance decomposition, evaluation of upper percentile errors ($P_{90}, P_{95}$) to detect motion artifact spikes.
   - *Recommended Toolkit:* Precision vs $n$ (Percentiles) $\rightarrow$ RMSE vs Percentiles Explainer.
   - *Primary Link:* `/precision`
3. **Clinical Non-Invasive Blood Pressure (NIBP)**
   - *Standard:* ISO 81060-2:2018 / 2019 & IEEE 1708
   - *Profile:* Auscultatory reference (dual-observer stethoscope) or invasive arterial line in normotensive, hypertensive, and hypotensive participants.
   - *Requirements:* $\ge 85$ participants, triplicate paired measurements, mean bias $\le \pm 5\text{ mmHg}$, SD $\le 8\text{ mmHg}$, arm circumference and age quotas.
   - *Recommended Toolkit:* Agreement Sizing (Equivalence test at $\delta = 5\text{ mmHg}$) $\rightarrow$ Demographics Planner.
   - *Primary Link:* `/agreement`
4. **Nocturnal Sleep Staging & Actigraphy**
   - *Standard:* Polysomnography (PSG) Gold Standard / CTA-2070
   - *Profile:* Overnight multi-channel sleep laboratory recordings comparing wearable photoplethysmography and accelerometry against certified sleep technologist scoring.
   - *Requirements:* 30-second epoch agreement, Cohen's kappa for sleep stages (Wake, Light, Deep, REM), Total Sleep Time (TST) and Sleep Onset Latency (SOL) limits of agreement.
   - *Recommended Toolkit:* Agreement vs ICC Explainer $\rightarrow$ Effect Size CIs $\rightarrow$ Timeline Forecasting.
   - *Primary Link:* `/timeline`

### 4.5 Expanded "Am I in the right place?" & "What an answer looks like"
- **"You are in the right place if you are asking":**
  Broaden the interactive question catalog to 8 items spanning clinical, biostatistical, engineering, and regulatory domains:
  1. *"How many participants do I need to prove clinical agreement?"* (`/agreement`)
  2. *"How tightly will a sample of $n=50$ or $n=100$ bound our limits of agreement?"* (`/precision`)
  3. *"How do I balance demographic quotas so rare segments don't stall enrollment?"* (`/demographics`)
  4. *"How long will IRB review, recruitment, and testing take at 90% confidence?"* (`/timeline`)
  5. *"How do I report Cohen's d confidence intervals honest to small sample sizes?"* (`/effect-size`)
  6. *"Why does our RMSE not match the error our users actually experience?"* (`/explainers/rmse-mae`)
  7. *"Is our high Intraclass Correlation (ICC) of 0.95 actually evidence of agreement?"* (`/explainers/agreement-vs-icc`)
  8. *"Where can I find normative population distributions for our baseline vitals?"* (`https://ross-wilkinson.github.io/health-data-distributions/`)
- **"What an answer looks like":**
  Elevate the showcase box from a single numeric example to a multi-dimensional study design summary:
  - *Sample Size & Precision:* *"With 64 participants, a validation study pins down mean bias to within ±0.20 SD and limits of agreement to within ±0.36 SD at 95% confidence (Carkeet 2015)."*
  - *Demographic Feasibility:* *"Enforcing a 10% minimum across 10 Monk skin tone categories requires capping any single group at 20 participants, preventing enrollment saturation."*
  - *Timeline Confidence:* *"A 4-phase trial with an expected 90-day timeline carries a 95th-percentile completion horizon of 132 days under realistic Gamma-distributed variance."*

### 4.6 Core Toolkit Directory & Explainer Previews
- Maintain the clean, accessible cards for all modules (`/agreement`, `/precision`, `/demographics`, `/timeline`, `/effect-size`).
- Maintain the educational explainer cards (`/explainers/rmse-mae`, `/explainers/agreement-vs-icc`).
- Preserve the "Why not G*Power" epilogue, with updated citations to Bland & Altman (1986, 1999, 2007), Carkeet (2015), and Zou (2013).

---

## 5. Technical Implementation Details & Type Definitions

### 5.1 Updates to `src/app/navigation.ts`
Add the following interfaces and constants to `src/app/navigation.ts` (or import from dedicated structures):

```typescript
export interface EcosystemLink {
  id: string;
  name: string;
  role: string;
  badge: string;
  url: string;
  isExternal: boolean;
  description: string;
  actionLabel: string;
}

export const ECOSYSTEM_LINKS: EcosystemLink[] = [
  {
    id: 'health-data-distributions',
    name: 'Health Data Distributions',
    role: 'Pre-Study Normative Baselines',
    badge: 'Population Norms',
    url: 'https://ross-wilkinson.github.io/health-data-distributions/',
    isExternal: true,
    description:
      'Empirical population distributions (NHANES, vitals, resting pulse, blood pressure, Monk skin tones). Lookup baseline spreads and demographic prevalence before sizing quotas.',
    actionLabel: 'Explore population distributions',
  },
  {
    id: 'validation-study-designer',
    name: 'Validation Study Designer',
    role: 'Interactive Study Sizing & Planning',
    badge: 'Design Portal',
    url: '/agreement',
    isExternal: false,
    description:
      'Browser-based calculators for Bland-Altman LoA precision, TOST equivalence bounds, capped demographic recruitment quotas, and Monte Carlo timeline risk modeling.',
    actionLabel: 'Design your protocol',
  },
  {
    id: 'agreekit',
    name: 'agreekit',
    role: 'Post-Collection Clustered Analysis',
    badge: 'Analysis Toolkit',
    url: 'https://github.com/ross-wilkinson/agreekit',
    isExternal: true,
    description:
      'Open-source Python analysis package for repeated-measures validation data. Decomposes within- and between-subject variance, eliminates pseudo-replication, and computes exact LoAs and Arms.',
    actionLabel: 'View analysis library',
  },
];

export interface StudyPathway {
  id: string;
  title: string;
  question: string;
  methodology: string;
  description: string;
  path: string;
  estimands: string[];
}

export const STUDY_PATHWAYS: StudyPathway[] = [
  {
    id: 'single-paired',
    title: 'Single-Sample Paired Agreement',
    question: 'How many participants for a single spot-check comparison?',
    methodology: 'Bland-Altman limits of agreement with exact Carkeet non-central t CIs',
    description:
      'Size a trial where each subject contributes one paired measurement (e.g., resting baseline device vs. reference). Pins down mean bias and limits of agreement.',
    path: '/agreement',
    estimands: ['Mean bias (d-bar)', '95% Limits of Agreement', 'Margin of Error'],
  },
  {
    id: 'repeated-measures',
    title: 'Paired Repeated Measures',
    question: 'How do I handle continuous sensor data or multiple tests per person?',
    methodology: 'Clustered variance decomposition & effective sample size (n_eff)',
    description:
      'When sensors sample continuously (e.g. continuous HR, pulse oximetry, sleep epochs), repeated readings cluster within subjects. Sizing is bounded by subject degrees of freedom.',
    path: '/precision',
    estimands: ['Between-subject variance (sigma_b)', 'Within-subject variance (sigma_w)', 'Effective n (n_eff)'],
  },
  {
    id: 'equivalence-tost',
    title: 'Equivalence & Non-Inferiority',
    question: 'How many participants to confirm accuracy within a clinical margin?',
    methodology: 'Two One-Sided Tests (TOST) against +/- delta thresholds',
    description:
      'Determine sample size to reject the hypothesis that the new device deviates from gold-standard reference by more than an acceptable clinical tolerance.',
    path: '/agreement',
    estimands: ['Equivalence margin (delta)', 'Type I error (alpha)', 'Statistical power (1 - beta)'],
  },
  {
    id: 'demographic-quotas',
    title: 'Demographic Stratification',
    question: 'How do I balance recruitment across skin tones, sexes, and ages?',
    methodology: 'Bounded demographic segment allocation with segment caps',
    description:
      'Satisfy FDA Diversity Action Plans and ISO standards without stalling recruitment. Enforces maximum segment caps so rare cohorts reach required thresholds.',
    path: '/demographics',
    estimands: ['Minimum segment target (n_min)', 'Maximum segment cap (n_max)', 'Strata feasibility'],
  },
  {
    id: 'timeline-forecasting',
    title: 'Timeline & Recruitment Risk',
    question: 'When will this study actually finish at 90% confidence?',
    methodology: 'Stochastic multi-phase Monte Carlo simulation',
    description:
      'Simulate ethics review, recruitment, screening failures, data collection, and analysis using heavy-tailed distributions rather than naive static averages.',
    path: '/timeline',
    estimands: ['50th percentile (P50)', '95th percentile (P95)', 'Completion date distribution'],
  },
];

export interface StudyPreset {
  id: string;
  name: string;
  standard: string;
  deviceType: string;
  summary: string;
  specs: string;
  primaryPath: string;
  tags: string[];
}

export const STUDY_PRESETS: StudyPreset[] = [
  {
    id: 'spo2-desat',
    name: 'Pulse Oximetry (SpO2) Desaturation',
    standard: 'ISO 80601-2-61 & FDA 510(k)',
    deviceType: 'Optical PPG Sensor / Pulse Oximeter',
    summary:
      'Controlled hypoxia study (70%–100% SaO2) with arterial co-oximetry blood gas reference.',
    specs: '>= 10 subjects, >= 200 data points, Monk Skin Tone Scale spread, Arms <= 3.0%',
    primaryPath: '/demographics',
    tags: ['Arms', 'Monk Skin Tone', 'ISO 80601-2-61'],
  },
  {
    id: 'continuous-hr',
    name: 'Continuous Exercise Heart Rate',
    standard: 'CTA-2065 & Sports Physiology',
    deviceType: 'Wrist/Arm Wearable PPG',
    summary:
      'Graded treadmill / cycle ergometer protocol evaluated against 12-lead ECG Holter.',
    specs: 'High replicate density (m > 1,000 s/subject), heavy-tailed error percentiles (P90, P95)',
    primaryPath: '/precision',
    tags: ['Repeated Measures', 'ECG Reference', 'P95 Error'],
  },
  {
    id: 'clinical-nibp',
    name: 'Clinical Blood Pressure (NIBP)',
    standard: 'ISO 81060-2 & IEEE 1708',
    deviceType: 'Cuff / Cuffless Wearable NIBP',
    summary:
      'Clinical investigation against dual-observer reference auscultation or arterial line.',
    specs: '>= 85 subjects, triplicate paired readings, bias <= 5 mmHg, SD <= 8 mmHg',
    primaryPath: '/agreement',
    tags: ['Equivalence', 'Triplicate Auscultation', 'ISO 81060-2'],
  },
  {
    id: 'sleep-staging',
    name: 'Nocturnal Sleep Staging',
    standard: 'Polysomnography (PSG) Gold Standard',
    deviceType: 'Wearable Actigraphy & PPG',
    summary:
      'Overnight laboratory polysomnography comparing 30-second epoch scoring (Wake/Light/Deep/REM).',
    specs: 'Epoch agreement, Cohen kappa, Total Sleep Time (TST) and Sleep Onset Latency (SOL) LoA',
    primaryPath: '/timeline',
    tags: ['Multi-Epoch', 'PSG Reference', 'Cohen kappa'],
  },
];
```

### 5.2 Accessibility & Styling Requirements
- **Theme Consistency:** Use strictly existing Tailwind tokens (`bg-plane`, `bg-surface`, `text-ink`, `text-ink-secondary`, `text-ink-muted`, `border-hairline`, `text-series-1`).
- **Contrast Ratios:** All primary text must exceed 4.5:1 contrast against surface/plane in both light and dark themes. The primary CTA button uses `bg-ink text-plane`, ensuring WCAG AA compliance across theme flips.
- **Heading Hierarchy:**
  - `h1`: Single main heading on the page ("Design Rigorous Human-Subject Validation Studies").
  - `h2`: Section headings ("The Validation Research Lifecycle", "Study Design Pathways", "Practical Study Presets", "You Are in the Right Place If You Are Asking", "What an Answer Looks Like", "Core Toolkit Modules", "Methodological Foundations", "Why Validation Differs from Classical Power Analysis").
  - `h3`: Card titles and pathway headers.
- **External Links:** All external links must carry `target="_blank"`, `rel="noreferrer"` (or `rel="noopener noreferrer"`), and an accessible SVG indicator or screen-reader text (`<span className="sr-only">(opens in a new tab)</span>`).
- **Interactive Focus Rings:** All links, buttons, and summary elements must utilize `:focus-visible` styling with `outline: 2px solid var(--color-series-1)` as established in `src/index.css`.

---

## 6. Acceptance Checks & Verification Criteria

The implementation must pass the following strict, numbered criteria:

### Automated Test Suite Checks
1. **Passes Existing Unit Tests:**
   Execute `npm test`. All 208+ existing unit tests across `src/stats/`, `src/modules/`, and `src/app/` must pass without modification of statistical baselines.
2. **HomePage Component Tests (`src/pages/HomePage.test.tsx`):**
   A dedicated test file must be created and verified:
   - Verifies the primary heading (`h1`) renders with text matching `/design rigorous human-subject validation studies/i`.
   - Verifies all three ecosystem cards render (`Health Data Distributions`, `Validation Study Designer`, `agreekit`).
   - Asserts that external ecosystem links have `href="https://ross-wilkinson.github.io/health-data-distributions/"` and `href="https://github.com/ross-wilkinson/agreekit"`, with `target="_blank"` and `rel` containing `noreferrer`.
   - Asserts that all 5 study pathways (`STUDY_PATHWAYS`) render with their titles and deep links to internal routes.
   - Asserts that all 4 study presets (`STUDY_PRESETS`) render with their standard badges (`ISO 80601-2-61`, `CTA-2065`, `ISO 81060-2`, `PSG`) and respective links.
   - Asserts that all core modules from `MODULE_ROUTES` and explainers from `EXPLAINER_ROUTES` render.
3. **App Integration Regression Check (`src/app/App.test.tsx`):**
   Update line 10-12 in `src/app/App.test.tsx` to match the new `h1` heading or verify that the primary heading query resolves cleanly.
4. **Build & Typecheck:**
   Execute `npm run build`. TypeScript compilation (`tsc -b`) and Vite production bundle must succeed with exit code `0`.

### Manual & Accessibility Verification
5. **Color Contrast & Theme Switch:**
   Toggle theme between system, light, and dark. Verify all text, badges, borders, and buttons remain legible and maintain high contrast.
6. **Keyboard Navigation:**
   Tab through all interactive elements on the home page. Ensure focus outlines (`outline: 2px solid var(--color-series-1)`) are clearly visible on every link, card, and button.
7. **HashRouter Compatibility:**
   All internal links must navigate within the HashRouter (`#/agreement`, `#/precision`, `#/demographics`, `#/timeline`, `#/effect-size`, `#/explainers/*`) without triggering full browser page reloads or 404 errors.

---

## 7. "Do Not Touch" Guardrails

To preserve biostatistical integrity and project architecture, the following boundaries are strictly enforced:

1. **`src/stats/*` is Immutable:**
   Under no circumstances should any statistical distribution, root-finding routine, or fixture in `src/stats/` be edited.
2. **`src/modules/*` are Protected:**
   Individual module calculation logic (`precisionModel.ts`, `agreementModel.ts`, `demographicsModel.ts`, `timelineModel.ts`, `effectSizeModel.ts`) and page views must remain intact.
3. **`src/app/study/*` Shared Plan State is Protected:**
   The `StudyContext`, `Study` interface, and persistence storage mechanisms must not be altered.
4. **No CSS Token Re-definitions:**
   Do not introduce unvetted custom hex codes or bypass Tailwind theme variables in `src/index.css`. All styling must draw from established tokens (`plane`, `surface`, `ink`, `ink-secondary`, `ink-muted`, `hairline`, `series-1` through `series-8`).
5. **No Full-Page Rerouting / BrowserRouter Shims:**
   The app must strictly remain on `HashRouter` to maintain zero-config GitHub Pages static hosting.

---

## 8. Summary of Scientific & Regulatory References

1. **Bland, J. M., & Altman, D. G. (1986).** Statistical methods for assessing agreement between two methods of clinical measurement. *The Lancet*, 327(8476), 307–310.
2. **Bland, J. M., & Altman, D. G. (1999).** Measuring agreement in method comparison studies. *Statistical Methods in Medical Research*, 8(2), 135–160.
3. **Bland, J. M., & Altman, D. G. (2007).** Agreement between methods of measurement with multiple observations per individual. *Journal of Biopharmaceutical Statistics*, 17(4), 571–582.
4. **Carkeet, A. (2015).** Exact limits of agreement confidence intervals. *Optometry and Vision Science*, 92(3), e71–e80.
5. **Zou, G. Y. (2013).** Confidence interval estimation for the Intraclass Correlation Coefficient and Limits of Agreement with repeated measures. *Statistical Methods in Medical Research*, 22(6), 630–642.
6. **Greenwood, J. A. (1974).** A fast machine for computing the variance of sample percentiles. *Journal of the Royal Statistical Society: Series C (Applied Statistics)*.
7. **ISO 80601-2-61:2019.** Medical electrical equipment — Part 2-61: Particular requirements for basic safety and essential performance of pulse oximeter equipment. International Organization for Standardization.
8. **ISO 81060-2:2018.** Non-invasive sphygmomanometers — Part 2: Clinical investigation of intermittent automated measurement type. International Organization for Standardization.
9. **U.S. Food and Drug Administration (2013).** *Pulse Oximeters - Premarket Notification Submissions [510(k)]: Guidance for Industry and Food and Drug Administration Staff*.
10. **U.S. Food and Drug Administration (2024).** *Diversity Action Plans to Improve Enrollment of Participants from Underrepresented Populations in Clinical Studies: Guidance for Industry*.
