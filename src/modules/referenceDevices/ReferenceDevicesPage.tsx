import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  DollarSign,
  ExternalLink,
  FlaskConical,
  Layers,
  Lock,
  Scale,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  Unlock,
  X,
  Zap,
} from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import MethodsText from '../../components/common/MethodsText.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import NextSteps from '../../app/study/NextSteps.tsx';
import { useStudy } from '../../app/study/StudyContext.tsx';
import { BLAND_ALTMAN_1999, ISO_80601_2_61, ISO_81060_2 } from '../../content/citations.ts';
import type { FeatureDomainId, ReferenceDevice, ReferenceTier } from '../../content/referenceDevices/types.ts';
import { FEATURE_DOMAINS } from '../../content/referenceDevices/catalog.ts';
import {
  calculateReferenceNoiseImpact,
  calculateStudyConsumableBudget,
  DATA_GRANULARITY_LABELS,
  DEFAULT_PROTOCOL_CONSTRAINTS,
  diagnoseProtocolConflicts,
  evaluateProtocolFit,
  filterDevices,
  FORM_FACTOR_LABELS,
  getDevicesForDomain,
  getDomainById,
  OFFLOAD_MECHANISM_LABELS,
  STUDY_ARCHETYPE_PRESETS,
  type ProtocolConstraints,
} from './referenceDevicesModel.ts';

const TIER_OPTIONS = [
  { value: 'all', label: 'All Standards (Gold, Silver, Bronze)' },
  { value: 'gold', label: 'Gold Standard (Clinical Criterion)' },
  { value: 'silver', label: 'Silver Standard (Clinical Research Benchmark)' },
  { value: 'bronze', label: 'Bronze Standard (Consumer / Wearable Instrument)' },
] as const;

const ENDPOINT_STATUS_OPTIONS = [
  { value: 'any', label: 'Any Endpoint Role' },
  { value: 'exploratory_trend', label: 'Exploratory / Observational Trend' },
  { value: 'formal_trial_endpoint', label: 'Formal Trial Endpoint (Locked Firmware)' },
] as const;

const PHYSIOLOGICAL_CONSTRUCT_OPTIONS = [
  { value: 'any', label: 'Any Sampling Window' },
  { value: 'nocturnal_or_resting', label: 'Nocturnal / Resting Window Only' },
  { value: 'continuous_24h_ambulatory', label: 'Continuous 24-Hour (Waking + Sleeping)' },
] as const;

const REQUIRED_GRANULARITY_OPTIONS = [
  { value: 'any', label: 'Any Temporal Resolution' },
  { value: 'summary_or_5min', label: 'Nightly Summaries or 5-Min Blocks' },
  { value: 'epoch_30s_clinical', label: '30-Second Clinical Epochs (AASM)' },
  { value: 'beat_to_beat_or_raw', label: 'Beat-to-Beat IBI (RR) or Raw Waveform' },
] as const;

const MONITORING_CADENCE_OPTIONS = [
  { value: 'any', label: 'Any Wear Duration' },
  { value: 'episodic_1_to_2_nights', label: 'Episodic Snapshot (24–48 Hours)' },
  { value: 'habitual_multi_week', label: 'Multi-Week Habitual Free-Living' },
] as const;

const DATA_OFFLOAD_OPTIONS = [
  { value: 'any', label: 'Any Data Offload Model' },
  { value: 'remote_cloud_sync', label: 'Remote Cloud / API Sync' },
  { value: 'direct_local_offload', label: 'Direct Local USB / SD / BLE Offload' },
] as const;

