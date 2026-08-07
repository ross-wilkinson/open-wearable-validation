import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/useTheme.ts';

const LABELS = {
  system: 'Theme: follow system',
  light: 'Theme: light',
  dark: 'Theme: dark',
} as const;

export default function ThemeToggle() {
  const { choice, cycle } = useTheme();
  const Icon = choice === 'system' ? Monitor : choice === 'light' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={cycle}
      title={LABELS[choice]}
      aria-label={LABELS[choice]}
      className="rounded-md p-2 text-ink-secondary transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <Icon size={18} aria-hidden />
    </button>
  );
}
