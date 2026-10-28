import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { OpenWearableValidationLogo } from '../components/brand/OpenWearableValidationLogo.tsx';
import { AgreekitLogo } from '../components/brand/AgreekitLogo.tsx';

function StudyDesignGraphic() {
  const uid = useId().replace(/:/g, '');
  const areaGradId = `sd-area-${uid}`;

  return (
    <svg
      viewBox="0 0 320 130"
      className="w-full h-32 sm:h-36 select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--color-series-1)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--color-series-1)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      <line x1="35" y1="20" x2="215" y2="20" stroke="var(--color-hairline)" strokeDasharray="3 3" />
      <line x1="35" y1="65" x2="215" y2="65" stroke="var(--color-hairline)" strokeDasharray="3 3" />
      <line x1="35" y1="110" x2="215" y2="110" stroke="var(--color-hairline)" />
      <line x1="35" y1="15" x2="35" y2="110" stroke="var(--color-hairline)" />

      {/* Precision Band (Uncertainty envelope around curve) */}
      <path
        d="M 45 28 C 85 45, 125 72, 205 92 L 205 106 C 125 92, 85 68, 45 52 Z"
        fill={`url(#${areaGradId})`}
      />

      {/* Precision Curve (1 / sqrt(N)) */}
      <path
        d="M 45 40 C 85 56, 125 80, 205 99"
        fill="none"
        stroke="var(--color-series-1)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Optimal Sample Size Anchor Point (N*=42) */}
      <line
        x1="125"
        y1="22"
        x2="125"
        y2="110"
        stroke="var(--color-series-4)"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
      <circle
        cx="125"
        cy="80"
        r="4.5"
        fill="var(--color-series-4)"
        stroke="var(--color-surface)"
        strokeWidth="1.5"
      />

      {/* Target Marker Pill */}
      <rect
        x="105"
        y="16"
        width="40"
        height="15"
        rx="3"
        fill="var(--color-surface)"
        stroke="var(--color-series-4)"
        strokeWidth="1"
      />
      <text
        x="125"
        y="27"
        fill="var(--color-series-4)"
        fontSize="8.5"
        fontWeight="bold"
        textAnchor="middle"
      >
        N* = 42
      </text>

      {/* Axis Labels */}
      <text x="45" y="121" fill="var(--color-ink-muted)" fontSize="8" textAnchor="middle">
        N=15
      </text>
      <text x="125" y="121" fill="var(--color-ink-muted)" fontSize="8" textAnchor="middle">
        N=42
      </text>
      <text x="205" y="121" fill="var(--color-ink-muted)" fontSize="8" textAnchor="middle">
        N=100
      </text>
      <text x="30" y="24" fill="var(--color-ink-muted)" fontSize="7.5" textAnchor="end">
        ±CI
      </text>

      {/* Caliper Section (Right Side) */}
      {/* Upper LoA */}
      <line
        x1="245"
        y1="28"
        x2="275"
        y2="28"
        stroke="var(--color-series-2)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="280" y="31" fill="var(--color-series-2)" fontSize="8.5" fontWeight="bold">
        +1.96 SD
      </text>

      {/* Caliper Bracket Spine */}
      <path
        d="M 242 28 L 235 28 L 235 62 L 230 65 L 235 68 L 235 102 L 242 102"
        fill="none"
        stroke="var(--color-series-1)"
        strokeWidth="1.5"
      />
      <text
        x="226"
        y="68"
        fill="var(--color-series-1)"
        fontSize="8"
        fontWeight="bold"
        textAnchor="end"
      >
        LoA
      </text>

      {/* Mean Bias Line */}
      <line
        x1="242"
        y1="65"
        x2="265"
        y2="65"
        stroke="var(--color-ink-secondary)"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <text x="270" y="68" fill="var(--color-ink-muted)" fontSize="8">
        Bias
      </text>

      {/* Lower LoA */}
      <line
        x1="245"
        y1="102"
        x2="275"
        y2="102"
        stroke="var(--color-series-2)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="280" y="105" fill="var(--color-series-2)" fontSize="8.5" fontWeight="bold">
        -1.96 SD
      </text>
    </svg>
  );
}

