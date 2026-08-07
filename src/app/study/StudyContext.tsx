import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_STUDY,
  clearStoredStudy,
  hasPlan,
  loadStudy,
  saveStudy,
  type Study,
} from './study.ts';

interface StudyContextValue {
  study: Study;
  /** Merge a partial update into the plan and persist it. */
  updateStudy: (patch: Partial<Study>) => void;
  /** Forget the plan entirely, including what is stored. */
  clearStudy: () => void;
  /** True once the plan carries a sample size. */
  planned: boolean;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser: localStorage is read once on mount rather than on every
  // render, and reading it during render is fine here because it is synchronous
  // and this is a client-only app with no hydration to mismatch against.
  const [study, setStudy] = useState<Study>(loadStudy);

  const updateStudy = useCallback((patch: Partial<Study>) => {
    setStudy((current) => {
      const next = { ...current, ...patch };
      saveStudy(next);
      return next;
    });
  }, []);

  const clearStudy = useCallback(() => {
    clearStoredStudy();
    setStudy(DEFAULT_STUDY);
  }, []);

  const value = useMemo(
    () => ({ study, updateStudy, clearStudy, planned: hasPlan(study) }),
    [study, updateStudy, clearStudy],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const value = useContext(StudyContext);
  if (value === null) {
    // A module rendered outside the provider would otherwise read defaults
    // forever and silently drop every save — worth failing loudly in a test.
    throw new Error('useStudy must be used inside a StudyProvider');
  }
  return value;
}