export default function ReferenceDevicesPage() {
  const { study, updateStudy } = useStudy();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read domain from URL query param if present
  const initialDomain = (searchParams.get('domain') as FeatureDomainId) || 'spo2';
  const validDomain = FEATURE_DOMAINS.some((d) => d.id === initialDomain) ? initialDomain : 'spo2';

  const [selectedDomainId, setSelectedDomainId] = useState<FeatureDomainId>(validDomain);
  const [selectedTier, setSelectedTier] = useState<ReferenceTier | 'all'>('all');
  const [activeDossierDevice, setActiveDossierDevice] = useState<ReferenceDevice | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'matrix' | 'gotchas'>('cards');
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  // Protocol Pressure-Test Console state
  const [protocolConstraints, setProtocolConstraints] = useState<ProtocolConstraints>(
    DEFAULT_PROTOCOL_CONSTRAINTS,
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Noise & Sample Size Simulator Controls
  const [baseN, setBaseN] = useState<number>(() => study.n ?? 60);
  const [expectedDutSd, setExpectedDutSd] = useState<number>(() => study.measurementSd ?? 1.5);
  const [selectedRefDeviceId, setSelectedRefDeviceId] = useState<string>('masimo-radical-7');

  const domain = useMemo(() => getDomainById(selectedDomainId), [selectedDomainId]);
  const domainDevices = useMemo(() => getDevicesForDomain(selectedDomainId), [selectedDomainId]);
  const displayedDevices = useMemo(
    () => filterDevices(selectedDomainId, selectedTier),
    [selectedDomainId, selectedTier],
  );

  const hasActiveConstraints = useMemo(
    () => Object.values(protocolConstraints).some((v) => v !== 'any'),
    [protocolConstraints],
  );

  const deviceEvaluations = useMemo(() => {
    const map = new Map<string, ReturnType<typeof evaluateProtocolFit>>();
    for (const dev of displayedDevices) {
      map.set(dev.id, evaluateProtocolFit(dev, protocolConstraints));
    }
    return map;
  }, [displayedDevices, protocolConstraints]);

  const protocolConflictDiagnostic = useMemo(() => {
    const evaluationsList = displayedDevices.map((device) => ({
      device,
      fit: deviceEvaluations.get(device.id) ?? evaluateProtocolFit(device, protocolConstraints),
    }));
    return diagnoseProtocolConflicts(selectedDomainId, protocolConstraints, evaluationsList);
  }, [selectedDomainId, protocolConstraints, displayedDevices, deviceEvaluations]);

  // Switch domain handler with URL synchronization
  const handleDomainChange = (newDomainId: FeatureDomainId) => {
    setSelectedDomainId(newDomainId);
    setSearchParams({ domain: newDomainId }, { replace: true });

    // Update active reference device for the newly selected domain
    const devices = getDevicesForDomain(newDomainId);
    const silver = devices.find((d) => d.tier === 'silver') ?? devices[0];
    if (silver) {
      setSelectedRefDeviceId(silver.id);
      if (silver.measurementSd > 0) {
        setExpectedDutSd(Number((silver.measurementSd * 1.5).toFixed(2)));
      }
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = STUDY_ARCHETYPE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setProtocolConstraints(preset.constraints);
    if (preset.recommendedDomain && preset.recommendedDomain !== selectedDomainId) {
      handleDomainChange(preset.recommendedDomain);
    }
  };

  const handleResetConstraints = () => {
    setActivePresetId(null);
    setProtocolConstraints(DEFAULT_PROTOCOL_CONSTRAINTS);
  };

  // Active Reference Device for Noise Inflation calculation
  const selectedRefDevice = useMemo(() => {
    return (
      domainDevices.find((d) => d.id === selectedRefDeviceId) ??
      domainDevices.find((d) => d.tier === 'silver') ??
      domainDevices[0]
    );
  }, [domainDevices, selectedRefDeviceId]);

  // Statistical inflation calculation
  const noiseImpact = useMemo(() => {
    const refSd = selectedRefDevice ? selectedRefDevice.measurementSd : 0;
    return calculateReferenceNoiseImpact(baseN, expectedDutSd, refSd);
  }, [baseN, expectedDutSd, selectedRefDevice]);

  // Consumables calculation
  const consumableBudget = useMemo(() => {
    const cost = selectedRefDevice ? selectedRefDevice.economics.perSubjectConsumableCost : 0;
    return calculateStudyConsumableBudget(noiseImpact.adjustedN, cost);
  }, [noiseImpact.adjustedN, selectedRefDevice]);

  // Variance breakdown percentages
  const varianceBreakdown = useMemo(() => {
    const dutVar = Math.pow(expectedDutSd, 2);
    const refVar = Math.pow(selectedRefDevice ? selectedRefDevice.measurementSd : 0, 2);
    const totalVar = dutVar + refVar;
    if (totalVar <= 0) return { dutPct: 100, refPct: 0 };
    const dutPct = Math.round((dutVar / totalVar) * 100);
    const refPct = 100 - dutPct;
    return { dutPct, refPct, dutVar, refVar, totalVar };
  }, [expectedDutSd, selectedRefDevice]);

  const handleApplyToPlan = () => {
    updateStudy({
      n: noiseImpact.adjustedN,
      measurementSd: Number(noiseImpact.totalDiffSd.toFixed(2)),
      unit: domain.primaryUnit,
      nSource: `Reference Adjusted (${selectedRefDevice?.name ?? 'Standard'})`,
    });
    setAppliedFeedback(true);
    setTimeout(() => {
      setAppliedFeedback(false);
    }, 2500);
  };

  // Next/Previous device in dossier modal
  const handleModalNav = (direction: 'next' | 'prev') => {
    if (!activeDossierDevice) return;
    const currentIndex = domainDevices.findIndex((d) => d.id === activeDossierDevice.id);
    if (currentIndex === -1) return;
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % domainDevices.length
        : (currentIndex - 1 + domainDevices.length) % domainDevices.length;
    const nextDevice = domainDevices[newIndex];
    if (nextDevice) {
      setActiveDossierDevice(nextDevice);
    }
  };

  return (
    <ModulePage
      eyebrow="PROTOCOL STUDIO • TOOL 00"
      accent="series-1"
      title="Which reference standard should I validate against?"
      method="Reference Device Selection, Protocol Pressure-Testing & Noise Allocation"
      currentN={noiseImpact.adjustedN}
      intro={
        <p className="leading-relaxed">
          Selecting a reference standard or clinical study wearable is governed by your hypothesis and protocol
          constraints—granularity (continuous beat-to-beat IBI vs nocturnal HRV), sleep staging fidelity, wear horizon,
          firmware stability, and API/contract walls. Validating against a noisy silver or bronze comparator also
          introduces reference error variance{' '}
          <span className="font-mono text-ink font-semibold">σ²_REF</span>, which directly inflates the limits of
          agreement and requires a larger sample size{' '}
          <span className="font-mono text-ink font-semibold">n</span> to maintain statistical power.
        </p>
      }
      assumption={
        <>
          Total observed difference variance is partitioned as{' '}
          <strong className="text-ink">σ²_diff = σ²_DUT + σ²_REF</strong> under independent measurement error. Sizing a
          study assuming an error-free gold standard (σ_REF = 0) while testing against a wearable or ambulatory silver
          comparator severely underpowers the trial.
        </>
      }
      controls={
        <div className="space-y-6">
          {/* Domain Selector with Quick Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Biometric Feature Domain
              </span>
              <span className="text-[10px] text-ink-muted">{FEATURE_DOMAINS.length} Domains</span>
            </div>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
              {FEATURE_DOMAINS.map((f) => {
                const isSelected = f.id === selectedDomainId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleDomainChange(f.id)}
                    className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition-all ${
                      isSelected
                        ? 'border border-series-1 bg-series-1/10 font-bold text-series-1 shadow-2xs'
                        : 'border border-hairline bg-surface text-ink hover:border-hairline-strong'
                    }`}
                  >
                    <span className="leading-snug">{f.name}</span>
                    {f.isPriorityTop5 && (
                      <span className="shrink-0 rounded-md bg-series-1/20 px-1.5 py-0.5 text-[9px] font-bold text-series-1 uppercase">
                        Core 5
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier Filter */}
          <SelectField
            label="Filter Reference Tier"
            value={selectedTier}
            options={TIER_OPTIONS}
            onChange={(val) => setSelectedTier(val as ReferenceTier | 'all')}
          />

          {/* Noise Sizing Impact Box */}
          <div className="rounded-2xl border border-hairline bg-plane p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-series-1" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                Reference Noise Sizer
              </h3>
            </div>

            <SelectField
              label="Active Reference Comparator"
              value={selectedRefDeviceId}
              options={domainDevices.map((d) => ({
                value: d.id,
                label: `[${d.tier.toUpperCase()}] ${d.name}`,
              }))}
              onChange={(val) => setSelectedRefDeviceId(val)}
              hint="Select the comparator to calculate variance inflation."
            />

            <NumberField
              label="Gold-Standard Target Sample Size (n)"
              value={baseN}
              min={10}
              max={500}
              step={5}
              onChange={setBaseN}
              hint="Sample size sized assuming zero reference error."
            />

            <NumberField
              label={`Estimated Wearable SD (σ_DUT)`}
              value={expectedDutSd}
              min={0.01}
              max={100}
              step={0.1}
              suffix={domain.primaryUnit}
              onChange={setExpectedDutSd}
              hint="Expected device-under-test standard deviation."
            />

            {/* Visual Variance Decomposition Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-ink-muted">
                <span>Variance Decomposition:</span>
                <span className="font-mono">
                  DUT: <strong className="text-ink">{varianceBreakdown.dutPct}%</strong> • REF:{' '}
                  <strong className="text-series-1">{varianceBreakdown.refPct}%</strong>
                </span>
              </div>
              <div className="h-2 w-full flex rounded-full overflow-hidden bg-hairline">
                <div
                  className="bg-ink transition-all duration-300"
                  style={{ width: `${varianceBreakdown.dutPct}%` }}
                  title={`DUT Error Variance: ${varianceBreakdown.dutPct}%`}
                />
                <div
                  className="bg-series-1 transition-all duration-300"
                  style={{ width: `${varianceBreakdown.refPct}%` }}
                  title={`Reference Noise Variance: ${varianceBreakdown.refPct}%`}
                />
              </div>
            </div>

            {/* Sizing Impact Metrics */}
            <div className="rounded-xl border border-hairline bg-surface p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center text-ink-secondary">
                <span>Reference Noise (σ_REF):</span>
                <span className="font-mono font-semibold text-ink">
                  ± {selectedRefDevice?.measurementSd ?? 0} {domain.primaryUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-ink-secondary">
                <span>Combined Diff SD (σ_diff):</span>
                <span className="font-mono font-bold text-series-1">
                  ± {noiseImpact.totalDiffSd.toFixed(2)} {domain.primaryUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-ink-secondary">
                <span>Variance Multiplier:</span>
                <span className="font-mono font-bold text-ink">
                  × {noiseImpact.sampleSizeMultiplier.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-hairline pt-2 flex justify-between items-center">
                <span className="font-bold text-ink">Adjusted Required n:</span>
                <div className="text-right">
                  <span className="font-mono text-sm font-extrabold text-series-1">
                    {noiseImpact.adjustedN}
                  </span>
                  {noiseImpact.penaltySubjects > 0 && (
                    <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      (+{noiseImpact.penaltySubjects} subjects penalty)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyToPlan}
              className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition-all duration-200 ${
                appliedFeedback
                  ? 'bg-emerald-600 text-white'
                  : 'bg-ink text-plane hover:opacity-90'
              }`}
            >
              {appliedFeedback ? (
                <>
                  <Check size={14} />
                  <span>Applied n = {noiseImpact.adjustedN} to Study Plan!</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Carry n = {noiseImpact.adjustedN} to Study Plan</span>
                </>
              )}
            </button>
          </div>

          {/* Consumable Budget Card */}
          <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400" />
                Consumables Estimate
              </span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                ${consumableBudget.totalConsumableCostUsd.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Based on ${selectedRefDevice?.economics.perSubjectConsumableCost.toFixed(2)}/subject across{' '}
              {consumableBudget.totalKitsNeeded} kits ({noiseImpact.adjustedN} subjects + 15% attrition buffer).
            </p>
          </div>
        </div>
      }
      methodNotes={
        <div className="space-y-4">
          <p>
            When assessing agreement between two measurement methods, Bland &amp; Altman (1999) demonstrated that the
            variance of paired differences between method 1 (DUT) and method 2 (Reference) is the sum of their
            individual measurement error variances when errors are independent:
          </p>
          <div className="rounded-xl border border-hairline bg-surface p-4 font-mono text-xs">
            σ²_diff = σ²_DUT + σ²_REF - 2·Cov(DUT, REF) + σ²_sync
          </div>
          <p>
            In clinical pulse oximetry, ISO 80601-2-61 explicitly requires blood gas CO-oximetry as the reference
            criterion (CLSI C46-A2) for claims spanning the 70% to 100% saturation range. Using a secondary benchtop
            pulse oximeter as the comparator introduces an empirical noise floor of ± 1.5% to 3.0%, demanding a
            proportional sample size increase to demonstrate limits of agreement compliance.
          </p>
          <MethodsText
            text="When assessing agreement between two measurement methods, Bland & Altman (1999) demonstrated that the total variance of paired differences is the sum of device error variance and reference error variance when errors are independent: σ²_diff = σ²_DUT + σ²_REF. Sizing a trial against a silver or bronze reference with non-zero measurement noise requires inflating sample size by (1 + σ²_REF / σ²_DUT) to maintain pre-specified limits-of-agreement confidence bounds."
            citations={[BLAND_ALTMAN_1999, ISO_80601_2_61, ISO_81060_2]}
          />
        </div>
      }
    >
      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-2 border-b border-hairline/60">
          <div className="flex flex-wrap items-center gap-2 text-ink-muted">
            <Link
              to="/reference-device-catalog"
              className="inline-flex items-center gap-1 font-semibold text-series-1 hover:underline transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Reference Catalog Hub</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-ink">{domain.name}</span>
          </div>

          <Link
            to="/protocol-studio"
            className="inline-flex items-center gap-1 font-semibold text-ink-secondary hover:text-ink transition-colors ml-auto sm:ml-0"
          >
            <span>Protocol Studio</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Domain Headline Banner */}
        <section className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-series-1/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-series-1">
                {domain.name}
              </span>
              <span className="text-xs text-ink-muted">Primary Unit: {domain.primaryUnit}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span>FDA Product Codes:</span>
              {domain.primaryFdaProductCodes.map((code: string) => (
                <span key={code} className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                  {code}
                </span>
              ))}
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink">
            {domain.tagline}
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            {domain.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-hairline text-xs">
            <span className="text-ink-muted font-medium">Consensus Standards:</span>
            {domain.keyConsensusStandards.map((std: string) => (
              <span key={std} className="rounded-md border border-hairline bg-plane px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
                {std}
              </span>
            ))}
          </div>
        </section>

        {/* Protocol Pressure-Test Console */}
        <section
          aria-label="Protocol Pressure-Test Console"
          className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6 shadow-2xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FlaskConical size={16} className="text-series-1" />
                <h3 className="text-sm sm:text-base font-bold text-ink">
                  Protocol Pressure-Test Console: Match Instrument to Study Hypotheses
                </h3>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Before choosing a device for data access convenience, pressure-test candidate instruments against the 5
                foundational protocol questions that govern physiological validity, participant burden, and API walls.
              </p>
            </div>
            {hasActiveConstraints && (
              <button
                type="button"
                onClick={handleResetConstraints}
                className="self-start sm:self-auto shrink-0 rounded-xl border border-hairline bg-plane px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:text-ink transition-colors"
              >
                Reset Protocol Filters
              </button>
            )}
          </div>

          {/* 4 Study Archetype Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
              Quick-Load Study Archetype Presets:
            </span>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {STUDY_ARCHETYPE_PRESETS.map((preset) => {
                const isPresetActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`rounded-xl border p-3 text-left transition-all space-y-1 ${
                      isPresetActive
                        ? 'border-series-1 bg-series-1/10 ring-1 ring-series-1/30'
                        : 'border-hairline bg-plane hover:border-series-1/40'
                    }`}
                  >
                    <div className="text-xs font-bold text-ink">{preset.shortLabel}</div>
                    <p className="text-[11px] text-ink-secondary leading-relaxed">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 Foundational Protocol Constraints */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 pt-2 border-t border-hairline">
            <SelectField
              label="1. Endpoint Status"
              value={protocolConstraints.endpointStatus}
              options={ENDPOINT_STATUS_OPTIONS}
              onChange={(val) => {
                setActivePresetId(null);
                setProtocolConstraints((prev) => ({
                  ...prev,
                  endpointStatus: val as ProtocolConstraints['endpointStatus'],
                }));
              }}
            />
            <SelectField
              label="2. Sampling Window"
              value={protocolConstraints.physiologicalConstruct}
              options={PHYSIOLOGICAL_CONSTRUCT_OPTIONS}
              onChange={(val) => {
                setActivePresetId(null);
                setProtocolConstraints((prev) => ({
                  ...prev,
                  physiologicalConstruct: val as ProtocolConstraints['physiologicalConstruct'],
                }));
              }}
            />
            <SelectField
              label="3. Required Granularity"
              value={protocolConstraints.requiredGranularity}
              options={REQUIRED_GRANULARITY_OPTIONS}
              onChange={(val) => {
                setActivePresetId(null);
                setProtocolConstraints((prev) => ({
                  ...prev,
                  requiredGranularity: val as ProtocolConstraints['requiredGranularity'],
                }));
              }}
            />
            <SelectField
              label="4. Monitoring Cadence"
              value={protocolConstraints.monitoringCadence}
              options={MONITORING_CADENCE_OPTIONS}
              onChange={(val) => {
                setActivePresetId(null);
                setProtocolConstraints((prev) => ({
                  ...prev,
                  monitoringCadence: val as ProtocolConstraints['monitoringCadence'],
                }));
              }}
            />
            <SelectField
              label="5. Data Offload Model"
              value={protocolConstraints.dataOffloadModel}
              options={DATA_OFFLOAD_OPTIONS}
              onChange={(val) => {
                setActivePresetId(null);
                setProtocolConstraints((prev) => ({
                  ...prev,
                  dataOffloadModel: val as ProtocolConstraints['dataOffloadModel'],
                }));
              }}
            />
          </div>

          {/* Protocol Conflict Diagnostic Banner */}
          {protocolConflictDiagnostic && protocolConflictDiagnostic.hasConflict && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{protocolConflictDiagnostic.title}</span>
              </div>
              <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                {protocolConflictDiagnostic.explanation}
              </p>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 leading-relaxed">
                {protocolConflictDiagnostic.recommendedResolution}
              </p>
            </div>
          )}
        </section>

        {/* View Mode Toggle Header */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">
                Candidate Reference &amp; Study Instruments ({displayedDevices.length} available)
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Inspect 10-dimension engineering dossiers, study-fit guidance, or compare specifications side-by-side.
              </p>
            </div>

            {/* Segmented View Mode Control */}
            <div className="flex items-center gap-1 rounded-xl border border-hairline bg-plane p-1 text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-surface font-bold text-ink shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Layers size={13} />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                  viewMode === 'matrix'
                    ? 'bg-surface font-bold text-series-1 shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <TableIcon size={13} />
                <span>Comparison Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('gotchas')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                  viewMode === 'gotchas'
                    ? 'bg-surface font-bold text-amber-700 dark:text-amber-400 shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <AlertTriangle size={13} />
                <span>Field Gotchas</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: CARDS */}
          {viewMode === 'cards' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedDevices.map((device) => {
                const tierBadgeClass =
                  device.tier === 'gold'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    : device.tier === 'silver'
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                      : 'bg-orange-600/10 text-orange-700 dark:text-orange-300 border-orange-600/30';

                const isSelectedForNoise = selectedRefDeviceId === device.id;
                const fitEval = deviceEvaluations.get(device.id);
                const si = device.studyInstrument;

                return (
                  <div
                    key={device.id}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-md ${
                      isSelectedForNoise
                        ? 'border-series-1 bg-surface ring-1 ring-series-1/40'
                        : 'border-hairline bg-surface hover:border-series-1/40'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${tierBadgeClass}`}
                        >
                          {device.tier} STANDARD
                        </span>
                        <span className="font-mono text-[11px] text-ink-muted">
                          {device.regulatory.clearancePathway}
                        </span>
                      </div>

                      {/* Protocol Fit Badge when constraints are active */}
                      {hasActiveConstraints && fitEval && (
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                              fitEval.status === 'compatible'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : fitEval.status === 'conditional'
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                  : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {fitEval.status === 'compatible'
                              ? '✓ Protocol Match'
                              : fitEval.status === 'conditional'
                                ? '⚠ Conditional Fit'
                                : '✕ Protocol Mismatch'}
                          </span>
                          {fitEval.status === 'mismatch' && fitEval.reasons.length > 0 && (
                            <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-snug">
                              {fitEval.reasons[0]}
                            </p>
                          )}
                          {fitEval.status === 'conditional' && fitEval.tradeoffs.length > 0 && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug">
                              {fitEval.tradeoffs[0]}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Titles */}
                      <div>
                        <h4 className="text-base font-bold text-ink group-hover:text-series-1 transition-colors">
                          {device.name}
                        </h4>
                        <p className="text-xs text-ink-muted">{device.vendor}</p>
                      </div>

                      <p className="text-xs text-ink-secondary leading-relaxed">
                        {device.tagline}
                      </p>

                      {/* Study Instrument Quick Badges */}
                      {si && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="rounded-md border border-hairline bg-plane px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
                            {FORM_FACTOR_LABELS[si.formFactor]}
                          </span>
                          <span className="rounded-md border border-hairline bg-plane px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
                            {DATA_GRANULARITY_LABELS[si.dataGranularity]}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                              si.firmwareLockSupported
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {si.firmwareLockSupported ? <Lock size={10} /> : <Unlock size={10} />}
                            {si.firmwareLockSupported ? 'Firmware Lockable' : 'Uncontrolled OTA'}
                          </span>
                        </div>
                      )}

                      {/* Key Spec Badges */}
                      <div className="space-y-2 border-t border-hairline pt-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-ink-muted flex items-center gap-1 font-medium">
                            <ShieldCheck size={13} className="text-series-1 shrink-0" />
                            Predicate Cited:
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-ink pl-4 break-words">
                            {device.regulatory.predicateChain}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted flex items-center gap-1">
                            <Cpu size={13} className="text-blue-600 dark:text-blue-400" /> Pipeline:
                          </span>
                          <span className="font-medium text-[11px] text-ink flex items-center gap-1">
                            <span className="font-mono font-bold text-series-1">{device.dataPipeline.easeScore}/5</span>
                            <span className="text-[10px] text-ink-muted">
                              ({device.dataPipeline.fileFormats[0]})
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted flex items-center gap-1">
                            <Scale size={13} className="text-emerald-600 dark:text-emerald-400" /> Noise Floor:
                          </span>
                          <span className="font-mono text-[11px] font-bold text-ink">
                            ± {device.measurementSd} {domain.primaryUnit}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted flex items-center gap-1">
                            <DollarSign size={13} className="text-amber-600 dark:text-amber-400" /> Consumable:
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-ink">
                            ${device.economics.perSubjectConsumableCost.toFixed(2)} / pt
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 border-t border-hairline pt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedRefDeviceId(device.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          isSelectedForNoise
                            ? 'bg-series-1 text-plane font-bold shadow-2xs'
                            : 'bg-ink/5 text-ink hover:bg-ink/10'
                        }`}
                      >
                        {isSelectedForNoise ? '✓ Active in Sizer' : 'Use in Sizer'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDossierDevice(device)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-series-1 hover:underline"
                      >
                        <span>Full Dossier</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: COMPARISON MATRIX */}
          {viewMode === 'matrix' && (
            <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface shadow-2xs">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-plane/50 text-ink-muted">
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] w-48">Dimension</th>
                    {displayedDevices.map((d) => (
                      <th key={d.id} className="p-3.5 font-bold text-ink min-w-[210px]">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`self-start rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                              d.tier === 'gold'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : d.tier === 'silver'
                                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                  : 'bg-orange-600/10 text-orange-700 dark:text-orange-300'
                            }`}
                          >
                            {d.tier}
                          </span>
                          <span className="leading-snug">{d.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-ink-secondary">
                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">Form Factor &amp; Battery</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5 space-y-1">
                        <div className="font-semibold text-ink">
                          {d.studyInstrument ? FORM_FACTOR_LABELS[d.studyInstrument.formFactor] : 'Clinical Standard'}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {d.studyInstrument?.typicalBatteryLife ?? 'AC / Standard'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">Data Granularity &amp; Lock</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5 space-y-1">
                        <div className="font-semibold text-ink">
                          {d.studyInstrument ? DATA_GRANULARITY_LABELS[d.studyInstrument.dataGranularity] : 'Standard'}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {d.studyInstrument?.firmwareLockSupported
                            ? '✓ Firmware Lockable'
                            : '⚠ Uncontrolled Consumer OTA'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">Clearance &amp; Predicate</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5 space-y-1">
                        <div className="font-mono text-ink font-semibold">
                          {d.regulatory.clearancePathway} {d.regulatory.clearanceNumber && `(${d.regulatory.clearanceNumber})`}
                        </div>
                        <div className="text-[11px] text-ink-muted">Cites: {d.regulatory.predicateChain}</div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">Reported Accuracy</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5 space-y-1">
                        {d.regulatory.reportedClearanceResults.slice(0, 2).map((res, i) => (
                          <div key={i} className="text-[11px]">
                            <span className="font-medium text-ink">{res.metric}:</span>{' '}
                            <span className="font-mono font-bold text-series-1">{res.value}</span>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">Pipeline &amp; File Format</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5 space-y-1">
                        <div className="font-mono font-bold text-series-1">
                          Score: {d.dataPipeline.easeScore}/5
                        </div>
                        <div className="text-[11px] text-ink">{d.dataPipeline.fileFormats.join(', ')}</div>
                        <div className="text-[10px] text-ink-muted">{d.dataPipeline.licensingPaywall}</div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">Sync &amp; Clock Drift</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5 space-y-1">
                        <div className="text-ink font-mono">{d.synchronization.nativeSamplingRate}</div>
                        <div className="text-[11px] text-ink-muted">Pins: {d.synchronization.syncHardware[0]}</div>
                        <div className="text-[10px] font-mono text-ink-muted">~{d.synchronization.clockDriftPpm} ppm drift</div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">CapEx &amp; Consumables</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5 space-y-1">
                        <div className="font-mono text-ink font-semibold">{d.economics.capexRange}</div>
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${d.economics.perSubjectConsumableCost.toFixed(2)} / subject
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">Reference Noise Floor</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5">
                        <span className="font-mono font-bold text-ink">
                          ± {d.measurementSd} {domain.primaryUnit}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-ink bg-plane/20">Action</td>
                    {displayedDevices.map((d) => (
                      <td key={d.id} className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setActiveDossierDevice(d)}
                          className="font-bold text-series-1 hover:underline text-xs"
                        >
                          View 10-Dim Dossier →
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW MODE 3: FIELD GOTCHAS */}
          {viewMode === 'gotchas' && (
            <div className="space-y-4">
              {displayedDevices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                      <div className="text-sm font-bold text-amber-950 dark:text-amber-200">
                        {device.name} ({device.tier.toUpperCase()} STANDARD)
                      </div>
                    </div>
                    <span className="text-[11px] text-amber-900 dark:text-amber-300 font-semibold">{device.vendor}</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 text-xs">
                    {device.fieldGotchas.map((gotcha, i) => (
                      <div key={i} className="rounded-xl border border-amber-500/20 bg-plane p-3 space-y-1">
                        <span className="font-bold text-amber-800 dark:text-amber-300 text-[11px]">Field Pitfall #{i + 1}</span>
                        <p className="text-ink leading-relaxed">{gotcha}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Clinical Gotchas Callout Banner for active comparator */}
        {viewMode !== 'gotchas' && (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Hard-Won Clinical Protocol Lessons ({domain.name})
              </h4>
            </div>
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Active Comparator: {selectedRefDevice?.name}
            </div>
            <div className="grid gap-2 text-xs text-amber-950/90 dark:text-amber-100 leading-relaxed sm:grid-cols-2">
              {selectedRefDevice?.fieldGotchas.map((gotcha, i) => (
                <div key={i} className="rounded-xl border border-amber-500/20 bg-plane p-3 space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300">Operational Trap #{i + 1}</span>
                  <p>{gotcha}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Next Steps Workflow Integration */}
        <NextSteps
          steps={[
            {
              to: '/agreement',
              title: 'Sample Size for Agreement',
              description: `Apply σ_diff = ± ${noiseImpact.totalDiffSd.toFixed(2)} ${domain.primaryUnit} to solve for exact Bland-Altman LoA bounds.`,
            },
            {
              to: '/repeated-measures',
              title: 'Repeated Measures Clustering',
              description: 'Partition between-subject biological variance from within-subject sensor repeatability.',
            },
            {
              to: '/timeline',
              title: 'Study Timeline Simulator',
              description: 'Propagate consumable lead times and subject recruitment ramp into the operations Monte Carlo.',
            },
          ]}
        />
      </div>

      {/* Full Spec Sheet & Study Instrument Dossier Modal */}
      {activeDossierDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-hairline bg-plane p-5 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-hairline pb-4 sticky top-0 bg-plane z-10 pt-1">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-series-1/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-series-1">
                    {activeDossierDevice.tier.toUpperCase()} STANDARD
                  </span>
                  <span className="text-xs text-ink-muted">{activeDossierDevice.model}</span>
                  {activeDossierDevice.studyInstrument && (
                    <span className="rounded-md border border-hairline bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                      Guidance Status: {activeDossierDevice.studyInstrument.reviewStatus}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-ink">{activeDossierDevice.name}</h3>
                <p className="text-xs text-ink-secondary mt-0.5">{activeDossierDevice.tagline}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Prev / Next device buttons */}
                <div className="flex items-center border border-hairline rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleModalNav('prev')}
                    className="p-2 text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors"
                    title="Previous Device"
                    aria-label="Previous Device"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModalNav('next')}
                    className="p-2 text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors border-l border-hairline"
                    title="Next Device"
                    aria-label="Next Device"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveDossierDevice(null)}
                  className="rounded-xl border border-hairline p-2 text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors"
                  aria-label="Close Dossier"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sections 1–4 Grid */}
            <div className="grid gap-5 md:grid-cols-2 text-xs">
              {/* 1. Regulatory & Predicate */}
              <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-2">
                <h4 className="font-bold text-ink flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-series-1" />
                  1. Regulatory Pedigree &amp; Predicate
                </h4>
                <div className="space-y-1.5 text-ink-secondary">
                  <div className="flex items-center justify-between">
                    <span className="text-ink font-semibold">Clearance:</span>
                    <span className="font-mono text-ink">
                      {activeDossierDevice.regulatory.clearancePathway}
                      {activeDossierDevice.regulatory.clearanceNumber && (
                        <a
                          href={`https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${activeDossierDevice.regulatory.clearanceNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1 inline-flex items-center gap-0.5 text-series-1 hover:underline"
                        >
                          ({activeDossierDevice.regulatory.clearanceNumber})
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink font-semibold">Product Code:</span>
                    <span className="font-mono text-ink">{activeDossierDevice.regulatory.productCode}</span>
                  </div>
                  <div>
                    <span className="text-ink font-semibold block">Predicate Cited:</span>
                    <span className="font-mono text-[11px] text-ink">{activeDossierDevice.regulatory.predicateChain}</span>
                  </div>
                  <div className="pt-1 border-t border-hairline">
                    <strong className="text-ink block">Reported Accuracy Clearance:</strong>
                    <ul className="list-disc pl-4 space-y-1 mt-1">
                      {activeDossierDevice.regulatory.reportedClearanceResults.map((res, i) => (
                        <li key={i}>
                          <span className="font-semibold text-ink">{res.metric}:</span>{' '}
                          <span className="font-mono font-bold text-series-1">{res.value}</span> ({res.context})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2. Data Pipeline */}
              <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-2">
                <h4 className="font-bold text-ink flex items-center gap-1.5">
                  <Database size={14} className="text-blue-600 dark:text-blue-400" />
                  2. Data Pipeline &amp; File Infrastructure
                </h4>
                <div className="space-y-1.5 text-ink-secondary">
                  <p>
                    <strong className="text-ink">Export Method:</strong> {activeDossierDevice.dataPipeline.exportMethod}
                  </p>
                  <p>
                    <strong className="text-ink">Supported Formats:</strong>{' '}
                    {activeDossierDevice.dataPipeline.fileFormats.join(', ')}
                  </p>
                  <div className="flex items-center justify-between">
                    <strong className="text-ink">Pipeline Ease Rating:</strong>{' '}
                    <span className="font-mono font-bold text-series-1">
                      {activeDossierDevice.dataPipeline.easeScore} / 5
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed italic text-ink-muted">
                    {activeDossierDevice.dataPipeline.easeSummary}
                  </p>
                  <p>
                    <strong className="text-ink">Licensing Paywall:</strong>{' '}
                    {activeDossierDevice.dataPipeline.licensingPaywall}
                  </p>
                </div>
              </div>

              {/* 3. Synchronization & Alignment */}
              <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-2">
                <h4 className="font-bold text-ink flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" />
                  3. Signal Alignment &amp; Multi-Stream Sync
                </h4>
                <div className="space-y-1.5 text-ink-secondary">
                  <p>
                    <strong className="text-ink">Native Sampling Rate:</strong>{' '}
                    {activeDossierDevice.synchronization.nativeSamplingRate}
                  </p>
                  <p>
                    <strong className="text-ink">Auxiliary Sensor Streams:</strong>{' '}
                    {activeDossierDevice.synchronization.auxiliaryStreams.join(', ')}
                  </p>
                  <p>
                    <strong className="text-ink">Hardware Sync Pins:</strong>{' '}
                    {activeDossierDevice.synchronization.syncHardware.join(', ')}
                  </p>
                  <p>
                    <strong className="text-ink">Clock Drift:</strong> ~
                    {activeDossierDevice.synchronization.clockDriftPpm} ppm
                  </p>
                  <p className="text-[11px] leading-relaxed pt-1 text-ink-muted">
                    {activeDossierDevice.synchronization.alignmentNotes}
                  </p>
                </div>
              </div>

              {/* 4. Economics & Operations */}
              <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-2">
                <h4 className="font-bold text-ink flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400" />
                  4. Economics, Consumables &amp; Lifecycle
                </h4>
                <div className="space-y-1.5 text-ink-secondary">
                  <div className="flex items-center justify-between">
                    <strong className="text-ink">Hardware CapEx:</strong>
                    <span className="font-mono">{activeDossierDevice.economics.capexRange}</span>
                  </div>
                  <p>
                    <strong className="text-ink">OpEx / Lab Fee:</strong>{' '}
                    {activeDossierDevice.economics.opexOrSubscription}
                  </p>
                  <div className="flex items-center justify-between">
                    <strong className="text-ink">Consumables per Subject:</strong>{' '}
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${activeDossierDevice.economics.perSubjectConsumableCost.toFixed(2)}
                    </span>
                  </div>
                  <p>
                    <strong className="text-ink">Required Items:</strong>{' '}
                    {activeDossierDevice.economics.consumablesRequired.join(', ')}
                  </p>
                  {activeDossierDevice.economics.shelfLifeAlert && (
                    <p className="rounded-lg bg-amber-500/10 p-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      ⚠️ {activeDossierDevice.economics.shelfLifeAlert}
                    </p>
                  )}
                  <p>
                    <strong className="text-ink">Calibration:</strong>{' '}
                    {activeDossierDevice.economics.calibration.intervalMonths === 0
                      ? 'Pre-calibrated'
                      : `Every ${activeDossierDevice.economics.calibration.intervalMonths} months`}{' '}
                    ({activeDossierDevice.economics.calibration.type})
                  </p>
                  <p>
                    <strong className="text-ink">RMA Turnaround:</strong> ~
                    {activeDossierDevice.economics.calibration.rmaTurnaroundWeeks} weeks
                  </p>
                  <p>
                    <strong className="text-ink">Vendor Support:</strong>{' '}
                    {activeDossierDevice.economics.vendorSupport.hqLocation} (
                    {activeDossierDevice.economics.vendorSupport.supportTimezone})
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Clinical Study Instrument Fit, API Walls & Cohort Sensitivities */}
            {activeDossierDevice.studyInstrument && (
              <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                  <h4 className="font-bold text-ink flex items-center gap-1.5 text-sm">
                    <FlaskConical size={15} className="text-series-1" />
                    5. Clinical Study Instrument Fit, API Walls &amp; Cohort Sensitivities
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-hairline bg-plane px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
                      {FORM_FACTOR_LABELS[activeDossierDevice.studyInstrument.formFactor]}
                    </span>
                    <span className="rounded-md border border-hairline bg-plane px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
                      {DATA_GRANULARITY_LABELS[activeDossierDevice.studyInstrument.dataGranularity]}
                    </span>
                    <span className="rounded-md border border-hairline bg-plane px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
                      {OFFLOAD_MECHANISM_LABELS[activeDossierDevice.studyInstrument.offloadMechanism]}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <strong className="text-ink block">Granularity &amp; Signal Access Reality:</strong>
                    <p className="text-ink-secondary leading-relaxed">
                      {activeDossierDevice.studyInstrument.granularityDetails}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <strong className="text-ink block">
                      Firmware &amp; Algorithm Stability (
                      {activeDossierDevice.studyInstrument.firmwareLockSupported
                        ? 'Version-Lock Supported'
                        : 'Uncontrolled Consumer OTA'}
                      ):
                    </strong>
                    <p className="text-ink-secondary leading-relaxed">
                      {activeDossierDevice.studyInstrument.algorithmStabilityNotes}
                    </p>
                  </div>
                </div>

                {/* Use For vs Do Not Use For */}
                <div className="grid gap-4 md:grid-cols-2 pt-2">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5">
                    <strong className="text-emerald-700 dark:text-emerald-300 block">
                      ✓ Recommended Study Protocols (Use For):
                    </strong>
                    <ul className="list-disc pl-4 space-y-1 text-ink-secondary">
                      {activeDossierDevice.studyInstrument.useFor.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-1.5">
                    <strong className="text-rose-700 dark:text-rose-300 block">
                      ✕ Incompatible Study Protocols (Do Not Use For):
                    </strong>
                    <ul className="list-disc pl-4 space-y-1 text-ink-secondary">
                      {activeDossierDevice.studyInstrument.doNotUseFor.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Contract Walls & Cohort Considerations */}
                <div className="grid gap-4 md:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <strong className="text-ink block">Contract, Licensing &amp; Cost Walls:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-ink-secondary">
                      {activeDossierDevice.studyInstrument.contractAndCostWalls.map((wall, i) => (
                        <li key={i}>{wall}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <strong className="text-ink block">Cohort-Specific Physiological Considerations:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-ink-secondary">
                      <li>
                        <strong className="text-ink">Aging &amp; Neurodegeneration:</strong>{' '}
                        {activeDossierDevice.studyInstrument.cohortConsiderations.agingAndNeuro}
                      </li>
                      <li>
                        <strong className="text-ink">Arrhythmia &amp; Ectopy:</strong>{' '}
                        {activeDossierDevice.studyInstrument.cohortConsiderations.arrhythmiaAndEctopy}
                      </li>
                      <li>
                        <strong className="text-ink">Skin Tone &amp; Perfusion:</strong>{' '}
                        {activeDossierDevice.studyInstrument.cohortConsiderations.skinToneAndPerfusion}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 6: Published Validation Evidence & Provenance */}
            {activeDossierDevice.studyInstrument && (
              <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-3 text-xs">
                <h4 className="font-bold text-ink flex items-center gap-1.5 text-sm">
                  <BookOpen size={15} className="text-series-1" />
                  6. Published Validation Evidence &amp; Noise Floor Provenance
                </h4>
                <p className="text-ink-secondary">
                  <strong className="text-ink">Reference SD Provenance (σ_REF = ± {activeDossierDevice.measurementSd} {domain.primaryUnit}):</strong>{' '}
                  {activeDossierDevice.studyInstrument.measurementSdSource}
                </p>
                <div className="space-y-2 pt-1">
                  {activeDossierDevice.studyInstrument.validationCitations.map((cit, i) => (
                    <div key={i} className="rounded-xl border border-hairline bg-plane p-3 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-ink">
                          {cit.authors} ({cit.year}) — <em>{cit.journal}</em>
                        </span>
                        {cit.doiOrPmid && (
                          <span className="font-mono text-[11px] text-series-1">{cit.doiOrPmid}</span>
                        )}
                      </div>
                      <div className="text-ink font-medium">{cit.title}</div>
                      <div className="text-[11px] text-ink-muted">
                        <strong>Sample &amp; Protocol:</strong> {cit.sampleSize} • {cit.protocolContext}
                      </div>
                      <div className="text-[11px] text-ink-secondary">
                        <strong>Key Finding:</strong> {cit.reportedResult}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Limitations */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Methodological Strengths
                </span>
                <ul className="list-disc pl-4 space-y-1 text-ink-secondary">
                  {activeDossierDevice.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-2">
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={14} /> Operational Limitations
                </span>
                <ul className="list-disc pl-4 space-y-1 text-ink-secondary">
                  {activeDossierDevice.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-hairline pt-4">
              <span className="text-xs text-ink-muted">
                Reference SD:{' '}
                <strong className="font-mono text-ink">
                  ± {activeDossierDevice.measurementSd} {domain.primaryUnit}
                </strong>{' '}
                (Repeatability Limit: {activeDossierDevice.repeatabilityLimit} {domain.primaryUnit})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedRefDeviceId(activeDossierDevice.id);
                  setActiveDossierDevice(null);
                }}
                className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-plane hover:opacity-90 transition-opacity"
              >
                Select this Device in Protocol Sizer
              </button>
            </div>
          </div>
        </div>
      )}
    </ModulePage>
  );
}