function ProductGatesGraphic() {
  const uid = useId().replace(/:/g, '');
  const ellipseGradId = `pg-ellipse-${uid}`;

  return (
    <svg
      viewBox="0 0 320 130"
      className="w-full h-32 sm:h-36 select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={ellipseGradId} cx="50%" cy="50%" r="50%">
          <stop stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* Quadrant Background Fills */}
      <rect x="155" y="12" width="105" height="52" rx="4" fill="#10b981" fillOpacity="0.12" />
      <rect x="50" y="12" width="105" height="52" rx="4" fill="#f59e0b" fillOpacity="0.08" />
      <rect x="50" y="64" width="105" height="52" rx="4" fill="#ef4444" fillOpacity="0.08" />
      <rect x="155" y="64" width="105" height="52" rx="4" fill="#f59e0b" fillOpacity="0.08" />

      {/* Quadrant Labels */}
      <text x="252" y="24" fill="#10b981" fontSize="7.5" fontWeight="bold" textAnchor="end">
        Q I • GREEN LIGHT
      </text>
      <text x="58" y="24" fill="#f59e0b" fontSize="7" fontWeight="600">
        Q II • PARITY RISK
      </text>
      <text x="58" y="110" fill="#ef4444" fontSize="7" fontWeight="600">
        Q III • REJECT
      </text>
      <text x="252" y="110" fill="#f59e0b" fontSize="7" fontWeight="600" textAnchor="end">
        Q IV • QUALITY DEBT
      </text>

      {/* Subtle Grid / Threshold Lines */}
      <line x1="40" y1="64" x2="265" y2="64" stroke="var(--color-ink-secondary)" strokeWidth="1.2" />
      <line x1="155" y1="12" x2="155" y2="116" stroke="var(--color-ink-secondary)" strokeWidth="1.2" />

      {/* Axis Arrows / Labels */}
      <text x="268" y="66.5" fill="var(--color-ink-secondary)" fontSize="7.5" fontWeight="bold">
        Gate 1 →
      </text>
      <text
        x="155"
        y="10"
        fill="var(--color-ink-secondary)"
        fontSize="7.5"
        fontWeight="bold"
        textAnchor="middle"
      >
        Gate 2 ↑
      </text>

      {/* Bivariate 95% Confidence Ellipse in Q1 */}
      <ellipse
        cx="200"
        cy="38"
        rx="26"
        ry="14"
        transform="rotate(-15 200 38)"
        fill={`url(#${ellipseGradId})`}
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />

      {/* Candidate Center Point */}
      <circle cx="200" cy="38" r="4" fill="#10b981" stroke="var(--color-surface)" strokeWidth="1.5" />
      <rect
        x="175"
        y="47"
        width="50"
        height="13"
        rx="2"
        fill="var(--color-surface)"
        stroke="#10b981"
        strokeWidth="0.75"
      />
      <text x="200" y="56" fill="#10b981" fontSize="7" fontWeight="bold" textAnchor="middle">
        Candidate V2.4
      </text>

      {/* Predecessor Anchor at (0, 0) */}
      <circle
        cx="155"
        cy="64"
        r="3.5"
        fill="var(--color-ink-muted)"
        stroke="var(--color-surface)"
        strokeWidth="1.5"
      />
      <text x="148" y="75" fill="var(--color-ink-muted)" fontSize="7" textAnchor="end">
        Predecessor V1
      </text>
    </svg>
  );
}

