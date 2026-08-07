import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus, Trash2 } from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { useTimelineSimulation } from './useTimelineSimulation.ts';
import {
  DEFAULT_PHASES,
  DISTRIBUTION_LABELS,
  DISTRIBUTION_NOTES,
  phaseExpectedValue,
  type Phase,
  type PhaseDistribution,
} from './timelineModel.ts';

const DISTRIBUTION_OPTIONS = (
  Object.keys(DISTRIBUTION_LABELS) as PhaseDistribution[]
).map((value) => ({ value, label: DISTRIBUTION_LABELS[value] }));

const ITERATION_OPTIONS = [
  { value: '10000', label: '10,000' },
  { value: '50000', label: '50,000' },
  { value: '200000', label: '200,000' },
] as const;

function days(value: number): string {
  return `${Math.round(value)} d`;
}

export default function TimelinePage() {
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [iterations, setIterations] = useState('50000');
  const [seed, setSeed] = useState(7);

  const input = useMemo(
    () => ({ phases, iterations: Number(iterations), seed }),
    [phases, iterations, seed],
  );

  const { result, running, error } = useTimelineSimulation(input);

  function updatePhase(id: string, patch: Partial<Phase>) {
    setPhases((current) =>
      current.map((phase) => (phase.id === id ? { ...phase, ...patch } : phase)),
    );
  }

  function addPhase() {
    setPhases((current) => [
      ...current,
      {
        id: `phase-${Date.now()}`,
        name: 'New phase',
        distribution: 'gamma',
        mean: 14,
        sd: 5,
        min: 7,
        mode: 14,
        max: 30,
        lambda: 4,
      },
    ]);
  }

  return (
    <ModulePage
      title="Study timeline simulator"
      intro={
        <>
          <p>
            Sample each phase, sum, repeat. The result is the distribution of total
            study duration — which is the thing you actually need when someone asks for
            a completion date.
          </p>
          <p>
            The source notebook models every phase as Poisson, which forces variance to
            equal the mean: a 28-day IRB review gets an SD of 5.3 days. Each phase here
            carries its own distribution instead, so the spread can match how that phase
            really behaves.
          </p>
        </>
      }
      controls={
        <>
          <SelectField
            label="Iterations"
            value={iterations}
            options={ITERATION_OPTIONS}
            onChange={setIterations}
            hint="Runs off the main thread in a Web Worker, so the UI stays responsive."
          />
          <NumberField
            label="Random seed"
            value={seed}
            onChange={setSeed}
            step={1}
            hint="Part of the input, not hidden state — the same seed always gives the same answer."
          />
          <button
            type="button"
            onClick={addPhase}
            className="flex items-center justify-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 text-sm text-ink-secondary transition-colors hover:bg-ink/5"
          >
            <Plus size={14} aria-hidden /> Add phase
          </button>
          <button
            type="button"
            onClick={() => setPhases(DEFAULT_PHASES)}
            className="rounded-md px-2.5 py-1.5 text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            Reset phases
          </button>
        </>
      }
    >
      {error && (
        <p className="rounded-lg border border-critical/40 bg-critical/5 p-4 text-sm">
          Simulation failed: {error}
        </p>
      )}

      <section aria-labelledby="totals">
        <h2
          id="totals"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          Total study duration
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Median (P50)', value: result?.p50, note: 'a coin flip' },
            { label: 'P80', value: result?.p80, note: '4 times in 5' },
            { label: 'P95', value: result?.p95, note: '19 times in 20' },
            {
              label: 'Sum of expected',
              value: result?.deterministicTotal,
              note: 'the naive plan',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-hairline bg-surface p-4"
            >
              <p className="text-xs font-medium text-ink-muted">{card.label}</p>
              <p className="mt-1.5 text-2xl font-semibold">
                {result ? days(card.value!) : '—'}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{card.note}</p>
            </div>
          ))}
        </div>
        {result && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Planning to the sum of expected durations ({days(result.deterministicTotal)}
            ) means finishing on time roughly half the time. A date you can commit to is
            closer to {days(result.p80)}–{days(result.p95)}.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Distribution of total duration
          </h2>
          {running && <span className="text-xs text-ink-muted">simulating…</span>}
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result?.histogram ?? []}
              margin={{ top: 8, right: 16, bottom: 28, left: 8 }}
            >
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="day"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART.axis }}
                tickFormatter={(value: number) => String(Math.round(value))}
                label={{
                  value: 'Total duration (days)',
                  position: 'insideBottom',
                  offset: -16,
                  style: AXIS_LABEL,
                }}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                label={{
                  value: 'Share of simulations',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: { ...AXIS_LABEL, textAnchor: 'middle' },
                }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) =>
                  typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : ''
                }
                labelFormatter={(value) =>
                  typeof value === 'number' ? `${Math.round(value)} days` : ''
                }
              />
              {result && (
                <>
                  <ReferenceLine
                    x={result.deterministicTotal}
                    stroke={CHART.reference}
                    strokeDasharray="4 4"
                    label={{
                      value: 'naive plan',
                      position: 'insideTopLeft',
                      style: AXIS_LABEL,
                    }}
                  />
                  <ReferenceLine
                    x={result.p95}
                    stroke={CHART.reference}
                    strokeDasharray="4 4"
                    label={{
                      value: 'P95',
                      position: 'insideTopRight',
                      style: AXIS_LABEL,
                    }}
                  />
                </>
              )}
              <Bar dataKey="density" fill={seriesColor(1)} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-labelledby="phases">
        <h2
          id="phases"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          Phases
        </h2>
        <div className="mt-3 flex flex-col gap-4">
          {phases.map((phase) => {
            const summary = result?.phases.find((p) => p.id === phase.id);
            return (
              <div
                key={phase.id}
                className="rounded-xl border border-hairline bg-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    aria-label={`Name for ${phase.name}`}
                    value={phase.name}
                    onChange={(event) =>
                      updatePhase(phase.id, { name: event.target.value })
                    }
                    className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 font-medium hover:border-hairline focus:border-hairline"
                  />
                  {summary && (
                    <p className="tabular shrink-0 text-sm text-ink-muted">
                      {days(summary.p5)}–{days(summary.p95)}
                    </p>
                  )}
                  {phases.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove ${phase.name}`}
                      onClick={() =>
                        setPhases((current) => current.filter((p) => p.id !== phase.id))
                      }
                      className="shrink-0 rounded p-1 text-ink-muted hover:bg-ink/5 hover:text-critical"
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  )}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <SelectField
                    label="Distribution"
                    value={phase.distribution}
                    options={DISTRIBUTION_OPTIONS}
                    onChange={(value) => updatePhase(phase.id, { distribution: value })}
                  />
                  {phase.distribution === 'pert' ? (
                    <>
                      <NumberField
                        label="Optimistic"
                        value={phase.min}
                        onChange={(value) => updatePhase(phase.id, { min: value })}
                        min={0}
                        suffix="d"
                      />
                      <NumberField
                        label="Most likely"
                        value={phase.mode}
                        onChange={(value) => updatePhase(phase.id, { mode: value })}
                        min={0}
                        suffix="d"
                      />
                      <NumberField
                        label="Pessimistic"
                        value={phase.max}
                        onChange={(value) => updatePhase(phase.id, { max: value })}
                        min={0}
                        suffix="d"
                      />
                    </>
                  ) : (
                    <>
                      <NumberField
                        label="Expected"
                        value={phase.mean}
                        onChange={(value) => updatePhase(phase.id, { mean: value })}
                        min={0}
                        suffix="d"
                      />
                      {phase.distribution !== 'poisson' &&
                        phase.distribution !== 'fixed' && (
                          <NumberField
                            label="SD"
                            value={phase.sd}
                            onChange={(value) => updatePhase(phase.id, { sd: value })}
                            min={0}
                            suffix="d"
                          />
                        )}
                    </>
                  )}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  {DISTRIBUTION_NOTES[phase.distribution]}
                  {phase.distribution === 'poisson' && (
                    <>
                      {' '}
                      Implied SD here: {Math.sqrt(Math.max(0, phase.mean)).toFixed(
                        1,
                      )}{' '}
                      days.
                    </>
                  )}
                  {phase.distribution !== 'pert' && (
                    <> Expected {days(phaseExpectedValue(phase))}.</>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </ModulePage>
  );
}
