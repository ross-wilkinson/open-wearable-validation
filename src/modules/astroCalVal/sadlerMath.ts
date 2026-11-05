import type { PipelineKey } from './showcaseData.ts';

export type CensoringRegime = 'uncensored' | 'all_retained' | 'both_excluded' | 'either_excluded';

export interface CensoringRegimeMeta {
  key: CensoringRegime;
  shortLabel: string;
  sadlerPanel: string;
  title: string;
  takeaway: string;
}

export const CENSORING_REGIMES: CensoringRegimeMeta[] = [
  {
    key: 'all_retained',
    shortLabel: '1. Clipped (All Retained)',
    sadlerPanel: 'Sadler (2019) Fig. 2(b)',
    title: 'Floor-Clipped Data — All Observations Retained',
    takeaway:
      'Clamping negative redshift estimates at the physical floor creates a sharp diagonal boundary, artificially depresses standard deviation, and pulls mean bias upward near the floor.',
  },
  {
    key: 'both_excluded',
    shortLabel: '2. Exclude Both Clipped',
    sadlerPanel: 'Sadler (2019) Fig. 2(c)',
    title: 'Floor-Clipped Data — Exclude Pairs Where Both Values Hit Floor',
    takeaway:
      'Removing only double-clipped pairs leaves single-method floor clipping untouched; the spurious upward bias hook and depressed standard deviation remain.',
  },
  {
    key: 'either_excluded',
    shortLabel: '3. Exclude Either Clipped',
    sadlerPanel: 'Sadler (2019) Fig. 2(d)',
    title: 'Floor-Clipped Data — Exclude Pairs Where Either Value Hits Floor',
    takeaway:
      'Counterintuitively, deleting every clipped observation still leaves strong positive bias and depressed standard deviation because truncation removes only the lower tail of the noise cloud.',
  },
  {
    key: 'uncensored',
    shortLabel: '4. Uncensored (True Cloud)',
    sadlerPanel: 'Sadler (2019) Fig. 2(a)',
    title: 'Uncensored Signed Output — No Artificial Floor Clamping',
    takeaway:
      'Allowing signed noise fluctuations below the floor (or restricting analysis above the 2.5×SD hazard zone) restores symmetric scatter, true standard deviation, and flat zero bias.',
  },
];

export interface SadlerCensoringBin {
  uCenter: number;
  biasA: number;
  sdA: number;
  trueSdA: number;
  biasB: number;
  sdB: number;
  trueSdB: number;
  clippedPctA: number;
}

export interface SadlerCensoringScatterPoint {
  u: number;
  diff: number;
  isClipped: boolean;
}

