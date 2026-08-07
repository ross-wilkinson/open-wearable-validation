import { useId, useState } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
}

/**
 * A labelled numeric input.
 *
 * WHY THERE IS A DRAFT STRING HERE. The obvious implementation — a controlled
 * input bound straight to a number, ignoring `onChange` when the field cannot
 * be parsed — is broken in a way that is easy to ship and hard to spot. Clearing
 * the field produces an empty string, which parses to nothing, so the change is
 * dropped and React re-renders the input with the old number still in it. The
 * user then types their new value *onto the end of the old one*: clearing "64"
 * and typing "30" yields 6430.
 *
 * It also makes decimals unenterable. Typing "0.5" passes through "0." which
 * parses to 0, and a naive prop-to-draft sync immediately rewrites the field to
 * "0", eating the decimal point.
 *
 * So the input owns a string, and the number is pushed outward only when the
 * string parses. The prop is allowed to overwrite the draft only when it
 * genuinely disagrees with what the draft *means* — `Number('0.') === 0` is not
 * a disagreement — which keeps external updates (presets, resets) working
 * without fighting the keyboard.
 *
 * The sync happens during render via the previous-value comparison rather than
 * in an effect; an effect here would be a second render pass and is exactly
 * what `react-hooks/set-state-in-effect` exists to catch.
 */
export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  hint,
}: NumberFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  const [draft, setDraft] = useState(() =>
    Number.isFinite(value) ? String(value) : '',
  );
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    if (Number(draft) !== value) {
      setDraft(Number.isFinite(value) ? String(value) : '');
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={draft}
          min={min}
          max={max}
          step={step}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            if (next.trim() === '') return;
            const parsed = Number(next);
            if (Number.isFinite(parsed)) onChange(parsed);
          }}
          onBlur={() => {
            // Leaving the field empty or mid-decimal would strand the display
            // out of step with the value actually in use; restore on the way out.
            if (draft.trim() === '' || !Number.isFinite(Number(draft))) {
              setDraft(Number.isFinite(value) ? String(value) : '');
            }
          }}
          className="tabular w-full rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-sm"
        />
        {suffix && (
          <span className="shrink-0 text-sm text-ink-muted" aria-hidden>
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
