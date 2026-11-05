import fs from 'node:fs';
import path from 'node:path';
import { FEATURE_DOMAINS, REFERENCE_DEVICES } from '../src/content/referenceDevices/catalog.ts';

const TARGET_REPO_DIR = path.resolve('C:/repos/reference-device-catalog');
const DEVICES_DIR = path.join(TARGET_REPO_DIR, 'devices');
const CATALOG_MD_PATH = path.join(TARGET_REPO_DIR, 'CATALOG.md');

console.log(`Syncing ${REFERENCE_DEVICES.length} reference devices across ${FEATURE_DOMAINS.length} domains...`);
console.log(`Target repository: ${TARGET_REPO_DIR}`);

if (!fs.existsSync(DEVICES_DIR)) {
  fs.mkdirSync(DEVICES_DIR, { recursive: true });
}

let syncedDeviceCount = 0;

for (const device of REFERENCE_DEVICES) {
  const domainDir = path.join(DEVICES_DIR, device.domainId);
  const deviceDir = path.join(domainDir, device.id);

  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }

  // 1. Write dossier.json
  const dossierPath = path.join(deviceDir, 'dossier.json');
  fs.writeFileSync(dossierPath, JSON.stringify(device, null, 2) + '\n', 'utf-8');

  // 2. Write evidence.md
  const domain = FEATURE_DOMAINS.find((d) => d.id === device.domainId);
  const si = device.studyInstrument;

  let evidenceMd = `# Evidence & Methodological Profile: ${device.name}\n\n`;
  evidenceMd += `**Domain:** ${domain?.name ?? device.domainId} (\`${device.domainId}\`)  \n`;
  evidenceMd += `**Tier:** ${device.tier.toUpperCase()} STANDARD  \n`;
  evidenceMd += `**Manufacturer / Vendor:** ${device.vendor} (${device.model})  \n`;
  evidenceMd += `**Tagline:** ${device.tagline}  \n\n`;

  evidenceMd += `## 1. Regulatory Pedigree & Predicates\n\n`;
  evidenceMd += `- **Clearance Pathway:** ${device.regulatory.clearancePathway}\n`;
  if (device.regulatory.clearanceNumber) {
    evidenceMd += `- **Clearance Number:** ${device.regulatory.clearanceNumber}\n`;
  }
  evidenceMd += `- **FDA Product Code:** \`${device.regulatory.productCode}\`\n`;
  if (device.regulatory.regulationNumber) {
    evidenceMd += `- **Regulation Number:** ${device.regulatory.regulationNumber}\n`;
  }
  evidenceMd += `- **Predicate Chain:** ${device.regulatory.predicateChain}\n`;
  evidenceMd += `- **Consensus Standards:** ${device.regulatory.consensusStandards.join(', ')}\n\n`;

  evidenceMd += `### Reported Regulatory Accuracy\n\n`;
  evidenceMd += `| Metric | Reported Value | Context |\n`;
  evidenceMd += `| :--- | :--- | :--- |\n`;
  for (const res of device.regulatory.reportedClearanceResults) {
    evidenceMd += `| ${res.metric} | **${res.value}** | ${res.context} |\n`;
  }
  evidenceMd += `\n`;

  evidenceMd += `## 2. Statistical Noise Floor & Repeatability\n\n`;
  evidenceMd += `- **Reference Standard Deviation (σ_REF):** ± ${device.measurementSd} ${domain?.primaryUnit ?? ''}\n`;
  evidenceMd += `- **Repeatability Limit (2.77 × σ_REF):** ${device.repeatabilityLimit} ${domain?.primaryUnit ?? ''}\n`;
  if (si?.measurementSdSource) {
    evidenceMd += `- **Noise Floor Derivation Source:** ${si.measurementSdSource}\n`;
  }
  evidenceMd += `\n`;

  if (si) {
    evidenceMd += `## 3. Clinical Study Instrument Profile\n\n`;
    evidenceMd += `- **Form Factor:** \`${si.formFactor}\`\n`;
    evidenceMd += `- **Typical Battery Life:** ${si.typicalBatteryLife}\n`;
    evidenceMd += `- **Data Granularity:** \`${si.dataGranularity}\`\n`;
    evidenceMd += `- **Granularity Details:** ${si.granularityDetails}\n`;
    evidenceMd += `- **Offload Mechanism:** \`${si.offloadMechanism}\`\n`;
    evidenceMd += `- **Firmware Lock Supported:** ${si.firmwareLockSupported ? 'Yes (Version-Frozen)' : 'No (Uncontrolled Consumer OTA)'}\n`;
    evidenceMd += `- **Algorithm Stability:** ${si.algorithmStabilityNotes}\n`;
    evidenceMd += `- **Review Status:** \`${si.reviewStatus}\`\n\n`;

    evidenceMd += `### Supported Capabilities\n\n`;
    evidenceMd += `- Continuous 24h IBI: ${si.supportedCapabilities.continuous24hIbi ? '✓ Yes' : '✕ No'}\n`;
    evidenceMd += `- Nocturnal Resting HRV: ${si.supportedCapabilities.nocturnalRestingHrv ? '✓ Yes' : '✕ No'}\n`;
    evidenceMd += `- AASM 30s Sleep Staging: ${si.supportedCapabilities.aasm30sSleepStaging ? '✓ Yes' : '✕ No'}\n`;
    evidenceMd += `- Consumer Sleep Summary: ${si.supportedCapabilities.consumerSleepSummary ? '✓ Yes' : '✕ No'}\n`;
    evidenceMd += `- Multi-Week Habitual Compliance: ${si.supportedCapabilities.multiWeekHabitualCompliance ? '✓ Yes' : '✕ No'}\n\n`;

    evidenceMd += `### Protocol Fit Guidance\n\n`;
    evidenceMd += `#### Recommended Use Cases (Use For)\n`;
    for (const u of si.useFor) {
      evidenceMd += `- ${u}\n`;
    }
    evidenceMd += `\n`;

    evidenceMd += `#### Incompatible Use Cases (Do Not Use For)\n`;
    for (const dnu of si.doNotUseFor) {
      evidenceMd += `- ${dnu}\n`;
    }
    evidenceMd += `\n`;

    evidenceMd += `### Cohort Considerations\n\n`;
    evidenceMd += `- **Aging & Neurodegeneration:** ${si.cohortConsiderations.agingAndNeuro}\n`;
    evidenceMd += `- **Arrhythmia & Ectopy:** ${si.cohortConsiderations.arrhythmiaAndEctopy}\n`;
    evidenceMd += `- **Skin Tone & Perfusion:** ${si.cohortConsiderations.skinToneAndPerfusion}\n\n`;

    if (si.contractAndCostWalls.length > 0) {
      evidenceMd += `### Contract & Paywall Disclosures\n\n`;
      for (const wall of si.contractAndCostWalls) {
        evidenceMd += `- ${wall}\n`;
      }
      evidenceMd += `\n`;
    }

    if (si.validationCitations.length > 0) {
      evidenceMd += `## 4. Published Validation Evidence\n\n`;
      for (const cit of si.validationCitations) {
        evidenceMd += `### ${cit.authors} (${cit.year})\n\n`;
        evidenceMd += `> **"${cit.title}"**  \n`;
        evidenceMd += `> *${cit.journal}*${cit.doiOrPmid ? ` • DOI/PMID: [${cit.doiOrPmid}](https://doi.org/${cit.doiOrPmid})` : ''}  \n\n`;
        evidenceMd += `- **Cohort / Sample Size:** ${cit.sampleSize}\n`;
        evidenceMd += `- **Protocol Context:** ${cit.protocolContext}\n`;
        evidenceMd += `- **Reported Finding:** ${cit.reportedResult}\n\n`;
      }
    }
  }

  const evidencePath = path.join(deviceDir, 'evidence.md');
  fs.writeFileSync(evidencePath, evidenceMd, 'utf-8');

  syncedDeviceCount++;
}