function PitfallsGraphic() {
  return (
    <svg
      viewBox="0 0 320 130"
      className="w-full h-32 sm:h-36 select-none"
      aria-hidden="true"
    >
      {/* Left Panel: N=5 Noise Trap */}
      <rect
        x="18"
        y="10"
        width="130"
        height="110"
        rx="6"
        fill="var(--color-surface)"
        stroke="var(--color-hairline)"
      />
      <rect x="26" y="16" width="114" height="16" rx="3" fill="#ef4444" fillOpacity="0.12" />
      <text x="83" y="27" fill="#ef4444" fontSize="7.5" fontWeight="bold" textAnchor="middle">
        N=5 NOISE TRAP (p &lt; 0.05)
      </text>

      {/* Spurious Trendline and Scatter */}
      <line
        x1="35"
        y1="90"
        x2="130"
        y2="45"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <circle cx="40" cy="85" r="3" fill="#ef4444" />
      <circle cx="62" cy="78" r="3" fill="#ef4444" />
      <circle cx="82" cy="68" r="3" fill="#ef4444" />
      <circle cx="108" cy="48" r="3" fill="#ef4444" />
      <circle cx="128" cy="52" r="3" fill="#ef4444" />

      {/* Trap Outcome Note */}
      <text x="83" y="102" fill="#ef4444" fontSize="7" fontWeight="600" textAnchor="middle">
        Winner&apos;s Curse Fallacy
      </text>
      <text x="83" y="112" fill="var(--color-ink-muted)" fontSize="6.5" textAnchor="middle">
        Difference test hides 8 bpm bias
      </text>

      {/* Divider */}
      <line
        x1="160"
        y1="20"
        x2="160"
        y2="110"
        stroke="var(--color-hairline)"
        strokeDasharray="2 2"
      />
      <circle
        cx="160"
        cy="65"
        r="8"
        fill="var(--color-surface)"
        stroke="var(--color-hairline)"
      />
      <text
        x="160"
        y="68"
        fill="var(--color-ink-muted)"
        fontSize="7.5"
        fontWeight="bold"
        textAnchor="middle"
      >
        vs
      </text>

      {/* Right Panel: True Agreement Corridor */}
      <rect
        x="172"
        y="10"
        width="130"
        height="110"
        rx="6"
        fill="var(--color-surface)"
        stroke="var(--color-hairline)"
      />
      <rect x="180" y="16" width="114" height="16" rx="3" fill="#10b981" fillOpacity="0.12" />
      <text x="237" y="27" fill="#10b981" fontSize="7.5" fontWeight="bold" textAnchor="middle">
        TRUE AGREEMENT (LoA)
      </text>

      {/* Agreement Corridor */}
      <rect x="182" y="42" width="110" height="48" fill="#10b981" fillOpacity="0.08" />
      <line x1="182" y1="42" x2="292" y2="42" stroke="#10b981" strokeWidth="1.2" />
      <line
        x1="182"
        y1="66"
        x2="292"
        y2="66"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      <line x1="182" y1="90" x2="292" y2="90" stroke="#10b981" strokeWidth="1.2" />

      {/* Paired clustered points */}
      <circle cx="198" cy="63" r="2.5" fill="#10b981" />
      <circle cx="215" cy="58" r="2.5" fill="#10b981" />
      <circle cx="232" cy="72" r="2.5" fill="#10b981" />
      <circle cx="250" cy="61" r="2.5" fill="#10b981" />
      <circle cx="268" cy="69" r="2.5" fill="#10b981" />
      <circle cx="282" cy="65" r="2.5" fill="#10b981" />

      {/* Agreement Outcome Note */}
      <text x="237" y="102" fill="#10b981" fontSize="7" fontWeight="600" textAnchor="middle">
        Repeated Measures ANOVA
      </text>
      <text x="237" y="112" fill="var(--color-ink-muted)" fontSize="6.5" textAnchor="middle">
        Exact ±1.96 SD limits
      </text>
    </svg>
  );
}

