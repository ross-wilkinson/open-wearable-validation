import { useState } from 'react';
import { Activity, Cpu, Gauge, Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface PulseBandProps {
  mode?: 'compact' | 'interactive' | 'exploded';
  className?: string;
}

/**
 * Meridian PulseBand 2 Hardware Visual Asset & Sensor Architecture (ADR-010, ADR-012).
 * Illustrates the optical sensor stack (530nm green LED, 660nm red LED, 940nm IR LED,
 * dual photodiode array, and 100 Hz IMU) that forms the heart of the clinical validation study.
 */
export function PulseBandHardwareGraphic({
  mode = 'interactive',
  className = '',
}: PulseBandProps) {
  const [activeSubsystem, setActiveSubsystem] = useState<
    'optical' | 'imu' | 'mcu' | 'chassis'
  >('optical');

  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
              Hardware Architecture
            </span>
            <span className="text-xs text-ink-muted">Gen 2 Platform</span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-ink">
            Meridian PulseBand 2 — Multi-Wavelength Optical Stack
          </h3>
        </div>

        {mode === 'interactive' && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveSubsystem('optical')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                activeSubsystem === 'optical'
                  ? 'bg-series-3/15 text-series-3 border border-series-3/30'
                  : 'text-ink-secondary hover:bg-ink/5'
              }`}
            >
              Optical PPG
            </button>
            <button
              type="button"
              onClick={() => setActiveSubsystem('imu')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                activeSubsystem === 'imu'
                  ? 'bg-series-1/15 text-series-1 border border-series-1/30'
                  : 'text-ink-secondary hover:bg-ink/5'
              }`}
            >
              100Hz IMU
            </button>
            <button
              type="button"
              onClick={() => setActiveSubsystem('mcu')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                activeSubsystem === 'mcu'
                  ? 'bg-series-4/15 text-series-4 border border-series-4/30'
                  : 'text-ink-secondary hover:bg-ink/5'
              }`}
            >
              DSP / MCU
            </button>
            <button
              type="button"
              onClick={() => setActiveSubsystem('chassis')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                activeSubsystem === 'chassis'
                  ? 'bg-series-5/15 text-series-5 border border-series-5/30'
                  : 'text-ink-secondary hover:bg-ink/5'
              }`}
            >
              Chassis
            </button>
          </div>
        )}
      </div>

      {/* SVG Diagram of Meridian PulseBand 2 */}
      <div className="mt-4 grid gap-6 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 flex justify-center">
          <svg
            viewBox="0 0 340 220"
            className="w-full max-w-[340px] drop-shadow-md select-none"
            aria-label="Meridian PulseBand 2 Hardware Diagram"
            role="img"
          >
            <defs>
              <linearGradient id="band-strap" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e293b" />
                <stop offset="0.5" stopColor="#334155" />
                <stop offset="1" stopColor="#1e293b" />
              </linearGradient>
              <radialGradient id="sensor-glass" cx="170" cy="110" r="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0f172a" />
                <stop offset="0.85" stopColor="#020617" />
                <stop offset="1" stopColor="#1e293b" />
              </radialGradient>
              <filter id="emitter-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Silicone Strap Contour */}
            <path
              d="M30 65 C 100 65, 120 75, 120 110 C 120 145, 100 155, 30 155 Z"
              fill="url(#band-strap)"
              stroke="#475569"
              strokeWidth="1.5"
            />
            <path
              d="M310 65 C 240 65, 220 75, 220 110 C 220 145, 240 155, 310 155 Z"
              fill="url(#band-strap)"
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* Strap Adjustment Ribs */}
            <line x1="50" y1="85" x2="50" y2="135" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="70" y1="85" x2="70" y2="135" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="90" y1="85" x2="90" y2="135" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="290" y1="85" x2="290" y2="135" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="270" y1="85" x2="270" y2="135" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="250" y1="85" x2="250" y2="135" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

            {/* Sensor Chassis / Outer Pod */}
            <rect
              x="110"
              y="40"
              width="120"
              height="140"
              rx="28"
              fill="url(#sensor-glass)"
              stroke={activeSubsystem === 'chassis' ? 'var(--color-series-5)' : '#64748b'}
              strokeWidth={activeSubsystem === 'chassis' ? '3' : '1.5'}
            />

            {/* Optical Sensor Glass Ring */}
            <circle
              cx="170"
              cy="110"
              r="48"
              fill="#030712"
              stroke={activeSubsystem === 'optical' ? 'var(--color-series-3)' : '#334155'}
              strokeWidth={activeSubsystem === 'optical' ? '2.5' : '1.5'}
            />

            {/* 530nm Green LED Emitter (Top) */}
            <circle
              cx="170"
              cy="80"
              r="7"
              fill="#10b981"
              filter="url(#emitter-glow)"
              stroke="#34d399"
              strokeWidth="1.5"
            />
            <text x="170" y="70" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold">
              530nm Green
            </text>

            {/* 660nm Red LED & 940nm Infrared (Bottom) for SpO2 */}
            <circle
              cx="155"
              cy="140"
              r="6"
              fill="#ef4444"
              filter="url(#emitter-glow)"
              stroke="#f87171"
              strokeWidth="1.2"
            />
            <circle
              cx="185"
              cy="140"
              r="6"
              fill="#7c3aed"
              filter="url(#emitter-glow)"
              stroke="#a78bfa"
              strokeWidth="1.2"
            />
            <text x="170" y="157" textAnchor="middle" fill="#94a3b8" fontSize="7">
              660nm Red / 940nm IR
            </text>

            {/* Dual Photodiode Detector Array (Center Left & Center Right) */}
            <rect
              x="138"
              y="102"
              width="14"
              height="16"
              rx="2"
              fill="#0284c7"
              stroke="#38bdf8"
              strokeWidth="1.2"
            />
            <rect
              x="188"
              y="102"
              width="14"
              height="16"
              rx="2"
              fill="#0284c7"
              stroke="#38bdf8"
              strokeWidth="1.2"
            />
            <text x="170" y="114" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="600">
              PD ARRAY
            </text>

            {/* 6-Axis IMU Sensor Location Stamp */}
            <rect
              x="122"
              y="52"
              width="22"
              height="14"
              rx="3"
              fill="#1e293b"
              stroke={activeSubsystem === 'imu' ? 'var(--color-series-1)' : '#475569'}
              strokeWidth={activeSubsystem === 'imu' ? '2' : '1'}
            />
            <text x="133" y="62" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">
              100Hz
            </text>

            {/* Cortex MCU Core Location Stamp */}
            <rect
              x="196"
              y="52"
              width="22"
              height="14"
              rx="3"
              fill="#1e293b"
              stroke={activeSubsystem === 'mcu' ? 'var(--color-series-4)' : '#475569'}
              strokeWidth={activeSubsystem === 'mcu' ? '2' : '1'}
            />
            <text x="207" y="62" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">
              MCU
            </text>
          </svg>
        </div>

        {/* Subsystem Details & Validation Context */}
        <div className="lg:col-span-6 space-y-3">
          {activeSubsystem === 'optical' && (
            <div className="rounded-xl border border-series-3/30 bg-series-3/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-series-3 font-semibold text-xs uppercase tracking-wider">
                <Activity size={16} /> TI AFE4404 Optical Front-End &amp; PPG Stack
              </div>
              <h4 className="text-sm font-semibold text-ink">
                Texas Instruments AFE4404 Bio-Sensing AFE &amp; Multi-Spectral Optical Array
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                The Texas Instruments AFE4404 provides dynamic LED drive current control, 24-bit ADC resolution,
                and high-performance hardware ambient light cancellation. Paired with a precision multi-wavelength optical
                emitter stack (530nm green for motion-tolerant exercise HR; 660nm red and 940nm infrared for pulsatile
                SpO2 saturation under ISO 80601-2-61) and dual low-noise PIN photodiodes.
              </p>
              <div className="mt-2 rounded bg-surface p-2 text-[11px] text-ink-muted border border-hairline">
                <strong className="text-ink">Validation Impact (Optical Revision):</strong> Any LED
                geometry, photodiode aperture, or cover-glass curvature modification forces an α₀ = 0 power-prior discount
                and demands a full N=40–60 clinical agreement trial.
              </div>
            </div>
          )}

          {activeSubsystem === 'imu' && (
            <div className="rounded-xl border border-series-1/30 bg-series-1/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-series-1 font-semibold text-xs uppercase tracking-wider">
                <Gauge size={16} /> 6-Axis Motion Subsystem
              </div>
              <h4 className="text-sm font-semibold text-ink">
                High-Frequency 100 Hz IMU (Accelerometer + Gyroscope)
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Samples arm kinematics at 100 Hz to prevent cadence lock during running (Module 5)
                and capture sub-10ms ground contact time (GCT) balance without Nyquist-Shannon
                aliasing.
              </p>
              <div className="mt-2 rounded bg-surface p-2 text-[11px] text-ink-muted border border-hairline">
                <strong className="text-ink">Harmonic Contamination Risk:</strong> Enables
                real-time harmonic cancellation when arm swing (160–185 spm) collides with heart
                rate.
              </div>
            </div>
          )}

          {activeSubsystem === 'mcu' && (
            <div className="rounded-xl border border-series-4/30 bg-series-4/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-series-4 font-semibold text-xs uppercase tracking-wider">
                <Cpu size={16} /> TI CC2652R SimpleLink™ Wireless MCU
              </div>
              <h4 className="text-sm font-semibold text-ink">
                Texas Instruments CC2652R SimpleLink™ 48MHz Arm® Cortex®-M4F (Ultra-Low-Power Edge DSP)
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                The TI CC2652R multiprotocol wireless MCU features 352KB in-system programmable flash, 80KB ultra-low-leakage
                SRAM, and hardware DSP instructions for real-time motion-rejection filtering, step detection, and on-wrist
                hypnogram classification (Wake, Light, Deep, REM).
              </p>
              <div className="mt-2 rounded bg-surface p-2 text-[11px] text-ink-muted border border-hairline">
                <strong className="text-ink">Paired Sizing Efficiency (Firmware Only):</strong> Re-running
                new firmware on recorded raw optical data achieves ρ ≥ 0.95, sizing validation to
                just N=10–15 subjects ($20k vs $250k).
              </div>
            </div>
          )}

          {activeSubsystem === 'chassis' && (
            <div className="rounded-xl border border-series-5/30 bg-series-5/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-series-5 font-semibold text-xs uppercase tracking-wider">
                <Layers size={16} /> Mechanical Coupling &amp; Ergonomics
              </div>
              <h4 className="text-sm font-semibold text-ink">
                Curved Sapphire Lens &amp; Fluoroelastomer Band
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Maintains constant contact pressure across wrist diameters (130mm–210mm) and prevents
                micro-gap optical leaks during high-acceleration sprint intervals and HIIT.
              </p>
              <div className="mt-2 rounded bg-surface p-2 text-[11px] text-ink-muted border border-hairline">
                <strong className="text-ink">Ergonomic Sizing Impact (Mechanical Revision):</strong> Strap
                or mass changes alter skin-sensor coupling; requires dual-wrist paired testing
                (N=20–30) across opposite wrists.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-muted pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" /> FDA 510(k) Class II Ready
            </span>
            <span className="flex items-center gap-1">
              <Sparkles size={13} className="text-cyan-500" /> ISO 80601-2-61 Calibrated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
