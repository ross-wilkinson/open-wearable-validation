import type { JSX } from 'react';
import { Link } from 'react-router-dom';

interface TranslationRow {
  concept: string;
  wearable: string;
  astro: string;
  whyItMatters: string;
}

const TRANSLATION_ROWS: TranslationRow[] = [
  {
    concept: 'Reference Standard (Ground Truth)',
    wearable: '12-Lead Holter Electrocardiogram (ECG) or Overnight Polysomnography (PSG)',
    astro: 'DESI Multi-Fiber Spectroscopic Redshift (z_spec, uncertainty σ ≈ 0.0001)',
    whyItMatters:
      'High-cost, high-precision reference instrument with negligible measurement noise relative to the sensor or pipeline under test.',
  },
  {
    concept: 'Device / Pipeline Under Test',
    wearable: 'Wrist-worn Photoplethysmography (PPG) optical heart-rate algorithms (Legacy vs. Next-Gen)',
    astro: '6-band (u, g, r, i, z, y) Photometric Redshift pipelines (Template Fitting vs. Deep Learning)',
    whyItMatters:
      'Scalable, wide-deployment measurement system inferring a continuous physical quantity from noisy broadband optical signals.',
  },
  {
    concept: 'Signal-to-Noise & Heteroscedastic Scatter',
    wearable: 'High-intensity motion artifacts & low peripheral blood perfusion widen error bounds at high heart rate',
    astro: 'Faint apparent brightness (r > 24 mag) & cosmological (1 + z) wavelength stretching widen error envelopes at high redshift',
    whyItMatters:
      'Constant horizontal Limits of Agreement fail in both domains; variance functions f(U) are required to model curved "trumpet" error bounds.',
  },
  {
    concept: 'Boundary Clipping & Censoring Bias',
    wearable: 'Physiological floor/ceiling clamping (e.g., Apnea–Hypopnea Index ≥ 0 or SpO2 ≤ 100%)',
    astro: 'Physical redshift floor clamping (z_phot ≥ 0) when photon shot noise pushes faint low-redshift estimates negative',
    whyItMatters:
      'Clamping noisy measurements at a boundary creates diagonal V-boundaries, artificially depresses standard deviation, and induces spurious positive bias near the floor.',
  },
  {
    concept: 'Catastrophic Outliers & Robust Spread',
    wearable: 'Optical cadence lock (PPG locking onto step frequency ~170 spm instead of true heart rate)',
    astro: 'Lyman–Balmer spectral break confusion (4000 Å rest-frame break misidentified as 912 Å Lyman break, causing |Δz| > 1.0)',
    whyItMatters:
      'A small fraction (2–10%) of multimodal failures inflates parametric standard deviation by 2–4×, requiring Median Absolute Deviation (NMAD) alongside parametric bounds.',
  },
  {
    concept: 'Clustered Repeated Measures',
    wearable: 'Multiple 1-minute epochs per human participant across a treadmill or sleep protocol',
    astro: 'Multiple telescope visits (exposures) of the same galaxy across different nights and atmospheric conditions',
    whyItMatters:
      'Treating repeated visits as independent observations underestimates confidence interval width; cluster bootstrap and Intraclass Correlation (ICC) yield honest effective sample sizes.',
  },
  {
    concept: 'Time-Locked Environmental Stress vs. Persistent Outliers',
    wearable: 'Cold-morning peripheral vasoconstriction flare during minutes 0–12 of an outdoor run vs. persistent subject fit issues',
    astro: 'Post-eclipse dome-opening thermal mirror gradient & high atmospheric airmass during minutes 0–12 vs. persistent dusty Active Galactic Nuclei (AGN)',
    whyItMatters:
      'A 2D Target × Time heatmap ("Lasagna plot") cleanly separates vertical bands (time-locked environmental flares) from horizontal stripes (persistent outlier targets).',
  },
];