function AcademyGraphic() {
  const uid = useId().replace(/:/g, '');
  const podRingGradId = `ac-pod-${uid}`;
  const greenGlowId = `ac-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 320 130"
      className="w-full h-32 sm:h-36 select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={podRingGradId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0284c7" />
          <stop offset="0.5" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <filter id={greenGlowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Top Banner Tag */}
      <rect
        x="60"
        y="4"
        width="200"
        height="15"
        rx="3"
        fill="var(--color-series-1)"
        fillOpacity="0.1"
      />
      <text
        x="160"
        y="15"
        fill="var(--color-series-1)"
        fontSize="7.5"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="0.04em"
      >
        FICTIONAL PRODUCT CASE STUDY
      </text>

      {/* Orbit Rings (representing 4 development phases) */}
      <ellipse
        cx="160"
        cy="70"
        rx="110"
        ry="42"
        fill="none"
        stroke="var(--color-hairline)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <ellipse
        cx="160"
        cy="70"
        rx="80"
        ry="32"
        fill="none"
        stroke="var(--color-series-1)"
        strokeWidth="1"
        strokeDasharray="4 3"
        strokeOpacity="0.4"
      />
      <ellipse
        cx="160"
        cy="70"
        rx="52"
        ry="22"
        fill="none"
        stroke="var(--color-series-3)"
        strokeWidth="1"
        strokeDasharray="3 2"
        strokeOpacity="0.5"
      />

      {/* 8 Milestone Node Badges on Orbits */}
      <circle cx="50" cy="70" r="7" fill="var(--color-surface)" stroke="var(--color-series-1)" strokeWidth="1.5" />
      <text x="50" y="73" fill="var(--color-ink)" fontSize="7" fontWeight="bold" textAnchor="middle">1</text>

      <circle cx="80" cy="43" r="7" fill="var(--color-surface)" stroke="var(--color-series-1)" strokeWidth="1.5" />
      <text x="80" y="46" fill="var(--color-ink)" fontSize="7" fontWeight="bold" textAnchor="middle">2</text>

      <circle cx="108" cy="52" r="7" fill="var(--color-surface)" stroke="var(--color-series-3)" strokeWidth="1.5" />
      <text x="108" y="55" fill="var(--color-ink)" fontSize="7" fontWeight="bold" textAnchor="middle">3</text>

      <circle cx="160" cy="28" r="7" fill="var(--color-surface)" stroke="var(--color-series-3)" strokeWidth="1.5" />
      <text x="160" y="31" fill="var(--color-ink)" fontSize="7" fontWeight="bold" textAnchor="middle">4</text>

      <circle cx="212" cy="52" r="7" fill="var(--color-surface)" stroke="var(--color-series-4)" strokeWidth="1.5" />
      <text x="212" y="55" fill="var(--color-ink)" fontSize="7" fontWeight="bold" textAnchor="middle">5</text>

      <circle cx="240" cy="43" r="7" fill="var(--color-surface)" stroke="var(--color-series-4)" strokeWidth="1.5" />
      <text x="240" y="46" fill="var(--color-ink)" fontSize="7" fontWeight="bold" textAnchor="middle">6</text>

      <circle cx="270" cy="70" r="7" fill="var(--color-surface)" stroke="#10b981" strokeWidth="1.5" />
      <text x="270" y="73" fill="var(--color-ink)" fontSize="7" fontWeight="bold" textAnchor="middle">7</text>

      <circle cx="212" cy="88" r="7" fill="var(--color-surface)" stroke="#10b981" strokeWidth="1.5" />
      <text x="212" y="91" fill="var(--color-ink)" fontSize="7" fontWeight="bold" textAnchor="middle">8</text>

      {/* Center Biosensor Pod (Meridian PulseBand 2) */}
      <rect
        x="135"
        y="50"
        width="50"
        height="40"
        rx="10"
        fill="#090d16"
        stroke={`url(#${podRingGradId})`}
        strokeWidth="1.5"
      />

      {/* Optical LEDs */}
      <circle cx="147" cy="65" r="3" fill="#22c55e" filter={`url(#${greenGlowId})`} />
      <circle cx="160" cy="65" r="3" fill="#ef4444" />
      <circle cx="173" cy="65" r="3" fill="#a855f7" />

      {/* Photodiode Window */}
      <rect
        x="146"
        y="74"
        width="28"
        height="5"
        rx="1.5"
        fill="#1e293b"
        stroke="#38bdf8"
        strokeWidth="0.5"
      />

      {/* Subtitle Label */}
      <text
        x="160"
        y="122"
        fill="var(--color-ink-muted)"
        fontSize="8"
        fontWeight="600"
        textAnchor="middle"
      >
        Meridian PulseBand 2 • 8 Interactive Modules
      </text>
    </svg>
  );
}

function PythonGraphic() {
  return (
    <div
      className="w-full h-32 sm:h-36 flex flex-col items-center justify-center gap-2.5 px-3 py-1 select-none"
      aria-hidden="true"
    >
      <AgreekitLogo size={46} showText subtitle="PYTHON SUITE" />
      <div className="flex items-center gap-2 rounded-md border border-hairline bg-surface px-2.5 py-1 font-mono text-[11px] text-ink-secondary shadow-2xs">
        <span className="font-bold text-series-7 select-none">$</span>
        <span>pip install agreekit</span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-ink-muted">
        <span>Bland-Altman</span>
        <span>•</span>
        <span>Bootstrap CI</span>
        <span>•</span>
        <span>Non-Inferiority</span>
      </div>
    </div>
  );
}

