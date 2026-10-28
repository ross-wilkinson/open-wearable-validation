import { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Layers,
  Terminal,
} from 'lucide-react';
import NextSteps from '../app/study/NextSteps.tsx';
import { AgreekitLogo } from '../components/brand/AgreekitLogo.tsx';

const PYTHON_EXAMPLES = [
  {
    id: 'heart-rate',
    title: 'Exercise Heart Rate (Continuous Sensor Stream)',
    code: `import agreekit as ak
import pandas as pd

# Load paired 1 Hz continuous time-series (Texas Instruments optical PPG vs ECG reference)
data = pd.read_parquet("pulseband_exercise_hiit.parquet")

# Run clustering-aware agreement table (decomposing between- vs within-subject variance)
table = ak.agreement_table(
    data,
    device="pulseband_hr",
    reference="ecg_hr",
    subject="subject_id",
    by="activity_state",       # Stratify by rest, warmup, HIIT intervals, recovery
    mape=True,                 # Mean absolute percentage error
    within=(5,),               # Share of samples within 5 bpm tolerance
    within_pct=(10,)           # Share of samples within 10%
)

# Output exact publication-ready markdown and methods text
print(ak.methods_text(table))`,
  },
  {
    id: 'spo2',
    title: 'SpO2 & Skin Tone (ISO 80601-2-61)',
    code: `import agreekit as ak

# Evaluate dual-wavelength pulsatile SpO2 against reference co-oximetry blood gas
table = ak.agreement_table(
    spo2_data,
    device="pulseband_spo2",
    reference="sao2_reference",
    subject="subject_id",
    by="monk_skin_tone",       # Stratify across Monk Skin Tone buckets (MST 01–10)
)

# Arms (Root-Mean-Square Error under ISO 80601-2-61 Table 1)
arms_metric = table.loc[table["estimand"] == "rmse"]
print(f"Arms: {arms_metric['estimate']:.2f}% (95% CI: [{arms_metric['ci_low']:.2f}, {arms_metric['ci_high']:.2f}])")`,
  },
  {
    id: 'sleep',
    title: 'Sleep Staging Epochs (Multi-Class Categorical)',
    code: `import agreekit as ak

# Evaluate 30-second epoch classifications against polysomnography (PSG)
epochs = ak.classification_table(
    sleep_df,
    device="predicted_stage",
    reference="psg_stage",
    subject="subject_id",
    labels=["wake", "light", "deep", "rem"],
    average="subject"          # Weights each subject equally to prevent subject bias
)

# Confusion matrix with subject-level cluster bootstrap intervals
matrix = ak.confusion_matrix(sleep_df, device="predicted_stage", reference="psg_stage", normalize=True)
print(matrix)`,
  },
];

const MCP_SERVER_CONFIG = `{
  "mcpServers": {
    "agreekit": {
      "command": "python",
      "args": ["-m", "agreekit.mcp"],
      "env": {
        "PYTHONUNBUFFERED": "1"
      }
    }
  }
}`;

