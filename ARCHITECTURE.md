# ADR-001: Open Wearable Validation — Scope, Mathematical Boundaries & UI Architecture

- **Status:** Accepted & Enforced
- **Date:** October 2026
- **Context:** `openwearablevalidation.org` & `agreekit` Python Ecosystem
- **Target Audience:** AI Engineering Agents (Gemini 3.8 Flash / Argon) & Core Maintainers

---

## 1. Core Product Philosophy: "The SRI Principle"

Inspired by the SRI Sleep Performance Testing framework, we are building an **Opinionated Trade-Off Engine** that standardizes wearable validation methodology, statistical error allocation, and reporting formats—not an exhaustive hardware encyclopedia or custom consulting platform.

Every interactive tool must obey the **80/20 Archetype Rule**:
1. **Curated Archetypes (The 80% Solution):** Provide 3 to 4 literature-backed presets (e.g., Optical HR, SpO2, CGM, Respiratory Rate) that seed all mathematical parameters in one click.
2. **First-Principles Escape Hatches (The 20% Override):** Provide 3 to 4 clean numeric sliders/inputs allowing researchers to input custom assumptions (`σ_d`, `σ_ref`, `±Δ`, `ICC`).
3. **Contextual Assumption Bridges:** Rather than bloating calculators with lookup tables, place subtle contextual links directly beside relevant sliders that route users to the standalone Catalogs to inspect underlying hardware or physiological assumptions.

### Knowledge-Transfer Principles

The site transfers expert judgment through constrained artifacts, not exhaustive prose. Completeness is a non-goal.

1. **Decision-Organized:** Content attaches to a named decision in the validation spine (Plan → Size → Evaluate → Decide; Pillars 1–3). Content mapping to no named decision goes to the backlog (Section 6).
2. **Judgment Lives in the Tool:** Opinionated defaults, assumption checks, and real-time decision readouts carry the expertise. Prose is secondary.
3. **Layered Depth:** L1 = the tool itself (serves the 80%). L2 = a 2–3 sentence "why this default" note, shown in context. L3 = optional deep dive, linked. L1 and L2 must never depend on L3 existing.
4. **Failure-Mode-First:** Prioritize content that prevents recurring, costly validation mistakes (Pitfall Explorer is the canonical home) over content that merely describes methods.
5. **Link Out, Don't Rewrite:** Cite standards and regulatory guidance with version and date. Add only the application layer and common misapplications.
6. **Synthetic or Public Data Only:** Worked examples and presets use synthetic or published data. No employer-derived or confidential data.

---

## 2. The "Storefront vs. Workshop" UX Boundary

### A. The Storefront (`HomePage.tsx`)
- **Purpose:** High-craft editorial storytelling, establishing clinical authority, and routing users.
- **Layout:** Borderless infinite cross-screen Hero SVG followed by a sequential full-width vertical narrative separated by 1px `#27272a` hairline dividers.
- **Visuals:** Mathematical abstractions rendered as edge-to-edge editorial art (no dense chart axes, legends, or form controls).

### B. The Workshop (Studio Landings & Interactive Calculators)
- **Purpose:** High-density scientific configuration, sensitivity sweeps, and decision gates.
- **Layout:** Vercel-style two-column console architecture (`lg:grid-cols-12`):
  - **Left Console Rail (`lg:col-span-3` or `lg:col-span-4`):** Sticky parameter seed controls, domain presets, and stage navigation.
  - **Main Workspace Canvas (`lg:col-span-9` or `lg:col-span-8`):** High-density 2x2 obsidian card grid (on landing pages) or the Universal 3-Block Calculator Template (on tool routes).

---

## 3. Ecosystem Architecture & Module Scope Matrix

### Pillar 1: Protocol Studio (`/protocol-studio` — 4 Core Engines)
Answers the prospective question: *"What are the mathematical trade-offs of my study design before I collect data?"*