function PopulationDataGraphic() {
  const uid = useId().replace(/:/g, '');
  const popGrad1Id = `pop-g1-${uid}`;
  const popGrad2Id = `pop-g2-${uid}`;

  return (
    <svg
      viewBox="0 0 320 130"
      className="w-full h-32 sm:h-36 select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={popGrad1Id} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--color-series-5)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--color-series-5)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={popGrad2Id} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--color-series-1)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--color-series-1)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Axis & Reference Grid */}
      <line x1="30" y1="105" x2="290" y2="105" stroke="var(--color-hairline)" strokeWidth="1" />
      <line x1="30" y1="25" x2="30" y2="105" stroke="var(--color-hairline)" strokeDasharray="2 2" />

      {/* Cohort 1 Distribution Curve (Rose/Magenta, Reference Cohort) */}
      <path
        d="M 50 105 C 90 105, 115 32, 145 32 C 175 32, 200 105, 240 105 Z"
        fill={`url(#${popGrad1Id})`}
      />
      <path
        d="M 50 105 C 90 105, 115 32, 145 32 C 175 32, 200 105, 240 105"
        fill="none"
        stroke="var(--color-series-5)"
        strokeWidth="2"
      />

      {/* Cohort 2 Distribution Curve (Blue, Comparison Cohort) */}
      <path
        d="M 85 105 C 125 105, 155 45, 185 45 C 215 45, 245 105, 285 105 Z"
        fill={`url(#${popGrad2Id})`}
      />
      <path
        d="M 85 105 C 125 105, 155 45, 185 45 C 215 45, 245 105, 285 105"
        fill="none"
        stroke="var(--color-series-1)"
        strokeWidth="2"
      />

      {/* Quantile Markers */}
      {/* P5 Line */}
      <line
        x1="85"
        y1="55"
        x2="85"
        y2="105"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <text x="85" y="50" fill="var(--color-ink-muted)" fontSize="7.5" textAnchor="middle">
        P5
      </text>

      {/* Median Line */}
      <line
        x1="165"
        y1="22"
        x2="165"
        y2="105"
        stroke="var(--color-series-5)"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      <rect
        x="145"
        y="12"
        width="40"
        height="13"
        rx="2"
        fill="var(--color-surface)"
        stroke="var(--color-series-5)"
        strokeWidth="0.75"
      />
      <text
        x="165"
        y="21"
        fill="var(--color-series-5)"
        fontSize="7.5"
        fontWeight="bold"
        textAnchor="middle"
      >
        Median
      </text>

      {/* P95 Line */}
      <line
        x1="245"
        y1="55"
        x2="245"
        y2="105"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <text x="245" y="50" fill="var(--color-ink-muted)" fontSize="7.5" textAnchor="middle">
        P95
      </text>

      {/* X-Axis Ticks & Units */}
      <text x="50" y="117" fill="var(--color-ink-muted)" fontSize="7.5">
        50 bpm
      </text>
      <text x="120" y="117" fill="var(--color-ink-muted)" fontSize="7.5" textAnchor="middle">
        65 bpm
      </text>
      <text x="185" y="117" fill="var(--color-ink-muted)" fontSize="7.5" textAnchor="middle">
        80 bpm
      </text>
      <text x="260" y="117" fill="var(--color-ink-muted)" fontSize="7.5" textAnchor="end">
        95 bpm
      </text>

      {/* Header Tag */}
      <text
        x="285"
        y="18"
        fill="var(--color-ink-muted)"
        fontSize="7.5"
        fontWeight="600"
        textAnchor="end"
      >
        CDC NHANES • SCIN REFERENCE
      </text>
    </svg>
  );
}