export default function AgreekitLandingPage() {
  const [activeTab, setActiveTab] = useState<string>('heart-rate');
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  const currentSnippet = PYTHON_EXAMPLES.find((e) => e.id === activeTab) ?? PYTHON_EXAMPLES[0]!;

  function copyInstallCmd() {
    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText('pip install agreekit')
        .then(() => {
          setCopiedInstall(true);
          setTimeout(() => setCopiedInstall(false), 2000);
        })
        .catch(() => {});
    }
  }

  function copyMcpConfig() {
    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(MCP_SERVER_CONFIG)
        .then(() => {
          setCopiedMcp(true);
          setTimeout(() => setCopiedMcp(false), 2000);
        })
        .catch(() => {});
    }
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Hero Banner */}
      <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-9 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-ink/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ink">
                AGREEKIT
              </span>
              <span className="text-xs text-ink-muted">Open-Source Analysis Engine</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              agreekit: Exact Agreement Statistics in Python
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-ink-secondary">
              The analysis counterpart to the Validation Study Designer: while the Designer sizes your study
              for a stated precision, <strong>agreekit</strong> analyzes post-collection data to compute the
              exact precision achieved. Built specifically for clustered human sensor datasets, it replaces
              naive textbook t-tests with closed-form random-effects ANOVA and subject-level bootstrap intervals.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-xl border border-hairline bg-plane px-3.5 py-2 font-mono text-xs font-semibold text-ink shadow-2xs">
                <span className="text-series-7 select-none">$</span>
                <span>pip install agreekit</span>
                <button
                  type="button"
                  onClick={copyInstallCmd}
                  aria-label="Copy pip install agreekit command"
                  className="ml-2 text-ink-muted hover:text-ink"
                >
                  {copiedInstall ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <a
                href="https://github.com/ross-wilkinson/agreekit"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-plane shadow-sm transition-opacity hover:opacity-90"
              >
                <span>View on GitHub</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-plane p-6 lg:w-72 shrink-0 space-y-3">
            <AgreekitLogo size={52} showText subtitle="PYTHON SUITE" />
            <div className="text-center space-y-1">
              <div className="text-xs font-semibold text-ink">Zero External DB Overhead</div>
              <p className="text-[11px] text-ink-muted">DuckDB + Columnar Parquet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-ink/5 text-ink">
            <Layers size={18} />
          </div>
          <h3 className="text-sm font-bold text-ink">First-Class Subject Clustering</h3>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Continuous wearable data produces thousands of rows per subject. Analyzing them as independent
            shrinks intervals by 50%+. agreekit partitions between- vs within-subject variance automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-ink/5 text-ink">
            <Database size={18} />
          </div>
          <h3 className="text-sm font-bold text-ink">Parquet + DuckDB Integration</h3>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Designed for local analytical speed. Seamlessly queries gigabytes of compressed Parquet time-series
            using DuckDB in-process, without needing Postgres, Redis, or cloud data warehouses.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-ink/5 text-ink">
            <Bot size={18} />
          </div>
          <h3 className="text-sm font-bold text-ink">AI Agent MCP Server Ready</h3>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Ship with native Model Context Protocol (MCP) tool bindings so AI coding assistants (Claude Desktop,
            Cursor) execute verified statistical routines instead of hallucinating formulas.
          </p>
        </div>
      </section>

      {/* Interactive Code Examples */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Production Python Workflows
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Clean, verified syntax for continuous sensor streams, regulatory SpO2, and categorical sleep hypnograms:
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
            {PYTHON_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => setActiveTab(example.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeTab === example.id
                    ? 'bg-ink text-plane shadow-xs'
                    : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                }`}
              >
                {example.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-plane overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5 bg-surface/80">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-series-7" />
              <span className="font-mono text-xs font-semibold text-ink">{currentSnippet.title}</span>
            </div>
            <span className="text-[10px] text-ink-muted">Python 3.10+</span>
          </div>
          <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-ink-secondary">
            {currentSnippet.code}
          </pre>
        </div>
      </section>

      {/* Model Context Protocol (MCP) Server Specification */}
      <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-series-7/10 px-2 py-0.5 text-xs font-semibold text-series-7">
                AI Agent Workflows
              </span>
              <span className="text-xs text-ink-muted">Model Context Protocol (MCP)</span>
            </div>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Augmenting AI Agents with agreekit-mcp
            </h3>
          </div>

          <button
            type="button"
            onClick={copyMcpConfig}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-plane transition-opacity hover:opacity-90 self-start sm:self-auto shadow-2xs"
          >
            {copiedMcp ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedMcp ? 'Config Copied!' : 'Copy MCP Config'}</span>
          </button>
        </div>

        <p className="text-sm leading-relaxed text-ink-secondary">
          AI agents shouldn&apos;t be adversaries or competitors to rigorous biostatistics—they should be augmented with
          exact tools. The <code className="font-mono text-xs bg-ink/5 px-1 py-0.5 rounded">agreekit-mcp</code> server
          exposes the agreekit Python API directly as tools to Claude Desktop, Cursor, and any MCP-compatible agent.
          Instead of guessing asymptotic formulas or writing broken random-effects loops, the AI agent delegates
          statistical computation directly to verified agreekit functions:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 text-xs pt-2">
          <div className="rounded-xl border border-hairline bg-plane p-3.5 space-y-1">
            <span className="font-mono font-bold text-series-7">agreekit_agreement_table</span>
            <p className="text-ink-secondary">
              Computes bias, LoA margins, random-effects ANOVA variance components, and effective sample size N_eff.
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-3.5 space-y-1">
            <span className="font-mono font-bold text-series-7">agreekit_sample_size_agreement</span>
            <p className="text-ink-secondary">
              Solves for exact required sample size n given a maximum allowable limits of agreement width.
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-3.5 space-y-1">
            <span className="font-mono font-bold text-series-7">agreekit_tost_equivalence</span>
            <p className="text-ink-secondary">
              Executes Two One-Sided Tests (TOST) against pre-specified clinical non-inferiority margins.
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-3.5 space-y-1">
            <span className="font-mono font-bold text-series-7">agreekit_demographic_quotas</span>
            <p className="text-ink-secondary">
              Computes ceiling and floor quotas across Monk Skin Tone and ISO 80601-2-61 categories.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-hairline bg-plane p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Terminal size={14} className="text-series-7" />
            <span>Claude Desktop Config (claude_desktop_config.json)</span>
          </div>
          <pre className="mt-2 font-mono text-[11px] text-ink-secondary">
            {MCP_SERVER_CONFIG}
          </pre>
        </div>
      </section>

      <NextSteps
        steps={[
          {
            to: '/protocol-studio',
            title: 'Protocol Studio: Sizing & Protocol Design',
            description:
              'Size your study for target LoA precision before collecting data and running agreekit.',
          },
          {
            to: '/report-studio',
            title: 'Report Studio: Launch Gates & Scorecards',
            description:
              'Synthesize agreekit outputs into executive decision scorecards and Bland-Altman centroid plots.',
          },
        ]}
      />
    </div>
  );
}
