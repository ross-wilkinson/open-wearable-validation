import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ACADEMY_MODULES, type AcademyModule } from '../academyData.ts';
import {
  computeWinnerCurseMetrics,
  computePairedDividend,
  computeClusteredEffectiveN,
  mapMonkToFitzpatrick,
  generateCadenceLockSimulation,
  computeClopperPearsonZeroEventBound,
  evaluateTwoGateLaunchEngine,
  computeTransitiveBridge,
} from '../academyModel.ts';

const MONK_SWATCHES = [
  { mst: 'MST 01', hex: '#f6ede4', label: 'Very Light', isDark: false },
  { mst: 'MST 02', hex: '#f3e7db', label: 'Light', isDark: false },
  { mst: 'MST 03', hex: '#f7ead0', label: 'Fair', isDark: false },
  { mst: 'MST 04', hex: '#eadaba', label: 'Medium Fair', isDark: false },
  { mst: 'MST 05', hex: '#d7bd96', label: 'Medium', isDark: false },
  { mst: 'MST 06', hex: '#a07e56', label: 'Olive Medium', isDark: true },
  { mst: 'MST 07', hex: '#825c43', label: 'Tan / Olive', isDark: true },
  { mst: 'MST 08', hex: '#604134', label: 'Brown', isDark: true },
  { mst: 'MST 09', hex: '#3a312a', label: 'Dark Brown', isDark: true },
  { mst: 'MST 10', hex: '#292420', label: 'Deepest Melanin', isDark: true },
];

interface WalkthroughCanvasProps {
  module: AcademyModule;
  onBackToRoadmap: () => void;
  onSelectModule?: (moduleId: string) => void;
}

