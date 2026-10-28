import { Compass } from 'lucide-react';
import { ACADEMY_MODULES } from '../academyData.ts';

interface CurriculumRoadmapProps {
  onSelectModule: (moduleId: string) => void;
  selectedModuleId?: string | null;
}

export function CurriculumRoadmap({
  onSelectModule,
  selectedModuleId,
}: CurriculumRoadmapProps) {
  const phases = [
    {
      phaseName: 'Phase 1: Rapid Prototyping & Algorithmic Sizing',
      modules: [ACADEMY_MODULES[0]!, ACADEMY_MODULES[1]!],
    },
    {
      phaseName: 'Phase 2: Clinical Trials & Demographic Compliance',
      modules: [ACADEMY_MODULES[2]!, ACADEMY_MODULES[3]!],
    },
    {
      phaseName: 'Phase 3: Stress Testing & Rare Event Governance',
      modules: [ACADEMY_MODULES[4]!, ACADEMY_MODULES[5]!],
    },
    {
      phaseName: 'Phase 4: Commercial Launch & Multi-Generation Legacy',
      modules: [ACADEMY_MODULES[6]!, ACADEMY_MODULES[7]!],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Lifecycle Architecture
          </span>
          <h3 className="text-lg font-bold text-ink">
            The Meridian Biosystems Product Journey
          </h3>
        </div>
        <span className="text-xs text-ink-muted">8 Interactive Validation Modules</span>
      </div>

      <div className="grid gap-6">
        {phases.map((phase, pIdx) => (
          <div key={pIdx} className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-series-1">
              {phase.phaseName}
            </span>

            <div className="grid gap-4 md:grid-cols-2">
              {phase.modules.map((module) => {
                const isSelected = selectedModuleId === module.id;
                return (
                  <div
                    key={module.id}
                    className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                      isSelected
                        ? 'border-series-1 bg-series-1/10 shadow-sm'
                        : 'border-hairline bg-surface hover:border-ink/20 hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-plane px-2 py-0.5 text-xs font-bold text-ink border border-hairline">
                          {module.actRoman}
                        </span>
                        <span className="text-[11px] font-mono text-ink-muted">
                          {module.estimatedMinutes} min
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-ink">{module.title}</h4>
                      <p className="text-xs text-series-1 font-semibold">{module.subtitle}</p>
                      <p className="text-xs text-ink-secondary leading-relaxed line-clamp-2">
                        {module.narrativeScenario}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                      <button
                        type="button"
                        onClick={() => onSelectModule(module.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-plane hover:opacity-90 transition-opacity"
                      >
                        <Compass size={13} />
                        <span>Launch Canvas</span>
                      </button>

                      <span className="text-[11px] text-ink-muted">{module.lifecycleStage.split(':')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
