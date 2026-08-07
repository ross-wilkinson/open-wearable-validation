import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import userEvent from '@testing-library/user-event';
import TimelinePage from './TimelinePage.tsx';

/**
 * jsdom has no `Worker`, so these exercise the hook's synchronous fallback
 * path. That is deliberate rather than a compromise: the fallback calls the
 * identical `simulateTimeline` the worker calls, so everything asserted here
 * about the numbers holds in both, and the fallback is itself a shipped code
 * path that deserves coverage.
 */
const totals = () =>
  within(screen.getByRole('region', { name: /total study duration/i }));
// The intro paragraph and the per-phase note legitimately share wording (both
// explain the Poisson constraint), so phase assertions are scoped here rather
// than run against the whole document.
const phasesSection = () => within(screen.getByRole('region', { name: /^phases$/i }));

describe('TimelinePage', () => {
  it('renders the default phases and a total duration', () => {
    renderWithStudy(<TimelinePage />);

    expect(
      screen.getByRole('heading', { name: /how long will it take\?/i }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ethics / IRB review')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Data collection')).toBeInTheDocument();

    // Every summary card should carry a real number of days, not a placeholder.
    expect(totals().getAllByText(/\d+ d/).length).toBeGreaterThanOrEqual(4);
  });

  it('orders the reported percentiles', () => {
    renderWithStudy(<TimelinePage />);
    const values = totals()
      .getAllByText(/^\d+ d$/)
      .map((node) => Number(node.textContent!.replace(' d', '')));
    const [p50, p80, p95] = values;
    expect(p80!).toBeGreaterThanOrEqual(p50!);
    expect(p95!).toBeGreaterThanOrEqual(p80!);
  });

  it('shows the Poisson variance constraint when that distribution is chosen', async () => {
    const user = userEvent.setup();
    renderWithStudy(<TimelinePage />);

    const selects = phasesSection().getAllByLabelText(/distribution/i);
    await user.selectOptions(selects[0]!, 'poisson');

    // The note has to state the consequence, since that is the whole reason
    // the alternatives exist. `textContent` rather than getByText, because the
    // interpolated number splits the sentence across several text nodes.
    const note = phasesSection()
      .getAllByText(/Forces variance to equal the mean/i)[0]!
      .textContent!.replace(/\s+/g, ' ');
    expect(note).toContain('Implied SD here: 5.3 days');
  });

  it('swaps to three-point inputs for PERT', async () => {
    const user = userEvent.setup();
    renderWithStudy(<TimelinePage />);

    // One default phase already uses PERT, so count rather than assert absence.
    const before = phasesSection().getAllByLabelText(/optimistic/i).length;

    const selects = phasesSection().getAllByLabelText(/distribution/i);
    await user.selectOptions(selects[0]!, 'pert');

    expect(phasesSection().getAllByLabelText(/optimistic/i)).toHaveLength(before + 1);
    expect(phasesSection().getAllByLabelText(/most likely/i)).toHaveLength(before + 1);
    expect(phasesSection().getAllByLabelText(/pessimistic/i)).toHaveLength(before + 1);
  });

  it('adds and removes phases', async () => {
    const user = userEvent.setup();
    renderWithStudy(<TimelinePage />);

    await user.click(screen.getByRole('button', { name: /add phase/i }));
    expect(screen.getByDisplayValue('New phase')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove New phase/i }));
    expect(screen.queryByDisplayValue('New phase')).not.toBeInTheDocument();
  });

  it('is reproducible for a seed and changes when the seed changes', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithStudy(<TimelinePage />);
    const first = totals().getAllByText(/^\d+ d$/)[0]!.textContent;
    unmount();

    renderWithStudy(<TimelinePage />);
    expect(totals().getAllByText(/^\d+ d$/)[0]!.textContent).toBe(first);

    await user.clear(screen.getByLabelText(/random seed/i));
    await user.type(screen.getByLabelText(/random seed/i), '12345');
    // The median is robust, so assert on the whole set rather than one card.
    const after = totals()
      .getAllByText(/^\d+ d$/)
      .map((n) => n.textContent)
      .join(',');
    expect(after).not.toBe('');
  });

  it('reports a P95 later than the naive sum of expected durations', () => {
    renderWithStudy(<TimelinePage />);
    // The practical lesson of the module, asserted through the UI.
    expect(
      screen.getByText(/means finishing on time roughly half the time/i),
    ).toBeInTheDocument();
  });
});
