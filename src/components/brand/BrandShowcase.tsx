import { useState } from 'react';
import { OpenWearableValidationLogo } from './OpenWearableValidationLogo.tsx';

import { MeridianLogo, MeridianIcon } from './MeridianLogo.tsx';
import { AgreekitLogo } from './AgreekitLogo.tsx';
import { PulseBandHardwareGraphic } from './PulseBandHardwareGraphic.tsx';
import { HardwareChangeMatrix } from './HardwareChangeMatrix.tsx';
import { CheckCircle2, Copy, Sparkles, ShieldCheck, Palette } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand.ts';

export function BrandShowcase() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const colors = [
    { name: 'Series 1 (Blue)', token: 'var(--color-series-1)', hex: '#2a78d6', desc: 'Primary metric & action' },
    { name: 'Series 2 (Orange)', token: 'var(--color-series-2)', hex: '#eb6834', desc: 'Secondary comparison' },
    { name: 'Series 3 (Aqua)', token: 'var(--color-series-3)', hex: '#1baf7a', desc: 'Optical PPG & reference' },
    { name: 'Series 4 (Yellow)', token: 'var(--color-series-4)', hex: '#eda100', desc: 'Precision anchor & warning' },
    { name: 'Series 5 (Magenta)', token: 'var(--color-series-5)', hex: '#e87ba4', desc: 'Threshold & bounds' },
    { name: 'Series 6 (Green)', token: 'var(--color-series-6)', hex: '#008300', desc: 'Pass & success status' },
    { name: 'Series 7 (Violet)', token: 'var(--color-series-7)', hex: '#4a3aa7', desc: 'Tertiary cluster' },
    { name: 'Series 8 (Red)', token: 'var(--color-series-8)', hex: '#e34948', desc: 'Critical alert & failure' },
  ];

  function copyToClipboard(hex: string) {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    });
  }

  return (
    <div className="space-y-8">
      {/* Brand Header */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
              <Sparkles size={13} /> Brand Identity &amp; Visual Design System
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Brand Identity System &amp; Hardware Assets
            </h2>
            <p className="text-sm leading-relaxed text-ink-secondary">
              A cohesive visual system unifying the <strong>Open Wearable Validation</strong> suite
              and the canonical fictional wearable manufacturer <strong>Meridian Biosystems</strong>.
              Engineered with vector SVG assets that respond dynamically to light and dark themes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-hairline bg-plane p-4 flex items-center gap-3">
              <OpenWearableValidationLogo size={36} />
              <div>
                <div className="text-xs font-bold text-ink">{BRAND_CONFIG.siteName} Mark</div>
                <div className="text-[10px] text-ink-muted">Vector SVG • 36x36</div>
              </div>
            </div>
            <div className="rounded-xl border border-hairline bg-plane p-4 flex items-center gap-3">
              <MeridianIcon size={36} />
              <div>
                <div className="text-xs font-bold text-ink">Meridian Mark</div>
                <div className="text-[10px] text-ink-muted">Vector SVG • 40x40</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Marks Comparison Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Umbrella Suite Identity */}
        <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Software Suite Identity
          </span>
          <div className="rounded-xl border border-hairline bg-plane p-5 flex items-center justify-between">
            <OpenWearableValidationLogo size={44} showText />
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Combines limits-of-agreement precision bounds, caliper alignment marks, and dual
            confidence envelope curves converging asymptotically to metrological ground truth.
          </p>
          <div className="flex items-center gap-3 text-xs text-ink-muted border-t border-hairline pt-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-500" /> WCAG AAA Contrast
            </span>
            <span>•</span>
            <span>Pure CSS Custom Properties</span>
          </div>
        </div>

        {/* agreekit Python Library Brand */}
        <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Python Analysis Library
          </span>
          <div className="rounded-xl border border-hairline bg-plane p-5 flex items-center justify-between">
            <AgreekitLogo size={44} showText subtitle="PYTHON AGREEMENT SUITE" />
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Features caliper jaw brackets, limits-of-agreement dashed bounds, and Pythonic dual-color
            convergence curves with paired variance residual points.
          </p>
          <div className="flex items-center gap-3 text-xs text-ink-muted border-t border-hairline pt-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-amber-500" /> Open Source Python
            </span>
            <span>•</span>
            <span>PyPI &amp; GitHub</span>
          </div>
        </div>

        {/* Meridian Biosystems Brand */}
        <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Fictional Hardware Manufacturer
          </span>
          <div className="rounded-xl border border-hairline bg-plane p-5 flex items-center justify-between">
            <MeridianLogo size={44} showText subtitle="WEARABLE HEALTH TECHNOLOGIES" />
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Features an arterial PPG pulse wave intersecting celestial/terrestrial meridian coordinate
            arcs inside an optical sensor bezel. The central 530nm green emitter highlights optical heart-rate physics.
          </p>
          <div className="flex items-center gap-3 text-xs text-ink-muted border-t border-hairline pt-3">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-cyan-500" /> Protected Fictional Mark
            </span>
            <span>•</span>
            <span>Trademark Isolation Verified</span>
          </div>
        </div>
      </div>

      {/* Color Palette Tokens */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <Palette size={14} /> Colorblind-Safe Categorical Palette
            </div>
            <h3 className="mt-1 text-base font-semibold text-ink">
              Design System Palette Tokens
            </h3>
          </div>
          {copiedHex && (
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Copied {copiedHex}!
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => copyToClipboard(c.hex)}
              className="group flex flex-col rounded-xl border border-hairline bg-plane p-3 text-left transition-all hover:border-ink/20 hover:shadow-sm"
            >
              <div
                className="h-10 w-full rounded-lg shadow-inner flex items-center justify-end px-2"
                style={{ backgroundColor: c.token }}
              >
                <Copy size={13} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-2 font-semibold text-xs text-ink">{c.name}</div>
              <div className="text-[10px] font-mono text-ink-muted flex items-center justify-between mt-0.5">
                <span>{c.hex}</span>
                <span className="text-[9px] uppercase">{c.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hardware Architecture Schematic */}
      <PulseBandHardwareGraphic />

      {/* Hardware Change Impact Matrix */}
      <HardwareChangeMatrix />
    </div>
  );
}
