import type { JSX } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export type PrimerTopicKey =
  | 'censoring'
  | 'variance-function'
  | 'detectability'
  | 'ecdf-kpis'
  | 'head-to-head'
  | 'time-series';

interface PrimerSection {
  heading: string;
  body: string;
  bullets?: string[];
  formula?: {
    expression: string;
    explanation: string;
  };
}

interface PrimerVignette {
  key: PrimerTopicKey;
  badge: string;
  shortTitle: string;
  title: string;
  executiveQuestion: string;
  thirtySecondGuide: string[];
  sections: PrimerSection[];
  pitfallCallout: {
    title: string;
    body: string;
  };
  citation: string;
}

const PRIMERS: PrimerVignette[] = [
  {
    key: 'censoring',
    badge: 'Primer 1 · Tab 1',
    shortTitle: 'Completeness & Floor Clipping',
    title: 'Detection Completeness & Left-Censoring Bias Near Physical Boundaries',
    executiveQuestion:
      '“Are we silently dropping faint targets—and when noisy estimates hit the zero boundary, does clamping them distort our accuracy metrics?”',
    thirtySecondGuide: [
      'In the Left Chart (Detection Yield), look at where the curve bends downward: a pipeline that drops below 90% completeness at faint brightness is achieving artificially clean error numbers simply by failing to report difficult targets.',
      'In the Right Chart (Floor Clipping), look at what happens near true redshift z = 0.05: when measurement noise pushes an estimate below zero and the software clamps it to 0.00, it creates a sharp diagonal boundary in the scatter plot.',
      'Switch between the 4 Censoring Regimes to see Sadler’s (2019) counterintuitive proof: deleting clipped rows (“Exclude Either Clipped”) does NOT fix the upward bias hook or the artificially depressed standard deviation.',
    ],
    sections: [
      {
        heading: '1. Why Completeness Must Be Audited Before Accuracy',
        body: 'An algorithm can trivially achieve low measurement error if it refuses to output a prediction whenever signal-to-noise is low. Plotting detection completeness (percentage of true reference targets with a valid measurement) across brightness ensures that error metrics are evaluated alongside data yield.',
      },
      {
        heading: '2. How Unequal Uncertainties + Floor Clamping Create Spurious Bias (Sadler 2019)',
        body: 'When a noisy pipeline (standard deviation σ_Y) is compared against a precise reference standard (σ_X ≪ σ_Y) near a physical floor (such as redshift z ≥ 0 or an assay Limit of Detection), two geometric effects combine:',
        bullets: [
          'Uncensored cloud (Sadler Fig. 2a): When plotted against the pair mean (X + Y)/2, unequal precision tilts the scatter cloud into a forward-leaning parallelogram, but the bin-average bias remains flat at zero.',
          'Clamped at floor, all data retained (Sadler Fig. 2b): Negative noise excursions are clipped to the floor, forming a sharp diagonal V-boundary. Because negative errors are truncated while positive errors remain intact, the mean bias hooks sharply upward and the observed standard deviation is artificially depressed (Sadler Figs. 1 & 3).',
          'Excluding pairs where both or either value is clipped (Sadler Figs. 2c & 2d): Removing clipped rows deletes the bottom tail of the distribution while leaving the upper tail intact—so the spurious positive bias and underestimated standard deviation persist almost unchanged.',
        ],
        formula: {
          expression: 'U_hazard = Floor + 2.5 × √f(Floor)',
          explanation:
            'Sadler (2019) demonstrates that floor-clipping bias extends up to 2.5 standard deviations above the boundary. Either pipelines must output uncensored signed values, or parametric agreement fits must exclude the full 2.5×SD hazard zone.',
        },
      },
    ],
    pitfallCallout: {
      title: 'Common Stakeholder Trap: “Just filter out the zero-clipped rows!”',
      body: 'In both wearable physiology and astronomy, analysts frequently discard rows that hit a sensor floor or ceiling. Sadler (2019) proved mathematically that discarding clipped rows truncates one side of a Gaussian noise cloud, preserving the exact same positive bias hook while making standard deviation look deceptively small.',
    },
    citation:
      'Sadler WA. Methods comparison biases due to differing uncertainties and data censoring. Annals of Clinical Biochemistry. 2019;56(2):198–203.',
  },
  {
    key: 'variance-function',
    badge: 'Primer 2 · Tab 2',
    shortTitle: 'Curved Bland–Altman (Sadler 2018)',
    title: 'Generalizing Bland–Altman Limits of Agreement with Variance Functions',
    executiveQuestion:
      '“When measurement scatter grows wider at fainter brightness or higher intensity, what are the true 95% error bounds at any specific operating point?”',
    thirtySecondGuide: [
      'Traditional flat horizontal Limits of Agreement (Bias ± 1.96 × SD) assume noise is constant everywhere. When noise grows across the range, flat lines are far too wide at the low end and dangerously narrow at the high end.',
      'A variance function f(U) models how error variance grows smoothly across the measurement range U, producing curved “trumpet” 95% Limits of Agreement with shaded 95% confidence corridors.',
      'Use the Scale Toggle to switch between Original Units (flaring trumpet), Relative Percentage Scale (downward-curving imprecision profile), and Variance-Normalized Space (flat horizontal band confirming the model fit). Use the Low-End Blow-Up Zoom (Sadler Fig. 4) to inspect behavior near the floor without full-range compression.',
    ],
    sections: [
      {
        heading: '1. Three-Stage Variance Normalization (Sadler 2018 Fig. 2a → 2c → Fig. 3)',
        body: 'Rather than guessing a log or percentage transformation (which fails whenever baseline noise is non-zero near the bottom of the scale), Sadler (2018) fits a smooth variance function f(U) = (β₁ + β₂·U)^J directly to the squared residuals:',
        bullets: [
          'Stage 1 — Normalize to constant variance: Divide each residual d_i = Y_i − X_i by √f(U_i) to obtain dimensionless standardized residuals z_i = d_i / √f(U_i).',
          'Stage 2 — Verify homoscedasticity: Run the Breusch–Pagan constant-variance check on z_i. A p-value > 0.05 confirms that the trumpet flare has been completely accounted for.',
          'Stage 3 — Back-transform to curved Limits of Agreement: Multiply the normalized bias B and 95% bounds (B ± 1.96 × s_z) by √f(U) to plot curved Limits of Agreement on the original scale (Fig. 3a) or by 100·√f(U)/(1+U) on the relative scale (Fig. 3b).',
        ],
        formula: {
          expression: 'LoA(U) = (B ± 1.96 · s_z) · √f(U)',
          explanation:
            'At any operating level U, 95% of differences lie inside the curved envelope, and delta-method error propagation yields the shaded 95% confidence corridors around both the bias and the outer limits.',
        },
      },
      {
        heading: '2. Why Plotting Against the Pair Mean (X + Y)/2 Induces a False Slope',
        body: 'Bland & Altman (1986) recommended plotting Y − X against the pair mean (X + Y)/2 when both instruments have comparable noise. However, when calibrating a noisy sensor/pipeline Y against a high-precision reference X (where σ_Y² ≫ σ_X²), the covariance Cov(Y − X, (X + Y)/2) = (σ_Y² − σ_X²)/2 is strictly positive—creating an upward regression slope even when the pipeline is 100% unbiased! Plotting against the true reference X eliminates this artifact.',
      },
    ],
    pitfallCallout: {
      title: 'Why Full-Range Plots Require a “Low-End Blow-Up” Toggle (Sadler Fig. 4)',
      body: 'When measurement noise spans an order of magnitude across the dynamic range, a full-scale original-units plot compresses the low end into a thin ribbon. Toggling to the Low-End Blow-Up Zoom (or the Relative Percentage view) lets stakeholders inspect low-end calibration accuracy clearly.',
    },
    citation:
      'Sadler WA. Using the variance function to generalize Bland–Altman analysis. Annals of Clinical Biochemistry. 2018;55(2):198–207.',
  },
  {
    key: 'detectability',
    badge: 'Primer 3 · Tab 2',
    shortTitle: 'Minimum Detectable Change (ISO 11843)',
    title: 'Smallest Real Change Reliably Detected Above Noise (ISO 11843-1)',
    executiveQuestion:
      '“Given our measurement noise at a baseline level z₀, how large does a real physical shift need to be before we can reliably distinguish it from random noise?”',
    thirtySecondGuide: [
      'Look at the Left Diagram (ISO 11843-1 Figure 1 Geometry): it plots Measured Output Shift (vertical axis) against True Physical Shift (horizontal axis) around your chosen baseline slider position.',
      'The Left Bell Curve (at True Shift = 0) shows random baseline noise. To keep the False Alarm Rate at α = 5%, we set a Critical Decision Threshold (x_C) at the 95th percentile of baseline noise.',
      'The Right Bell Curve (at True Shift = x_D) shows the noisy measurements when a real shift of size x_D occurs. For the Missed Detection Rate to stay at β = 5% (95% detection power), the entire lower 95% of this second bell curve must clear the threshold—defining the Minimum Detectable Change (x_D).',
    ],
    sections: [
      {
        heading: '1. Two Thresholds Answering Two Different Stakeholder Questions',
        body: 'ISO 11843-1 defines capability of detection using two linked quantities on the true physical scale:',
        bullets: [
          'Critical Decision Limit (x_C — False Alarm Guard): The smallest observed shift above baseline that exceeds random baseline noise with 95% confidence (α = 0.05). If you observe a shift smaller than x_C, you cannot claim any real change occurred.',
          'Minimum Detectable Change (x_D — 95% Detection Guarantee): The smallest true physical shift that is guaranteed to trigger a detection above x_C at least 95% of the time (β = 0.05).',
        ],
        formula: {
          expression: 'x_D = x_C + (z_{1-β} / β₁) · √f(z₀ + x_D)',
          explanation:
            'Because noise √f(U) grows larger as the true state increases from z₀ to z₀ + x_D, the upper bell curve is wider than the baseline bell curve—stretching x_D to more than twice x_C.',
        },
      },
    ],
    pitfallCallout: {
      title: 'Why x_D Is Always More Than Twice the Decision Limit x_C Under Heteroscedastic Noise',
      body: 'Under constant noise, x_D = 2 × x_C (for α = β = 0.05). When noise increases with signal level, the shifted distribution at z₀ + x_D has a wider standard deviation than the baseline distribution at z₀, inflating x_D by an additional heteroscedastic penalty factor.',
    },
    citation:
      'ISO 11843-1:1997. Capability of detection — Part 1: Terms and definitions.',
  },
  {
    key: 'ecdf-kpis',
    badge: 'Primer 4 · KPI Summary & Tab 3',
    shortTitle: '6-Row KPI Matrix & ECDFs',
    title: 'Pooled vs. Target-Level Error Distributions & The 6-Row KPI Scorecard',
    executiveQuestion:
      '“Does our algorithm work consistently across every target in the cohort, or does a good pooled average hide targets where the algorithm fails repeatedly?”',
    thirtySecondGuide: [
      'An Empirical Cumulative Distribution Function (ECDF) plots the percentage of data (vertical axis, 0% to 100%) whose absolute error falls at or below any given threshold (horizontal axis). A steeper curve shifted to the left means smaller errors.',
      'Follow the two horizontal dashed lines at 50% (Typical performance / Median) and 95% (Edge-Case performance) across to where they intersect the three curves.',
      'The 6-Row KPI Table reads out the 95% Confidence Interval Upper Bound at those exact intersections—evaluating Pooled observations alongside Typical Targets (50th percentile subject) and Edge-Case Targets (95th percentile subject).',
    ],
    sections: [
      {
        heading: '1. Why Pooled Error Alone Is Dangerous in Repeated-Measures Studies',
        body: 'When a study collects 40 exposures across 60 targets (2,400 total observations), pooling all 2,400 errors into a single curve blends within-target random noise with persistent between-target failures. If 5% of targets fail on every single exposure (for example, due to dusty active galactic nuclei or dark-skin optical cadence lock), the pooled median barely moves—yet 1 in 20 users/targets experiences a broken product.',
      },
      {
        heading: '2. Anatomy of the 6-Row Validation KPI Matrix',
        body: 'By summarizing each target’s 40 exposures into two numbers—that target’s Typical Error (Median, P50) and that target’s Edge-Case Error (95th percentile, P95)—we construct a complete 6-row safety matrix gated on the 95% confidence interval upper bound:',
        bullets: [
          'Rows 1 & 2 (Pooled Typical & Pooled Edge-Case): Overall P50 and P95 across all 2,400 observations.',
          'Row 3 (Typical Error for Typical Target — P50 of Target P50s): What a median target experiences on a typical exposure.',
          'Row 4 (Typical Error for Edge-Case Target — P95 of Target P50s): Isolates persistent outlier targets whose everyday median error is unacceptably high.',
          'Row 5 (Edge-Case Error for Typical Target — P50 of Target P95s): What a typical target experiences during their worst 5% of exposures (e.g., transient atmospheric flare).',
          'Row 6 (Edge-Case Error for Edge-Case Target — P95 of Target P95s): The worst-case corner combining difficult targets with transient stress.',
        ],
      },
    ],
    pitfallCallout: {
      title: 'Why We Gate on the Upper Bound of the 95% Confidence Interval',
      body: 'Passing a requirement based on a point estimate alone rewards small, underpowered sample sizes. Requiring the upper bound of the 95% cluster-bootstrap confidence interval to fall below the standard guarantees 95% statistical assurance before launch.',
    },
    citation:
      'Cluster-bootstrap quantile estimation across repeated-measures cohorts (agreekit validation standard).',
  },
  {
    key: 'head-to-head',
    badge: 'Primer 5 · Head-to-Head View',
    shortTitle: 'Head-to-Head & Cliff’s Delta',
    title: 'Head-to-Head Algorithm Comparison & Paired Cliff’s Delta Dominance',
    executiveQuestion:
      '“When evaluated on the exact same observations, how often does Pipeline B beat Pipeline A by a meaningful margin—and is that advantage consistent across targets?”',
    thirtySecondGuide: [
      'Comparing two pipelines requires dedicated Head-to-Head visualizations rather than stacking two single-pipeline Bland–Altman plots on top of each other.',
      'First, define a Practical Tie Margin (τ = ±0.005): if Pipeline A and Pipeline B differ by less than 0.005 on an exposure, that exposure is a practical tie.',
      'Paired Cliff’s Delta = (% Pipeline B Wins − % Pipeline A Wins). A value within ±33% indicates practical equivalence; exceeding +33% proves strong superiority.',
    ],
    sections: [
      {
        heading: '1. Why Head-to-Head Needs Its Own Visual Design',
        body: 'In a three-way validation study (Reference vs. Pipeline A vs. Pipeline B), the stakeholder questions for Head-to-Head are fundamentally different from single-pipeline reference calibration. Instead of asking “Does Pipeline A meet the absolute specification?”, Head-to-Head asks “Where, when, and by how much does Pipeline B reduce error relative to Pipeline A on paired observations?”',
      },
      {
        heading: '2. Pooled vs. Per-Target Paired Cliff’s Delta',
        body: 'For every paired observation (i, t), we compute the absolute error reduction Δ|e| = |e_A| − |e_B|:',
        bullets: [
          'Pipeline B Win: |e_B| < |e_A| − τ (Pipeline B is closer to truth by more than the tie margin).',
          'Practical Tie: ||e_A| − |e_B|| ≤ τ (Both pipelines perform equivalently within noise).',
          'Pipeline A Win: |e_A| < |e_B| − τ (Pipeline A is closer to truth by more than the tie margin).',
          'Per-Target Boxplot & Jitter: Computing Cliff’s Delta separately for each of the 60 targets verifies that the headline win rate is driven by broad improvement across almost every target (53 of 60 targets won by B) rather than a few extreme outliers.',
        ],
        formula: {
          expression: 'Cliff’s Delta (%) = (Wins − Losses) / Total Pairs × 100',
          explanation:
            'Ranges from −100% (Pipeline A wins every pair) to +100% (Pipeline B wins every pair), non-parametrically bounded and immune to single-exposure outlier explosions.',
        },
      },
    ],
    pitfallCallout: {
      title: 'Always Compare Absolute Errors |e_A| vs. |e_B|, Never Signed Errors',
      body: 'If Pipeline A has wide symmetric errors (−0.10 and +0.10) and Pipeline B has tight symmetric errors (−0.01 and +0.01), their signed errors have the same median (0.00), making paired dominance on signed residuals meaningless. Paired dominance must always compare closeness to truth (|e|).',
    },
    citation:
      'Cliff N. Dominance statistics: Ordinal analyses to answer ordinal questions. Psychological Bulletin. 1993;114(3):494–509.',
  },
  {
    key: 'time-series',
    badge: 'Primer 6 · Tab 4',
    shortTitle: 'Error Over Time & Carpet Plot',
    title: 'Decomposing Time-Locked Environmental Stress vs. Persistent Outlier Targets',
    executiveQuestion:
      '“Are our worst errors happening at a specific time across all targets (like an initial thermal/perfusion warm-up flare), or on specific targets across all times?”',
    thirtySecondGuide: [
      'Plotting 60 overlapping time-series lines creates an unreadable “spaghetti plot.” Instead, Tab 4 uses a 3-layer drill-down architecture.',
      'Layer 1 (Top — Quantile Fan Ribbon) shows the cohort median (P50), interquartile range (P25–P75), and 5th–95th percentile envelope over the 60-minute tracking window alongside the environmental stress curve (Atmospheric Airmass).',
      'Layer 2 (Middle — 60 × 40 Carpet Heatmap) sorts all 60 targets from worst (top) to best (bottom). Vertical color bands reveal time-locked environmental flares (minutes 0–12); horizontal stripes isolate persistent outlier targets. Click any row to inspect its exact trace in Layer 3.',
    ],
    sections: [
      {
        heading: '1. Why Time-Series Diagnostics Are Critical in Validation Reports',
        body: 'Aggregate Bland–Altman plots and ECDFs collapse the time dimension. In both wearable sensors (e.g., optical heart-rate errors during the first 10 minutes of a cold-morning run before peripheral vasodilation occurs) and astronomical surveys (e.g., thermal mirror settling and high airmass immediately after dome/eclipse opening), errors are strongly non-stationary over time.',
      },
      {
        heading: '2. Reading the Target × Time Carpet Heatmap (“Lasagna Plot”)',
        body: 'By sorting rows by each target’s median error (or Head-to-Head advantage), two orthogonal failure modes separate visually:',
        bullets: [
          'Vertical Bands (Time-Locked Environmental Stress): During minutes 0–12, high airmass (X = 2.00 → 1.35) and post-eclipse mirror thermal gradients inflate scatter across all 60 rows simultaneously.',
          'Horizontal Stripes (Persistent Target Failure): Three dusty Active Galactic Nuclei (AGN) targets exhibit severe color degeneracy across all 40 exposures under Pipeline A, appearing as unbroken dark horizontal stripes at the top of the carpet.',
        ],
      },
    ],
    pitfallCallout: {
      title: 'Why Replacing Spaghetti Plots with a 3-Layer Hierarchy Scales to Any Cohort Size',
      body: 'Whether a validation study has 30 participants or 500 calibration targets, the Quantile Fan Ribbon + Sorted Carpet Heatmap + Single-Target Inspector preserves both population trends and individual-epoch accountability without visual overplotting.',
    },
    citation:
      'Swihart BJ et al. Lasagna plots: A saucy alternative to spaghetti plots. Epidemiology. 2010;21(5):621–625.',
  },
];

