import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MethodsText from './MethodsText.tsx';

const CITATIONS = [
  { text: 'Bland JM, Altman DG. Lancet. 1986;327(8476):307-10.', url: 'https://example.org' },
  { text: 'Chow S-C, Wang H, Shao J. Sample Size Calculations. 2007.' },
];

/**
 * jsdom exposes `navigator.clipboard` as a getter-only property, and
 * `userEvent.setup()` installs a stub of its own, so this has to define over
 * the top of both — and be called *after* setup, or userEvent wins.
 */
function stubClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  return writeText;
}

describe('MethodsText', () => {
  it('renders the paragraph and every citation', () => {
    render(<MethodsText text="A sample of 150 participants." citations={CITATIONS} />);

    expect(screen.getByText('A sample of 150 participants.')).toBeInTheDocument();
    for (const citation of CITATIONS) {
      expect(screen.getByText(citation.text)).toBeInTheDocument();
    }
  });

  it('links a citation that has a URL and leaves the others as plain text', () => {
    render(<MethodsText text="Text." citations={CITATIONS} />);

    expect(screen.getByRole('link', { name: CITATIONS[0]!.text })).toHaveAttribute(
      'href',
      'https://example.org',
    );
    expect(
      screen.queryByRole('link', { name: CITATIONS[1]!.text }),
    ).not.toBeInTheDocument();
  });

  it('copies the paragraph together with its references', async () => {
    // The citations travelling with the text is the whole point — a sentence
    // pasted into a protocol without its reference is the failure this exists
    // to prevent, so it is worth asserting rather than assuming.
    const user = userEvent.setup();
    const writeText = stubClipboard(vi.fn().mockResolvedValue(undefined));
    render(<MethodsText text="A sample of 150 participants." citations={CITATIONS} />);

    await user.click(screen.getByRole('button', { name: /copy/i }));

    const copied = writeText.mock.calls[0]![0] as string;
    expect(copied).toContain('A sample of 150 participants.');
    for (const citation of CITATIONS) {
      expect(copied).toContain(citation.text);
    }
  });

  it('confirms the copy, then drops the confirmation when the text changes', async () => {
    // `copied` is derived from *what* was copied rather than stored as a flag,
    // so changing an input upstream retires the confirmation without an effect
    // to clear it. If that ever regresses, a stale tick would sit next to a
    // paragraph nobody copied.
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockResolvedValue(undefined));

    function Harness() {
      const [n, setN] = useState(150);
      return (
        <>
          <button type="button" onClick={() => setN(200)}>
            change n
          </button>
          <MethodsText text={`A sample of ${n} participants.`} citations={CITATIONS} />
        </>
      );
    }

    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /^copy$/i }));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /change n/i }));
    expect(screen.queryByRole('button', { name: /copied/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument();
  });

  it('selects the text and says so when the clipboard refuses', async () => {
    // Not hypothetical: headless Chrome denies clipboard-write outright, and so
    // do plain-http origins and several embedded webviews. An earlier version
    // swallowed the rejection and did nothing at all, which makes the button
    // look broken. Selecting the paragraph leaves the user one keystroke away.
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<MethodsText text="A sample of 150 participants." citations={CITATIONS} />);

    await user.click(screen.getByRole('button', { name: /copy/i }));

    expect(screen.queryByRole('button', { name: /copied/i })).not.toBeInTheDocument();
    expect(screen.getByText(/would not let the page write to the clipboard/i))
      .toBeInTheDocument();

    const selection = window.getSelection();
    expect(selection?.toString()).toContain('A sample of 150 participants.');
  });
});