function ReferenceCatalogGraphic() {
  return (
    <svg viewBox="0 0 320 130" className="w-full h-32 sm:h-36 select-none" aria-hidden="true">
      {/* Background container */}
      <rect x="10" y="8" width="300" height="114" rx="8" fill="var(--color-surface)" stroke="var(--color-hairline)" />

      {/* Tier 1: Gold */}
      <g transform="translate(24, 20)">
        <rect x="0" y="0" width="84" height="66" rx="6" fill="#f59e0b" fillOpacity="0.08" stroke="#f59e0b" strokeWidth="1" />
        <rect x="6" y="6" width="38" height="12" rx="3" fill="#f59e0b" fillOpacity="0.18" />
        <text x="25" y="15" fill="#d97706" fontSize="6.5" fontWeight="bold" textAnchor="middle">GOLD</text>
        <text x="10" y="32" fill="var(--color-ink)" fontSize="7.5" fontWeight="bold">Clinical True</text>
        <text x="10" y="44" fill="var(--color-ink-muted)" fontSize="6.5">CO-Ox / Holter</text>
        <text x="10" y="56" fill="#d97706" fontSize="6.5" fontWeight="bold">σ_ref ≈ 0</text>
      </g>

      {/* Tier 2: Silver */}
      <g transform="translate(118, 20)">
        <rect x="0" y="0" width="84" height="66" rx="6" fill="#0284c7" fillOpacity="0.08" stroke="#0284c7" strokeWidth="1" />
        <rect x="6" y="6" width="42" height="12" rx="3" fill="#0284c7" fillOpacity="0.18" />
        <text x="27" y="15" fill="#0284c7" fontSize="6.5" fontWeight="bold" textAnchor="middle">SILVER</text>
        <text x="10" y="32" fill="var(--color-ink)" fontSize="7.5" fontWeight="bold">Research Bench</text>
        <text x="10" y="44" fill="var(--color-ink-muted)" fontSize="6.5">Masimo / Faros</text>
        <text x="10" y="56" fill="#0284c7" fontSize="6.5" fontWeight="bold">+25% n penalty</text>
      </g>

      {/* Tier 3: Bronze */}
      <g transform="translate(212, 20)">
        <rect x="0" y="0" width="84" height="66" rx="6" fill="#ea580c" fillOpacity="0.08" stroke="#ea580c" strokeWidth="1" />
        <rect x="6" y="6" width="46" height="12" rx="3" fill="#ea580c" fillOpacity="0.18" />
        <text x="29" y="15" fill="#ea580c" fontSize="6.5" fontWeight="bold" textAnchor="middle">BRONZE</text>
        <text x="10" y="32" fill="var(--color-ink)" fontSize="7.5" fontWeight="bold">Consumer Head</text>
        <text x="10" y="44" fill="var(--color-ink-muted)" fontSize="6.5">Wrist Optical PPG</text>
        <text x="10" y="56" fill="#ea580c" fontSize="6.5" fontWeight="bold">+120% n penalty</text>
      </g>

      {/* Footer annotation bar */}
      <rect x="24" y="94" width="272" height="20" rx="4" fill="var(--color-plane)" stroke="var(--color-hairline)" />
      <text x="160" y="107" fill="var(--color-ink)" fontSize="6.8" fontWeight="600" textAnchor="middle">
        FDA 510(k) Predicates • 10-Dimension Dossiers • Hardware Sync Triggers
      </text>
    </svg>
  );
}

interface AcademyWorkspaceTile {
  id: string;
  workspaceName: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  destination: string;
  actionLabel: string;
  badgeClass: string;
  hoverTitleClass: string;
  actionColorClass: string;
  focusRingClass: string;
  Visual: () => React.ReactNode;
}

const ACADEMY_WORKSPACES: AcademyWorkspaceTile[] = [
  {
    id: 'learning-studio',
    workspaceName: 'Learning Studio',
    eyebrow: 'LEARNING STUDIO',
    title: 'Learn wearable validation hands-on',
    subtitle:
      'Step into the shoes of a lead validation scientist developing the fictional Meridian PulseBand 2. Work through 8 interactive modules spanning the full product journey—from early prototyping and product launch to investigating post-launch issues and tracking multi-year device iterations.',
    destination: '/academy',
    actionLabel: 'Enter Learning Studio',
    badgeClass: 'bg-series-3/10 text-series-3 border border-series-3/20',
    hoverTitleClass: 'group-hover:text-series-3',
    actionColorClass: 'text-series-3',
    focusRingClass: 'focus-visible:ring-series-3',
    Visual: AcademyGraphic,
  },
  {
    id: 'protocol-studio',
    workspaceName: 'Protocol Studio',
    eyebrow: 'PROTOCOL STUDIO',
    title: 'Design your validation study',
    subtitle:
      'Sizing a study too small risks inconclusive results, while sizing it too large wastes time and budget. Design protocols for internal product KPIs, predecessor comparisons, or regulatory submissions that properly account for measurement agreement, repeated measures, and demographic quotas before enrolling participants.',
    destination: '/protocol-studio',
    actionLabel: 'Enter Protocol Studio',
    badgeClass: 'bg-series-1/10 text-series-1 border border-series-1/20',
    hoverTitleClass: 'group-hover:text-series-1',
    actionColorClass: 'text-series-1',
    focusRingClass: 'focus-visible:ring-series-1',
    Visual: StudyDesignGraphic,
  },
  {
    id: 'report-studio',
    workspaceName: 'Report Studio',
    eyebrow: 'REPORT STUDIO',
    title: 'Evaluate product launch readiness',
    subtitle:
      'Discover the right metrics and KPI frameworks to evaluate wearable performance, and synthesize your results into clear decision scorecards that your stakeholders can all understand and trust.',
    destination: '/report-studio/overview',
    actionLabel: 'Enter Report Studio',
    badgeClass: 'bg-series-2/10 text-series-2 border border-series-2/20',
    hoverTitleClass: 'group-hover:text-series-2',
    actionColorClass: 'text-series-2',
    focusRingClass: 'focus-visible:ring-series-2',
    Visual: ProductGatesGraphic,
  },
  {
    id: 'pitfall-explorer',
    workspaceName: 'Pitfall Explorer',
    eyebrow: 'PITFALL EXPLORER',
    title: 'Avoid costly statistical pitfalls',
    subtitle:
      'Standard statistical software was built to detect differences between groups rather than evaluate agreement, while generic AI assistants frequently fall into common statistical traps. Discover why standard methods fail when applied to paired wearable sensors, repeated measures, and rapid prototyping screens.',
    destination: '/explainers',
    actionLabel: 'Enter Pitfall Explorer',
    badgeClass: 'bg-series-4/10 text-series-4 border border-series-4/20',
    hoverTitleClass: 'group-hover:text-series-4',
    actionColorClass: 'text-series-4',
    focusRingClass: 'focus-visible:ring-series-4',
    Visual: PitfallsGraphic,
  },
];