export default function AstroPrimersPage(): JSX.Element {
  const { topic } = useParams<{ topic?: string }>();
  const navigate = useNavigate();

  const activePrimer =
    PRIMERS.find((p) => p.key === topic) ?? PRIMERS[0]!;

  return (
    <div>
      {/* Top Breadcrumb & Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <Link to="/academy" className="hover:text-ink underline underline-offset-4">
            Validation Academy
          </Link>
          <span>/</span>
          <Link to="/academy/astro-calval" className="hover:text-ink underline underline-offset-4">
            Astronomy Cal/Val Report
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink">Methodological Primers</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/academy/astro-calval/study-protocol"
            className="rounded-md border border-hairline bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
          >
            Study Protocol &amp; Cross-Domain Guide →
          </Link>
          <Link
            to="/academy/astro-calval"
            className="rounded-md bg-ink px-3.5 py-1.5 text-xs font-semibold text-surface hover:opacity-90"
          >
            ← Return to Validation Report
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Stakeholder Vignettes · How to Read the Metrics &amp; Charts
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Methodological Primers for the Validation Report
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-secondary leading-relaxed">
          A metric or chart is only as useful as it is understood by the decision-makers reading it.
          These six concise vignettes explain the intuition, visual anatomy, and statistical math
          behind every analysis in the Photometric Redshift Algorithm Validation Report—keeping the
          main report clean and executive-ready.
        </p>
      </header>

      {/* Topic Selector Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-hairline pb-4">
        {PRIMERS.map((p) => {
          const isActive = p.key === activePrimer.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => navigate(`/academy/astro-calval/primers/${p.key}`)}
              className={`rounded-lg px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-ink text-surface font-semibold shadow-sm'
                  : 'border border-hairline bg-surface-subtle/60 text-ink-secondary hover:text-ink hover:bg-surface'
              }`}
            >
              <div className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-surface/80' : 'text-ink-muted'}`}>
                {p.badge}
              </div>
              <div className="mt-0.5">{p.shortTitle}</div>
            </button>
          );
        })}
      </div>

      {/* Active Primer Content Card */}
      <article className="rounded-xl border border-hairline bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {activePrimer.badge}
          </span>
          <span className="text-xs text-ink-muted">{activePrimer.citation}</span>
        </div>

        <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          {activePrimer.title}
        </h2>

        {/* The Stakeholder Question */}
        <div className="mt-5 rounded-lg border-l-4 border-accent bg-surface-subtle/60 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-accent">
            The Stakeholder Question This Answers
          </div>
          <p className="mt-1 text-sm font-medium italic text-ink">
            {activePrimer.executiveQuestion}
          </p>
        </div>

        {/* 30-Second Visual Reading Guide */}
        <div className="mt-6 rounded-lg border border-hairline bg-surface-subtle/30 p-5">
          <h3 className="text-sm font-semibold text-ink">
            How to Read This Visualization in 30 Seconds
          </h3>
          <ol className="mt-3 space-y-2.5 text-xs text-ink-secondary leading-relaxed list-decimal list-inside">
            {activePrimer.thirtySecondGuide.map((step, idx) => (
              <li key={idx} className="pl-1">
                <span className="text-ink">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Detailed Sections */}
        <div className="mt-7 space-y-6">
          {activePrimer.sections.map((sec) => (
            <div key={sec.heading}>
              <h3 className="text-base font-semibold text-ink">{sec.heading}</h3>
              <p className="mt-2 text-sm text-ink-secondary leading-relaxed">{sec.body}</p>
              {sec.bullets && (
                <ul className="mt-3 space-y-2 pl-5 list-disc text-xs text-ink-secondary leading-relaxed">
                  {sec.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
              {sec.formula && (
                <div className="mt-4 rounded-lg border border-hairline bg-surface-subtle/50 p-4">
                  <div className="font-mono text-sm font-semibold text-ink">
                    {sec.formula.expression}
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary">{sec.formula.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Common Trap / Pitfall Callout */}
        <div className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Key Methodological Insight
          </div>
          <h4 className="mt-1 text-sm font-semibold text-ink">{activePrimer.pitfallCallout.title}</h4>
          <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
            {activePrimer.pitfallCallout.body}
          </p>
        </div>

        {/* Prev / Next Primer Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
          {(() => {
            const idx = PRIMERS.findIndex((p) => p.key === activePrimer.key);
            const prev = idx > 0 ? PRIMERS[idx - 1] : null;
            const next = idx < PRIMERS.length - 1 ? PRIMERS[idx + 1] : null;
            return (
              <>
                <div>
                  {prev && (
                    <button
                      type="button"
                      onClick={() => navigate(`/academy/astro-calval/primers/${prev.key}`)}
                      className="rounded-md border border-hairline bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface cursor-pointer"
                    >
                      ← Previous: {prev.shortTitle}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {next && (
                    <button
                      type="button"
                      onClick={() => navigate(`/academy/astro-calval/primers/${next.key}`)}
                      className="rounded-md border border-hairline bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface cursor-pointer"
                    >
                      Next: {next.shortTitle} →
                    </button>
                  )}
                  <Link
                    to="/academy/astro-calval"
                    className="rounded-md bg-ink px-3.5 py-1.5 text-xs font-semibold text-surface hover:opacity-90"
                  >
                    Return to Validation Report
                  </Link>
                </div>
              </>
            );
          })()}
        </div>
      </article>
    </div>
  );
}