console.log(`Successfully synced ${syncedDeviceCount} device dossiers and evidence sheets.`);

// 3. Generate CATALOG.md
let catalogMd = `# Clinical Reference Device Catalog for Wearable Biometrics\n\n`;
catalogMd += `> A comprehensive 10-dimension engineering, regulatory, and statistical reference catalog covering clinical criterion standards, clinical research benchmarks, and popular consumer/research wearables across **12 biometric feature domains**.\n\n`;

catalogMd += `## Catalog Overview\n\n`;
catalogMd += `- **Total Biometric Domains:** ${FEATURE_DOMAINS.length}\n`;
catalogMd += `- **Total Catalogued Devices:** ${REFERENCE_DEVICES.length}\n`;
catalogMd += `- **Gold Standards (Clinical Criterion):** ${REFERENCE_DEVICES.filter((d) => d.tier === 'gold').length}\n`;
catalogMd += `- **Silver Standards (Clinical Research Benchmark):** ${REFERENCE_DEVICES.filter((d) => d.tier === 'silver').length}\n`;
catalogMd += `- **Bronze Standards (Consumer / Wearable Surrogate):** ${REFERENCE_DEVICES.filter((d) => d.tier === 'bronze').length}\n\n`;

catalogMd += `## Biometric Feature Domains\n\n`;
catalogMd += `| Domain | Name | Primary Unit | Core 5 | Devices | Primary Standards |\n`;
catalogMd += `| :--- | :--- | :--- | :---: | :---: | :--- |\n`;