const GLOSSARY_ITEMS = [
  {
    term: 'Normalized Redshift Error — Δz / (1 + z_spec)',
    definition:
      'Because cosmic expansion stretches all observed wavelengths by a factor of (1 + z), raw redshift errors (z_phot − z_spec) naturally scale with (1 + z). Dividing by (1 + z_spec) expresses error as a dimensionless fractional wavelength error.',
  },
  {
    term: 'Science Requirement — LSST Science Requirements Document (SRD)',
    definition:
      'The formal accuracy standard for the Vera C. Rubin Observatory Legacy Survey of Space and Time (LSST): population mean bias must remain within ±0.003, robust scatter (σ_NMAD) below 0.05 (implying median absolute error ≤ 0.0337 and 95th percentile absolute error ≤ 0.0980 under Gaussian scaling), and catastrophic outlier rate below 10%.',
  },
  {
    term: 'Normalized Median Absolute Deviation (σ_NMAD)',
    definition:
      'Defined as 1.4826 × median(|e − median(e)|), where e = Δz / (1 + z_spec). The factor 1.4826 scales the median absolute deviation so that σ_NMAD equals the standard deviation for a pure Gaussian distribution while remaining insensitive to catastrophic outliers.',
  },
  {
    term: 'Catastrophic Outlier Rate (f_out)',
    definition:
      'The percentage of galaxy observations whose normalized redshift error exceeds |Δz| / (1 + z_spec) > 0.150, typically caused by misidentifying the Balmer/4000 Å spectral break as the Lyman break.',
  },
  {
    term: 'Two One-Sided Tests (TOST) for Equivalence',
    definition:
      'A formal statistical test proving that systematic mean bias lies strictly inside the required equivalence margin (−0.003 to +0.003) at the 95% confidence level, rather than merely failing to reject zero bias.',
  },
  {
    term: 'Breusch–Pagan Constant-Variance Check',
    definition:
      'A chi-squared test (df = 1) that regresses squared residuals against the measurement scale U to test whether scatter is constant (homoscedastic, p > 0.05) or varies systematically with magnitude/redshift (heteroscedastic, p < 0.05).',
  },
  {
    term: 'Intraclass Correlation Coefficient (ICC) & Effective Sample Size (n_eff)',
    definition:
      'ICC measures the fraction of total error variance attributable to persistent between-galaxy differences rather than exposure-to-exposure photon noise. Higher ICC reduces the effective number of independent observations n_eff below the raw exposure count.',
  },
];

