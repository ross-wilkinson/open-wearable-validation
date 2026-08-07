import type { ReactNode } from 'react';

interface ModulePageProps {
  title: string;
  intro: ReactNode;
  /** Controls column. Sticky on wide screens, stacked above on narrow ones. */
  controls: ReactNode;
  children: ReactNode;
}

/**
 * Shared two-column layout for every calculator module: controls on the left,
 * results on the right, stacking to a single column below `lg`.
 *
 * The controls column comes first in the DOM as well as visually, so tab order
 * and screen-reader order both follow the actual workflow — set the inputs,
 * then read the outputs.
 */
export default function ModulePage({
  title,
  intro,
  controls,
  children,
}: ModulePageProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <div className="mt-3 flex flex-col gap-3 leading-relaxed text-ink-secondary">
          {intro}
        </div>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-72">
          <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface p-5">
            {controls}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-8">{children}</div>
      </div>
    </div>
  );
}
