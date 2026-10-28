import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import NextSteps from '../../app/study/NextSteps.tsx';
import { AUTHOR } from '../../content/author.ts';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import {
  DEFAULT_SNIFF_PROTOTYPES,
  simulateSniffTest,
} from './sniffTestModel.ts';

export default function SniffTestExplainerPage() {
  const [sampleSize, setSampleSize] = useState<number>(5);
  const [noiseSd, setNoiseSd] = useState<number>(3.0);
  const eliminationThreshold = 5.0;

  const result = useMemo(
    () =>
      simulateSniffTest(
        DEFAULT_SNIFF_PROTOTYPES,
        sampleSize,
        noiseSd,
        3000,
        42,
        eliminationThreshold,
      ),
    [sampleSize, noiseSd, eliminationThreshold],
  );

  // Chart data preparing error bar format [errorLow, errorHigh]
  const chartData = useMemo(() => {
    return result.prototypes.map((p) => ({
      name: p.name.split(' (')[0],
      fullName: p.name,
      trueMean: p.trueMean,
      sampleMean: Number(p.sampleMean.toFixed(2)),
      errorSpan: [
        Number((p.sampleMean - p.ciLower).toFixed(2)),
        Number((p.ciUpper - p.sampleMean).toFixed(2)),
      ],
      ciLower: Number(p.ciLower.toFixed(2)),
      ciUpper: Number(p.ciUpper.toFixed(2)),
      winRate: Number(p.winRate.toFixed(1)),
      eliminationRate: Number(p.eliminationRate.toFixed(1)),
      isFlawed: p.isFlawed,
    }));
  }, [result.prototypes]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-series-1/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-series-1">
            PITFALL EXPLORER
          </span>
          <span className="text-xs font-medium text-ink-muted">Explainer</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          The Sniff Test Trap: Why N=5 Cannot Pick a Winner, But Can Safely Eliminate a Loser
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          By{' '}
          <a
            href={AUTHOR.scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            {AUTHOR.name}
          </a>
        </p>
      </header>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <p>
          In hardware engineering labs and algorithmic prototyping teams, the "N=5 Sniff Test" is
          ubiquitous. An optical sensor team builds five mechanical chassis revisions or DSP filters
          and tests them on five colleagues in the lab.
        </p>
        <p>
          They look at the leaderboard: <strong>Prototype B</strong> has an error of 1.9 bpm, while{' '}
          <strong>Prototype A</strong> has 2.2 bpm. The team declares Prototype B the champion and
          commits millions of dollars to tooling.
        </p>
        <p className="font-semibold text-ink">
          This is the "Winner's Curse" in rapid prototyping. At N=5, noise dominates the ranking.
          Prototype B didn't win because it was better — it won because it got lucky noise.
        </p>
        <p>
          Yet the sniff test is not useless. Below, explore an interactive simulation of 5 candidate
          prototypes tested on N participants. Watch what happens when you compare selection versus
          elimination.
        </p>
      </section>

      {/* Interactive Controls */}
      <section className="rounded-xl border border-hairline bg-surface p-5 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Interactive Prototyping Screen</h2>
            <p className="text-xs text-ink-secondary">
              Simulating 3,000 randomized screening trials across 5 hardware candidates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSampleSize(5);
                setNoiseSd(3.0);
              }}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                sampleSize === 5 && noiseSd === 3.0
                  ? 'bg-series-1/10 text-series-1 border border-series-1/30'
                  : 'border border-hairline text-ink-secondary hover:bg-ink/5'
              }`}
            >
              Default N=5 Sniff Test
            </button>
            <button
              type="button"
              onClick={() => {
                setSampleSize(30);
                setNoiseSd(3.0);
              }}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                sampleSize === 30
                  ? 'bg-series-1/10 text-series-1 border border-series-1/30'
                  : 'border border-hairline text-ink-secondary hover:bg-ink/5'
              }`}
            >
              Scaled N=30 Trial
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sniff-n-slider" className="flex justify-between text-xs font-medium text-ink">
              <span>Screening Sample Size (N)</span>
              <span className="font-mono text-series-1 font-bold">N = {sampleSize} subjects</span>
            </label>
            <input
              id="sniff-n-slider"
              type="range"
              min={3}
              max={40}
              step={1}
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--color-series-1)]"
            />
            <div className="flex justify-between text-[10px] text-ink-muted">
              <span>N=3 (Extreme Noise)</span>
              <span>N=5 (Sniff Test)</span>
              <span>N=40 (Rigorous Sizing)</span>
            </div>
          </div>

          <div>
            <label htmlFor="sniff-sd-slider" className="flex justify-between text-xs font-medium text-ink">
              <span>Measurement &amp; Subject Noise (σ)</span>
              <span className="font-mono text-series-1 font-bold">σ = {noiseSd.toFixed(1)} bpm</span>
            </label>
            <input
              id="sniff-sd-slider"
              type="range"
              min={1.0}
              max={6.0}
              step={0.5}
              value={noiseSd}
              onChange={(e) => setNoiseSd(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--color-series-2)]"
            />
            <div className="flex justify-between text-[10px] text-ink-muted">
              <span>1.0 bpm (Lab Bench)</span>
              <span>3.0 bpm (Typical PPG)</span>
              <span>6.0 bpm (High Motion)</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Two Realities: Winner's Curse vs Catastrophic Elimination */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* Reality 1: The Selection Trap */}
        <div className="flex flex-col justify-between rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
          <div>
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-semibold text-xs uppercase tracking-wider">
              <ShieldAlert size={16} aria-hidden /> The Selection Trap (Winner's Curse)
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
              {result.winnerCurseRate.toFixed(1)}%
              <span className="ml-1.5 text-xs font-normal text-ink-muted">error rate</span>
            </p>
            <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
              In <strong>{result.winnerCurseRate.toFixed(1)}% of screens</strong>, the apparent winner on the leaderboard was{' '}
              <strong className="text-rose-600 dark:text-rose-400">NOT the true best prototype</strong>.
            </p>
          </div>
          <div className="mt-3 border-t border-hairline/60 pt-2 text-[11px] text-ink-muted">
            Selection Bias: Winner appears <strong>+{result.expectedWinnerOverOptimism.toFixed(2)} bpm</strong> more accurate than its true capability.
          </div>
        </div>

        {/* Reality 2: The Elimination Power */}
        <div className="flex flex-col justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
              <CheckCircle2 size={16} aria-hidden /> The Elimination Superpower
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
              {result.flawedEliminationRate.toFixed(1)}%
              <span className="ml-1.5 text-xs font-normal text-ink-muted">catch rate</span>
            </p>
            <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
              In <strong>{result.flawedEliminationRate.toFixed(1)}% of screens</strong>, Prototype E (the catastrophic flawed design) was{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">safely caught and eliminated</strong>.
            </p>
          </div>
          <div className="mt-3 border-t border-hairline/60 pt-2 text-[11px] text-ink-muted">
            Elimination threshold: &gt;{eliminationThreshold} bpm error catches optical decoupling effortlessly.
          </div>
        </div>
      </section>

      {/* Visual Bar Chart with 95% Confidence Intervals */}
      <section className="rounded-xl border border-hairline bg-surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Observed Errors with 95% Confidence Intervals at N = {sampleSize}
            </h2>
            <p className="text-xs text-ink-secondary">
              Notice how Prototypes A, B, C, D heavily overlap (statistically indistinguishable), while Prototype E stands completely apart.
            </p>
          </div>
          <span className="rounded bg-ink/5 px-2 py-0.5 text-xs font-mono text-ink-muted">
            SE = {(noiseSd / Math.sqrt(sampleSize)).toFixed(2)} bpm
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="name" tick={AXIS_TICK} />
              <YAxis
                unit=" bpm"
                tick={AXIS_TICK}
                domain={[0, 'auto']}
                label={{
                  value: 'Error (bpm)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: AXIS_LABEL,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]!.payload as (typeof chartData)[0];
                  return (
                    <div className="rounded-lg border border-hairline bg-surface p-3 text-xs shadow-md space-y-1">
                      <p className="font-semibold text-ink">{d.fullName}</p>
                      <p className="text-ink-secondary">True Mean Error: <span className="font-mono">{d.trueMean} bpm</span></p>
                      <p className="text-ink-secondary">Sample 95% CI: <span className="font-mono">[{d.ciLower}, {d.ciUpper}] bpm</span></p>
                      <p className="font-medium text-series-1">N={sampleSize} Win Rate: {d.winRate}%</p>
                      {d.isFlawed && (
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Elimination Rate: {d.eliminationRate}%
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={eliminationThreshold}
                stroke="var(--color-series-5)"
                strokeDasharray="4 4"
                label={{
                  value: `Elimination Threshold (${eliminationThreshold} bpm)`,
                  fill: 'var(--color-series-5)',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Bar dataKey="sampleMean" fill={seriesColor(1)} radius={[4, 4, 0, 0]}>
                <ErrorBar
                  dataKey="errorSpan"
                  width={6}
                  strokeWidth={1.5}
                  stroke={CHART.reference}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-ink-muted border-t border-hairline pt-3">
          <span>Error bars indicate 95% t-distribution confidence intervals.</span>
          <span>Dashed line: Cut-off for catastrophic candidate elimination.</span>
        </div>
      </section>

      {/* Candidate Leaderboard & Elimination Table */}
      <section className="rounded-xl border border-hairline bg-surface p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink">
          Candidate Roster &amp; Screening Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-ink-muted">
                <th className="pb-2 font-medium">Candidate Prototype</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">True Error</th>
                <th className="pb-2 font-medium text-right">Observed Mean</th>
                <th className="pb-2 font-medium text-right">N={sampleSize} Win Rate</th>
                <th className="pb-2 font-medium text-right">Status / Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {result.prototypes.map((p) => {
                const desc = DEFAULT_SNIFF_PROTOTYPES.find((c) => c.id === p.id)?.description;
                return (
                  <tr key={p.id} className="hover:bg-plane/50">
                    <td className="py-2.5 font-medium text-ink">{p.name}</td>
                    <td className="py-2.5 text-ink-secondary">{desc}</td>
                    <td className="py-2.5 font-mono text-right text-ink-muted">{p.trueMean.toFixed(1)} bpm</td>
                    <td className="py-2.5 font-mono text-right text-ink">{p.sampleMean.toFixed(2)} bpm</td>
                    <td className="py-2.5 font-mono text-right font-semibold text-series-1">{p.winRate.toFixed(1)}%</td>
                    <td className="py-2.5 text-right font-medium">
                      {p.isFlawed ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                          <ShieldAlert size={12} /> Eliminated ({p.eliminationRate.toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={12} /> Retained
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* The Core Institutional Lesson / ADR-003 */}
      <section className="rounded-xl border border-hairline bg-surface p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-series-1/10 text-series-1">
            <Sparkles size={18} aria-hidden />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-ink">
              The Golden Rule of Rapid Prototyping
            </h2>
            <blockquote className="border-l-2 border-series-1 pl-3 text-sm italic text-ink font-medium leading-relaxed">
              "Use N=5 sniff tests exclusively to eliminate the bottom 50% of flawed candidates.
              NEVER use an N=5 screen to pick a single winner among close contenders."
            </blockquote>
            <p className="text-xs leading-relaxed text-ink-secondary">
              At N=5, the standard error of difference between two prototypes with noise σ = 3.0 bpm is:
            </p>
            <div className="rounded bg-plane p-2 font-mono text-xs text-ink">
              SE(Diff) = √(3.0² / 5 + 3.0² / 5) = √(1.8 + 1.8) ≈ 1.90 bpm
            </div>
            <p className="text-xs leading-relaxed text-ink-secondary">
              If Prototype A and Prototype B differ by only 0.3 bpm, the signal-to-noise ratio is 0.3 / 1.90 = 0.16.
              The statistical power to identify the true winner is barely 25% — essentially a coin flip!
              Advancing all top viable candidates into an appropriately sized study (N = 25–40) is the only
              defensible path.
            </p>
          </div>
        </div>
      </section>

      <NextSteps
        steps={[
          {
            to: '/chance-kpi',
            title: 'Report Studio: Pass by Chance?',
            description:
              'Permutation null distributions to check if small N or narrow dynamic range created a false-pass illusion.',
          },
          {
            to: '/agreement',
            title: 'Protocol Studio: Paired Non-Inferiority',
            description:
              'Size your head-to-head algorithm comparisons properly using identical sensor data correlation.',
          },
          {
            to: '/report-studio',
            title: 'Report Studio: Two-Gate Visualizer',
            description:
              'Simultaneously evaluate absolute performance vs reference and predecessor non-inferiority with confidence ellipses.',
          },
        ]}
      />
    </article>
  );
}
