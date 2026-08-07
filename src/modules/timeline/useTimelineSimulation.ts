import { useEffect, useMemo, useRef, useState } from 'react';
import {
  simulateTimeline,
  type TimelineInput,
  type TimelineResult,
} from './timelineModel.ts';
import type { WorkerRequest, WorkerResponse } from './timeline.worker.ts';

interface SimulationState {
  result: TimelineResult | null;
  running: boolean;
  error: string | null;
}

interface WorkerState {
  result: TimelineResult | null;
  error: string | null;
  /** Id of the most recent request the worker has answered. */
  completedId: number;
}

/**
 * Run the timeline simulation off the main thread.
 *
 * Three details that matter more than they look:
 *
 * 1. **Stale-result rejection.** Editing a phase fires a new run, and workers
 *    do not guarantee response order. Each request carries an incrementing id,
 *    and responses whose id is not the current one are dropped — otherwise a
 *    slow early run can land after a fast later one and the UI silently shows
 *    the answer to a question the user has already moved on from.
 *
 * 2. **Synchronous fallback.** jsdom has no `Worker`, and neither do some
 *    locked-down browser configurations. Those environments run the same
 *    `simulateTimeline` inline rather than being left with a permanently empty
 *    chart. It is the identical function the worker calls, so the only
 *    difference is which thread it occupies.
 *
 * 3. **Nothing sets state synchronously inside an effect.** The fallback is a
 *    pure computation, so it is a `useMemo`, not effect-assigned state — the
 *    first version wrote it in an effect and `react-hooks/set-state-in-effect`
 *    caught it. `running` is likewise *derived* from comparing the current
 *    request id against the last completed one, rather than being flipped on
 *    by hand before each post. Both changes remove a render pass and, more to
 *    the point, remove a second copy of state that could disagree with the
 *    first.
 */
export function useTimelineSimulation(input: TimelineInput): SimulationState {
  // Captured once: whether `Worker` exists cannot change during a session, and
  // reading it during render keeps the fallback branch stable.
  const [supportsWorker] = useState(() => typeof Worker !== 'undefined');

  const [workerState, setWorkerState] = useState<WorkerState>({
    result: null,
    error: null,
    completedId: 0,
  });

  // Bump a request id whenever the input identity changes. Adjusting state
  // during render (rather than in an effect) is the documented React pattern
  // for deriving state from changed props, and it keeps `running` accurate on
  // the very first render after an edit.
  const [lastInput, setLastInput] = useState(input);
  const [requestId, setRequestId] = useState(1);
  if (input !== lastInput) {
    setLastInput(input);
    setRequestId((current) => current + 1);
  }

  const workerRef = useRef<Worker | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const fallback = useMemo(() => {
    if (supportsWorker) return null;
    try {
      return { result: simulateTimeline(input), error: null };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [input, supportsWorker]);

  useEffect(() => {
    if (!supportsWorker) return;

    const worker = new Worker(new URL('./timeline.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      // Stale-rejection via the functional updater rather than a ref holding
      // the live request id. Reading a ref written during render is exactly
      // what `react-hooks/refs` objects to, and comparing against the last id
      // we actually accepted is the more direct statement of the rule anyway:
      // never move backwards.
      setWorkerState((current) =>
        message.requestId < current.completedId
          ? current
          : message.ok
            ? { result: message.result, error: null, completedId: message.requestId }
            : { result: null, error: message.error, completedId: message.requestId },
      );
    };

    worker.onerror = (event) => {
      // A worker that dies silently leaves the UI spinning forever. This is
      // separate from per-request errors: the worker is gone, so no id will
      // ever complete and `running` has to be short-circuited.
      setFatalError(event.message || 'The simulation worker failed to start.');
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [supportsWorker]);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;
    const request: WorkerRequest = { requestId, input };
    worker.postMessage(request);
  }, [requestId, input]);

  if (fallback) {
    return { result: fallback.result, running: false, error: fallback.error };
  }

  if (fatalError) {
    return { result: null, running: false, error: fatalError };
  }

  return {
    result: workerState.result,
    error: workerState.error,
    running: workerState.completedId !== requestId,
  };
}