export function WalkthroughCanvas({
  module,
  onBackToRoadmap,
  onSelectModule,
}: WalkthroughCanvasProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // --------------------------------------------------------------------------
  // Module 1 Interactive State
  // --------------------------------------------------------------------------
  const [act1N, setAct1N] = useState<number>(5);
  const [act1Noise, setAct1Noise] = useState<number>(3.0);
  const act1Result = computeWinnerCurseMetrics(act1N, act1Noise);

  // --------------------------------------------------------------------------
  // Module 2 Interactive State
  // --------------------------------------------------------------------------
  const [act2Rho, setAct2Rho] = useState<number>(0.95);
  const act2Result = computePairedDividend(190, act2Rho, 1300);

  // --------------------------------------------------------------------------
  // Module 3 Interactive State
  // --------------------------------------------------------------------------
  const [act3Participants, setAct3Participants] = useState<number>(25);
  const [act3Replicates, setAct3Replicates] = useState<number>(2700);
  const [act3Icc, setAct3Icc] = useState<number>(0.85);
  const act3Result = computeClusteredEffectiveN(act3Participants, act3Replicates, act3Icc);

  // --------------------------------------------------------------------------
  // Module 4 Interactive State
  // --------------------------------------------------------------------------
  const [act4Mode, setAct4Mode] = useState<'fda_regulated' | 'consumer'>('fda_regulated');
  const [act4MonkCounts, setAct4MonkCounts] = useState<number[]>([
    4, 4, 3, 3, 2, 2, 1, 1, 1, 1,
  ]);
  const act4Result = mapMonkToFitzpatrick(act4MonkCounts);

  // --------------------------------------------------------------------------
  // Module 5 Interactive State
  // --------------------------------------------------------------------------
  const [act5Severity, setAct5Severity] = useState<'none' | 'moderate' | 'severe'>('severe');
  const [act5ImuHz, setAct5ImuHz] = useState<number>(25);
  const act5Result = useMemo(
    () => generateCadenceLockSimulation(10, act5Severity, act5ImuHz),
    [act5Severity, act5ImuHz],
  );
  const act5ChartData = useMemo(() => {
    return act5Result.samples.map((s) => ({
      timeMin: Number((s.timeSec / 60).toFixed(1)),
      refHeartRate: s.refHeartRateBpm,
      cadence: s.cadenceSpm,
      ppgHeartRate: s.ppgHeartRateBpm,
      isLocked: s.isLocked,
    }));
  }, [act5Result]);

  // --------------------------------------------------------------------------
  // Module 6 Interactive State
  // --------------------------------------------------------------------------
  const [act6Trials, setAct6Trials] = useState<number>(1000);
  const act6Result = computeClopperPearsonZeroEventBound(act6Trials);

  // --------------------------------------------------------------------------
  // Module 7 Interactive State
  // --------------------------------------------------------------------------
  const [act7Gate1, setAct7Gate1] = useState<number>(2.4);
  const [act7Gate2, setAct7Gate2] = useState<number>(0.9);
  const act7Result = evaluateTwoGateLaunchEngine(act7Gate1, 3.0, act7Gate2, 1.5);

  // --------------------------------------------------------------------------
  // Module 8 Interactive State
  // --------------------------------------------------------------------------
  const [act8Delta32, setAct8Delta32] = useState<number>(0.7);
  const [act8Delta21, setAct8Delta21] = useState<number>(0.6);
  const [act8RefShift, setAct8RefShift] = useState<number>(0.0);
  const act8Result = computeTransitiveBridge(act8Delta32, 0.35, act8Delta21, 0.35, 1.5, act8RefShift);

  const step = module.walkthroughSteps[currentStep - 1] ?? module.walkthroughSteps[0]!;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Navigation Bar inside Canvas */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
        <button
          type="button"
          onClick={onBackToRoadmap}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-series-1 hover:underline"
        >
          <ArrowLeft size={14} /> Back to 8-Module Curriculum Roadmap
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">
            Step {currentStep} of {module.walkthroughSteps.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentStep <= 1}
              onClick={() => setCurrentStep((p) => Math.max(p - 1, 1))}
              className="rounded p-1 text-ink-secondary hover:bg-ink/5 disabled:opacity-30"
              aria-label="Previous step"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={currentStep >= module.walkthroughSteps.length}
              onClick={() =>
                setCurrentStep((p) => Math.min(p + 1, module.walkthroughSteps.length))
              }
              className="rounded p-1 text-ink-secondary hover:bg-ink/5 disabled:opacity-30"
              aria-label="Next step"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Narrative Header Box */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-series-1/10 px-2.5 py-0.5 text-xs font-bold text-series-1">
            {module.actRoman}
          </span>
          <span className="text-xs font-medium text-ink-muted">•</span>
          <span className="text-xs font-medium text-ink-muted">{module.lifecycleStage}</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            {module.title}
          </h2>
          <p className="text-sm font-medium text-series-1 mt-0.5">{module.subtitle}</p>
        </div>

        {/* Meridian Biosystems Narrative Scenario Box */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-semibold text-xs uppercase tracking-wider">
            <Info size={15} /> Meridian Biosystems Scenario
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary">
            {module.narrativeScenario}
          </p>
        </div>
      </div>

      {/* Guided Tour Stepper & Active Lesson Content */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-4">
        {/* Step Indicator Badges */}
        <div className="flex items-center gap-2 border-b border-hairline pb-4">
          {module.walkthroughSteps.map((s) => (
            <button
              key={s.stepNumber}
              type="button"
              onClick={() => setCurrentStep(s.stepNumber)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentStep === s.stepNumber
                  ? 'bg-ink text-plane font-semibold shadow-sm'
                  : 'border border-hairline text-ink-secondary hover:bg-ink/5'
              }`}
            >
              <span>{s.stepNumber}.</span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Current Step Description */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-ink">
            Step {step.stepNumber}: {step.title}
          </h3>
          <p className="text-sm leading-relaxed text-ink-secondary">
            {step.description}
          </p>
          {step.callout && (
            <div className="mt-2 rounded-lg border-l-2 border-series-4 bg-series-4/5 p-3 text-xs text-ink">
              <strong>Key Principle:</strong> {step.callout}
            </div>
          )}
        </div>
      </div>

      {/* Live Interactive Simulation Widget per Module */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-series-1" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Interactive Mathematical Sandbox
            </h3>
          </div>
          <span className="text-[11px] font-mono text-ink-muted">
            Live Browser Computation
          </span>
        </div>

        {/* ACT I SANDBOX */}
        {module.actNumber === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="act1-n-slider" className="flex justify-between text-xs font-medium text-ink">
                  <span>Prototyping Sample Size (N)</span>
                  <span className="font-mono text-series-1 font-bold">N = {act1N}</span>
                </label>
                <input
                  id="act1-n-slider"
                  type="range"
                  min={3}
                  max={40}
                  value={act1N}
                  onChange={(e) => setAct1N(Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>N=3 (Extreme Noise)</span>
                  <span>N=5 (Sniff Test)</span>
                  <span>N=40 (Rigorous)</span>
                </div>
              </div>

              <div>
                <label htmlFor="act1-noise-slider" className="flex justify-between text-xs font-medium text-ink">
                  <span>Sensor &amp; Motion Noise (σ)</span>
                  <span className="font-mono text-series-2 font-bold">{act1Noise.toFixed(1)} bpm</span>
                </label>
                <input
                  id="act1-noise-slider"
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={act1Noise}
                  onChange={(e) => setAct1Noise(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  Winner's Curse Risk
                </span>
                <p className="text-2xl font-extrabold text-ink">
                  {act1Result.winnerCurseProbability.toFixed(1)}%
                </p>
                <p className="text-xs text-ink-secondary">
                  Probability apparent winner on leaderboard won by lucky noise.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Catastrophic Elimination Power
                </span>
                <p className="text-2xl font-extrabold text-ink">
                  {act1Result.catastrophicEliminationPower.toFixed(1)}%
                </p>
                <p className="text-xs text-ink-secondary">
                  Power to safely discard fatal optical decoupling flaws (Δ ≥ 5 bpm).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ACT II SANDBOX */}
        {module.actNumber === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="act2-rho-slider" className="flex justify-between text-xs font-medium text-ink">
                <span>Optical PPG Paired Correlation (ρ)</span>
                <span className="font-mono text-series-3 font-bold">ρ = {act2Rho.toFixed(2)}</span>
              </label>
              <input
                id="act2-rho-slider"
                type="range"
                min={0.5}
                max={0.99}
                step={0.01}
                value={act2Rho}
                onChange={(e) => setAct2Rho(Number(e.target.value))}
                className="mt-1 w-full"
              />
              <div className="flex justify-between text-[10px] text-ink-muted">
                <span>0.50 (Uncorrelated / Different Sessions)</span>
                <span>0.95 (Identical Optical Photodiode Stream)</span>
                <span>0.99</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              <div className="rounded-xl border border-hairline bg-plane p-4 space-y-1">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Generic Sizing
                </span>
                <p className="text-2xl font-bold text-ink">N = {act2Result.independentSampleSize}</p>
                <p className="text-xs text-ink-muted">$247,000 budget</p>
              </div>

              <div className="rounded-xl border border-series-1/30 bg-series-1/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-series-1 uppercase tracking-wider">
                  Paired Sizing
                </span>
                <p className="text-2xl font-extrabold text-ink">N = {act2Result.pairedSampleSize}</p>
                <p className="text-xs text-series-1 font-semibold">${act2Result.pairedCost.toLocaleString()} budget</p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Dividend Saved
                </span>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${act2Result.costSaved.toLocaleString()}
                </p>
                <p className="text-xs text-ink-muted">{act2Result.costSavedPct.toFixed(1)}% clinical budget saved</p>
              </div>
            </div>
          </div>
        )}

        {/* ACT III SANDBOX */}
        {module.actNumber === 3 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="act3-n-input" className="text-xs font-medium text-ink">Participants (N)</label>
                <input
                  id="act3-n-input"
                  type="number"
                  min={1}
                  max={100}
                  value={act3Participants}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setAct3Participants(Number.isNaN(v) ? 0 : Math.max(v, 0));
                  }}
                  className="mt-1 w-full rounded border border-hairline bg-plane px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <label htmlFor="act3-m-input" className="text-xs font-medium text-ink">Replicates per Person (m)</label>
                <input
                  id="act3-m-input"
                  type="number"
                  min={1}
                  max={5000}
                  value={act3Replicates}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setAct3Replicates(Number.isNaN(v) ? 0 : Math.max(v, 0));
                  }}
                  className="mt-1 w-full rounded border border-hairline bg-plane px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <label htmlFor="act3-icc-slider" className="text-xs font-medium text-ink">Intraclass Correlation (ICC)</label>
                <input
                  id="act3-icc-slider"
                  type="range"
                  min={0.0}
                  max={0.99}
                  step={0.05}
                  value={act3Icc}
                  onChange={(e) => setAct3Icc(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <span className="text-[10px] font-mono text-series-1">ICC = {act3Icc.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              <div className="rounded-xl border border-hairline bg-plane p-4 space-y-1">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Raw Rows (N × m)
                </span>
                <p className="text-2xl font-bold text-ink">
                  {act3Result.totalRows.toLocaleString()}
                </p>
                <p className="text-xs text-rose-500 font-medium">Naive assumption: N = {act3Result.totalRows.toLocaleString()}</p>
              </div>

              <div className="rounded-xl border border-series-1/30 bg-series-1/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-series-1 uppercase tracking-wider">
                  True Effective N
                </span>
                <p className="text-2xl font-extrabold text-ink">
                  {act3Result.effectiveN.toFixed(1)}
                </p>
                <p className="text-xs text-ink-muted">VIF = {act3Result.vif.toFixed(0)}x variance inflation</p>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  Understated Error
                </span>
                <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {act3Result.uncertaintyUnderstatementPct.toFixed(1)}%
                </p>
                <p className="text-xs text-ink-muted">Naive CI understates uncertainty</p>
              </div>
            </div>
          </div>
        )}

        {/* ACT IV SANDBOX */}
        {module.actNumber === 4 && (
          <div className="space-y-4">
            {/* Mode Toggle: Consumer Feature vs FDA Regulated 510(k) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
              <div>
                <span className="text-xs font-semibold text-ink">Demographic Quota Target Mode</span>
                <p className="text-[11px] text-ink-muted">
                  {act4Mode === 'fda_regulated'
                    ? 'FDA 510(k) Regulated: ISO 80601-2-61 requires ≥15% in dark pigmentation (Fitzpatrick V–VI).'
                    : 'Consumer Feature: Broad population equity across all 10 Monk Skin Tones (ceiling 20% per bucket).'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-hairline bg-surface p-0.5">
                <button
                  type="button"
                  onClick={() => setAct4Mode('fda_regulated')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    act4Mode === 'fda_regulated'
                      ? 'bg-ink text-plane shadow-xs'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  FDA Regulated 510(k)
                </button>
                <button
                  type="button"
                  onClick={() => setAct4Mode('consumer')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    act4Mode === 'consumer'
                      ? 'bg-ink text-plane shadow-xs'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  Consumer Feature
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Monk Skin Tone Scale Enrollment (MST 01 through MST 10)
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mt-2">
                {act4MonkCounts.map((count, idx) => {
                  const swatch = MONK_SWATCHES[idx]!;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center rounded-lg border border-hairline p-1.5 shadow-xs"
                      style={{ backgroundColor: swatch.hex }}
                    >
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          swatch.isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {swatch.mst}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        aria-label={`Enrolled count for ${swatch.mst}`}
                        value={count}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          const next = [...act4MonkCounts];
                          next[idx] = Number.isNaN(v) ? 0 : Math.max(v, 0);
                          setAct4MonkCounts(next);
                        }}
                        className="mt-1 w-full rounded border border-black/20 bg-white/90 text-center text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-hairline bg-plane p-4 space-y-2">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  FDA ISO 80601-2-61 Table 1 Mapping
                </span>
                <div className="space-y-1 text-xs">
                  {act4Result.fitzpatrickBuckets.map((b) => (
                    <div key={b.fitzpatrickType} className="flex justify-between items-center text-ink-secondary">
                      <span>{b.fitzpatrickType} ({b.monkEquivalent}):</span>
                      <span className="font-mono font-semibold text-ink">{b.count} pts ({b.percentage.toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`flex flex-col justify-between rounded-xl border p-4 ${
                  act4Result.satisfiesFda15PctRule
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    FDA ≥15% Dark Skin Quota Check
                  </span>
                  <p className="mt-1 text-2xl font-extrabold text-ink">
                    {act4Result.darkSkinPercentage.toFixed(1)}%
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      (min required: 15% / {act4Result.minDarkSkinRequired} pts)
                    </span>
                  </p>
                  <p className="text-xs mt-1">
                    {act4Result.satisfiesFda15PctRule ? (
                      <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Complies with FDA 510(k) Pre-Market Requirements
                      </span>
                    ) : (
                      <span className="text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1">
                        <ShieldAlert size={13} /> Deficit: Walk-in clinic ceiling cap needed
                      </span>
                    )}
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-ink-muted border-t border-hairline pt-2">
                  Total Enrolled: {act4Result.totalEnrolled} participants
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACT V SANDBOX */}
        {module.actNumber === 5 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="block text-xs font-medium text-ink">Harmonic Contamination Scenario</span>
                <div className="flex gap-2 mt-1">
                  {(['none', 'moderate', 'severe'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setAct5Severity(sev)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                        act5Severity === sev
                          ? 'bg-ink text-plane'
                          : 'border border-hairline text-ink-secondary hover:bg-ink/5'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-ink">IMU Sampling Rate (Running Dynamics)</span>
                <div className="flex gap-2 mt-1">
                  {[25, 50, 100, 200].map((hz) => (
                    <button
                      key={hz}
                      type="button"
                      onClick={() => setAct5ImuHz(hz)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                        act5ImuHz === hz
                          ? 'bg-series-1 text-plane'
                          : 'border border-hairline text-ink-secondary hover:bg-ink/5'
                      }`}
                    >
                      {hz} Hz
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Module 5 Provocation Protocol Time-Series Chart */}
            <div className="rounded-xl border border-hairline bg-plane p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Treadmill Speed-Ramp Provocation Time Series (0–10 min)
                </span>
                <span className="text-[11px] font-mono text-series-1">
                  Speed: 8 km/h &rarr; 16 km/h
                </span>
              </div>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={act5ChartData} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid, #e2e8f0)" />
                    <XAxis
                      dataKey="timeMin"
                      stroke="var(--color-ink-muted, #94a3b8)"
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Protocol Time (min)', position: 'insideBottom', offset: -12, fontSize: 11 }}
                    />
                    <YAxis
                      domain={[120, 195]}
                      stroke="var(--color-ink-muted, #94a3b8)"
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Rate (BPM / SPM)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface, #ffffff)',
                        borderColor: 'var(--color-hairline, #cbd5e1)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(val, name) => [`${val} ${name === 'Step Cadence' ? 'spm' : 'bpm'}`, name]}
                      labelFormatter={(l) => `Time: ${l} min`}
                    />
                    <ReferenceArea x1={4} x2={7} strokeOpacity={0.3} fill="var(--color-series-2, #eb6834)" fillOpacity={0.08} />
                    <ReferenceLine y={170} stroke="var(--color-series-2, #eb6834)" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="refHeartRate"
                      name="ECG Reference Heart Rate"
                      stroke="var(--color-series-6, #008300)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cadence"
                      name="Step Cadence"
                      stroke="var(--color-series-2, #eb6834)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="ppgHeartRate"
                      name="PulseBand 2 PPG Output"
                      stroke="var(--color-series-1, #2a78d6)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-ink-muted pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-4 rounded bg-emerald-600" /> ECG Reference (bpm)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-amber-600" /> Cadence (spm)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-4 rounded bg-blue-600" /> PulseBand 2 PPG (bpm)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-4 rounded bg-amber-500/20 border border-amber-500/40" /> Crossover Zone
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-hairline bg-plane p-4 space-y-1">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Harmonic Contamination Index (HCI)
                </span>
                <p className="text-2xl font-extrabold text-ink">
                  {act5Result.metrics.harmonicContaminationIndex}%
                </p>
                <p className="text-xs text-ink-muted">
                  Max heart-rate lock discrepancy: <strong>{act5Result.metrics.maxDiscrepancyBpm} bpm</strong>
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 space-y-1 ${
                  act5Result.metrics.imuResolutionVerdict === 'SUFFICIENT'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  IMU GCT Temporal Aliasing ({act5Result.metrics.imuSamplingRateHz} Hz)
                </span>
                <p className="text-2xl font-extrabold text-ink">
                  ±{act5Result.metrics.imuPeriodMs} ms
                </p>
                <p className="text-xs">
                  {act5Result.metrics.imuResolutionVerdict === 'SUFFICIENT' ? (
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                      Sufficient for ground contact time (&lt;5% error)
                    </span>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-300 font-semibold">
                      Severe temporal blur ({act5Result.metrics.gctTemporalResolutionErrorPct}% error window on 220ms GCT)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ACT VI SANDBOX */}
        {module.actNumber === 6 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="act6-trials-slider" className="flex justify-between text-xs font-medium text-ink">
                <span>High-Motion Challenge Windows (k = 0 false events)</span>
                <span className="font-mono text-series-1 font-bold">N = {act6Trials.toLocaleString()} windows</span>
              </label>
              <input
                id="act6-trials-slider"
                type="range"
                min={200}
                max={5000}
                step={100}
                value={act6Trials}
                onChange={(e) => setAct6Trials(Number(e.target.value))}
                className="mt-1 w-full"
              />
              <div className="flex justify-between text-[10px] text-ink-muted">
                <span>200 windows</span>
                <span>1,000 windows (Standard trial)</span>
                <span>5,000 windows</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              <div className="rounded-xl border border-hairline bg-plane p-4 space-y-1">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Observed Rate
                </span>
                <p className="text-2xl font-bold text-ink">0.00%</p>
                <p className="text-xs text-ink-muted">0 events in {act6Result.trials} windows</p>
              </div>

              <div className="rounded-xl border border-series-4/30 bg-series-4/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-series-4 uppercase tracking-wider">
                  Exact 95% Upper Bound
                </span>
                <p className="text-2xl font-extrabold text-ink">
                  ≤ {act6Result.exactUpperBoundPct.toFixed(2)}%
                </p>
                <p className="text-xs text-ink-muted">Clopper-Pearson (Rule of 3: {act6Result.ruleOfThreeUpperBoundPct.toFixed(2)}%)</p>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  1M User Annual Scale
                </span>
                <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {(act6Result.annualPopulationFalseAlarms / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-ink-muted">False alarms/year at upper bound</p>
              </div>
            </div>
          </div>
        )}

        {/* ACT VII SANDBOX */}
        {module.actNumber === 7 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="act7-gate1-slider" className="flex justify-between text-xs font-medium text-ink">
                  <span>Gate 1: Absolute Clinical RMSE vs ECG</span>
                  <span className="font-mono text-series-1 font-bold">{act7Gate1.toFixed(1)} bpm</span>
                </label>
                <input
                  id="act7-gate1-slider"
                  type="range"
                  min={1.0}
                  max={5.0}
                  step={0.1}
                  value={act7Gate1}
                  onChange={(e) => setAct7Gate1(Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <span className="text-[10px] text-ink-muted">Clinical Threshold: ≤ 3.0 bpm</span>
              </div>

              <div>
                <label htmlFor="act7-gate2-slider" className="flex justify-between text-xs font-medium text-ink">
                  <span>Gate 2: Predecessor Parity vs PulseBand 1</span>
                  <span className="font-mono text-series-2 font-bold">{act7Gate2.toFixed(1)} bpm</span>
                </label>
                <input
                  id="act7-gate2-slider"
                  type="range"
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  value={act7Gate2}
                  onChange={(e) => setAct7Gate2(Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <span className="text-[10px] text-ink-muted">Parity Threshold: ≤ 1.5 bpm</span>
              </div>
            </div>

            {/* 2x2 Decision Matrix Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Two-Gate 4-Quadrant Commercial Decision Plane
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Quadrant I: Green Light */}
                <div
                  className={`rounded-xl border p-3.5 transition-all ${
                    act7Result.verdict === 'GREEN_LIGHT'
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-sm ring-2 ring-emerald-500/30'
                      : 'border-hairline bg-surface opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Quadrant I: Green Light</span>
                    {act7Result.verdict === 'GREEN_LIGHT' && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] text-white">Active</span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-secondary">Gate 1 Pass (RMSE ≤ 3.0) &amp; Gate 2 Pass (Parity ≤ 1.5)</div>
                  <div className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">Commercial Launch Approved</div>
                </div>

                {/* Quadrant II: Amber Parity Risk */}
                <div
                  className={`rounded-xl border p-3.5 transition-all ${
                    act7Result.verdict === 'AMBER_PARITY_RISK'
                      ? 'border-amber-500 bg-amber-500/15 shadow-sm ring-2 ring-amber-500/30'
                      : 'border-hairline bg-surface opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-300">
                    <span>Quadrant II: Parity Risk</span>
                    {act7Result.verdict === 'AMBER_PARITY_RISK' && (
                      <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] text-white">Active</span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-secondary">Gate 1 Pass (RMSE ≤ 3.0) &amp; Gate 2 Fail (Parity &gt; 1.5)</div>
                  <div className="mt-1 font-semibold text-amber-600 dark:text-amber-400">Customer Backlash &amp; Return Hazard</div>
                </div>

                {/* Quadrant III: Amber Quality Debt */}
                <div
                  className={`rounded-xl border p-3.5 transition-all ${
                    act7Result.verdict === 'AMBER_QUALITY_DEBT'
                      ? 'border-amber-500 bg-amber-500/15 shadow-sm ring-2 ring-amber-500/30'
                      : 'border-hairline bg-surface opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-300">
                    <span>Quadrant III: Quality Debt</span>
                    {act7Result.verdict === 'AMBER_QUALITY_DEBT' && (
                      <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] text-white">Active</span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-secondary">Gate 1 Fail (RMSE &gt; 3.0) &amp; Gate 2 Pass (Parity ≤ 1.5)</div>
                  <div className="mt-1 font-semibold text-amber-600 dark:text-amber-400">Clinical Gold Standard Tolerance Breached</div>
                </div>

                {/* Quadrant IV: Red Light */}
                <div
                  className={`rounded-xl border p-3.5 transition-all ${
                    act7Result.verdict === 'RED_LIGHT'
                      ? 'border-rose-500 bg-rose-500/15 shadow-sm ring-2 ring-rose-500/30'
                      : 'border-hairline bg-surface opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-300">
                    <span>Quadrant IV: Red Light</span>
                    {act7Result.verdict === 'RED_LIGHT' && (
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] text-white">Active</span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-secondary">Gate 1 Fail (RMSE &gt; 3.0) &amp; Gate 2 Fail (Parity &gt; 1.5)</div>
                  <div className="mt-1 font-semibold text-rose-600 dark:text-rose-400">Unacceptable Commercial Risk: Block Production</div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-xl border p-5 space-y-2 ${
                act7Result.verdict === 'GREEN_LIGHT'
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : act7Result.verdict === 'RED_LIGHT'
                  ? 'border-rose-500/40 bg-rose-500/10'
                  : 'border-amber-500/40 bg-amber-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  4-Quadrant Launch Engine Decision
                </span>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-extrabold ${
                    act7Result.verdict === 'GREEN_LIGHT'
                      ? 'bg-emerald-600 text-white'
                      : act7Result.verdict === 'RED_LIGHT'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-black'
                  }`}
                >
                  {act7Result.verdict.replace(/_/g, ' ')}
                </span>
              </div>
              <h4 className="text-base font-bold text-ink">{act7Result.verdictTitle}</h4>
              <p className="text-xs leading-relaxed text-ink-secondary">
                {act7Result.verdictRecommendation}
              </p>
            </div>
          </div>
        )}

        {/* ACT VIII SANDBOX */}
        {module.actNumber === 8 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="act8-delta32-input" className="text-xs font-medium text-ink">PulseBand 3 vs 2 (Δ₃₋₂)</label>
                <input
                  id="act8-delta32-input"
                  type="number"
                  step={0.1}
                  value={act8Delta32}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setAct8Delta32(Number.isNaN(v) ? 0 : v);
                  }}
                  className="mt-1 w-full rounded border border-hairline bg-plane px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <label htmlFor="act8-delta21-input" className="text-xs font-medium text-ink">PulseBand 2 vs 1 (Δ₂₋₁)</label>
                <input
                  id="act8-delta21-input"
                  type="number"
                  step={0.1}
                  value={act8Delta21}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setAct8Delta21(Number.isNaN(v) ? 0 : v);
                  }}
                  className="mt-1 w-full rounded border border-hairline bg-plane px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <label htmlFor="act8-refshift-input" className="text-xs font-medium text-ink">Reference Standard Shift</label>
                <input
                  id="act8-refshift-input"
                  type="number"
                  step={0.1}
                  value={act8RefShift}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setAct8RefShift(Number.isNaN(v) ? 0 : v);
                  }}
                  className="mt-1 w-full rounded border border-hairline bg-plane px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>

            {/* Visual Stepped Transitive Bridge Diagram */}
            <div className="rounded-xl border border-hairline bg-plane p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Transitive Predecessor Bridge Flow
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                {/* Gen 1 */}
                <div className="rounded-lg border border-hairline bg-surface p-3 text-center space-y-1">
                  <div className="text-[10px] uppercase font-bold text-ink-muted">Device Generation 1</div>
                  <div className="text-sm font-bold text-ink">PulseBand 1</div>
                  <div className="text-xs font-mono text-emerald-600 font-semibold">Baseline Reference (0.00 bpm)</div>
                </div>

                {/* Bridge 1 -> 2 */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-[11px] font-mono font-semibold text-series-1">
                    Δ₂₋₁ = +{act8Delta21.toFixed(2)} bpm
                  </div>
                  <div className="text-[10px] text-ink-muted">Opposite-Wrist Trial</div>
                  <ArrowRight size={16} className="text-series-1 hidden md:block my-1" />
                </div>

                {/* Gen 2 */}
                <div className="rounded-lg border border-hairline bg-surface p-3 text-center space-y-1">
                  <div className="text-[10px] uppercase font-bold text-ink-muted">Device Generation 2</div>
                  <div className="text-sm font-bold text-ink">PulseBand 2</div>
                  <div className="text-xs font-mono text-ink-secondary">Parity with Gen 1: +{act8Delta21.toFixed(2)} bpm</div>
                </div>
              </div>

              <div className="rounded-xl border border-series-1/30 bg-series-1/5 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-ink">PulseBand 3 vs PulseBand 1 Cumulative Transitive Contrast:</div>
                  <div className="text-xs text-ink-secondary mt-0.5">
                    Indirect Difference: <strong className="font-mono text-ink">+{act8Result.transitiveDelta.toFixed(2)} bpm</strong> &bull; 95% Indirect CI: <span className="font-mono">[{act8Result.ciLower.toFixed(2)}, {act8Result.ciUpper.toFixed(2)}] bpm</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted">Margin: ≤ 1.50 bpm</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      act8Result.isNonInferior ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {act8Result.isNonInferior ? 'NON-INFERIOR' : 'DRIFT REGRESSION'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-hairline bg-plane p-4 space-y-1">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Transitive Contrast (Gen 3 vs Gen 1)
                </span>
                <p className="text-2xl font-extrabold text-ink">
                  +{act8Result.transitiveDelta.toFixed(2)} bpm
                </p>
                <p className="text-xs text-ink-muted">
                  95% Indirect CI: [{act8Result.ciLower.toFixed(2)}, {act8Result.ciUpper.toFixed(2)}] bpm
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 space-y-1 ${
                  act8Result.driftCanaryAlert
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-emerald-500/30 bg-emerald-500/5'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Longitudinal Drift Canary
                </span>
                <p className="text-sm font-bold text-ink">
                  {act8Result.driftCanaryAlert ? 'DRIFT ALERT' : 'STABLE BASELINE'}
                </p>
                <p className="text-xs text-ink-secondary">
                  {act8Result.driftWarningMessage ??
                    'No longitudinal degradation detected across device generations.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formula & Reference Card */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Formal Mathematical Formulation &amp; Architectural Standard
        </h3>
        <div className="rounded-xl bg-plane p-4 font-mono text-xs sm:text-sm text-ink overflow-x-auto">
          {module.statisticalFormula}
        </div>
        <p className="text-xs leading-relaxed text-ink-secondary">
          <strong>Key Takeaway:</strong> {module.keyTakeaway}
        </p>
      </div>

      {/* Deep Link Action Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-hairline bg-surface p-6">
        <div>
          <h4 className="text-sm font-bold text-ink">
            Ready to design a complete study with this methodology?
          </h4>
          <p className="text-xs text-ink-secondary mt-0.5">
            Open the full clinical designer tool with custom datasets and export options.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onSelectModule && module.actNumber < 8 && (
            <button
              type="button"
              onClick={() => {
                const nextModule = ACADEMY_MODULES[module.actNumber];
                if (nextModule) onSelectModule(nextModule.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-ink/5"
            >
              <span>Next: Module {module.actNumber + 1}</span>
              <ChevronRight size={14} />
            </button>
          )}
          <Link
            to={module.interactiveToolRoute}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2.5 text-xs font-semibold text-plane transition-opacity hover:opacity-90"
          >
            <span>{module.interactiveToolLabel}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
