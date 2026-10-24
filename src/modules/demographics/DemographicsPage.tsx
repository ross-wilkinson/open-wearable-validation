import { useMemo, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import NextSteps from '../../app/study/NextSteps.tsx';
import { useStudy } from '../../app/study/StudyContext.tsx';

import NumberField from '../../components/common/NumberField.tsx';
import {
  SEGMENT_PRESETS,
  planSegments,
  type SegmentPreset,
} from './demographicsModel.ts';

export default function DemographicsPage() {
  const { study } = useStudy();
  const [sampleSize, setSampleSize] = useState(() => study.n ?? 65);
  const [segments, setSegments] = useState(2);
  const [minPercent, setMinPercent] = useState(40);
  const [labels, setLabels] = useState<string[]>(['Female', 'Male']);
  const [activePreset, setActivePreset] = useState<string | null>('sex');

  const plan = useMemo(
    () => planSegments({ sampleSize, segments, minPercent }),
    [sampleSize, segments, minPercent],
  );

  function applyPreset(preset: SegmentPreset) {
    setSampleSize(preset.sampleSize);
    setSegments(preset.segmentLabels.length);
    setMinPercent(preset.minPercent);
    setLabels(preset.segmentLabels);
    setActivePreset(preset.id);
  }

  function updateSegments(count: number) {
    const clamped = Math.max(2, Math.min(12, Math.round(count)));
    setSegments(clamped);
    setActivePreset(null);
    setLabels((current) =>
      Array.from(
        { length: clamped },
        (_, index) => current[index] ?? `Segment ${index + 1}`,
      ),
    );
  }

  const preset = SEGMENT_PRESETS.find((p) => p.id === activePreset);
  const rows = Array.from({ length: segments }, (_, index) => ({
    index,
    label: labels[index] ?? `Segment ${index + 1}`,
  }));

  return (
    <ModulePage
      title="Who do I need to recruit?"
      currentN={sampleSize}
      method="Demographic segment planner"
      intro={
        <>
          <p>
            A total sample size is not a recruitment plan. This turns your n into a
            target per segment — sex, age band, or skin tone — and tells you before you
            start whether that target is reachable at all.
          </p>
          <p className="flex gap-2 rounded-lg border border-hairline bg-surface p-3 text-sm">
            <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-series-1" />
            <span>
              <strong className="font-semibold">Cap the maximum, not just the
              minimum.</strong>{' '}
              Recruiting is easiest in the commonest segment and hardest in the rarest.
              Set only a floor and the easy segments fill first, the total is met, and
              the rare segment is still short — with no budget left to fix it. The cap
              is what reserves room for the segment you will struggle to fill.
            </span>
          </p>
        </>
      }
      assumption={
        <>
          every participant falls into exactly one segment, and segments are planned
          independently. Where you need balance across two attributes at once — sex{' '}
          <em>and</em> skin tone — the binding constraint is the rarest combination,
          not the rarest single category, and that needs more people than this shows.
        </>
      }
      controls={
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-ink-secondary">Presets</legend>
            <div className="flex flex-col gap-1.5">
              {SEGMENT_PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={activePreset === item.id}
                  onClick={() => applyPreset(item)}
                  className={`rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                    activePreset === item.id
                      ? 'border-series-1 bg-series-1/10 text-series-1'
                      : 'border-hairline text-ink-secondary hover:bg-ink/5'
                  }`}
                >
                  {item.factor}
                </button>
              ))}
            </div>
          </fieldset>

          <NumberField
            label="Target sample size"
            value={sampleSize}
            onChange={(value) => {
              setSampleSize(value);
              setActivePreset(null);
            }}
            min={1}
            step={5}
          />
          <NumberField
            label="Segments in this factor"
            value={segments}
            onChange={updateSegments}
            min={2}
            max={12}
            step={1}
          />
          <NumberField
            label="Minimum in the rarest segment"
            value={minPercent}
            onChange={(value) => {
              setMinPercent(value);
              setActivePreset(null);
            }}
            min={1}
            max={100}
            step={1}
            suffix="%"
          />
        </>
      }
    >
      {preset?.note && (
        <p className="flex gap-2 rounded-lg border border-hairline bg-surface p-4 text-sm leading-relaxed text-ink-secondary">
          <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-series-1" />
          <span>{preset.note}</span>
        </p>
      )}

      {plan === null ? (
        <p className="rounded-lg border border-hairline bg-surface p-4 text-sm text-ink-secondary">
          Enter a sample size of at least 1, two or more segments, and a minimum between
          1% and 100%.
        </p>
      ) : (
        <>
          {!plan.feasible && (
            <p className="flex gap-2 rounded-lg border border-critical/40 bg-critical/5 p-4 text-sm leading-relaxed">
              <AlertTriangle
                size={16}
                aria-hidden
                className="mt-0.5 shrink-0 text-critical"
              />
              <span>
                <strong className="font-semibold">This plan is not feasible.</strong>{' '}
                {plan.minRequiredTotal > plan.sampleSize ? (
                  <>
                    A {plan.minPercent}% floor across {plan.segments} segments needs at
                    least {plan.minRequiredTotal} subjects, more than your target of{' '}
                    {plan.sampleSize}. Lower the floor or raise the sample size.
                  </>
                ) : (
                  <>
                    Rounding leaves the caps unable to reach your total: {plan.segments}{' '}
                    segments capped at {plan.maxSubjects} allow only{' '}
                    {plan.maxAchievableTotal}. Hit the minimum in every segment before
                    exceeding the cap in any of them.
                  </>
                )}
              </span>
            </p>
          )}

          <section aria-labelledby="plan-table">
            <h2
              id="plan-table"
              className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
            >
              Recruitment targets per segment
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-hairline bg-surface">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Minimum and maximum subjects per demographic segment
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border-b border-hairline px-4 py-2 text-left font-medium text-ink-muted"
                    >
                      Segment
                    </th>
                    <th
                      scope="col"
                      className="border-b border-hairline px-4 py-2 text-right font-medium text-ink-muted"
                    >
                      Min (n)
                    </th>
                    <th
                      scope="col"
                      className="border-b border-hairline px-4 py-2 text-right font-medium text-ink-muted"
                    >
                      Max (n)
                    </th>
                    <th
                      scope="col"
                      className="border-b border-hairline px-4 py-2 text-right font-medium text-ink-muted"
                    >
                      Min (%)
                    </th>
                    <th
                      scope="col"
                      className="border-b border-hairline px-4 py-2 text-right font-medium text-ink-muted"
                    >
                      Max (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.index}
                      className="border-b border-hairline last:border-0"
                    >
                      <td className="px-4 py-2">
                        <input
                          aria-label={`Label for segment ${row.index + 1}`}
                          value={row.label}
                          onChange={(event) =>
                            setLabels((current) => {
                              const next = [...current];
                              next[row.index] = event.target.value;
                              return next;
                            })
                          }
                          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-hairline focus:border-hairline"
                        />
                      </td>
                      <td className="tabular px-4 py-2 text-right font-medium">
                        {plan.minSubjects}
                      </td>
                      <td className="tabular px-4 py-2 text-right font-medium">
                        {plan.maxSubjects}
                      </td>
                      <td className="tabular px-4 py-2 text-right text-ink-secondary">
                        {plan.minPercent}
                      </td>
                      <td className="tabular px-4 py-2 text-right text-ink-secondary">
                        {Math.ceil(plan.maxPercent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Floors round up and caps round down — both err toward a stricter plan,
              never toward one that looks satisfiable but is not.
            </p>
          </section>

          <section className="max-w-3xl text-sm leading-relaxed text-ink-secondary">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Method
            </h2>
            <p className="mt-3">
              To guarantee the rarest segment reaches its floor, everything else has to
              fit in what remains. Sharing that remainder equally across the{' '}
              {plan.segments === 2
                ? 'one other segment'
                : `other ${plan.segments - 1} segments`}{' '}
              gives the cap:
            </p>
            <p className="tabular mt-2 rounded-lg border border-hairline bg-surface p-3 text-ink">
              max% = (100 − {plan.minPercent}) / ({plan.segments} − 1) ={' '}
              {plan.maxPercent.toFixed(1)}%
            </p>
            <p className="mt-3">
              With every other segment at its cap, exactly {plan.minPercent}% is left
              over — which is the floor, reachable by construction.
            </p>
          </section>
        </>
      )}

      {/* Companion Ecosystem: Health Data Distributions */}
      <section className="rounded-xl border border-hairline bg-surface p-4 text-xs leading-relaxed text-ink-secondary">
        <p>
          <strong className="text-ink">Need empirical population distributions?</strong>{' '}
          Browse stratified percentiles across sex, age brackets, and Monk skin tone categories
          derived from CDC NHANES and SCIN datasets at{' '}
          <a
            href="https://ross-wilkinson.github.io/health-data-distributions/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-series-1 underline underline-offset-2 hover:opacity-80"
          >
            Health Data Distributions ↗
          </a>
          .
        </p>
      </section>

      <NextSteps
        offer={{ n: sampleSize, source: 'recruitment plan' }}
        steps={[
          {
            to: '/repeated-measures',
            title: 'Design for repeated measures',
            description:
              'Evaluate within-subject designs and trade off participants vs replicates.',
          },
          {
            to: '/timeline',
            title: 'How long will it take?',
            description:
              'Recruiting the rarest segment is usually what sets the schedule.',
          },
          {
            to: '/precision',
            title: 'How precise will my study be?',
            description: 'Check this total still delivers the precision you need.',
          },
        ]}
      />
    </ModulePage>
  );
}
