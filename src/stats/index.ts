/**
 * The statistics core.
 *
 * Pure, typed, UI-free. Nothing in this directory imports React or touches the
 * DOM, which is what lets every function be verified against SciPy in
 * isolation — see `__fixtures__/` and the `*.test.ts` files beside each module.
 *
 * Namespaced rather than flattened, because `normal.cdf` and `studentT.cdf`
 * are different functions and a flat `cdf` export would make call sites
 * ambiguous at a glance.
 */

export * as normal from './normal.ts';
export * as studentT from './studentT.ts';
export * as halfNormal from './halfNormal.ts';
export * as poisson from './poisson.ts';
export * as nonCentralT from './nonCentralT.ts';
export * as special from './special.ts';

export { bracketRoot, invertCdf, solveMonotonic } from './rootFind.ts';
export type { Bracket, BracketOptions } from './rootFind.ts';