/**
 * Deterministic Gaussian PRNG (Mulberry32 + Box-Muller) so Sadler (2019)
 * 4-regime censoring curves and scatter clouds are 100% reproducible.
 */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleNormal(rng: () => number): number {
  const u1 = Math.max(1e-9, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Computes the Sadler (2019) Figs. 1, 2(a-d), and 3 bin curves and low-end
 * Bland-Altman scatter cloud for the selected censoring regime.
 */
export function computeSadlerCensoringData(
  regime: CensoringRegime,
  pipeline: PipelineKey,
): {
  bins: SadlerCensoringBin[];
  scatter: SadlerCensoringScatterPoint[];
  floorLoD: number;
  hazardZoneUpper: number;
} {
  const floorLoD = 0.05;
  // Pipeline A has a higher low-z noise floor (sigma_Y = 0.038) vs reference (sigma_X = 0.010).
  // Pipeline B has tighter low-z noise (sigma_Y = 0.019) and outputs uncensored estimates by design.
  const sigmaX = 0.010;
  const sigmaYA = 0.038;
  const sigmaYB = 0.019;
  const trueSdA = Math.sqrt(sigmaX * sigmaX + sigmaYA * sigmaYA);
  const trueSdB = Math.sqrt(sigmaX * sigmaX + sigmaYB * sigmaYB);
  const hazardZoneUpper =
    pipeline === 'a' ? floorLoD + 2.5 * trueSdA : floorLoD + 2.5 * trueSdB;

  const binCenters = [0.055, 0.075, 0.10, 0.13, 0.16, 0.20, 0.25, 0.30, 0.36, 0.43, 0.50, 0.58];
  const nPerBin = 350;
  const rng = createRng(201904);

  const bins: SadlerCensoringBin[] = binCenters.map((targetZ) => {
    const diffsA: number[] = [];
    const diffsB: number[] = [];
    let clippedCountA = 0;

    for (let i = 0; i < nPerBin; i++) {
      const zX = sampleNormal(rng);
      const zY = sampleNormal(rng);
      const rawX = targetZ + sigmaX * zX;
      const rawYA = targetZ + sigmaYA * zY;
      const rawYB = targetZ + sigmaYB * zY;

      const xClipped = rawX <= floorLoD;
      const yAClipped = rawYA <= floorLoD;
      if (yAClipped) clippedCountA++;

      // Pipeline A under selected censoring regime
      let keepA = true;
      let valXA = rawX;
      let valYA = rawYA;
      if (regime !== 'uncensored') {
        valXA = Math.max(floorLoD, rawX);
        valYA = Math.max(floorLoD, rawYA);
        if (regime === 'both_excluded' && xClipped && yAClipped) keepA = false;
        if (regime === 'either_excluded' && (xClipped || yAClipped)) keepA = false;
      }
      if (keepA) {
        diffsA.push(valYA - valXA);
      }

      // Pipeline B outputs uncensored signed values by architecture, or shows mild comparison
      let keepB = true;
      let valXB = rawX;
      let valYB = rawYB;
      const yBClipped = rawYB <= floorLoD;
      if (regime !== 'uncensored' && pipeline === 'b') {
        valXB = Math.max(floorLoD, rawX);
        valYB = Math.max(floorLoD, rawYB);
        if (regime === 'both_excluded' && xClipped && yBClipped) keepB = false;
        if (regime === 'either_excluded' && (xClipped || yBClipped)) keepB = false;
      }
      if (keepB) {
        diffsB.push(valYB - valXB);
      }
    }

    const meanA =
      diffsA.length > 0 ? diffsA.reduce((acc, v) => acc + v, 0) / diffsA.length : 0;
    const varA =
      diffsA.length > 1
        ? diffsA.reduce((acc, v) => acc + (v - meanA) ** 2, 0) / (diffsA.length - 1)
        : 0;

    const meanB =
      diffsB.length > 0 ? diffsB.reduce((acc, v) => acc + v, 0) / diffsB.length : 0;
    const varB =
      diffsB.length > 1
        ? diffsB.reduce((acc, v) => acc + (v - meanB) ** 2, 0) / (diffsB.length - 1)
        : 0;

    return {
      uCenter: Number(targetZ.toFixed(3)),
      biasA: Number(meanA.toFixed(4)),
      sdA: Number(Math.sqrt(varA).toFixed(4)),
      trueSdA: Number(trueSdA.toFixed(4)),
      biasB: Number(meanB.toFixed(4)),
      sdB: Number(Math.sqrt(varB).toFixed(4)),
      trueSdB: Number(trueSdB.toFixed(4)),
      clippedPctA: Number(((clippedCountA / nPerBin) * 100).toFixed(1)),
    };
  });

  // Generate 160 scatter points across low redshift [0.04, 0.38] to show Sadler Fig. 2(a-d)
  const scatterRng = createRng(pipeline === 'a' ? 918273 : 918274);
  const sigmaY = pipeline === 'a' ? sigmaYA : sigmaYB;
  const scatter: SadlerCensoringScatterPoint[] = [];

  for (let i = 0; i < 180; i++) {
    const targetZ = 0.045 + (i / 179) * 0.335;
    const rawX = targetZ + sigmaX * sampleNormal(scatterRng);
    const rawY = targetZ + sigmaY * sampleNormal(scatterRng);
    const xClip = rawX <= floorLoD;
    const yClip = rawY <= floorLoD;

    if (regime === 'both_excluded' && xClip && yClip) continue;
    if (regime === 'either_excluded' && (xClip || yClip)) continue;

    const valX = regime === 'uncensored' ? rawX : Math.max(floorLoD, rawX);
    const valY = regime === 'uncensored' ? rawY : Math.max(floorLoD, rawY);
    const pairMean = 0.5 * (valX + valY);
    const diff = valY - valX;

    scatter.push({
      u: Number(pairMean.toFixed(4)),
      diff: Number(diff.toFixed(4)),
      isClipped: regime !== 'uncensored' && (xClip || yClip),
    });
  }

  return { bins, scatter, floorLoD, hazardZoneUpper };
}

export interface IsoBellCurvePoint {
  y: number;
  nullDensity: number;
  nullAlphaTail: number | null;
  shiftDensity: number;
  shiftBetaTail: number | null;
}

/**
 * Generates the two Gaussian probability density curves (at X = 0 and X = x_D)
 * for the ISO 11843-1 Figure 1 geometric diagram.
 */
export function computeIsoBellCurveData(params: {
  slope: number;
  sigma0: number;
  sigmaD: number;
  yC: number;
  xD: number;
}): IsoBellCurvePoint[] {
  const { slope, sigma0, sigmaD, yC, xD } = params;
  const mu0 = 0;
  const muD = slope * xD;
  const yMin = mu0 - 3.2 * sigma0;
  const yMax = muD + 3.2 * sigmaD;
  const steps = 80;
  const out: IsoBellCurvePoint[] = [];

  const gauss = (y: number, mu: number, s: number) => {
    const z = (y - mu) / Math.max(1e-6, s);
    return Math.exp(-0.5 * z * z) / (Math.max(1e-6, s) * Math.sqrt(2 * Math.PI));
  };

  for (let i = 0; i <= steps; i++) {
    const y = yMin + (i / steps) * (yMax - yMin);
    const d0 = gauss(y, mu0, sigma0);
    const dD = gauss(y, muD, sigmaD);
    out.push({
      y: Number(y.toFixed(4)),
      nullDensity: Number(d0.toFixed(3)),
      nullAlphaTail: y >= yC ? Number(d0.toFixed(3)) : null,
      shiftDensity: Number(dD.toFixed(3)),
      shiftBetaTail: y <= yC ? Number(dD.toFixed(3)) : null,
    });
  }
  return out;
}

export const KPI_ROW_DEFINITIONS: Record<string, string> = {
  pooled_typical:
    'Upper bound of the 95% confidence interval for the median absolute error across all pooled observations.',
  pooled_edge:
    'Upper bound of the 95% confidence interval for the 95th percentile of absolute error across all pooled observations.',
  typical_for_typical:
    'Upper bound of the 95% confidence interval for the median of per-target median absolute errors.',
  typical_for_edge:
    'Upper bound of the 95% confidence interval for the 95th percentile of per-target median absolute errors.',
  edge_for_typical:
    'Upper bound of the 95% confidence interval for the median of per-target 95th percentile absolute errors.',
  edge_for_edge:
    'Upper bound of the 95% confidence interval for the 95th percentile of per-target 95th percentile absolute errors.',
};

