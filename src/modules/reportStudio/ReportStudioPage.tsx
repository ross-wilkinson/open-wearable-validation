import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Compass,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Layers,
  ShieldAlert,
  Sparkles,
  Split,
  X,
} from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import DataTable from '../../components/common/DataTable.tsx';
import type { TableColumn } from '../../components/common/DataTable.tsx';
import NextSteps from '../../app/study/NextSteps.tsx';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { BLAND_ALTMAN_1986, BLAND_ALTMAN_2007, ZOU_2013 } from '../../content/citations.ts';
import {
  DEFAULT_TRANSITIVE_DRIFT_GENERATIONS,
  KPI_TAXONOMY_DEFINITIONS,
  QUADRANT_CANDIDATE_PRESETS,
  REPORT_STUDIO_PRESETS,
  classifyQuadrant,
  computeAgreementMetrics,
  computeHeadToHeadDominance,
  computeKsPseudoreplicationDiagnostic,
  computePearsonR,
  computeSubjectWeightedEcdf,
  computeSurvivalCurve,
  computeTransitiveDriftCanary,
  detectEcdfCrossover,
  generateCitableMethodsParagraph,
  generateConfidenceEllipse,
  generateExecutiveScorecard,
  generateFdaTable1Markdown,
  generateLaunchBriefingMarkdown,
  generatePlxJsonSummary,
  generateStandaloneHtmlReport,
  generateSyntheticPairedData,
  generateThreeWayPairedData,
  type PairedObservation,
  type QuadrantCandidatePreset,
  type SubjectHeadToHeadDominance,
  type SurvivalPoint,
  type ThreeWayPairedObservation,
  type TransitiveDriftGeneration,
} from './reportStudioModel.ts';

const PRESET_OPTIONS = REPORT_STUDIO_PRESETS.map((p) => ({
  value: p.id,
  label: p.name,
}));

const LENS_OPTIONS = [
  { value: 'all', label: 'All Stakeholders (Consolidated)' },
  { value: 'product', label: 'Product & Executive Lens' },
  { value: 'engineering', label: 'Algorithm & Engineering Lens' },
  { value: 'clinical', label: 'Clinical & Regulatory Lens' },
] as const;

export type ReportVectorId = 'all' | 'vector1' | 'vector2' | 'vector3' | 'vector4' | 'vector5';

interface VectorPageMeta {
  eyebrow: string;
  accent: 'series-1' | 'series-2' | 'series-3' | 'series-4' | 'series-5' | 'series-7';
  method: string;
  title: string;
  intro: ReactNode;
  assumption: string;
}

export const VECTOR_PAGE_META: Record<ReportVectorId, VectorPageMeta> = {
  all: {
    eyebrow: 'REPORT STUDIO',
    accent: 'series-2',
    method: 'Validation Reporting & Evidence Synthesis',
    title: 'How do I present and report validation findings?',
    intro: (
      <>
        <p>
          Presenting validation results across cross-functional leadership (Product, Algorithm
          Engineering, and Clinical &amp; Regulatory) requires bridging high-level commercial gating
          with the rigorous hierarchical data-generating process.
        </p>
        <p>
          Validation reporting centers around five core reporting areas:
          KPI &amp; Metric Taxonomy, Error Distributions &amp; Curve Comparison, Three-Way Head-to-Head Dominance,
          the Two-Gate Commercial Launch Plane, and Firmware Drift Canary Tracking.
        </p>
      </>
    ),
    assumption:
      'Paired repeated observations are clustered within human participants. Between-subject trait variance and within-subject sensor noise are decomposed via random-effects models.',
  },
  vector1: {
    eyebrow: 'REPORT STUDIO • METRICS & KPIS',
    accent: 'series-1',
    method: 'Accuracy Metrics & Reporting Standards',
    title: 'Recommended Accuracy Metrics & KPI Standards',
    intro: (
      <p>
        Evaluating continuous physiological sensor error across RMSE, MAE, Bland-Altman Limits of Agreement, and ISO 80601-2-61 Arms.
      </p>
    ),
    assumption:
      'Evaluations assume repeated measures across human participants. Quadratic metrics (RMSE, Arms) heavily penalize intermittent motion outliers compared to linear summaries (MAE).',
  },
  vector2: {
    eyebrow: 'REPORT STUDIO • ERROR DISTRIBUTIONS',
    accent: 'series-2',
    method: 'Distribution Curves & Repeated Measures',
    title: 'Subject-Weighted Error Distributions & Morphology',
    intro: (
      <p>
        Evaluating empirical error distributions, subject-weighted envelopes, and morphology crossover points across the physiological range.
      </p>
    ),
    assumption:
      'Repeated observations within each subject are correlated (non-zero ICC). Subject-level envelopes prevent heavily sampled individuals from skewing reported coverage.',
  },
  vector3: {
    eyebrow: 'REPORT STUDIO • HEAD-TO-HEAD COMPARISON',
    accent: 'series-3',
    method: 'Synchronized Paired Difference Analysis',
    title: 'Head-to-Head Algorithm Dominance: Comparing Two Devices Against ECG',
    intro: (
      <p>
        Overcoming the pairing discard fallacy by evaluating synchronized error differences (Δ = |e1| - |e2|) with clinical indifference margins (τ) to determine participant win counts.
      </p>
    ),
    assumption:
      'Device 1, Device 2, and the reference were collected synchronously on the exact same heartbeats. Deltas within the clinical indifference margin (τ) represent clinical equivalence.',
  },
  vector4: {
    eyebrow: 'REPORT STUDIO • COMMERCIAL LAUNCH PLANE',
    accent: 'series-4',
    method: 'Release Governance & Risk Balancing',
    title: 'The Two-Gate Commercial Launch Matrix',
    intro: (
      <p>
        Balancing Gate 1 (Absolute Clinical Safety) against Gate 2 (Predecessor Parity) across the 4-quadrant decision plane to avoid shipping regression traps.
      </p>
    ),
    assumption:
      'Gate 1 enforces absolute clinical safety thresholds. Gate 2 enforces non-inferiority against legacy production firmware to protect existing user experience.',
  },
  vector5: {
    eyebrow: 'REPORT STUDIO • SOFTWARE EVOLUTION',
    accent: 'series-5',
    method: 'Multi-Generation Transitive Canary Testing',
    title: 'Catching Silent Algorithmic Drift Across Firmware Generations',
    intro: (
      <p>
        Detecting creeping performance degradation across firmware iterations (1 -&gt; 2 -&gt; 3) before cumulative drift reaches customers.
      </p>
    ),
    assumption:
      'Transitive network comparisons assume bridge studies maintain consistent protocol provocations and representative participant cohorts across firmware generations.',
  },
};