interface EcosystemPillarTile {
  id: string;
  pillarNumber: string;
  name: string;
  eyebrow: string;
  tagline: string;
  title: string;
  subtitle: string;
  destination: string;
  isExternal: boolean;
  actionLabel: string;
  badgeClass: string;
  hoverTitleClass: string;
  actionColorClass: string;
  focusRingClass: string;
  Visual: () => React.ReactNode;
}

const ECOSYSTEM_PILLARS: EcosystemPillarTile[] = [
  {
    id: 'agreekit',
    pillarNumber: 'PILLAR 02',
    name: 'agreekit',
    eyebrow: 'AGREEKIT',
    tagline: 'Python agreement engine, CLI, MCP server',
    title: 'Execute agreement analyses in Python',
    subtitle:
      'An open-source Python package and MCP server built specifically for wearable health and algorithm validation studies. Execute exact agreement statistics, variance decompositions, and cluster-bootstrap confidence intervals directly within your own research pipelines and AI workflows.',
    destination: '/agreekit',
    isExternal: false,
    actionLabel: 'Enter agreekit Hub',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    hoverTitleClass: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    actionColorClass: 'text-amber-600 dark:text-amber-400',
    focusRingClass: 'focus-visible:ring-amber-500',
    Visual: PythonGraphic,
  },
  {
    id: 'health-data',
    pillarNumber: 'PILLAR 03',
    name: 'Health Data Catalog',
    eyebrow: 'HEALTH DATA CATALOG',
    tagline: 'Population Reference Baselines',
    title: 'Ground your protocol in population data',
    subtitle:
      'Planning an accurate study requires knowing how physiological measures naturally vary in real populations. Access reference distributions across various subject demographics and health measures to set realistic baselines before writing your protocol.',
    destination: '/health-data-distributions',
    isExternal: false,
    actionLabel: 'Enter Health Data Hub',
    badgeClass: 'bg-series-5/10 text-series-5 border border-series-5/20',
    hoverTitleClass: 'group-hover:text-series-5',
    actionColorClass: 'text-series-5',
    focusRingClass: 'focus-visible:ring-series-5',
    Visual: PopulationDataGraphic,
  },
  {
    id: 'reference-device-catalog',
    pillarNumber: 'PILLAR 04',
    name: 'Reference Device Catalog',
    eyebrow: 'REFERENCE DEVICE CATALOG',
    tagline: 'Clinical Comparators & 510(k) Predicates',
    title: 'Evaluate clinical reference standards',
    subtitle:
      'Selecting the right reference comparator determines regulatory clearance, data pipeline friction, and sample size inflation. Explore 10-dimension engineering profiles across 12 biometric domains covering FDA 510(k) predicates, hardware sync triggers, and consumable budgets.',
    destination: '/reference-device-catalog',
    isExternal: false,
    actionLabel: 'Enter Reference Catalog',
    badgeClass: 'bg-series-1/10 text-series-1 border border-series-1/20',
    hoverTitleClass: 'group-hover:text-series-1',
    actionColorClass: 'text-series-1',
    focusRingClass: 'focus-visible:ring-series-1',
    Visual: ReferenceCatalogGraphic,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 sm:gap-14 py-2 sm:py-4">
      {/* Hero Section */}
      <section className="space-y-4 max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-semibold text-series-1 shadow-2xs">
          <Sparkles size={13} aria-hidden />
          <span>OPEN-SOURCE VALIDATION</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-tight">
          Measure Ground Truth. Validate With Confidence.
        </h1>

        <p className="text-base sm:text-lg leading-relaxed text-ink-secondary max-w-3xl">
          The open-source suite for wearable sensors and health algorithms.
        </p>
      </section>

      {/* The 4 Main Pillars Showcase */}
      <section aria-label="Open Wearable Validation Platform Pillars" className="space-y-8 sm:space-y-10">
        {/* Pillar 1: The Validation Academy */}
        <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2">
                <span className="rounded-md bg-series-1/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-series-1 border border-series-1/20">
                  PILLAR 01
                </span>
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  VALIDATION ACADEMY
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                The Validation Academy
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                The open-source interactive web suite hosting 4 specialized workspaces:
                <strong className="text-ink"> Learning Studio</strong>,
                <strong className="text-ink"> Protocol Studio</strong>,
                <strong className="text-ink"> Report Studio</strong>, and
                <strong className="text-ink"> Pitfall Explorer</strong>.
              </p>
            </div>
            <Link
              to="/academy"
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-plane px-4 py-2 text-xs font-semibold text-ink shadow-2xs hover:bg-surface hover:border-ink/20 transition-all self-start md:self-center shrink-0"
            >
              <span>Enter Validation Academy</span>
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>

          {/* 4 Workspaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ACADEMY_WORKSPACES.map((tile) => {
              const cardContent = (
                <>
                  <div className="flex flex-1 flex-col space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${tile.badgeClass}`}
                      >
                        {tile.eyebrow}
                      </span>
                    </div>
                    <h2
                      className={`text-base sm:text-lg font-bold tracking-tight text-ink transition-colors ${tile.hoverTitleClass} leading-snug`}
                    >
                      {tile.title}
                    </h2>
                    <p className="text-xs leading-relaxed text-ink-secondary">
                      {tile.subtitle}
                    </p>
                  </div>

                  <div className="my-4 rounded-xl border border-hairline/70 bg-plane/70 p-3 flex items-center justify-center overflow-hidden transition-colors group-hover:border-ink/20">
                    <tile.Visual />
                  </div>

                  <div
                    className={`pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold ${tile.actionColorClass}`}
                  >
                    <span>{tile.actionLabel}</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </>
              );

              const cardClassName = `group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline bg-surface p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:border-ink/25 hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 ${tile.focusRingClass} text-left`;

              return (
                <Link key={tile.id} to={tile.destination} className={cardClassName}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pillars 2, 3, 4: Open Ecosystem Pillars */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Ecosystem Pillars
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
              Analysis Engines, Reference Standards &amp; Population Baselines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {ECOSYSTEM_PILLARS.map((tile) => {
              const cardContent = (
                <>
                  <div className="flex flex-1 flex-col space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${tile.badgeClass}`}
                      >
                        {tile.eyebrow}
                      </span>
                      <span className="rounded bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                        {tile.pillarNumber}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h2
                        className={`text-lg sm:text-xl font-bold tracking-tight text-ink transition-colors ${tile.hoverTitleClass} leading-snug`}
                      >
                        {tile.title}
                      </h2>
                      <p className="text-[11px] font-semibold tracking-wider text-ink-muted">
                        {tile.tagline}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary">
                      {tile.subtitle}
                    </p>
                  </div>

                  <div className="my-5 rounded-xl border border-hairline/70 bg-plane/70 p-3 sm:p-4 flex items-center justify-center overflow-hidden transition-colors group-hover:border-ink/20">
                    <tile.Visual />
                  </div>

                  <div
                    className={`pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold ${tile.actionColorClass}`}
                  >
                    <span>{tile.actionLabel}</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </>
              );

              const cardClassName = `group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xs transition-all duration-200 hover:border-ink/25 hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 ${tile.focusRingClass} text-left`;

              return (
                <Link key={tile.id} to={tile.destination} className={cardClassName}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Minimalist Provenance Strip */}
      <section className="rounded-2xl border border-hairline bg-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <OpenWearableValidationLogo size={20} />
            <h3 className="text-sm font-semibold text-ink">
              Engineered for Zero Data Upload &amp; Exact Mathematics
            </h3>
          </div>
          <p className="text-xs text-ink-muted max-w-2xl leading-relaxed">
            Authored by Ross D. Wilkinson, PhD (ex-Google Research Scientist). All calculations
            execute entirely in your local browser with zero telemetry. Built to replace fragile
            spreadsheets with exact non-central t intervals and random-effects models.
          </p>
        </div>

        <Link
          to="/about"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-series-1 hover:underline"
        >
          <span>Author credentials &amp; rationale</span>
          <ArrowRight size={13} aria-hidden />
        </Link>
      </section>
    </div>
  );
}
