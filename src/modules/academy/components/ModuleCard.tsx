import { ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type AcademyModule } from '../academyData.ts';

interface ModuleCardProps {
  module: AcademyModule;
  onLaunchWalkthrough: (moduleId: string) => void;
}

export function ModuleCard({ module, onLaunchWalkthrough }: ModuleCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onLaunchWalkthrough(module.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLaunchWalkthrough(module.id);
        }
      }}
      className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-2xs transition-all hover:border-ink/25 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink text-left"
    >
      <div className="space-y-3">
        {/* Header Tags */}
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-ink/10 px-2.5 py-0.5 text-xs font-bold text-ink">
            {module.actRoman}
          </span>
          <span className="text-[11px] font-medium text-ink-muted">
            {module.estimatedMinutes} min walkthrough
          </span>
        </div>

        {/* Title & Lifecycle */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            {module.lifecycleStage}
          </span>
          <h3 className="mt-1 text-base font-bold tracking-tight text-ink sm:text-lg group-hover:text-ink">
            {module.title}
          </h3>
          <p className="text-xs font-medium text-ink-secondary mt-0.5">{module.subtitle}</p>
        </div>

        {/* Narrative Teaser */}
        <p className="text-xs leading-relaxed text-ink-secondary line-clamp-3">
          {module.narrativeScenario}
        </p>

        {/* Key takeaway highlight */}
        <div className="rounded-xl border border-hairline bg-plane/60 p-3 text-[11px] leading-relaxed text-ink-secondary">
          <strong className="text-ink">Key Takeaway:</strong> {module.keyTakeaway}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4 gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-plane transition-opacity group-hover:opacity-90">
          <Compass size={14} />
          <span>Interactive Tour</span>
        </span>

        <Link
          to={module.interactiveToolRoute}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline p-1"
        >
          <span>Deep Tool</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