export default function ReportStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const vectorQuery = searchParams.get('vector');
  const selectedVector: ReportVectorId =
    vectorQuery === 'vector1' ||
    vectorQuery === 'vector2' ||
    vectorQuery === 'vector3' ||
    vectorQuery === 'vector4' ||
    vectorQuery === 'vector5'
      ? vectorQuery
      : 'all';

  const [selectedPresetId, setSelectedPresetId] = useState<string>('spo2');
  const [activeLens, setActiveLens] = useState<'all' | 'product' | 'engineering' | 'clinical'>('all');
  const [blandAltmanView, setBlandAltmanView] = useState<'all' | 'centroids'>('all');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  function handleSelectVector(vec: ReportVectorId) {
    const nextParams = new URLSearchParams(searchParams);
    if (vec === 'all') {
      nextParams.delete('vector');
    } else {
      nextParams.set('vector', vec);
    }
    setSearchParams(nextParams, { replace: true });
  }

  // Active preset configuration
  const currentPreset = useMemo(
    () => REPORT_STUDIO_PRESETS.find((p) => p.id === selectedPresetId) ?? REPORT_STUDIO_PRESETS[0]!,
    [selectedPresetId],
  );

  // Editable parameters
  const [m, setM] = useState<number>(() => currentPreset.defaultM);
  const [k, setK] = useState<number>(() => currentPreset.defaultK);
  const [bias, setBias] = useState<number>(() => currentPreset.defaultBias);
  const [sdB, setSdB] = useState<number>(() => currentPreset.defaultSdB);
  const [sdW, setSdW] = useState<number>(() => currentPreset.defaultSdW);
  const [toleranceWindow, setToleranceWindow] = useState<number>(() => currentPreset.toleranceWindow);
  const [outlierRate, setOutlierRate] = useState<number>(() => currentPreset.defaultOutlierRate);

  // Handle switching preset
  function handlePresetChange(presetId: string) {
    const p = REPORT_STUDIO_PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setSelectedPresetId(presetId);
    setM(p.defaultM);
    setK(p.defaultK);
    setBias(p.defaultBias);
    setSdB(p.defaultSdB);
    setSdW(p.defaultSdW);
    setToleranceWindow(p.toleranceWindow);
    setOutlierRate(p.defaultOutlierRate);
  }

  // Vector 3 State: Three-Way Head-to-Head Dominance
  const [h2hActivity, setH2hActivity] = useState<'running' | 'cycling' | 'rest'>('running');
  const [h2hTieMargin, setH2hTieMargin] = useState<number>(3.0);
  const [h2hCliffsThreshold, setH2hCliffsThreshold] = useState<number>(0.15);

  // Vector 4 State: 4-Quadrant Visualizer
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('ideal-launch');
  const [candGate1Margin, setCandGate1Margin] = useState<number>(0.45);
  const [candGate2Parity, setCandGate2Parity] = useState<number>(0.4);
  const [candSeX, setCandSeX] = useState<number>(0.08);
  const [candSeY, setCandSeY] = useState<number>(0.07);
  const [candRXY, setCandRXY] = useState<number>(0.35);
  const [briefingCopyFeedback, setBriefingCopyFeedback] = useState<string | null>(null);

  // Vector 5 State: Transitive Drift Canary
  const [canaryLimit, setCanaryLimit] = useState<number>(0.75);

  // Secondary [Export Report ▾] Dropdown & Modal State
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [activeExportModal, setActiveExportModal] = useState<'brief' | 'fdaTable1' | 'methods' | null>(null);
  const [exportModalContent, setExportModalContent] = useState<string>('');
  const [exportModalTitle, setExportModalTitle] = useState<string>('');

  useEffect(() => {
    if (!activeExportModal) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveExportModal(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeExportModal]);

  function applyCandidatePreset(preset: QuadrantCandidatePreset) {
    setSelectedCandidateId(preset.id);
    setCandGate1Margin(preset.gate1Margin);
    setCandGate2Parity(preset.gate2Parity);
    setCandSeX(preset.seX);
    setCandSeY(preset.seY);
    setCandRXY(preset.rXY);
  }

  const quadrantVerdict = useMemo(
    () => classifyQuadrant(candGate1Margin >= 0, candGate2Parity >= 0),
    [candGate1Margin, candGate2Parity],
  );

  const ellipsePoints = useMemo(
    () =>
      generateConfidenceEllipse(
        candGate1Margin,
        candGate2Parity,
        candSeX,
        candSeY,
        candRXY,
        0.95,
        64,
      ),
    [candGate1Margin, candGate2Parity, candSeX, candSeY, candRXY],
  );

  // Check if confidence ellipse crosses any quadrant boundary
  const ellipseCrossesBoundaries = useMemo(() => {
    let hasNegX = false;
    let hasPosX = false;
    let hasNegY = false;
    let hasPosY = false;
    for (const pt of ellipsePoints) {
      if (pt.x < 0) hasNegX = true;
      if (pt.x > 0) hasPosX = true;
      if (pt.y < 0) hasNegY = true;
      if (pt.y > 0) hasPosY = true;
    }
    return (hasNegX && hasPosX) || (hasNegY && hasPosY);
  }, [ellipsePoints]);

  // Sanitize user inputs against degenerate inputs (0, empty, negative)
  const safeM = Math.max(2, Math.round(m) || 2);
  const safeK = Math.max(1, Math.round(k) || 1);
  const safeBias = Number.isFinite(bias) ? bias : currentPreset.defaultBias;
  const safeSdB = Math.max(0, Number.isFinite(sdB) ? sdB : 0);
  const safeSdW = Math.max(0.01, Number.isFinite(sdW) ? sdW : 0.01);
  const safeTolerance = Math.max(0.1, Number.isFinite(toleranceWindow) ? toleranceWindow : 0.1);
  const safeOutlierRate = Math.max(0, Math.min(0.5, Number.isFinite(outlierRate) ? outlierRate : 0));

  // Generate synthetic data adhering to the hierarchical model
  const { observations, centroids } = useMemo(
    () =>
      generateSyntheticPairedData({
        m: safeM,
        k: safeK,
        bias: safeBias,
        sdB: safeSdB,
        sdW: safeSdW,
        outlierRate: safeOutlierRate,
        outlierScale: currentPreset.defaultOutlierScale,
        seed: 42,
        refRange:
          currentPreset.id === 'spo2'
            ? [70, 99]
            : currentPreset.id === 'heart-rate'
              ? [45, 185]
              : [300, 520],
      }),
    [safeM, safeK, safeBias, safeSdB, safeSdW, safeOutlierRate, currentPreset],
  );

  // Compute cluster-aware ANOVA agreement metrics
  const metrics = useMemo(
    () => computeAgreementMetrics(observations, safeTolerance, 0.95),
    [observations, safeTolerance],
  );

  // Compute live Pearson correlation r from active paired observations
  const livePearsonR = useMemo(() => computePearsonR(observations), [observations]);

  // Compute survival curve
  const survivalCurve = useMemo(
    () =>
      computeSurvivalCurve(
        observations,
        metrics.meanBias,
        metrics.variance.sdTotal,
        safeTolerance * 2.5,
        35,
      ),
    [observations, metrics.meanBias, metrics.variance.sdTotal, safeTolerance],
  );

  // Generate multi-tier executive scorecard
  const scorecard = useMemo(
    () => generateExecutiveScorecard(metrics, currentPreset, safeTolerance),
    [metrics, currentPreset, safeTolerance],
  );

  // Filter scorecard items by active lens
  const visibleScorecard = useMemo(
    () => (activeLens === 'all' ? scorecard : scorecard.filter((s) => s.lens === activeLens)),
    [scorecard, activeLens],
  );

  // Safe Y-axis domain for Bland-Altman scatter plot
  const safeYDomain = useMemo<[number, number]>(() => {
    const yMin = Math.floor(Math.min(metrics.loaLower, -safeTolerance) * 1.3);
    const yMax = Math.ceil(Math.max(metrics.loaUpper, safeTolerance) * 1.3);
    return yMin >= yMax ? [yMin - 1, yMax + 1] : [yMin, yMax];
  }, [metrics.loaLower, metrics.loaUpper, safeTolerance]);

  // Vector 2: Subject-Weighted ECDF & Morphology
  const subjectEcdfEnvelope = useMemo(
    () => computeSubjectWeightedEcdf(observations, safeTolerance * 2.5, 35),
    [observations, safeTolerance],
  );

  const ecdfCrossover = useMemo(() => {
    const candidatePoints = subjectEcdfEnvelope.map((p) => ({
      threshold: p.threshold,
      coverage: p.subjectWeightedCoverage,
    }));
    const comparatorPoints = survivalCurve.map((p) => ({
      threshold: p.threshold,
      coverage: p.gaussianCoverage,
    }));
    return detectEcdfCrossover(candidatePoints, comparatorPoints);
  }, [subjectEcdfEnvelope, survivalCurve]);

  const ksDiagnostic = useMemo(
    () => computeKsPseudoreplicationDiagnostic(safeM, safeK, metrics.variance.icc),
    [safeM, safeK, metrics.variance.icc],
  );

  // Vector 3: Three-Way Head-to-Head Dominance
  const threeWayData = useMemo(
    () =>
      generateThreeWayPairedData({
        m: 25,
        k: 40,
        activity: h2hActivity,
        seed: 42,
      }),
    [h2hActivity],
  );

  const h2hSummary = useMemo(
    () =>
      computeHeadToHeadDominance(
        threeWayData,
        h2hTieMargin,
        h2hCliffsThreshold,
        h2hActivity === 'running'
          ? 'High-Intensity Interval Running'
          : h2hActivity === 'cycling'
            ? 'Outdoor Cycling'
            : 'Rest & Sedentary',
      ),
    [threeWayData, h2hTieMargin, h2hCliffsThreshold, h2hActivity],
  );

  // Vector 5: Multi-Generation Transitive Drift Canary
  const transitiveDriftSummary = useMemo(
    () => computeTransitiveDriftCanary(DEFAULT_TRANSITIVE_DRIFT_GENERATIONS, canaryLimit),
    [canaryLimit],
  );

  // Briefing markdown generator
  function getExecutiveBriefingMarkdown(): string {
    return generateLaunchBriefingMarkdown({
      title: 'COMMERCIAL LAUNCH READINESS SCORECARD',
      quadrant: quadrantVerdict.quadrant,
      gate1Status: candGate1Margin >= 0 ? 'PASS' : 'FAIL',
      gate1Metrics:
        currentPreset.id === 'sleep-staging'
          ? [
              { name: "Cohen's Kappa", value: (0.6 + candGate1Margin * 0.1).toFixed(2), ci: '0.60, 0.66', passed: candGate1Margin >= 0, target: 'KPI >= 0.60' },
              { name: '4-Stage Accuracy', value: `${(68.0 + candGate1Margin * 5).toFixed(1)}%`, ci: '66.1%, 72.3%', passed: candGate1Margin >= 0, target: 'KPI >= 68.0%' },
              { name: 'TST 95% Error Bound', value: `${(30.0 - candGate1Margin * 8).toFixed(1)} min`, passed: candGate1Margin >= 0, target: 'KPI <= 30.0 min' },
            ]
          : [
              { name: 'Arms Error', value: `${(currentPreset.armsTarget - candGate1Margin).toFixed(2)} ${currentPreset.unit}`, passed: candGate1Margin >= 0, target: `KPI <= ${currentPreset.armsTarget.toFixed(2)} ${currentPreset.unit}` },
              { name: 'Tolerance Coverage', value: `${(currentPreset.targetCoveragePct + candGate1Margin * 5).toFixed(1)}%`, passed: candGate1Margin >= 0, target: `KPI >= ${currentPreset.targetCoveragePct.toFixed(1)}%` },
            ],
      gate2Status: candGate2Parity >= 0 ? 'PASS' : 'FAIL',
      gate2Metrics: [
        {
          name: currentPreset.id === 'sleep-staging' ? 'Kappa' : 'Error',
          frequentistDiff: `${candGate2Parity >= 0 ? '+' : ''}${candGate2Parity.toFixed(2)}`,
          frequentistPassed: candGate2Parity >= 0,
          frequentistTarget: 'Exceeds -0.05',
          assurance: Math.max(0.1, Math.min(0.99, 0.9 + candGate2Parity * 0.15)),
          assurancePassed: candGate2Parity >= 0,
          assuranceTarget: 0.9,
          cliffsDelta: Math.max(-0.8, Math.min(0.8, candGate2Parity * 0.4)),
          cliffsDeltaPassed: candGate2Parity >= 0,
          cliffsDeltaTarget: -0.2,
          tieMargin: currentPreset.id === 'sleep-staging' ? '15 min' : `1.0 ${currentPreset.unit}`,
        },
      ],
      nEnrolled: Math.round(safeM * 1.4),
      nAnalyzable: safeM,
      attritionYield: (safeM / Math.round(safeM * 1.4)) * 100,
    });
  }

  function handleCopyLaunchBriefing() {
    const markdown = getExecutiveBriefingMarkdown();
    copyToClipboard(markdown, 'Executive briefing markdown copied to clipboard!', setBriefingCopyFeedback);
  }

  function copyToClipboard(text: string, successMsg: string, feedbackSetter: (msg: string | null) => void) {
    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          feedbackSetter(successMsg);
          setTimeout(() => feedbackSetter(null), 3000);
        })
        .catch(() => {
          feedbackSetter('Failed to copy to clipboard.');
          setTimeout(() => feedbackSetter(null), 3000);
        });
    } else {
      feedbackSetter('Clipboard API unavailable in this browser.');
      setTimeout(() => feedbackSetter(null), 3000);
    }
  }

  // Open Export Modal
  function handleOpenExportModal(type: 'brief' | 'fdaTable1' | 'methods') {
    setExportDropdownOpen(false);
    if (type === 'brief') {
      const brief = getExecutiveBriefingMarkdown();
      setExportModalTitle('Executive Launch Readiness Brief');
      setExportModalContent(brief);
    } else if (type === 'fdaTable1') {
      const table1 = generateFdaTable1Markdown(metrics, currentPreset);
      setExportModalTitle('FDA 510(k) Pre-Market Notification / ISO 80601-2-61 Table 1');
      setExportModalContent(table1);
    } else if (type === 'methods') {
      const methods = generateCitableMethodsParagraph({
        preset: currentPreset,
        metrics,
        toleranceWindow: safeTolerance,
      });
      setExportModalTitle('Citable Statistical Methods Paragraph');
      setExportModalContent(methods);
    }
    setActiveExportModal(type);
  }

  // Standalone HTML report export
  function handleExportHtml() {
    setExportDropdownOpen(false);
    const html = generateStandaloneHtmlReport({
      preset: currentPreset,
      metrics,
      scorecard,
      survivalCurve,
      toleranceWindow: safeTolerance,
      observations,
      centroids,
    });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `validation-report-${currentPreset.id}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Copy JSON summary for Plx / Looker / ETL dashboards
  function handleCopyPlxJson() {
    setExportDropdownOpen(false);
    const jsonStr = generatePlxJsonSummary({
      preset: currentPreset,
      metrics,
      scorecard,
      toleranceWindow,
    });
    copyToClipboard(jsonStr, 'JSON dashboard summary copied to clipboard!', setCopyFeedback);
  }

  // Table columns for Bland-Altman data view
  const observationColumns: TableColumn<PairedObservation>[] = [
    { key: 'id', header: 'Observation ID', render: (row) => row.id },
    { key: 'subjectId', header: 'Subject', render: (row) => `Subject ${row.subjectId}` },
    {
      key: 'refValue',
      header: `Reference (${currentPreset.unit})`,
      render: (row) => row.refValue.toFixed(2),
      numeric: true,
    },
    {
      key: 'devValue',
      header: `Device (${currentPreset.unit})`,
      render: (row) => row.devValue.toFixed(2),
      numeric: true,
    },
    {
      key: 'diff',
      header: `Difference (${currentPreset.unit})`,
      render: (row) => `${row.diff >= 0 ? '+' : ''}${row.diff.toFixed(2)}`,
      numeric: true,
    },
    {
      key: 'absDiff',
      header: `Absolute Error (${currentPreset.unit})`,
      render: (row) => row.absDiff.toFixed(2),
      numeric: true,
    },
  ];

  // Table columns for Survival Curve data view
  const survivalColumns: TableColumn<SurvivalPoint>[] = [
    {
      key: 'threshold',
      header: `Threshold x (${currentPreset.unit})`,
      render: (row) => row.threshold.toFixed(2),
      numeric: true,
    },
    {
      key: 'empiricalSurvival',
      header: 'Survival P(|Error| > x)',
      render: (row) => `${row.empiricalSurvival.toFixed(1)}%`,
      numeric: true,
    },
    {
      key: 'empiricalCoverage',
      header: 'Coverage P(|Error| ≤ x)',
      render: (row) => `${row.empiricalCoverage.toFixed(1)}%`,
      numeric: true,
    },
    {
      key: 'gaussianSurvival',
      header: 'Gaussian Theoretical Survival',
      render: (row) => `${row.gaussianSurvival.toFixed(1)}%`,
      numeric: true,
    },
    {
      key: 'heavyTailExcess',
      header: 'Heavy-Tail Hazard Excess',
      render: (row) => `${row.heavyTailExcess.toFixed(1)}%`,
      numeric: true,
    },
  ];

  // Table columns for Vector 3 Head-to-Head
  const h2hColumns: TableColumn<SubjectHeadToHeadDominance>[] = [
    { key: 'subjectId', header: 'Participant', render: (r) => `Participant ${r.subjectId}` },
    { key: 'totalEpochs', header: 'Epochs', render: (r) => String(r.totalEpochs), numeric: true },
    { key: 'dev1Wins', header: 'Dev 1 Wins', render: (r) => String(r.dev1Wins), numeric: true },
    { key: 'dev2Wins', header: 'Dev 2 Wins', render: (r) => String(r.dev2Wins), numeric: true },
    { key: 'ties', header: 'Ties', render: (r) => String(r.ties), numeric: true },
    {
      key: 'cliffsDelta',
      header: "Cliff's Delta (δ)",
      render: (r) => `${r.cliffsDelta >= 0 ? '+' : ''}${r.cliffsDelta.toFixed(3)}`,
      numeric: true,
    },
    {
      key: 'outcome',
      header: 'Subject Verdict',
      render: (r) => (r.outcome === 'dev1_win' ? 'Device 1 Superior' : r.outcome === 'dev2_win' ? 'Device 2 Superior' : 'Inconclusive / Tie'),
    },
  ];

  // Table columns for Vector 3 Synchronized Paired Epochs: Delta = |e1| - |e2|
  const threeWayEpochColumns: TableColumn<ThreeWayPairedObservation>[] = [
    { key: 'id', header: 'Epoch ID', render: (r) => r.id },
    { key: 'subjectId', header: 'Subject', render: (r) => `Subject ${r.subjectId}` },
    { key: 'refValue', header: 'ECG Ref (bpm)', render: (r) => r.refValue.toFixed(1), numeric: true },
    { key: 'dev1Value', header: 'Device 1 (bpm)', render: (r) => r.dev1Value.toFixed(1), numeric: true },
    { key: 'dev2Value', header: 'Device 2 (bpm)', render: (r) => r.dev2Value.toFixed(1), numeric: true },
    { key: 'absE1', header: '|e1| (bpm)', render: (r) => r.absE1.toFixed(1), numeric: true },
    { key: 'absE2', header: '|e2| (bpm)', render: (r) => r.absE2.toFixed(1), numeric: true },
    {
      key: 'delta',
      header: 'Δ = |e1| - |e2|',
      render: (r) => `${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(2)} bpm`,
      numeric: true,
    },
    {
      key: 'outcome',
      header: 'Epoch Verdict',
      render: (r) => {
        if (r.delta < -h2hTieMargin) return 'Device 1 Win';
        if (r.delta > h2hTieMargin) return 'Device 2 Win';
        return `Tie (|Δ| ≤ ${h2hTieMargin.toFixed(1)})`;
      },
    },
  ];

  // Table columns for Vector 5 Transitive Drift
  const transitiveColumns: TableColumn<TransitiveDriftGeneration>[] = [
    { key: 'name', header: 'Hardware / Algorithm Iteration', render: (r) => r.name },
    { key: 'hardwareVersion', header: 'Hardware Revision', render: (r) => r.hardwareVersion },
    {
      key: 'stepBiasDiff',
      header: 'Step Δ vs Predecessor',
      render: (r) =>
        r.stepBiasDiff === 0
          ? 'Anchor Baseline'
          : `${r.stepBiasDiff >= 0 ? '+' : ''}${r.stepBiasDiff.toFixed(2)} bpm (Target ≤ +${r.stepNiTarget.toFixed(2)})`,
    },
    {
      key: 'stepPassed',
      header: 'Step Gate',
      render: () => 'PASS',
    },
    {
      key: 'cumulativeBiasDiff',
      header: 'Transitive Cumulative Δ vs Gen 1',
      render: (r) =>
        `${r.cumulativeBiasDiff >= 0 ? '+' : ''}${r.cumulativeBiasDiff.toFixed(2)} bpm (Limit: +${r.cumulativeCanaryLimit.toFixed(2)})`,
    },
    {
      key: 'canaryStatus',
      header: 'Transitive Canary Status',
      render: (r) =>
        r.canaryStatus === 'ALARM'
          ? 'ALARM (Silent Drift)'
          : r.canaryStatus === 'WARNING'
            ? 'WARNING (Drift Risk)'
            : 'PASS (Clear)',
    },
  ];

  const currentMeta = VECTOR_PAGE_META[selectedVector] ?? VECTOR_PAGE_META.all;

  return (
    <ModulePage
      eyebrow={currentMeta.eyebrow}
      accent={currentMeta.accent}
      title={currentMeta.title}
      method={currentMeta.method}
      intro={currentMeta.intro}
      assumption={currentMeta.assumption}
      currentN={m}
      controls={
        <>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Evaluation Preset
            </span>
            <SelectField
              label="Domain Preset"
              value={selectedPresetId}
              options={PRESET_OPTIONS}
              onChange={handlePresetChange}
            />
            <p className="mt-1 text-xs text-ink-muted">{currentPreset.domain}</p>
          </div>

          <div className="border-t border-hairline pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Stakeholder Filter
            </span>
            <SelectField
              label="Scorecard Lens"
              value={activeLens}
              options={LENS_OPTIONS}
              onChange={(v) => setActiveLens(v as typeof activeLens)}
            />
          </div>

          <div className="border-t border-hairline pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Clinical Tolerance Margin
            </span>
            <NumberField
              label={`Acceptance Window (±${currentPreset.unit})`}
              value={toleranceWindow}
              onChange={setToleranceWindow}
              min={0.1}
              step={0.5}
            />
          </div>

          <div className="border-t border-hairline pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Hierarchical Architecture
            </span>
            <div className="mt-2 flex flex-col gap-2">
              <NumberField
                label="Participants (m)"
                value={m}
                onChange={setM}
                min={3}
                step={1}
              />
              <NumberField
                label="Replicates per Subject (k)"
                value={k}
                onChange={setK}
                min={2}
                step={1}
              />
              <NumberField
                label={`Between-Subject SD (σ_b, ${currentPreset.unit})`}
                value={sdB}
                onChange={setSdB}
                min={0}
                step={0.1}
              />
              <NumberField
                label={`Within-Subject SD (σ_w, ${currentPreset.unit})`}
                value={sdW}
                onChange={setSdW}
                min={0.1}
                step={0.1}
              />
              <NumberField
                label="Outlier Tail Contamination (p)"
                value={outlierRate}
                onChange={setOutlierRate}
                min={0}
                max={0.25}
                step={0.01}
              />
            </div>
          </div>

          <div className="border-t border-hairline pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Zero-Permission Portable Export
            </span>
            <div className="mt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExportHtml}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-plane transition-opacity hover:opacity-90"
              >
                <Download size={14} aria-hidden /> Export Standalone HTML Report
              </button>
              <button
                type="button"
                onClick={handleCopyPlxJson}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-ink/5"
              >
                <Copy size={14} aria-hidden /> Copy Plx / JSON Metrics
              </button>
              {copyFeedback && (
                <p className="text-center text-xs font-medium text-series-2" role="status">
                  {copyFeedback}
                </p>
              )}
            </div>
          </div>
        </>
      }
      methodNotes={
        <>
          <p>
            <strong>Cross-Functional Reporting Principles:</strong> Different stakeholders require
            different statistical resolutions. Product teams care about user error coverage;
            Algorithm teams require variance components (between- vs within-subject) to diagnose
            sensor calibration vs demographic disparities; Regulatory leads require Arms and Limits
            of Agreement confidence bounds.
          </p>
          <p>
            <strong>The Google Scaling Architecture:</strong> In large engineering organizations,
            restrictive data permission silos often delay validation audits. Distributing findings
            as self-contained client-side HTML+JS or Plx Dashboards guarantees zero-permission
            portability, instant reproducibility, and complete audit trails without needing direct
            backend database privileges.
          </p>
          <p>
            <strong>Survival of Error vs Gaussian Bland-Altman:</strong> Standard Bland-Altman
            summaries only report mean bias and standard deviation, implicitly assuming a Gaussian
            bell curve. In sensor physiology (SpO2, photoplethysmography, wearable EEG), errors have
            heavy tails caused by motion artifacts, poor skin coupling, and arrhythmias. Survival of
            Error curves P(|error| &gt; x) directly quantify the true clinical outlier
            hazard that RMS hides.
          </p>
          <div className="mt-3 flex flex-col gap-2 text-xs text-ink-muted">
            <p>
              1. {BLAND_ALTMAN_1986.text}{' '}
              {BLAND_ALTMAN_1986.url && (
                <a
                  href={BLAND_ALTMAN_1986.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-series-1 hover:underline"
                >
                  [doi] <ExternalLink size={11} aria-hidden />
                </a>
              )}
            </p>
            <p>
              2. {BLAND_ALTMAN_2007.text}{' '}
              {BLAND_ALTMAN_2007.url && (
                <a
                  href={BLAND_ALTMAN_2007.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-series-1 hover:underline"
                >
                  [doi] <ExternalLink size={11} aria-hidden />
                </a>
              )}
            </p>
            <p>
              3. {ZOU_2013.text}{' '}
              {ZOU_2013.url && (
                <a
                  href={ZOU_2013.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-series-1 hover:underline"
                >
                  [doi] <ExternalLink size={11} aria-hidden />
                </a>
              )}
            </p>
          </div>
        </>
      }
    >
      {/* Scaling Callout */}
      {selectedVector === 'all' && (
        <section className="rounded-xl border border-hairline bg-surface p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-series-1/10 text-series-1">
            <Sparkles size={18} aria-hidden />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-ink">
              Systems That Scale: Client-Side Portability &amp; Plx Dashboards
            </h2>
            <p className="text-xs leading-relaxed text-ink-secondary">
              At Google and other enterprise research environments, client-side HTML+JavaScript
              pages and Plx Dashboards proved to be the most resilient validation medium because they
              bypass enterprise data-permission bottlenecks. You can export this entire studio view
              as a self-contained, interactive HTML document, standardized FDA Table 1, or Plx-compatible JSON payload that
              executives and auditors can inspect without database permissions.
            </p>
          </div>
        </div>
      </section>
      )}

      {/* Progressive Disclosure: Clean Uncluttered 5-Vector Entry Deck */}
      {selectedVector === 'all' && (
        <section aria-labelledby="vector-entry-heading" className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-series-2" />
              <h2 id="vector-entry-heading" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Validation Reporting Focus Areas
              </h2>
            </div>
            <span className="text-[11px] text-ink-muted">Select an area to focus workbench</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
            <button
              type="button"
              onClick={() => handleSelectVector('vector1')}
              className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-3.5 text-left transition-all hover:border-ink/25 hover:shadow-xs group cursor-pointer"
            >
              <div>
                <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                  Vector 1
                </span>
                <h3 className="mt-2 font-bold text-ink transition-colors">
                  KPI &amp; Metric Taxonomy
                </h3>
                <p className="mt-1 text-[11px] text-ink-secondary leading-snug line-clamp-2">
                  RMSE, MAE, LoA, ISO 80601-2-61 Arms, &amp; continuous error metrics.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-ink group-hover:underline">
                <span>Inspect KPIs</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectVector('vector2')}
              className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-3.5 text-left transition-all hover:border-ink/25 hover:shadow-xs group cursor-pointer"
            >
              <div>
                <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                  Vector 2
                </span>
                <h3 className="mt-2 font-bold text-ink transition-colors">
                  ECDF &amp; Morphology
                </h3>
                <p className="mt-1 text-[11px] text-ink-secondary leading-snug line-clamp-2">
                  Subject-weighted envelopes, curve crossover points, &amp; non-parametric survival.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-ink group-hover:underline">
                <span>View Envelopes</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectVector('vector3')}
              className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-3.5 text-left transition-all hover:border-ink/25 hover:shadow-xs group cursor-pointer"
            >
              <div>
                <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                  Vector 3
                </span>
                <h3 className="mt-2 font-bold text-ink transition-colors">
                  Head-to-Head Dominance
                </h3>
                <p className="mt-1 text-[11px] text-ink-secondary leading-snug line-clamp-2">
                  Paired Δ = |e1| - |e2|, clinical tie margins &amp; subject Cliff's delta dominance.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-ink group-hover:underline">
                <span>21 of 25 Participants</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectVector('vector4')}
              className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-3.5 text-left transition-all hover:border-ink/25 hover:shadow-xs group cursor-pointer"
            >
              <div>
                <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                  Vector 4
                </span>
                <h3 className="mt-2 font-bold text-ink transition-colors">
                  Two-Gate Launch Plane
                </h3>
                <p className="mt-1 text-ink-secondary text-[11px] leading-snug line-clamp-2">
                  Gate 1 Absolute vs Gate 2 Predecessor parity in an interactive 4-quadrant plane.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-ink group-hover:underline">
                <span>Launch Plane</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectVector('vector5')}
              className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-3.5 text-left transition-all hover:border-ink/25 hover:shadow-xs group cursor-pointer"
            >
              <div>
                <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                  Vector 5
                </span>
                <h3 className="mt-2 font-bold text-ink transition-colors">
                  Transitive Drift Canary
                </h3>
                <p className="mt-1 text-ink-secondary text-[11px] leading-snug line-clamp-2">
                  Indirect network comparisons 1 -&gt; 2 -&gt; 3 -&gt; 4 to catch silent software drift.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-ink group-hover:underline">
                <span>Canary Alarms</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          </div>
        </section>
      )}

      {/* Sticky Compact Report Outline Bar atop the High-Density Interactive Workbench */}
      <div className="sticky top-2 z-30 mb-6 rounded-2xl border border-hairline/80 bg-surface/95 backdrop-blur-md px-3.5 py-2.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Vector Outline Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mr-1 shrink-0">
              Outline:
            </span>
            <button
              type="button"
              onClick={() => handleSelectVector('all')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors shrink-0 ${
                selectedVector === 'all'
                  ? 'bg-ink text-plane shadow-xs'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              All Vectors
            </button>
            <button
              type="button"
              onClick={() => handleSelectVector('vector1')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors shrink-0 ${
                selectedVector === 'vector1'
                  ? 'bg-series-1 text-plane shadow-xs'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              1. KPI Taxonomy
            </button>
            <button
              type="button"
              onClick={() => handleSelectVector('vector2')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors shrink-0 ${
                selectedVector === 'vector2'
                  ? 'bg-series-2 text-plane shadow-xs'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              2. ECDF Morphology
            </button>
            <button
              type="button"
              onClick={() => handleSelectVector('vector3')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors shrink-0 ${
                selectedVector === 'vector3'
                  ? 'bg-series-3 text-plane shadow-xs'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              3. Head-to-Head (21 of 25)
            </button>
            <button
              type="button"
              onClick={() => handleSelectVector('vector4')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors shrink-0 ${
                selectedVector === 'vector4'
                  ? 'bg-series-4 text-plane shadow-xs'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              4. Two-Gate Plane
            </button>
            <button
              type="button"
              onClick={() => handleSelectVector('vector5')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors shrink-0 ${
                selectedVector === 'vector5'
                  ? 'bg-rose-600 text-plane shadow-xs'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              5. Drift Canary
            </button>
          </div>

          {/* Right Toolbar: Overview Hub Link & Secondary [Export Report ▾] Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Link
              to="/report-studio/overview"
              className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs hover:bg-ink/5 transition-colors"
            >
              <span>Overview Hub</span>
              <span aria-hidden>&rarr;</span>
            </Link>

            {/* Clean Secondary [Export Report ▾] Utility Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs hover:bg-ink/5 transition-colors"
                aria-expanded={exportDropdownOpen}
                aria-haspopup="menu"
              >
                <span>Export Report</span>
                <ChevronDown size={13} className={`transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {exportDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setExportDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-hairline bg-surface p-1.5 shadow-lg z-50 text-xs"
                  >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleOpenExportModal('brief')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-ink hover:bg-ink/5"
                  >
                    <FileText size={14} className="text-series-2" />
                    <div>
                      <div className="font-semibold">Executive Launch Brief</div>
                      <div className="text-[10px] text-ink-muted">Markdown Briefing with Gate 1 &amp; Gate 2</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleOpenExportModal('fdaTable1')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-ink hover:bg-ink/5"
                  >
                    <CheckCircle2 size={14} className="text-series-1" />
                    <div>
                      <div className="font-semibold">FDA 510(k) Table 1</div>
                      <div className="text-[10px] text-ink-muted">ISO 80601-2-61 Arms &amp; LoA Format</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleOpenExportModal('methods')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-ink hover:bg-ink/5"
                  >
                    <Layers size={14} className="text-series-3" />
                    <div>
                      <div className="font-semibold">Citable Methods Paragraph</div>
                      <div className="text-[10px] text-ink-muted">Publication-ready text with ANOVA citations</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-hairline" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleExportHtml}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-ink hover:bg-ink/5"
                  >
                    <Download size={14} className="text-series-4" />
                    <div>
                      <div className="font-semibold">Standalone HTML Report</div>
                      <div className="text-[10px] text-ink-muted">Single-file zero-permission offline bundle</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleCopyPlxJson}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-ink hover:bg-ink/5"
                  >
                    <Copy size={14} className="text-ink-secondary" />
                    <div>
                      <div className="font-semibold">Copy Plx / JSON Metrics</div>
                      <div className="text-[10px] text-ink-muted">Structured payload for SQL / Looker dashboards</div>
                    </div>
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* VECTOR 1: KPI & Metric Taxonomy */}
      {/* ==================================================================== */}
      {(selectedVector === 'all' || selectedVector === 'vector1') && (
        <section aria-labelledby="vector1-heading" className="space-y-5 mb-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-series-1/10 px-2 py-0.5 text-xs font-bold text-series-1">
                  Vector 1
                </span>
                <h2 id="vector1-heading" className="text-lg font-bold tracking-tight text-ink">
                  KPI &amp; Metric Taxonomy
                </h2>
              </div>
              <p className="text-xs text-ink-secondary">
                Rigorous definitions for RMSE, MAE, Bland-Altman LoA, ISO 80601-2-61 Arms, % Within Tolerance, and why Pearson correlation r is deceptive.
              </p>
            </div>
            <span className="text-xs font-semibold text-ink-muted">Standard: {currentPreset.regulatoryStandard}</span>
          </div>

          {/* Metric Taxonomy Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {KPI_TAXONOMY_DEFINITIONS.map((def) => {
              let liveVal = '';
              if (def.id === 'rmse') liveVal = `${metrics.arms.toFixed(2)} ${currentPreset.unit}`;
              else if (def.id === 'mae') liveVal = `${metrics.mae.toFixed(2)} ${currentPreset.unit}`;
              else if (def.id === 'loa') liveVal = `[${metrics.loaLower.toFixed(1)}, +${metrics.loaUpper.toFixed(1)}] ${currentPreset.unit}`;
              else if (def.id === 'tolerance-coverage') liveVal = `${metrics.coverageAtTolerance.toFixed(1)}%`;
              else if (def.id === 'correlation-r') liveVal = `r = ${livePearsonR >= 0 ? '+' : ''}${livePearsonR.toFixed(3)} (Deceptive)`;

              return (
                <div
                  key={def.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between space-y-2.5 transition-colors ${
                    def.id === 'correlation-r'
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-hairline bg-surface'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-bold text-ink-muted">{def.acronym}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          def.outlierSensitivity === 'Quadratic (High)'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : def.outlierSensitivity === 'Linear (Medium)'
                              ? 'bg-series-1/10 text-series-1'
                              : def.outlierSensitivity === 'Deceptive / High Risk'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {def.outlierSensitivity}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-ink">{def.name}</h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold tracking-tight text-ink tabular">{liveVal}</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-ink-muted bg-plane px-2 py-1 rounded border border-hairline/60">
                      {def.formula}
                    </p>
                  </div>
                  <div className="border-t border-hairline/60 pt-2 text-[11px] leading-relaxed text-ink-secondary">
                    {def.clinicalInterpretation}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pitfall Explorer Callout: Why Correlation (r) is Deceptive */}
          <div className="rounded-xl border border-hairline bg-surface p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink-secondary">
              <AlertTriangle size={15} className="text-ink-muted shrink-0" />
              <span>
                <strong>Methodological Guidance:</strong> Pearson correlation <em>r</em> measures linear association rather than agreement. Wide dynamic ranges artificially inflate <em>r</em> &gt; 0.98 despite clinically significant sensor errors.
              </span>
            </div>
            <Link
              to="/explainers/rmse-mae"
              className="inline-flex items-center gap-1 font-semibold text-ink hover:underline shrink-0"
            >
              <span>Explore in Pitfall Explorer</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Section 1: Cross-Functional Executive Scorecard */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-ink">
                  1. Cross-Functional Executive Scorecard
                </h3>
                <p className="text-xs text-ink-secondary">
                  Clinical tolerance window: <strong className="text-ink">±{toleranceWindow} {currentPreset.unit}</strong> &bull; Standard:{' '}
                  <span className="text-ink">{currentPreset.regulatoryStandard}</span>
                </p>
              </div>

              {/* Quick lens toggle */}
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-hairline bg-plane p-1 text-xs">
                {(['all', 'product', 'engineering', 'clinical'] as const).map((lens) => (
                  <button
                    key={lens}
                    type="button"
                    onClick={() => setActiveLens(lens)}
                    className={`rounded px-2.5 py-1 font-medium capitalize transition-colors ${
                      activeLens === lens
                        ? 'bg-surface text-ink shadow-sm'
                        : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    {lens === 'all' ? 'All Lenses' : lens}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleScorecard.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-shadow hover:shadow-sm ${
                    item.status === 'pass'
                      ? 'border-hairline bg-surface'
                      : item.status === 'caution'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                        {item.lens}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.status === 'pass'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : item.status === 'caution'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {item.status === 'pass' ? (
                          <CheckCircle2 size={12} aria-hidden />
                        ) : item.status === 'caution' ? (
                          <AlertTriangle size={12} aria-hidden />
                        ) : (
                          <ShieldAlert size={12} aria-hidden />
                        )}
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="mt-2 text-xs font-medium text-ink-secondary">{item.label}</h4>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold tracking-tight text-ink tabular">{item.value}</span>
                      <span className="text-xs text-ink-muted">target: {item.target}</span>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-hairline pt-2">
                    <p className="text-xs font-medium text-ink">{item.verdict}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hierarchical Variance Decomposition Table */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold text-ink">
              Hierarchical Variance Decomposition &amp; Clustering Penalty (Bland &amp; Altman 2007)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-plane text-ink-muted">
                    <th className="p-3 font-semibold uppercase">Component</th>
                    <th className="p-3 font-semibold uppercase">Value ({currentPreset.unit})</th>
                    <th className="p-3 font-semibold uppercase">Variance Share</th>
                    <th className="p-3 font-semibold uppercase">Clinical &amp; Engineering Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr>
                    <td className="p-3 font-semibold text-ink">Between-Subject Spread (σ_b)</td>
                    <td className="p-3 font-mono font-bold text-ink">{metrics.variance.sdBetween.toFixed(2)}</td>
                    <td className="p-3 font-semibold text-series-1">{(metrics.variance.icc * 100).toFixed(1)}% (ICC = {metrics.variance.icc.toFixed(2)})</td>
                    <td className="p-3 text-ink-secondary">Subject trait differences (pigmentation, perfusion, geometry). High σ_b signals demographic disparities.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-ink">Within-Subject Spread (σ_w)</td>
                    <td className="p-3 font-mono font-bold text-ink">{metrics.variance.sdWithin.toFixed(2)}</td>
                    <td className="p-3 font-semibold text-series-2">{((1 - metrics.variance.icc) * 100).toFixed(1)}%</td>
                    <td className="p-3 text-ink-secondary">Sensor noise, optical contact impedance, and temporal fluctuations within the same participant.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-ink">Total Agreement Spread (σ_total)</td>
                    <td className="p-3 font-mono font-bold text-ink">{metrics.variance.sdTotal.toFixed(2)}</td>
                    <td className="p-3 font-semibold text-ink">100%</td>
                    <td className="p-3 text-ink-secondary">LoA Span = ±{(1.96 * metrics.variance.sdTotal).toFixed(2)} {currentPreset.unit}. Design effect = {metrics.variance.designEffect.toFixed(2)} (Effective N = {metrics.variance.nEffective.toFixed(0)} of {metrics.totalN}).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sleep Staging Multi-Class Confusion Matrix if sleep preset */}
          {currentPreset.sleepSummary && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-ink">
                Sleep Staging Multi-Class Confusion Matrix (Wearable vs PSG Reference)
              </h3>
              <p className="text-xs text-ink-secondary">
                Epoch-by-epoch concordance across 27,210 30-second epochs. Overall Accuracy: <strong className="text-ink">83.5%</strong> &bull; Cohen's Kappa: <strong className="text-ink">{currentPreset.sleepSummary.cohensKappa.toFixed(3)}</strong>
              </p>
              <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-hairline bg-plane text-ink-muted">
                      <th className="p-2.5 font-semibold">True PSG \ Device</th>
                      {currentPreset.sleepSummary.classes.map((cls) => (
                        <th key={cls} className="p-2.5 font-semibold text-right">{cls}</th>
                      ))}
                      <th className="p-2.5 font-semibold text-right">Sensitivity</th>
                      <th className="p-2.5 font-semibold text-right">Specificity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {currentPreset.sleepSummary.matrix.map((row, rIdx) => {
                      const cls = currentPreset.sleepSummary!.classes[rIdx]!;
                      const metric = currentPreset.sleepSummary!.stageMetrics[rIdx]!;
                      return (
                        <tr key={cls}>
                          <td className="p-2.5 font-semibold text-ink">{cls}</td>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`p-2.5 font-mono text-right ${
                                rIdx === cIdx ? 'bg-series-1/10 font-bold text-series-1' : 'text-ink-secondary'
                              }`}
                            >
                              {cell.toLocaleString()}
                            </td>
                          ))}
                          <td className="p-2.5 font-mono font-bold text-right text-emerald-600">{(metric.sensitivity * 100).toFixed(1)}%</td>
                          <td className="p-2.5 font-mono text-right text-ink-muted">{(metric.specificity * 100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================================================================== */}
      {/* VECTOR 2: ECDF & Error Morphology */}
      {/* ==================================================================== */}
      {(selectedVector === 'all' || selectedVector === 'vector2') && (
        <section aria-labelledby="vector2-heading" className="space-y-5 mb-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-series-2/10 px-2 py-0.5 text-xs font-bold text-series-2">
                  Vector 2
                </span>
                <h2 id="vector2-heading" className="text-lg font-bold tracking-tight text-ink">
                  ECDF &amp; Error Morphology
                </h2>
              </div>
              <p className="text-xs text-ink-secondary">
                Subject-weighted ECDF envelopes vs. pooled rows, curve crossover detection, and avoiding the invalid KS-test pseudoreplication trap.
              </p>
            </div>
            <span className="text-xs font-semibold text-ink-muted">Coverage at ±{toleranceWindow} {currentPreset.unit}: {metrics.coverageAtTolerance.toFixed(1)}%</span>
          </div>

          {/* Best Practice Diagnostic: Cluster-Honest ECDF vs Naive KS */}
          <div className="rounded-xl border border-hairline bg-surface p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <ShieldAlert size={15} className="text-ink-muted" />
                <span>Repeated Measures Consideration: Naive Pooling vs Cluster-Honest Testing</span>
              </div>
              <Link
                to="/explainers"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink hover:underline shrink-0"
              >
                <span>Read KS Trap in Pitfall Explorer</span>
                <ArrowRight size={12} />
              </Link>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {ksDiagnostic.hazardExplanation}
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono pt-1 text-ink-muted">
              <span>Naive Pooled KS: p = {ksDiagnostic.naivePooledPValue} (Invalid)</span>
              <span>&bull;</span>
              <span>Cluster-Honest Permutation: p = {ksDiagnostic.clusterHonestPValue} (Honest)</span>
              <span>&bull;</span>
              <span>Design Effect: {ksDiagnostic.designEffect.toFixed(2)}x</span>
            </div>
          </div>

          {/* Chart 1: Subject-Weighted ECDF Envelope vs Pooled Rows */}
          <div className="rounded-xl border border-hairline bg-surface p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Subject-Weighted ECDF Envelopes vs. Naive Pooled Rows
                </h3>
                <p className="text-xs text-ink-secondary">
                  Shaded band represents the 10th to 90th percentile envelope across participants, preventing a single noisy subject from distorting findings.
                </p>
              </div>
              {ecdfCrossover.crossoverDetected && (
                <span className="rounded bg-series-2/10 px-2.5 py-1 text-xs font-bold text-series-2 border border-series-2/20">
                  Crossover @ ±{ecdfCrossover.threshold.toFixed(1)} {currentPreset.unit}
                </span>
              )}
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={subjectEcdfEnvelope} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="threshold"
                    tick={AXIS_TICK}
                    label={{
                      value: `Error Threshold x (${currentPreset.unit})`,
                      position: 'bottom',
                      offset: 5,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={AXIS_TICK}
                    label={{
                      value: 'Coverage P(|Error| ≤ x)',
                      angle: -90,
                      position: 'insideLeft',
                      style: AXIS_LABEL,
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]!.payload as typeof subjectEcdfEnvelope[0];
                      return (
                        <div className="rounded-lg border border-hairline bg-surface p-2.5 text-xs shadow-md">
                          <p className="font-semibold text-ink">Threshold: {d.threshold} {currentPreset.unit}</p>
                          <p className="mt-1 font-bold text-series-2">
                            Subject-Weighted Mean: {d.subjectWeightedCoverage}%
                          </p>
                          <p className="text-series-1 font-medium">Pooled Rows: {d.pooledCoverage}%</p>
                          <p className="text-ink-muted">Subject P10 - P90 Band: [{d.p10Coverage}%, {d.p90Coverage}%]</p>
                          <p className="text-ink-muted">Min - Max Envelope: [{d.minCoverage}%, {d.maxCoverage}%]</p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    x={toleranceWindow}
                    stroke="var(--color-series-2)"
                    strokeDasharray="3 3"
                    label={{
                      value: `Tolerance (±${toleranceWindow})`,
                      fill: 'var(--color-series-2)',
                      fontSize: 10,
                    }}
                  />
                  {/* Subject Envelope Bounds */}
                  <Line type="monotone" dataKey="p10Coverage" stroke="var(--color-series-2)" strokeWidth={1} strokeDasharray="2 2" dot={false} name="P10 Envelope" />
                  <Line type="monotone" dataKey="p90Coverage" stroke="var(--color-series-2)" strokeWidth={1} strokeDasharray="2 2" dot={false} name="P90 Envelope" />
                  {/* Pooled Rows */}
                  <Line type="monotone" dataKey="pooledCoverage" stroke="var(--color-series-1)" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Naive Pooled Rows" />
                  {/* Subject Weighted Mean */}
                  <Line type="monotone" dataKey="subjectWeightedCoverage" stroke="var(--color-series-2)" strokeWidth={3} dot={false} name="Subject-Weighted Mean" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-ink-muted pt-2 border-t border-hairline">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-series-2" /> Subject-Weighted Mean</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-series-1" /> Naive Pooled Rows</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full border border-series-2" /> P10–P90 Envelope</span>
              </div>
              <span>{ecdfCrossover.interpretation}</span>
            </div>
          </div>

          {/* Bland-Altman Agreement Chart with Subject-Level Clustering */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Bland-Altman Agreement Chart with Subject-Level Clustering
                </h3>
                <p className="text-xs text-ink-secondary">
                  Difference vs. Reference with ±1.96 Limits of Agreement and shaded clinical tolerance window.
                </p>
              </div>

              {/* Toggle view between all observations and centroids */}
              <div className="flex items-center gap-1 rounded-lg border border-hairline bg-plane p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setBlandAltmanView('all')}
                  className={`rounded px-2.5 py-1 font-medium transition-colors ${
                    blandAltmanView === 'all'
                      ? 'bg-surface text-ink shadow-sm'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  All {metrics.totalN} Points
                </button>
                <button
                  type="button"
                  onClick={() => setBlandAltmanView('centroids')}
                  className={`rounded px-2.5 py-1 font-medium transition-colors ${
                    blandAltmanView === 'centroids'
                      ? 'bg-surface text-ink shadow-sm'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {m} Subject Centroids
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="reference"
                      name="Reference"
                      unit={` ${currentPreset.unit}`}
                      tick={AXIS_TICK}
                      label={{
                        value: `${currentPreset.referenceName} (${currentPreset.unit})`,
                        position: 'bottom',
                        offset: 5,
                        style: AXIS_LABEL,
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="diff"
                      name="Device - Reference"
                      unit={` ${currentPreset.unit}`}
                      tick={AXIS_TICK}
                      domain={safeYDomain}
                      label={{
                        value: `Difference (${currentPreset.deviceName} - Ref)`,
                        angle: -90,
                        position: 'insideLeft',
                        style: AXIS_LABEL,
                      }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]!.payload as {
                          subjectId: number;
                          reference: number;
                          diff: number;
                          isCentroid?: boolean;
                          count?: number;
                        };
                        return (
                          <div className="rounded-lg border border-hairline bg-surface p-2.5 text-xs shadow-md">
                            <p className="font-semibold text-ink">
                              {d.isCentroid
                                ? `Subject ${d.subjectId} Mean Centroid`
                                : `Subject ${d.subjectId} Observation`}
                            </p>
                            <p className="mt-1 text-ink-secondary">
                              Reference: <span className="font-mono text-ink">{d.reference.toFixed(2)} {currentPreset.unit}</span>
                            </p>
                            <p className="text-ink-secondary">
                              Difference: <span className="font-mono text-ink">{d.diff >= 0 ? '+' : ''}{d.diff.toFixed(2)} {currentPreset.unit}</span>
                            </p>
                            {d.isCentroid && (
                              <p className="text-[11px] text-ink-muted">Averaged across {d.count} replicates</p>
                            )}
                          </div>
                        );
                      }}
                    />

                    {/* Shaded Clinical Tolerance Window */}
                    <ReferenceArea
                      y1={-toleranceWindow}
                      y2={toleranceWindow}
                      fill="var(--color-series-2)"
                      fillOpacity={0.07}
                      stroke="none"
                    />

                    {/* Mean Bias Line */}
                    <ReferenceLine
                      y={metrics.meanBias}
                      stroke={seriesColor(1)}
                      strokeWidth={2}
                      label={{
                        value: `Bias: ${metrics.meanBias >= 0 ? '+' : ''}${metrics.meanBias.toFixed(2)}`,
                        fill: seriesColor(1),
                        fontSize: 11,
                        position: 'right',
                      }}
                    />

                    {/* LoA Upper and Lower */}
                    <ReferenceLine
                      y={metrics.loaUpper}
                      stroke="var(--color-ink-muted)"
                      strokeDasharray="4 4"
                      label={{
                        value: `+95% LoA: +${metrics.loaUpper.toFixed(2)}`,
                        fill: 'var(--color-ink-muted)',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                    <ReferenceLine
                      y={metrics.loaLower}
                      stroke="var(--color-ink-muted)"
                      strokeDasharray="4 4"
                      label={{
                        value: `-95% LoA: ${metrics.loaLower.toFixed(2)}`,
                        fill: 'var(--color-ink-muted)',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />

                    {/* Zero Line */}
                    <ReferenceLine y={0} stroke="var(--color-hairline)" />

                    {blandAltmanView === 'all' ? (
                      <Scatter
                        data={observations.map((o) => ({
                          reference: o.refValue,
                          diff: o.diff,
                          subjectId: o.subjectId,
                        }))}
                        fill={seriesColor(1)}
                        fillOpacity={0.65}
                      />
                    ) : (
                      <Scatter
                        data={centroids.map((c) => ({
                          reference: c.meanRef,
                          diff: c.meanDiff,
                          subjectId: c.subjectId,
                          isCentroid: true,
                          count: c.count,
                        }))}
                        fill={seriesColor(3)}
                        fillOpacity={0.9}
                        shape="diamond"
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 border-t border-hairline/60 pt-3">
                <DataTable
                  caption="Sample Paired Subject Observations & Residual Differences (First 50 Epochs)"
                  columns={observationColumns}
                  rows={observations.slice(0, 50)}
                  rowKey={(row) => row.id}
                />
              </div>
            </div>
          </div>

          {/* Survival of Error and Cumulative Coverage Lines */}
          <div className="space-y-3 pt-2">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-ink">
                4. "Survival of Error" &amp; Cumulative Coverage (Heavy-Tail Diagnostics)
              </h3>
              <p className="text-xs text-ink-secondary">
                Assessing the probability that absolute device error exceeds clinical threshold x:{' '}
                <strong className="text-ink">P(|error| &gt; x)</strong> vs theoretical Gaussian survival.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Chart 1: Survival of Error */}
              <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Survival of Error: P(|Error| &gt; x)
                    </h4>
                    <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      Tail Hazard Curve
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary">
                    Reveals the proportion of readings that suffer errors larger than threshold x. Non-Gaussian
                    heavy tails diverge above the dashed Gaussian curve.
                  </p>
                </div>

                <div className="mt-3 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={survivalCurve} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="threshold" tick={AXIS_TICK} />
                      <YAxis domain={[0, 100]} unit="%" tick={AXIS_TICK} />
                      <Tooltip />
                      <ReferenceLine x={toleranceWindow} stroke="var(--color-series-2)" strokeDasharray="2 2" />
                      <ReferenceLine x={metrics.p95} stroke={seriesColor(5)} strokeDasharray="2 2" />
                      <Line type="monotone" dataKey="gaussianSurvival" stroke="var(--color-ink-muted)" strokeDasharray="4 4" dot={false} name="Gaussian Theoretical" />
                      <Line type="monotone" dataKey="empiricalSurvival" stroke={seriesColor(5)} strokeWidth={2.5} dot={false} name="Empirical Survival" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Cumulative Error Coverage */}
              <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Cumulative Coverage: P(|Error| &le; x)
                    </h4>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Error Envelope
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary">
                    The percentage of measurements falling within &plusmn;x bounds. At &plusmn;{toleranceWindow}{' '}
                    {currentPreset.unit}, coverage is {metrics.coverageAtTolerance.toFixed(1)}%.
                  </p>
                </div>

                <div className="mt-3 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={survivalCurve} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="threshold" tick={AXIS_TICK} />
                      <YAxis domain={[0, 100]} unit="%" tick={AXIS_TICK} />
                      <Tooltip />
                      <ReferenceLine x={toleranceWindow} stroke="var(--color-series-2)" strokeDasharray="2 2" />
                      <Line type="monotone" dataKey="empiricalCoverage" stroke="var(--color-series-2)" strokeWidth={2.5} dot={false} name="Empirical Coverage" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <DataTable
              caption="Survival of Error and Heavy-Tail Contamination Table"
              columns={survivalColumns}
              rows={survivalCurve.filter((_, idx) => idx % 3 === 0)}
              rowKey={(row) => String(row.threshold)}
            />
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* VECTOR 3: Three-Way Head-to-Head Dominance */}
      {/* ==================================================================== */}
      {(selectedVector === 'all' || selectedVector === 'vector3') && (
        <section aria-labelledby="vector3-heading" className="space-y-5 mb-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-series-3/10 px-2 py-0.5 text-xs font-bold text-series-3">
                  Vector 3
                </span>
                <h2 id="vector3-heading" className="text-lg font-bold tracking-tight text-ink">
                  Three-Way Head-to-Head Dominance
                </h2>
              </div>
              <p className="text-xs text-ink-secondary">
                Addressing the "Pairing Discard" fallacy with paired error differences Delta = |e1| - |e2|, clinical tie margins, and subject Cliff's delta.
              </p>
            </div>
            <span className="text-xs font-semibold text-series-3">N = {h2hSummary.totalSubjects} Paired Participants</span>
          </div>

          {/* Motivation: The Pairing Discard Fallacy Banner */}
          <div className="rounded-xl border border-series-3/30 bg-series-3/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <Split size={15} className="text-series-3" />
              <span>Overcoming the "Pairing Discard" Fallacy in Comparative Validation</span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {h2hSummary.pairingDiscardFallacyNote}
            </p>
          </div>

          {/* Interactive Controls for Vector 3 */}
          <div className="grid gap-3 sm:grid-cols-3 rounded-xl border border-hairline bg-surface p-4 text-xs">
            <div>
              <label htmlFor="h2h-activity-select" className="font-semibold text-ink uppercase tracking-wider text-[10px] block mb-1">
                Exercise Activity Protocol
              </label>
              <select
                id="h2h-activity-select"
                value={h2hActivity}
                onChange={(e) => setH2hActivity(e.target.value as typeof h2hActivity)}
                className="w-full rounded-lg border border-hairline bg-plane px-2.5 py-1.5 text-xs text-ink"
              >
                <option value="running">High-Intensity Interval Running</option>
                <option value="cycling">Outdoor Cycling</option>
                <option value="rest">Rest &amp; Sedentary</option>
              </select>
            </div>

            <div>
              <label htmlFor="h2h-tie-margin-input" className="font-semibold text-ink uppercase tracking-wider text-[10px] block mb-1">
                Clinical Tie Margin (τ = {h2hTieMargin.toFixed(1)} bpm)
              </label>
              <input
                id="h2h-tie-margin-input"
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={h2hTieMargin}
                onChange={(e) => setH2hTieMargin(parseFloat(e.target.value))}
                className="w-full accent-series-3"
              />
              <span className="text-[10px] text-ink-muted">Errors within ±{h2hTieMargin} bpm counted as ties</span>
            </div>

            <div>
              <label htmlFor="h2h-cliffs-threshold-input" className="font-semibold text-ink uppercase tracking-wider text-[10px] block mb-1">
                Subject Cliff's Delta Threshold (|δ| &gt; {h2hCliffsThreshold.toFixed(2)})
              </label>
              <input
                id="h2h-cliffs-threshold-input"
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={h2hCliffsThreshold}
                onChange={(e) => setH2hCliffsThreshold(parseFloat(e.target.value))}
                className="w-full accent-series-3"
              />
              <span className="text-[10px] text-ink-muted">Threshold required to declare a subject win</span>
            </div>
          </div>

          {/* PROMINENT HEADLINE CONCLUSION */}
          <div
            className={`rounded-2xl border-2 p-5 space-y-2 text-center sm:text-left ${
              h2hSummary.dev1WinningSubjects > h2hSummary.dev2WinningSubjects &&
              h2hSummary.dev1WinningSubjects > h2hSummary.tieSubjects
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
                : h2hSummary.dev2WinningSubjects > h2hSummary.dev1WinningSubjects &&
                    h2hSummary.dev2WinningSubjects > h2hSummary.tieSubjects
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-950 dark:text-rose-100'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100'
            }`}
          >
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-plane ${
                h2hSummary.dev1WinningSubjects > h2hSummary.dev2WinningSubjects &&
                h2hSummary.dev1WinningSubjects > h2hSummary.tieSubjects
                  ? 'bg-emerald-600'
                  : h2hSummary.dev2WinningSubjects > h2hSummary.dev1WinningSubjects &&
                      h2hSummary.dev2WinningSubjects > h2hSummary.tieSubjects
                    ? 'bg-rose-600'
                    : 'bg-amber-600'
              }`}
            >
              Definitive Comparative Conclusion
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {h2hSummary.headlineConclusion}
            </h3>
            <p className="text-xs opacity-90 leading-relaxed">
              Evaluated across {h2hSummary.totalSubjects} participants ({threeWayData.length} synchronized epochs) with agreed-upon tie margin &tau; = {h2hTieMargin.toFixed(1)} bpm and subject threshold |&delta;| &gt; {h2hCliffsThreshold.toFixed(2)}.
              &bull; <strong>{h2hSummary.dev1WinningSubjects} Device 1 Wins</strong> &bull; <strong>{h2hSummary.tieSubjects} Inconclusive / Ties</strong> &bull; <strong>{h2hSummary.dev2WinningSubjects} Device 2 Wins</strong>.
            </p>
          </div>

          {/* Participant Waterfall Dominance Distribution */}
          <div className="rounded-xl border border-hairline bg-surface p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Participant Dominance Distribution: Subject-Specific Cliff's Delta (δ_i)
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={h2hSummary.subjectResults.map((s, idx) => ({
                    index: idx + 1,
                    subjectId: s.subjectId,
                    cliffsDelta: s.cliffsDelta,
                    outcome: s.outcome,
                  }))}
                  margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="index"
                    tick={AXIS_TICK}
                    label={{ value: 'Participants Ranked by Cliff\'s Delta (δ)', position: 'bottom', offset: 5, style: AXIS_LABEL }}
                  />
                  <YAxis
                    domain={[-0.8, 0.8]}
                    tick={AXIS_TICK}
                    label={{ value: "Cliff's Delta (δ)", angle: -90, position: 'insideLeft', style: AXIS_LABEL }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]!.payload as { subjectId: number; cliffsDelta: number; outcome: string };
                      return (
                        <div className="rounded-lg border border-hairline bg-surface p-2 text-xs shadow-md">
                          <p className="font-bold text-ink">Participant {d.subjectId}</p>
                          <p className="font-mono text-series-3">Cliff's Delta: {d.cliffsDelta >= 0 ? '+' : ''}{d.cliffsDelta.toFixed(3)}</p>
                          <p className="capitalize text-ink-muted">Verdict: {d.outcome.replace('_', ' ')}</p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={h2hCliffsThreshold} stroke="#10b981" strokeDasharray="3 3" label={{ value: `+${h2hCliffsThreshold} Superiority`, fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={-h2hCliffsThreshold} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `-${h2hCliffsThreshold} Inferiority`, fill: '#ef4444', fontSize: 10 }} />
                  <ReferenceLine y={0} stroke="var(--color-hairline)" />
                  <Line type="stepAfter" dataKey="cliffsDelta" stroke="var(--color-series-3)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-series-3)' }} name="Cliff's Delta" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <DataTable
            caption="Subject-by-Subject Head-to-Head Dominance Table"
            columns={h2hColumns}
            rows={h2hSummary.subjectResults}
            rowKey={(r) => String(r.subjectId)}
          />

          <div className="border-t border-hairline/60 pt-3">
            <DataTable
              caption="Sample Synchronized Paired Epochs: Paired Error Differences Δ = |e1| - |e2| vs Agreed-Upon Tie Margin (First 30 Epochs)"
              columns={threeWayEpochColumns}
              rows={threeWayData.slice(0, 30)}
              rowKey={(r) => r.id}
            />
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* VECTOR 4: Two-Gate Commercial Launch Plane */}
      {/* ==================================================================== */}
      {(selectedVector === 'all' || selectedVector === 'vector4') && (
        <section aria-labelledby="vector4-heading" className="space-y-5 mb-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-series-4/10 px-2 py-0.5 text-xs font-bold text-series-4">
                  Vector 4
                </span>
                <h2 id="vector4-heading" className="text-lg font-bold tracking-tight text-ink">
                  2. Two-Gate 4-Quadrant Commercial Launch Visualizer
                </h2>
              </div>
              <p className="text-xs text-ink-secondary">
                Simultaneously evaluating Gate 1 (Absolute KPI vs Reference) and Gate 2 (Predecessor Parity vs Legacy) with 2D confidence ellipses.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLaunchBriefing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/5"
              >
                <Copy size={13} aria-hidden /> Copy Executive Briefing
              </button>
              {briefingCopyFeedback && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {briefingCopyFeedback}
                </span>
              )}
            </div>
          </div>

          {/* Candidate Archetype Presets */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Candidate Archetype Presets
            </legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {QUADRANT_CANDIDATE_PRESETS.map((p) => {
                const isSelected = selectedCandidateId === p.id;
                const cl = classifyQuadrant(p.gate1Margin >= 0, p.gate2Parity >= 0);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => applyCandidatePreset(p)}
                    className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-series-1 bg-series-1/10 shadow-sm'
                        : 'border-hairline bg-surface hover:bg-ink/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-ink">{p.name}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-muted line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-hairline/60 pt-2 text-[11px]">
                      <span className="font-mono text-ink-muted">
                        ({p.gate1Margin >= 0 ? '+' : ''}{p.gate1Margin.toFixed(2)}, {p.gate2Parity >= 0 ? '+' : ''}{p.gate2Parity.toFixed(2)})
                      </span>
                      <span className="font-semibold" style={{ color: cl.color }}>
                        {cl.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Visualizer & Executive Scorecard Grid */}
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Interactive SVG 4-Quadrant Plot */}
            <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Interactive 4-Quadrant Decision Canvas
                  </h3>
                  <span className="rounded bg-ink/5 px-2 py-0.5 text-[11px] font-mono text-ink-secondary">
                    Point: ({candGate1Margin >= 0 ? '+' : ''}{candGate1Margin.toFixed(2)}, {candGate2Parity >= 0 ? '+' : ''}{candGate2Parity.toFixed(2)})
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Drag sliders below to adjust Gate 1 clearance, Gate 2 parity, and confidence ellipse scale.
                </p>
              </div>

              {/* Responsive SVG Quadrant Canvas */}
              <div className="mt-3 relative mx-auto h-72 w-72 max-w-full aspect-square select-none overflow-hidden rounded-lg border border-hairline bg-plane">
                <svg
                  viewBox="-1.2 -1.2 2.4 2.4"
                  className="size-full overflow-visible"
                  style={{ transform: 'scaleY(-1)' }}
                >
                  <rect x="0" y="0" width="1.2" height="1.2" fill="rgba(16, 185, 129, 0.12)" />
                  <rect x="0" y="-1.2" width="1.2" height="1.2" fill="rgba(245, 158, 11, 0.12)" />
                  <rect x="-1.2" y="0" width="1.2" height="1.2" fill="rgba(245, 158, 11, 0.12)" />
                  <rect x="-1.2" y="-1.2" width="1.2" height="1.2" fill="rgba(239, 68, 68, 0.12)" />

                  <line x1="-1.2" y1="-0.5" x2="1.2" y2="-0.5" stroke="var(--color-hairline)" strokeDasharray="0.04 0.04" strokeWidth="0.01" />
                  <line x1="-1.2" y1="0.5" x2="1.2" y2="0.5" stroke="var(--color-hairline)" strokeDasharray="0.04 0.04" strokeWidth="0.01" />
                  <line x1="-0.5" y1="-1.2" x2="-0.5" y2="1.2" stroke="var(--color-hairline)" strokeDasharray="0.04 0.04" strokeWidth="0.01" />
                  <line x1="0.5" y1="-1.2" x2="0.5" y2="1.2" stroke="var(--color-hairline)" strokeDasharray="0.04 0.04" strokeWidth="0.01" />

                  <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="var(--color-ink-secondary)" strokeWidth="0.02" />
                  <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="var(--color-ink-secondary)" strokeWidth="0.02" />

                  <polygon
                    points={ellipsePoints.map((pt) => `${pt.x},${pt.y}`).join(' ')}
                    fill="rgba(59, 130, 246, 0.22)"
                    stroke="#3b82f6"
                    strokeWidth="0.02"
                    strokeDasharray="0.04 0.02"
                  />

                  <circle
                    cx={candGate1Margin}
                    cy={candGate2Parity}
                    r="0.045"
                    fill={quadrantVerdict.color}
                    stroke="#ffffff"
                    strokeWidth="0.015"
                  />
                </svg>

                <div className="pointer-events-none absolute inset-0 p-3 flex flex-col justify-between text-[11px] font-semibold">
                  <div className="flex justify-between items-start">
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-700 dark:text-amber-300">
                      Q3: AMBER (QUALITY DEBT)
                    </span>
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300">
                      Q1: GREEN LIGHT (GO)
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-700 dark:text-rose-300">
                      Q4: RED LIGHT (NO-GO)
                    </span>
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-700 dark:text-amber-300">
                      Q2: AMBER (PARITY RISK)
                    </span>
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <label htmlFor="cand-g1-margin" className="font-semibold text-ink">
                    Gate 1 Absolute Margin: {candGate1Margin >= 0 ? '+' : ''}{candGate1Margin.toFixed(2)}
                  </label>
                  <input
                    id="cand-g1-margin"
                    type="range"
                    min="-0.8"
                    max="0.8"
                    step="0.05"
                    value={candGate1Margin}
                    onChange={(e) => setCandGate1Margin(parseFloat(e.target.value))}
                    className="w-full accent-series-1"
                  />
                </div>
                <div>
                  <label htmlFor="cand-g2-parity" className="font-semibold text-ink">
                    Gate 2 Parity Margin: {candGate2Parity >= 0 ? '+' : ''}{candGate2Parity.toFixed(2)}
                  </label>
                  <input
                    id="cand-g2-parity"
                    type="range"
                    min="-0.8"
                    max="0.8"
                    step="0.05"
                    value={candGate2Parity}
                    onChange={(e) => setCandGate2Parity(parseFloat(e.target.value))}
                    className="w-full accent-series-1"
                  />
                </div>
              </div>

              {ellipseCrossesBoundaries && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-200">
                  <AlertTriangle size={14} className="shrink-0 text-amber-600" />
                  <span>
                    <strong>Statistical Uncertainty:</strong> 95% confidence ellipse crosses quadrant boundaries. Release decision carries residual sampling risk.
                  </span>
                </div>
              )}
            </div>

            {/* Commercial Mandate & Action Card */}
            <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Launch Committee Verdict
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: `${quadrantVerdict.color}20`, color: quadrantVerdict.color }}
                  >
                    {quadrantVerdict.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold tracking-tight text-ink">
                  {quadrantVerdict.name}
                </h3>

                <div className="rounded-lg border border-hairline bg-plane p-3 space-y-2 text-xs">
                  <div className="font-semibold text-ink">Commercial Meaning:</div>
                  <p className="text-ink-secondary leading-relaxed">{quadrantVerdict.commercialMeaning}</p>
                </div>

                <div className="rounded-lg border border-hairline bg-plane p-3 space-y-2 text-xs">
                  <div className="font-semibold text-ink">Action Mandate:</div>
                  <p className="text-ink-secondary leading-relaxed">{quadrantVerdict.actionMandate}</p>
                </div>
              </div>

              <div className="border-t border-hairline pt-3 flex justify-between items-center text-xs">
                <span className="text-ink-muted">Dual-Gate Clearance:</span>
                <span className="font-mono font-bold text-ink">
                  Gate 1: {candGate1Margin >= 0 ? '✓ PASS' : '✗ FAIL'} | Gate 2: {candGate2Parity >= 0 ? '✓ PASS' : '✗ FAIL'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* VECTOR 5: Multi-Generation Transitive Drift Canary */}
      {/* ==================================================================== */}
      {(selectedVector === 'all' || selectedVector === 'vector5') && (
        <section aria-labelledby="vector5-heading" className="space-y-5 mb-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-rose-600/10 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  Vector 5
                </span>
                <h2 id="vector5-heading" className="text-lg font-bold tracking-tight text-ink">
                  Multi-Generation Transitive Drift Canary
                </h2>
              </div>
              <p className="text-xs text-ink-secondary">
                Indirect network comparisons across iterations 1 -&gt; 2 -&gt; 3 -&gt; 4 to catch silent software drift before market release.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="canary-limit-slider" className="text-xs font-semibold text-ink-muted">
                Canary Limit: +{canaryLimit.toFixed(2)} bpm
              </label>
              <input
                id="canary-limit-slider"
                type="range"
                min="0.50"
                max="1.50"
                step="0.05"
                value={canaryLimit}
                onChange={(e) => setCanaryLimit(parseFloat(e.target.value))}
                className="w-24 accent-rose-600"
              />
            </div>
          </div>

          {/* Canary Alarm Banner */}
          {transitiveDriftSummary.hasCanaryAlarm ? (
            <div className="rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 p-5 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertTriangle size={18} />
                <span className="text-sm font-extrabold uppercase tracking-wider">
                  CANARY ALARM: Silent Algorithmic Drift Detected!
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-rose-950 dark:text-rose-100 leading-relaxed">
                {transitiveDriftSummary.alarmMessage}
              </p>
              <p className="text-xs text-rose-900/80 dark:text-rose-200/80 leading-relaxed">
                Notice: Every single release cleared its individual step-wise non-inferiority gate against its immediate predecessor (+0.28, +0.32, +0.35 bpm vs +0.50 bpm target). However, because no indirect anchor test back to Generation 1 was conducted, cumulative drift (+0.95 bpm) breached the multi-generation canary budget!
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Transitive Drift Guard Clear:</strong> Cumulative drift across all device iterations (+{transitiveDriftSummary.totalTransitiveDrift.toFixed(2)} bpm) remains within the multi-generation budget (+{canaryLimit.toFixed(2)} bpm).
              </span>
            </div>
          )}

          {/* Transitive Drift Canary Progression Table */}
          <DataTable
            caption="Multi-Generation Transitive Drift History & Canary Tracking"
            columns={transitiveColumns}
            rows={transitiveDriftSummary.generations}
            rowKey={(r) => r.genId}
          />

          <div className="rounded-xl border border-hairline bg-surface p-4 text-xs text-ink-secondary space-y-1">
            <div className="font-semibold text-ink">Why Transitive Canary Testing Matters:</div>
            <p className="leading-relaxed">{transitiveDriftSummary.canaryExplanation}</p>
          </div>
        </section>
      )}

      {/* Export Preview Modal */}
      {activeExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal backdrop"
            onClick={() => setActiveExportModal(null)}
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs cursor-default"
            tabIndex={-1}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-hairline bg-surface p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 id="export-modal-title" className="text-sm font-bold text-ink">
                {exportModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setActiveExportModal(null)}
                className="rounded-lg p-1 text-ink-muted hover:bg-ink/5 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <pre className="flex-1 overflow-auto rounded-xl border border-hairline bg-plane p-4 text-xs font-mono text-ink leading-relaxed select-all">
              {exportModalContent}
            </pre>

            <div className="flex items-center justify-between pt-2 border-t border-hairline">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {copyFeedback}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(exportModalContent, 'Copied to clipboard!', setCopyFeedback)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-plane hover:opacity-90 transition-opacity"
                >
                  <Copy size={13} /> Copy to Clipboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExportModal(null)}
                  className="rounded-lg border border-hairline bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-ink/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NextSteps Workflow Bridge */}
      <NextSteps
        steps={[
          {
            to: '/protocol-studio',
            title: 'Protocol Studio: Sample Size & Sizing',
            description:
              'Size your validation protocol for Bland-Altman LoA precision before collecting data and generating reports.',
          },
          {
            to: '/academy',
            title: 'Validation Academy: 8 Interactive Case Studies',
            description:
              'Walk through the complete lifecycle of wearable algorithm validation using the fictional Meridian PulseBand 2.',
          },
          {
            to: '/chance-kpi',
            title: 'False-Pass Auditor: Pass by Chance?',
            description:
              'Test whether passing an accuracy KPI was genuine or an artifact of narrow physiological dynamic range.',
          },
        ]}
      />
    </ModulePage>
  );
}
