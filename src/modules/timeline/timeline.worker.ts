/// <reference lib="webworker" />

/**
 * Web Worker wrapper around `simulateTimeline`.
 *
 * The simulation is a tight loop over `iterations * phases` draws. At 100,000
 * iterations that is hundreds of thousands of gamma rejections, which on the
 * main thread blocks paint and input for long enough to feel broken — the
 * slider stops tracking the pointer mid-drag.
 *
 * The worker imports the same `simulateTimeline` the tests call directly, so
 * there is no second copy of the model that could drift. This file is only
 * transport: receive input, run, post the result back.
 */

import {
  simulateTimeline,
  type TimelineInput,
  type TimelineResult,
} from './timelineModel.ts';

export interface WorkerRequest {
  /** Echoed back so the UI can discard results from superseded runs. */
  requestId: number;
  input: TimelineInput;
}

export type WorkerResponse =
  | { requestId: number; ok: true; result: TimelineResult }
  | { requestId: number; ok: false; error: string };

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { requestId, input } = event.data;
  try {
    const result = simulateTimeline(input);
    const response: WorkerResponse = { requestId, ok: true, result };
    self.postMessage(response);
  } catch (error) {
    // A worker that throws dies silently and leaves the UI spinning forever.
    // Failing back across the wire keeps the error visible.
    const response: WorkerResponse = {
      requestId,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};
