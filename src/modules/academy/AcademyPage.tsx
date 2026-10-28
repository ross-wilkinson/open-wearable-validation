import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ACADEMY_MODULES } from './academyData.ts';
import { ModuleCard } from './components/ModuleCard.tsx';
import { CurriculumRoadmap } from './components/CurriculumRoadmap.tsx';
import { WalkthroughCanvas } from './components/WalkthroughCanvas.tsx';
import { MeridianLogo } from '../../components/brand/MeridianLogo.tsx';
import { HardwareChangeMatrix } from '../../components/brand/HardwareChangeMatrix.tsx';
import { PulseBandHardwareGraphic } from '../../components/brand/PulseBandHardwareGraphic.tsx';
import NextSteps from '../../app/study/NextSteps.tsx';

type AcademyTab = 'modules' | 'roadmap' | 'walkthrough' | 'matrix';

export default function AcademyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleParam = searchParams.get('module') ?? searchParams.get('act');
  const tabParam = searchParams.get('tab') as AcademyTab | null;

  // Derive directly from URL search params — no redundant effect or state
  const activeTab: AcademyTab = tabParam ?? (moduleParam ? 'walkthrough' : 'modules');
  const selectedModuleId = moduleParam ?? ACADEMY_MODULES[0]!.id;
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedModule =
    ACADEMY_MODULES.find(
      (m) =>
        m.id === selectedModuleId ||
        m.id.replace('act-', 'module-') === selectedModuleId ||
        m.id.replace('module-', 'act-') === selectedModuleId ||
        String(m.actNumber) === selectedModuleId,
    ) ?? ACADEMY_MODULES[0]!;

  function handleSelectModule(id: string) {
    setSearchParams({ module: id, tab: 'walkthrough' });
  }

  function handleTabChange(tab: AcademyTab) {
    setSearchParams({ module: selectedModuleId, tab });
  }

  const filteredModules =
    categoryFilter === 'all'
      ? ACADEMY_MODULES
      : ACADEMY_MODULES.filter((m) => m.category === categoryFilter);

  return (
    <div className="flex flex-col gap-10">
      {/* Academy Hero Banner */}
      <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-9 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                VALIDATION ACADEMY
              </span>
              <span className="text-xs text-ink-muted">
                Interactive 8-Module Curriculum
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              The Validation Academy: Mastering Wearable Clinical Studies
            </h1>

            <p className="text-base leading-relaxed text-ink-secondary">
              Step into the role of <strong>Lead Validation Scientist</strong> at{' '}
              <strong className="text-ink">Meridian Biosystems</strong>. Guide the executive committee,
              hardware engineers, and clinical teams through the complete product development lifecycle
              of the next-generation <strong>Meridian PulseBand 2</strong>—from initial rapid prototype screens
              to FDA 510(k) demographic quotas, edge-case cadence lock provocation, and multi-year indirect transitive bridges.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSelectModule(ACADEMY_MODULES[0]!.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-plane shadow-sm transition-opacity hover:opacity-90"
              >
                <Compass size={15} />
                <span>Begin Module 1 Walkthrough</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('matrix')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-plane px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-ink/5"
              >
                <Layers size={15} />
                <span>Explore Decision Matrix</span>
              </button>
            </div>
          </div>

          {/* Meridian Corporate Badge Spotlight */}
          <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-plane p-5 lg:w-72 shrink-0">
            <MeridianLogo size={36} showText subtitle="FICTIONAL WEARABLE OEM" />
            <div className="border-t border-hairline pt-3 space-y-1.5 text-xs text-ink-secondary">
              <div className="flex justify-between">
                <span className="text-ink-muted">Device:</span>
                <span className="font-semibold text-ink">PulseBand 2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Sensor Stack:</span>
                <span className="font-semibold text-ink">530nm / 660nm / 940nm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Standard:</span>
                <span className="font-semibold text-ink">ISO 80601-2-61</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Phase 1 Pre-Market</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominently Featured Hardware Architecture Spotlight */}
      <section aria-label="Meridian PulseBand 2 Hardware Architecture">
        <PulseBandHardwareGraphic mode="interactive" />
      </section>

      {/* Main Tab Controls */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('modules')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'modules'
                  ? 'bg-ink text-plane shadow-sm'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <BookOpen size={14} />
              <span>All 8 Modules</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('roadmap')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-ink text-plane shadow-sm'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <Compass size={14} />
              <span>Curriculum Roadmap</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('walkthrough')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'walkthrough'
                  ? 'bg-ink text-plane shadow-sm'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <Sparkles size={14} />
              <span>Walkthrough Canvas ({selectedModule.actRoman})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('matrix')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'matrix'
                  ? 'bg-ink text-plane shadow-sm'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <Layers size={14} />
              <span>Hardware Change Matrix</span>
            </button>
          </div>

          {activeTab === 'modules' && (
            <div className="flex items-center gap-1">
              {['all', 'prototyping', 'sizing', 'operations', 'governance'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs capitalize transition-colors ${
                    categoryFilter === cat
                      ? 'bg-series-1/10 text-series-1 font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: ALL MODULES GRID */}
        {activeTab === 'modules' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onLaunchWalkthrough={handleSelectModule}
              />
            ))}
          </div>
        )}

        {/* TAB 2: ROADMAP VIEW */}
        {activeTab === 'roadmap' && (
          <CurriculumRoadmap
            onSelectModule={handleSelectModule}
            selectedModuleId={selectedModuleId}
          />
        )}

        {/* TAB 3: ACTIVE WALKTHROUGH CANVAS */}
        {activeTab === 'walkthrough' && (
          <WalkthroughCanvas
            module={selectedModule}
            onBackToRoadmap={() => handleTabChange('roadmap')}
            onSelectModule={handleSelectModule}
          />
        )}

        {/* TAB 4: HARDWARE CHANGE MATRIX */}
        {activeTab === 'matrix' && <HardwareChangeMatrix />}
      </section>

      <NextSteps
        steps={[
          {
            to: '/agreement',
            title: 'Protocol Studio: Study Design & Sizing',
            description:
              'Put Academy methods into practice: calculate sample sizes, repeated-measures ANOVA, and demographic quotas.',
          },
          {
            to: '/report-studio',
            title: 'Report Studio: Launch Gates & Scorecards',
            description:
              'Evaluate candidate sensors against predecessor benchmarks using 4-quadrant decision matrices.',
          },
        ]}
      />
    </div>
  );
}