export default function AstroStudyProtocolPage(): JSX.Element {
  return (
    <div>
      {/* Top Breadcrumb & Back Navigation */}
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
          <span className="font-semibold text-ink">Study Protocol &amp; Cross-Domain Guide</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/academy/astro-calval/primers"
            className="rounded-md border border-hairline bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
          >
            Browse Methodological Primers (5) →
          </Link>
          <Link
            to="/academy/astro-calval"
            className="rounded-md bg-ink px-3.5 py-1.5 text-xs font-semibold text-surface hover:opacity-90"
          >
            ← Return to Validation Report
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Study Protocol · Background &amp; Cross-Domain Architecture
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          What Is This Study? — Rubin Commissioning Photo-z Benchmark
        </h1>
        <p className="mt-3 max-w-3xl text-base text-ink-secondary leading-relaxed">
          Before reviewing an algorithm validation report, stakeholders need to know how the data
          were collected, what physical instruments are being compared, and why specific pass/fail
          thresholds govern the release decision. This page documents the study design, physical
          measurement pipeline, and cross-domain mapping behind the Photometric Redshift Algorithm
          Validation Report.
        </p>
      </header>

      {/* Section 1: The Physical Pipeline */}
      <section className="mb-10 rounded-xl border border-hairline bg-surface p-6">
        <h2 className="font-display text-xl font-semibold text-ink">
          1. The Physical Measurement Pipeline: From Galaxy Light to Redshift Estimate
        </h2>
        <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
          The Vera C. Rubin Observatory’s Legacy Survey of Space and Time (LSST) will image billions
          of galaxies across the Southern sky. Obtaining a full high-resolution spectrum for every
          galaxy is physically impossible; instead, pipelines must infer each galaxy’s cosmological
          redshift (<span className="font-mono text-ink">z_phot</span>) from six broadband color
          filters. Every observation passes through four physical stages:
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-hairline bg-surface-subtle/50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-accent">
              Step 1 · Intrinsic Emission
            </div>
            <h3 className="mt-1 text-sm font-semibold text-ink">
              Rest-Frame Spectral Energy Distribution
            </h3>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              Every galaxy or transient emits a continuous spectrum of light across wavelengths,
              shaped by its stellar populations, active galactic nucleus (AGN) accretion, and host-galaxy
              dust attenuation.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-subtle/50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-accent">
              Step 2 · Cosmic Expansion
            </div>
            <h3 className="mt-1 text-sm font-semibold text-ink">
              Redshift Stretching (1 + z) &amp; Milky Way Dust
            </h3>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              As photons travel across expanding space, their wavelengths stretch by{' '}
              <span className="font-mono">1 + z</span> and arrival rates dilate in time, shifting
              key spectral landmarks (like the 4000 Å Balmer break) into redder wavelengths.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-subtle/50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-accent">
              Step 3 · Broadband Filters
            </div>
            <h3 className="mt-1 text-sm font-semibold text-ink">
              Six-Band Passband Integration (u, g, r, i, z, y)
            </h3>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              The survey camera rotates six broad colored glass filters in front of the CCD sensor,
              integrating the arriving spectrum into six coarse brightness measurements rather than a
              continuous spectrum.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-subtle/50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-accent">
              Step 4 · Detector &amp; Sky Noise
            </div>
            <h3 className="mt-1 text-sm font-semibold text-ink">
              Cadence, Atmospheric Blur &amp; Shot Noise
            </h3>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              Each exposure adds sky background glow, atmospheric turbulence (seeing), Poisson photon
              shot noise, and sensor read noise. At faint magnitudes (<span className="font-mono">r &gt; 24</span>),
              low signal-to-noise causes severe heteroscedastic error growth.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Study Design & Two-Stage Protocol */}
      <section className="mb-10 rounded-xl border border-hairline bg-surface p-6">
        <h2 className="font-display text-xl font-semibold text-ink">
          2. Study Design &amp; Three-Way Validation Architecture
        </h2>
        <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
          Following the three-way comparative validation paradigm used in clinical and consumer
          sensor benchmarks, this study evaluates two candidate photometric redshift algorithms
          against a spectroscopic ground-truth reference across two complementary commissioning
          protocols:
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="rounded-lg border border-hairline bg-surface-subtle/40 p-4">
            <span className="inline-block rounded bg-ink/10 px-2 py-0.5 text-[11px] font-semibold text-ink">
              Reference Standard
            </span>
            <h3 className="mt-2 text-base font-semibold text-ink">
              DESI Spectroscopic Cross-Match (z_spec)
            </h3>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              High-resolution multi-fiber spectroscopy from the Dark Energy Spectroscopic Instrument
              (DESI) provides ground-truth redshifts across <span className="font-mono">0.05 ≤ z_spec ≤ 2.80</span>{' '}
              with negligible uncertainty (<span className="font-mono">σ_z ≈ 10⁻⁴</span>), serving the
              same role as a 12-lead Holter ECG or overnight polysomnography in wearable studies.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-subtle/40 p-4">
            <span
              className="inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: 'var(--color-series-2)' }}
            >
              Pipeline A · Baseline Production
            </span>
            <h3 className="mt-2 text-base font-semibold text-ink">
              Legacy Template Fitting (BPZ-v2.4)
            </h3>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              Fits observed 6-band fluxes against a fixed library of 8 rest-frame spectral templates
              and clamps negative point estimates at the physical boundary{' '}
              <span className="font-mono">z_phot = 0.00</span>. Vulnerable to faint-end drop-out,
              low-redshift floor-clipping bias, and 6.5% catastrophic Lyman–Balmer break confusion.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-subtle/40 p-4">
            <span
              className="inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: 'var(--color-series-1)' }}
            >
              Pipeline B · Candidate Release
            </span>
            <h3 className="mt-2 text-base font-semibold text-ink">
              Deep Learning Hybrid (PhotoZ-Net-v3.1)
            </h3>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              Combines multi-band pixel morphology with neural density estimation to resolve color
              degeneracies and outputs uncensored signed calibration residuals near zero. Reduces
              catastrophic outliers to 2.0%, eliminates systematic redshift drift, and recovers faint
              sources down to <span className="font-mono">r = 25.3 mag</span>.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-hairline p-4">
            <h4 className="text-sm font-semibold text-ink">
              Protocol Stage A · Wide-Field Survey Catalog (1,500 Galaxies × 3–5 Visits = 6,000 Observations)
            </h4>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              Samples the full commissioning footprint across apparent magnitude{' '}
              <span className="font-mono">r ∈ [18.0, 25.5] mag</span> and spectroscopic redshift{' '}
              <span className="font-mono">z_spec ∈ [0.05, 2.80]</span> with 3 to 5 repeated visits per
              galaxy. Powers <strong>Tab 1 (Detection Yield &amp; Floor Clipping)</strong> and{' '}
              <strong>Tab 2 (Correlation, Heteroscedastic Agreement &amp; Minimum Detectable Change)</strong>.
            </p>
          </div>

          <div className="rounded-lg border border-hairline p-4">
            <h4 className="text-sm font-semibold text-ink">
              Protocol Stage B · Continuous Tracking Stress Panel (60 Targets × 40 Epochs = 2,400 Observations)
            </h4>
            <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
              Tracks 60 representative calibration galaxies across 40 consecutive 90-second exposures
              (<span className="font-mono">60 minutes</span>) immediately following a post-eclipse
              dome opening as atmospheric airmass improves from{' '}
              <span className="font-mono">X = 2.00 → 1.06</span> and mirror thermal gradients
              stabilize. Powers the <strong>6-Row Pooled vs. Per-Target KPI Summary</strong>,{' '}
              <strong>Tab 3 (Cumulative Error Distributions)</strong>, and{' '}
              <strong>Tab 4 (Error Over Time)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Cross-Domain Translation Matrix (Moved from Report Footer) */}
      <section className="mb-10 rounded-xl border border-hairline bg-surface p-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            Why This Case Study Exists
          </p>
          <h2 className="mt-0.5 font-display text-xl font-semibold text-ink">
            3. Cross-Domain Translation Matrix: Same Math, Different Photons
          </h2>
          <p className="mt-1.5 text-sm text-ink-secondary">
            Whether photons bounce off subcutaneous capillaries in a wrist-worn heart-rate sensor or
            travel ten billion light-years from a high-redshift galaxy to a telescope CCD, the
            statistical machinery required to validate noisy measurements against a high-precision
            reference is identical.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-hairline bg-surface-subtle/60 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
                <th className="py-3 pr-4 pl-3">Validation Concept</th>
                <th className="py-3 px-4">Biomedical Wearable Benchmark (PPG vs. ECG / PSG)</th>
                <th className="py-3 px-4">Astronomical Survey Benchmark (Rubin Photo-z vs. DESI Spec-z)</th>
                <th className="py-3 pl-4 pr-3">Shared Statistical &amp; Physical Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {TRANSLATION_ROWS.map((row) => (
                <tr key={row.concept} className="align-top hover:bg-surface-subtle/30">
                  <td className="py-3 pr-4 pl-3 font-semibold text-ink">{row.concept}</td>
                  <td className="py-3 px-4 text-ink-secondary">{row.wearable}</td>
                  <td className="py-3 px-4 text-ink-secondary">{row.astro}</td>
                  <td className="py-3 pl-4 pr-3 text-ink-secondary">{row.whyItMatters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Plain-English Glossary */}
      <section className="mb-10 rounded-xl border border-hairline bg-surface p-6">
        <h2 className="font-display text-xl font-semibold text-ink">
          4. Plain-English Glossary of Metrics &amp; Standards
        </h2>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Reference definitions for all domain metrics, statistical tests, and pass/fail thresholds
          used in the validation report.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {GLOSSARY_ITEMS.map((item) => (
            <div key={item.term} className="rounded-lg border border-hairline bg-surface-subtle/30 p-4">
              <h3 className="text-sm font-semibold text-ink">{item.term}</h3>
              <p className="mt-1 text-xs text-ink-secondary leading-relaxed">{item.definition}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-surface-subtle/50 p-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">Ready to explore the results or deep-dive into the methods?</h3>
          <p className="text-xs text-ink-secondary">
            Return to the interactive 3-way validation report or read the 5 visual primers explaining each chart type.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/academy/astro-calval/primers"
            className="rounded-md border border-hairline bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-surface-subtle"
          >
            Read Methodological Primers →
          </Link>
          <Link
            to="/academy/astro-calval"
            className="rounded-md bg-ink px-4 py-2 text-xs font-semibold text-surface hover:opacity-90"
          >
            Open Validation Report →
          </Link>
        </div>
      </div>
    </div>
  );
}
