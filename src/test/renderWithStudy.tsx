import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, type RenderOptions } from '@testing-library/react';
import { StudyProvider } from '../app/study/StudyContext.tsx';
import { STORAGE_KEY } from '../app/study/study.ts';

/**
 * Render a module page with the providers it needs at runtime.
 *
 * Module pages read the shared study plan and link between each other, so they
 * need both a StudyProvider and a router. `useStudy` throws outside its
 * provider by design — a page silently reading defaults and dropping every save
 * is a worse failure than a loud one — which means tests have to supply it too.
 *
 * Storage is *not* cleared here. That happens once per test in global setup —
 * clearing at render time defeated `seedStudy`, which necessarily runs first,
 * because the render then wiped the very plan the test had just staged.
 */
export function renderWithStudy(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <StudyProvider>{children}</StudyProvider>
      </MemoryRouter>
    ),
    ...options,
  });
}

/** Seed a stored plan before rendering, for tests about carrying values over. */
export function seedStudy(plan: {
  n?: number | null;
  confidence?: number;
  nSource?: string | null;
}) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      n: null,
      confidence: 0.95,
      measurementSd: null,
      unit: '',
      nSource: null,
      ...plan,
    }),
  );
}