| Stage | Route & Component | Core Trade-Off Taught | Required Presets (80%) | Custom Inputs & Assumption Bridges (20%) | Strict Exclusions (DO NOT BUILD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `/agreement` (Sample Size & Precision Engine) | **Cohort Cost (`n`) vs. Outer 95% LoA CI Clearance:** Bidirectional engine that solves for exact `n` to clear `±Δ` OR sweeps margin of error for a fixed budget `n`. | PPG Heart Rate (`σ=2.5 bpm`), Pulse Oximetry (`σ=1.8%`), CGM (`σ=12 mg/dL`), Resp Rate (`σ=1.2 brpm`). | • **Mode Toggle:** `Solve for N` vs. `Evaluate Fixed N`<br>• **Error SD (`σ_d`):** Includes contextual bridge to `/reference-devices` (*"Includes reference noise σ_ref → Inspect Reference Catalog"*)<br>• **Clinical Gate (`±Δ`):** Includes contextual bridge to `/health-data` (*"Requires valid dynamic range → Inspect Health Data Priors"*) | Consolidates former Sample Size & Precision pages. Parametric Bland-Altman LoA & paired TOST only. |
| **02** | `/repeated-measures` (Clustering & ANOVA) | **Unique Subjects (`n`) vs. Replicates (`m`):** High Intraclass Correlation (`ICC`) forces recruiting more subjects rather than recording longer sessions. | High Clustering (`ICC = 0.82`), Moderate (`ICC = 0.50`), Low (`ICC = 0.15`). | Between-subject variance (`s_b²`) or `ICC`, Within-subject variance (`s_w²`), Cost per Subject (`C_n`), Cost per Replicate (`C_m`). | Closed-form one-way random-effects ANOVA (`Deff = 1 + (m - 1) * ICC`) only. |
| **03** | `/demographics` (Demographic Quotas & Equity) | **Walk-in Speed vs. Subgroup Parity:** Convenience walk-in sampling follows skewed population base rates, filling total `n` before underrepresented strata (e.g., MST 7–10) reach minimum power. | ISO 80601-2-61 / FDA (`>= 25%` MST 7–10), Balanced 3-Bin MST, Age & BMI Stratified Matrix. | • **Total `n` & Subgroup Floor (`%`)**<br>• **Local Walk-in Base Rate (`%`):** Includes contextual bridge to `/health-data` (*"Seeded from NHANES / regional priors → Inspect Walk-In Distributions"*)<br>• **Screen/Attrition Buffer (`%`)** | Model recruitment ceiling caps and expected screening over-runs only; no participant CRM tables. |
| **04** | `/timeline` (Study Timeline Monte Carlo) | **Optimistic Guess vs. Stochastic Reality:** Models tail risk across Ethics, Enrollment, and Extraction phases. | Internal Lab Pilot, Academic/CRO Trial, Hard-to-Recruit Quota. | Target `n`, Weekly Enrollment Rate (min/mode/max), IRB Weeks (min/mode/max), Hardware Dropout (`%`). | 3-phase stochastic PERT/Poisson density curve (P50/P90) only; no Gantt chart editors. |

### Pillar 2: Pitfall Explorer (`/pitfalls`)
Answers the diagnostic question: *"Why are standard statistical shortcuts lying to me?"*
- **Scope:** Focused, single-concept interactive visual proofs:
  1. Correlation (`r`) vs. Agreement (Bland-Altman LoA)
  2. Naive Pooling vs. Clustered Repeated-Measures Variance
  3. Asynchronous Clock Drift / Phase Error Inflation
  4. Narrow Physiological Range Restriction (links directly to `/health-data`)
- **UI Pattern:** Side-by-side "Illusion vs. Reality" plots driven by 1–2 simple sliders.

### Pillar 3: Report Studio (`/report-studio`)
Answers the retrospective question: *"How do I report a defensible launch decision after data collection?"*
- **Scope:** Visual specification for reporting wearable validation studies, centered on **2x2 Equivalence Decision Gates** (Point Estimate vs. Outer 95% CI Bound against Clinical Thresholds) and stratified subgroup parity scorecards.

### Pillar 4: The Standalone Ecosystem Catalogs & Codebase
Answers the foundational question: *"What reference hardware, physiological priors, and software routines ground my protocol?"*

1. **`agreekit` Python Package (`/agreekit`):**
   - Open-source Python execution engine for paired agreement bounds, variance decomposition, and cluster-bootstrapping on raw datasets.
2. **Health Data Catalog (`/health-data`):**
   - **Dual-Purpose Empirical Priors:**
     - *Role 1 — Bidirectional Physiological Range (Bridges to Stage 01 & Pitfall Explorer):* Contrasts the narrow normative range (`P5`, `Median`, `P95`) naturally observed at rest against the wide physiological excursion a protocol must actively elicit to validate a KPI threshold (`±Δ`).
     - *Role 2 — Demographic Walk-In Base Rates (Bridges to Stage 03):* Provides empirical population distributions (age, sex, BMI, Monk Skin Tone priors) so researchers can see how severely natural walk-in convenience sampling under-recruits tail cohorts without hard ceiling caps.
3. **Reference Device Catalog (`/reference-devices`):**
   - **Standalone Comparator Lookup:** Evaluates Gold, Silver, and Bronze clinical reference archetypes across biometric domains. Teaches how reference measurement noise (`σ²_ref`) inflates observed error (`σ²_obs = σ²_dev + σ²_ref`) and outlines hardware TTL/BNC synchronization requirements.

---

## 4. Universal 3-Block Template for Individual Tool Pages

When building or refactoring any individual calculator route (`/agreement`, `/repeated-measures`, `/demographics`, `/timeline`), agents must use this exact 3-block wireframe:

1. **Block 1: Unboxed Architectural Header (`border-b border-[#27272a] pb-6`)**
   - Breadcrumb badge (`PROTOCOL STUDIO // STAGE 0X`), clear H1 title, 2-sentence plain-English summary of the trade-off, and an explicit statistical assumption badge (e.g., `Method: Shieh Exact LoA Inversion`).
2. **Block 2: Left Parameter Rail (`lg:col-span-4 space-y-5`)**
   - **Top Card:** 3–4 clickable Domain/Scenario Preset buttons (`Auto-seed`).
   - **Middle Card:** 3–4 clean numeric sliders/steppers (`Custom Overrides`) wired to `StudyContext`, with inline **Assumption Bridge links** (`-> Reference Catalog` or `-> Health Data Priors`) beneath relevant sliders.
   - **Bottom Card:** Handoff link to the next logical stage.
3. **Block 3: Right Interactive Trade-Off Canvas (`lg:col-span-8 space-y-6`)**
   - **Primary Visual:** One high-craft, dark-mode SVG sensitivity curve or trade-off plot.
   - **Plain-English Decision Readout:** A dynamic callout sentence interpreting the current math in real time.
   - **Method Assumptions Footer:** 1–2 lines stating the method's primary assumption and its failure condition, linking to the relevant `/pitfalls` entry where one exists (Layer 2).

---

## 5. Strict UI & Code Guardrails for AI Agents

1. **Dual-Theme Token Enforcement (Light & Obsidian Dark Mode):**
   - Never hardcode dark-only text or background classes (`text-white`, `bg-[#090d16]`) without their light-mode semantic pair.
   - Primary Canvas / Card Surface: `bg-surface dark:bg-[#090d16]`
   - Secondary Recessed Plane: `bg-plane dark:bg-[#05080f]` (or `dark:bg-[#121318]`)
   - Primary Headings & Values: `text-ink dark:text-white`
   - Body Copy & Descriptions: `text-ink-secondary`
   - Labels & Metadata: `text-ink-muted`
   - Hairline Borders & Dividers: `border-hairline dark:border-[#27272a]` (1px solid)
   - Semantic Accents: Protocol Studio = `text-sky-600 dark:text-sky-400`, Report Studio / Pass Gate = `text-emerald-600 dark:text-emerald-400`, Pitfalls / Fail Gate = `text-rose-600 dark:text-rose-400`, Equity / Hardware = `text-amber-600 dark:text-amber-400`.
2. **Zero Meta-Copy Leakage:** Never write prompt terminology in user-facing UI text (e.g., NEVER write *"A Vercel-style engineering workspace"* or *"Bento grid"* in headings or paragraphs).
3. **No "Box-in-a-Box" Visuals:** Card graphics and SVGs must bleed flush to the edges of their parent card using CSS `mask-image: linear-gradient(to bottom, transparent 0%, black 28%)` over subtle architectural grids.
4. **No Truncated Sentences or Redundant Links:** Never use `line-clamp` or `truncate` on scientific descriptions or methodology labels. If an entire card is a `<Link>`, do not put a redundant `"Open Engine ->"` button inside it; use a top-right `ArrowUpRight` icon.
5. **Real Closed-Form Math Only:** Never hardcode static multipliers for statistical outputs. For example, 95% LoA CI half-widths must dynamically compute `1.96 * sd * Math.sqrt(3 / n)`.
6. **Provenance for Every Default:** Each preset parameter (e.g., `σ`, `ICC`, `±Δ`) must carry a citation and a 2–3 sentence "why this default" note. Do not ship a preset without a source; if none exists, label it `Unsourced assumption` in the UI and flag it to maintainers.
7. **No Confidential Data:** Never embed or derive examples, presets, or catalog entries from proprietary or employer-confidential datasets.

---

## 6. Scope Governance

### A. Admission Test
A proposed tool, page, preset family, or catalog domain ships only if it passes all five. Failing any one sends it to the backlog.
1. Maps to a named decision in the validation spine.
2. Addresses an error that is frequent, costly, and commonly made (see B).
3. Reduces to transparent closed-form math with at most 3–4 overrides (80/20 Archetype Rule).
4. Is not adequately covered by a cited standard or an existing module.
5. Has literature-backed presets (Guardrail 6).

AI agents must not add routes, tools, or catalog domains beyond the Section 3 matrix without maintainer approval. Propose them via this test instead.

### B. Decision Inventory & Triage
Maintain a living inventory of validation-program decisions (expected ~50–100), each scored on frequency × cost of error × observed misuse rate. The top ~20% receive full-engine or Pitfall treatment; the remainder get a short note or outbound link. The ~20% cut line is a starting heuristic, not an empirically derived threshold. Revisit it once user data exists.

### C. Published Non-Coverage
Maintain a user-facing "What this site does not cover" statement derived from the Strict Exclusions column and the backlog.

### D. Usage-Pulled Roadmap
- **Pre-launch:** Observe 3–5 target users (e.g., sensor engineer, academic researcher) completing a real protocol on the site. Log where they stall. Observed stalls outrank maintainer intuition for next-build priority.
- **Post-launch:** Prioritize the backlog by user questions and tool analytics.# ADR-001: Open Wearable Validation — Scope, Mathematical Boundaries & UI Architecture

- **Status:** Accepted & Enforced
- **Date:** October 2026
- **Context:** `openwearablevalidation.org` & `agreekit` Python Ecosystem
- **Target Audience:** AI Engineering Agents (Gemini 3.8 Flash / Argon) & Core Maintainers

---

## 1. Core Product Philosophy: "The SRI Principle"

Inspired by the SRI Sleep Performance Testing framework, we are building an **Opinionated Trade-Off Engine** that standardizes wearable validation methodology, statistical error allocation, and reporting formats—not an exhaustive hardware encyclopedia or custom consulting platform.

Every interactive tool must obey the **80/20 Archetype Rule**:
1. **Curated Archetypes (The 80% Solution):** Provide 3 to 4 literature-backed presets (e.g., Optical HR, SpO2, CGM, Respiratory Rate) that seed all mathematical parameters in one click.
2. **First-Principles Escape Hatches (The 20% Override):** Provide 3 to 4 clean numeric sliders/inputs allowing researchers to input custom assumptions (`σ_d`, `σ_ref`, `±Δ`, `ICC`).
3. **Contextual Assumption Bridges:** Rather than bloating calculators with lookup tables, place subtle contextual links directly beside relevant sliders that route users to the standalone Catalogs to inspect underlying hardware or physiological assumptions.

### Knowledge-Transfer Principles

The site transfers expert judgment through constrained artifacts, not exhaustive prose. Completeness is a non-goal.

1. **Decision-Organized:** Content attaches to a named decision in the validation spine (Plan → Size → Evaluate → Decide; Pillars 1–3). Content mapping to no named decision goes to the backlog (Section 6).
2. **Judgment Lives in the Tool:** Opinionated defaults, assumption checks, and real-time decision readouts carry the expertise. Prose is secondary.
3. **Layered Depth:** L1 = the tool itself (serves the 80%). L2 = a 2–3 sentence "why this default" note, shown in context. L3 = optional deep dive, linked. L1 and L2 must never depend on L3 existing.
4. **Failure-Mode-First:** Prioritize content that prevents recurring, costly validation mistakes (Pitfall Explorer is the canonical home) over content that merely describes methods.
5. **Link Out, Don't Rewrite:** Cite standards and regulatory guidance with version and date. Add only the application layer and common misapplications.
6. **Synthetic or Public Data Only:** Worked examples and presets use synthetic or published data. No employer-derived or confidential data.

---

## 2. The "Storefront vs. Workshop" UX Boundary

### A. The Storefront (`HomePage.tsx`)
- **Purpose:** High-craft editorial storytelling, establishing clinical authority, and routing users.
- **Layout:** Borderless infinite cross-screen Hero SVG followed by a sequential full-width vertical narrative separated by 1px `#27272a` hairline dividers.
- **Visuals:** Mathematical abstractions rendered as edge-to-edge editorial art (no dense chart axes, legends, or form controls).

### B. The Workshop (Studio Landings & Interactive Calculators)
- **Purpose:** High-density scientific configuration, sensitivity sweeps, and decision gates.
- **Layout:** Vercel-style two-column console architecture (`lg:grid-cols-12`):
  - **Left Console Rail (`lg:col-span-3` or `lg:col-span-4`):** Sticky parameter seed controls, domain presets, and stage navigation.
  - **Main Workspace Canvas (`lg:col-span-9` or `lg:col-span-8`):** High-density 2x2 obsidian card grid (on landing pages) or the Universal 3-Block Calculator Template (on tool routes).

---

## 3. Ecosystem Architecture & Module Scope Matrix

### Pillar 1: Protocol Studio (`/protocol-studio` — 4 Core Engines)
Answers the prospective question: *"What are the mathematical trade-offs of my study design before I collect data?"*

| Stage | Route & Component | Core Trade-Off Taught | Required Presets (80%) | Custom Inputs & Assumption Bridges (20%) | Strict Exclusions (DO NOT BUILD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `/agreement` (Sample Size & Precision Engine) | **Cohort Cost (`n`) vs. Outer 95% LoA CI Clearance:** Bidirectional engine that solves for exact `n` to clear `±Δ` OR sweeps margin of error for a fixed budget `n`. | PPG Heart Rate (`σ=2.5 bpm`), Pulse Oximetry (`σ=1.8%`), CGM (`σ=12 mg/dL`), Resp Rate (`σ=1.2 brpm`). | • **Mode Toggle:** `Solve for N` vs. `Evaluate Fixed N`<br>• **Error SD (`σ_d`):** Includes contextual bridge to `/reference-devices` (*"Includes reference noise σ_ref → Inspect Reference Catalog"*)<br>• **Clinical Gate (`±Δ`):** Includes contextual bridge to `/health-data` (*"Requires valid dynamic range → Inspect Health Data Priors"*) | Consolidates former Sample Size & Precision pages. Parametric Bland-Altman LoA & paired TOST only. |
| **02** | `/repeated-measures` (Clustering & ANOVA) | **Unique Subjects (`n`) vs. Replicates (`m`):** High Intraclass Correlation (`ICC`) forces recruiting more subjects rather than recording longer sessions. | High Clustering (`ICC = 0.82`), Moderate (`ICC = 0.50`), Low (`ICC = 0.15`). | Between-subject variance (`s_b²`) or `ICC`, Within-subject variance (`s_w²`), Cost per Subject (`C_n`), Cost per Replicate (`C_m`). | Closed-form one-way random-effects ANOVA (`Deff = 1 + (m - 1) * ICC`) only. |
| **03** | `/demographics` (Demographic Quotas & Equity) | **Walk-in Speed vs. Subgroup Parity:** Convenience walk-in sampling follows skewed population base rates, filling total `n` before underrepresented strata (e.g., MST 7–10) reach minimum power. | ISO 80601-2-61 / FDA (`>= 25%` MST 7–10), Balanced 3-Bin MST, Age & BMI Stratified Matrix. | • **Total `n` & Subgroup Floor (`%`)**<br>• **Local Walk-in Base Rate (`%`):** Includes contextual bridge to `/health-data` (*"Seeded from NHANES / regional priors → Inspect Walk-In Distributions"*)<br>• **Screen/Attrition Buffer (`%`)** | Model recruitment ceiling caps and expected screening over-runs only; no participant CRM tables. |
| **04** | `/timeline` (Study Timeline Monte Carlo) | **Optimistic Guess vs. Stochastic Reality:** Models tail risk across Ethics, Enrollment, and Extraction phases. | Internal Lab Pilot, Academic/CRO Trial, Hard-to-Recruit Quota. | Target `n`, Weekly Enrollment Rate (min/mode/max), IRB Weeks (min/mode/max), Hardware Dropout (`%`). | 3-phase stochastic PERT/Poisson density curve (P50/P90) only; no Gantt chart editors. |

### Pillar 2: Pitfall Explorer (`/pitfalls`)
Answers the diagnostic question: *"Why are standard statistical shortcuts lying to me?"*
- **Scope:** Focused, single-concept interactive visual proofs:
  1. Correlation (`r`) vs. Agreement (Bland-Altman LoA)
  2. Naive Pooling vs. Clustered Repeated-Measures Variance
  3. Asynchronous Clock Drift / Phase Error Inflation
  4. Narrow Physiological Range Restriction (links directly to `/health-data`)
- **UI Pattern:** Side-by-side "Illusion vs. Reality" plots driven by 1–2 simple sliders.

### Pillar 3: Report Studio (`/report-studio`)
Answers the retrospective question: *"How do I report a defensible launch decision after data collection?"*
- **Scope:** Visual specification for reporting wearable validation studies, centered on **2x2 Equivalence Decision Gates** (Point Estimate vs. Outer 95% CI Bound against Clinical Thresholds) and stratified subgroup parity scorecards.

### Pillar 4: The Standalone Ecosystem Catalogs & Codebase
Answers the foundational question: *"What reference hardware, physiological priors, and software routines ground my protocol?"*

1. **`agreekit` Python Package (`/agreekit`):**
   - Open-source Python execution engine for paired agreement bounds, variance decomposition, and cluster-bootstrapping on raw datasets.
2. **Health Data Catalog (`/health-data`):**
   - **Dual-Purpose Empirical Priors:**
     - *Role 1 — Bidirectional Physiological Range (Bridges to Stage 01 & Pitfall Explorer):* Contrasts the narrow normative range (`P5`, `Median`, `P95`) naturally observed at rest against the wide physiological excursion a protocol must actively elicit to validate a KPI threshold (`±Δ`).
     - *Role 2 — Demographic Walk-In Base Rates (Bridges to Stage 03):* Provides empirical population distributions (age, sex, BMI, Monk Skin Tone priors) so researchers can see how severely natural walk-in convenience sampling under-recruits tail cohorts without hard ceiling caps.
3. **Reference Device Catalog (`/reference-devices`):**
   - **Standalone Comparator Lookup:** Evaluates Gold, Silver, and Bronze clinical reference archetypes across biometric domains. Teaches how reference measurement noise (`σ²_ref`) inflates observed error (`σ²_obs = σ²_dev + σ²_ref`) and outlines hardware TTL/BNC synchronization requirements.

---

## 4. Universal 3-Block Template for Individual Tool Pages

When building or refactoring any individual calculator route (`/agreement`, `/repeated-measures`, `/demographics`, `/timeline`), agents must use this exact 3-block wireframe:

1. **Block 1: Unboxed Architectural Header (`border-b border-[#27272a] pb-6`)**
   - Breadcrumb badge (`PROTOCOL STUDIO // STAGE 0X`), clear H1 title, 2-sentence plain-English summary of the trade-off, and an explicit statistical assumption badge (e.g., `Method: Shieh Exact LoA Inversion`).
2. **Block 2: Left Parameter Rail (`lg:col-span-4 space-y-5`)**
   - **Top Card:** 3–4 clickable Domain/Scenario Preset buttons (`Auto-seed`).
   - **Middle Card:** 3–4 clean numeric sliders/steppers (`Custom Overrides`) wired to `StudyContext`, with inline **Assumption Bridge links** (`-> Reference Catalog` or `-> Health Data Priors`) beneath relevant sliders.
   - **Bottom Card:** Handoff link to the next logical stage.
3. **Block 3: Right Interactive Trade-Off Canvas (`lg:col-span-8 space-y-6`)**
   - **Primary Visual:** One high-craft, dark-mode SVG sensitivity curve or trade-off plot.
   - **Plain-English Decision Readout:** A dynamic callout sentence interpreting the current math in real time.
   - **Method Assumptions Footer:** 1–2 lines stating the method's primary assumption and its failure condition, linking to the relevant `/pitfalls` entry where one exists (Layer 2).

---

## 5. Strict UI & Code Guardrails for AI Agents

1. **Dual-Theme Token Enforcement (Light & Obsidian Dark Mode):**
   - Never hardcode dark-only text or background classes (`text-white`, `bg-[#090d16]`) without their light-mode semantic pair.
   - Primary Canvas / Card Surface: `bg-surface dark:bg-[#090d16]`
   - Secondary Recessed Plane: `bg-plane dark:bg-[#05080f]` (or `dark:bg-[#121318]`)
   - Primary Headings & Values: `text-ink dark:text-white`
   - Body Copy & Descriptions: `text-ink-secondary`
   - Labels & Metadata: `text-ink-muted`
   - Hairline Borders & Dividers: `border-hairline dark:border-[#27272a]` (1px solid)
   - Semantic Accents: Protocol Studio = `text-sky-600 dark:text-sky-400`, Report Studio / Pass Gate = `text-emerald-600 dark:text-emerald-400`, Pitfalls / Fail Gate = `text-rose-600 dark:text-rose-400`, Equity / Hardware = `text-amber-600 dark:text-amber-400`.
2. **Zero Meta-Copy Leakage:** Never write prompt terminology in user-facing UI text (e.g., NEVER write *"A Vercel-style engineering workspace"* or *"Bento grid"* in headings or paragraphs).
3. **No "Box-in-a-Box" Visuals:** Card graphics and SVGs must bleed flush to the edges of their parent card using CSS `mask-image: linear-gradient(to bottom, transparent 0%, black 28%)` over subtle architectural grids.
4. **No Truncated Sentences or Redundant Links:** Never use `line-clamp` or `truncate` on scientific descriptions or methodology labels. If an entire card is a `<Link>`, do not put a redundant `"Open Engine ->"` button inside it; use a top-right `ArrowUpRight` icon.
5. **Real Closed-Form Math Only:** Never hardcode static multipliers for statistical outputs. For example, 95% LoA CI half-widths must dynamically compute `1.96 * sd * Math.sqrt(3 / n)`.
6. **Provenance for Every Default:** Each preset parameter (e.g., `σ`, `ICC`, `±Δ`) must carry a citation and a 2–3 sentence "why this default" note. Do not ship a preset without a source; if none exists, label it `Unsourced assumption` in the UI and flag it to maintainers.
7. **No Confidential Data:** Never embed or derive examples, presets, or catalog entries from proprietary or employer-confidential datasets.

---

## 6. Scope Governance

### A. Admission Test
A proposed tool, page, preset family, or catalog domain ships only if it passes all five. Failing any one sends it to the backlog.
1. Maps to a named decision in the validation spine.
2. Addresses an error that is frequent, costly, and commonly made (see B).
3. Reduces to transparent closed-form math with at most 3–4 overrides (80/20 Archetype Rule).
4. Is not adequately covered by a cited standard or an existing module.
5. Has literature-backed presets (Guardrail 6).

AI agents must not add routes, tools, or catalog domains beyond the Section 3 matrix without maintainer approval. Propose them via this test instead.

### B. Decision Inventory & Triage
Maintain a living inventory of validation-program decisions (expected ~50–100), each scored on frequency × cost of error × observed misuse rate. The top ~20% receive full-engine or Pitfall treatment; the remainder get a short note or outbound link. The ~20% cut line is a starting heuristic, not an empirically derived threshold. Revisit it once user data exists.

### C. Published Non-Coverage
Maintain a user-facing "What this site does not cover" statement derived from the Strict Exclusions column and the backlog.

### D. Usage-Pulled Roadmap
- **Pre-launch:** Observe 3–5 target users (e.g., sensor engineer, academic researcher) completing a real protocol on the site. Log where they stall. Observed stalls outrank maintainer intuition for next-build priority.
- **Post-launch:** Prioritize the backlog by user questions and tool analytics.