for (const dom of FEATURE_DOMAINS) {
  const devs = REFERENCE_DEVICES.filter((d) => d.domainId === dom.id);
  catalogMd += `| \`${dom.id}\` | **${dom.name}** | \`${dom.primaryUnit}\` | ${dom.isPriorityTop5 ? '✓ Yes' : '—'} | ${devs.length} | ${dom.keyConsensusStandards.slice(0, 2).join('; ')} |\n`;
}
catalogMd += `\n`;

for (const dom of FEATURE_DOMAINS) {
  const devs = REFERENCE_DEVICES.filter((d) => d.domainId === dom.id);
  catalogMd += `## Domain: ${dom.name} (\`${dom.id}\`)\n\n`;
  catalogMd += `*${dom.tagline}*  \n`;
  catalogMd += `${dom.description}\n\n`;
  catalogMd += `**Clinical Endpoints:** ${dom.clinicalEndpoints.join('; ')}  \n`;
  catalogMd += `**Consensus Standards:** ${dom.keyConsensusStandards.join('; ')}  \n\n`;

  catalogMd += `| Tier | Device Name | Manufacturer | Regulatory Clearance | Noise SD (σ_REF) | Battery Life | Data Granularity | Firmware Lock |\n`;
  catalogMd += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |\n`;

  for (const dev of devs) {
    const si = dev.studyInstrument;
    const tierBadge = dev.tier === 'gold' ? '🥇 Gold' : dev.tier === 'silver' ? '🥈 Silver' : '🥉 Bronze';
    const reg = dev.regulatory.clearanceNumber ? `${dev.regulatory.clearancePathway} (${dev.regulatory.clearanceNumber})` : dev.regulatory.clearancePathway;
    const sd = `± ${dev.measurementSd} ${dom.primaryUnit}`;
    const batt = si?.typicalBatteryLife ?? 'Standard';
    const gran = si?.dataGranularity ?? 'Standard';
    const lock = si?.firmwareLockSupported ? '✓ Lockable' : '⚠ OTA';

    catalogMd += `| ${tierBadge} | [${dev.name}](./devices/${dev.domainId}/${dev.id}/dossier.json) | ${dev.vendor} | ${reg} | ${sd} | ${batt} | \`${gran}\` | ${lock} |\n`;
  }
  catalogMd += `\n`;
}

fs.writeFileSync(CATALOG_MD_PATH, catalogMd, 'utf-8');
console.log(`Successfully generated CATALOG.md at ${CATALOG_MD_PATH}.`);
