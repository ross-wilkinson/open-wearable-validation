import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import userEvent from '@testing-library/user-event';
import PrecisionPage from './PrecisionPage.tsx';
import { biasMargin, percentileMargin } from './precisionModel.ts';

/**
 * Queries are scoped to a named region rather than run against the whole
 * document. The collapsed `<details>` table keeps all ~200 of its rows in the
 * DOM, so an unscoped `getByText('±0.250')` matches a stat card and two table
 * cells and throws. Scoping is not a workaround for that — a value appearing in
 * both the summary and the full table is correct — it is how the test says
 * which one it means.
 */
const statCards = () => within(screen.getByRole('region', { name: /at n =/i }));
const neededTable = () =>
  within(screen.getByRole('table', { name: /subjects needed/i }));

describe('PrecisionPage', () => {
  it('renders the default series with their computed values', () => {
    renderWithStudy(<PrecisionPage />);

    expect(
      screen.getByRole('heading', { name: /how precise will my study be\?/i }),
    ).toBeInTheDocument();

    // Default inspection point is n = 64 — the notebook's own worked example.
    expect(screen.getByRole('heading', { name: /at n = 64/i })).toBeInTheDocument();
    expect(
      statCards().getByText(`±${biasMargin(64, 0.95).toFixed(3)}`),
    ).toBeInTheDocument();
    expect(
      statCards().getByText(`±${percentileMargin(0.9, 64, 0.95).toFixed(3)}`),
    ).toBeInTheDocument();
  });

  it('recomputes when the inspection point changes', async () => {
    const user = userEvent.setup();
    renderWithStudy(<PrecisionPage />);

    const field = screen.getByLabelText(/inspect at n/i);
    await user.clear(field);
    await user.type(field, '30');

    expect(screen.getByRole('heading', { name: /at n = 30/i })).toBeInTheDocument();
    expect(
      statCards().getByText(`±${biasMargin(30, 0.95).toFixed(3)}`),
    ).toBeInTheDocument();
  });

  it('widens every margin when the confidence level rises', async () => {
    const user = userEvent.setup();
    renderWithStudy(<PrecisionPage />);

    expect(
      statCards().getByText(`±${biasMargin(64, 0.95).toFixed(3)}`),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/confidence level/i), '0.99');

    expect(
      statCards().getByText(`±${biasMargin(64, 0.99).toFixed(3)}`),
    ).toBeInTheDocument();
  });

  it('adds and removes percentile series', async () => {
    const user = userEvent.setup();
    renderWithStudy(<PrecisionPage />);

    expect(statCards().queryByText('68th percentile')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'P68' }));
    expect(statCards().getByText('68th percentile')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'P50' }));
    expect(statCards().queryByText('50th percentile')).not.toBeInTheDocument();
  });

  it('reports a larger required n for an upper percentile than for the bias', () => {
    renderWithStudy(<PrecisionPage />);

    // The module's actual argument, asserted through the UI: sizing on the bias
    // understates what the other estimands need.
    const valueFor = (label: string | RegExp) => {
      const row = neededTable()
        .getAllByRole('row')
        .find((candidate) => within(candidate).queryByText(label));
      const cells = within(row!).getAllByRole('cell');
      return Number(cells[1]!.textContent);
    };

    expect(valueFor('90th percentile')).toBeGreaterThan(valueFor('Bias'));
    expect(valueFor(/limits of agreement/i)).toBeGreaterThan(valueFor('Bias'));
  });

  it('renders a table view of every plotted value', async () => {
    const user = userEvent.setup();
    renderWithStudy(<PrecisionPage />);

    // The table is the accessible equivalent of the chart, and the documented
    // relief for series colours below 3:1 contrast on the light surface.
    //
    // `selector` disambiguates the disclosure's <summary> from the table's own
    // sr-only <caption>; both legitimately carry the same text, since that is
    // what makes the collapsed control and the expanded table read as one thing.
    await user.click(screen.getByText(/all values/i, { selector: 'summary' }));
    const table = screen.getByRole('table', { name: /all values/i });
    expect(within(table).getByRole('columnheader', { name: 'n' })).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: /90th percentile/i }),
    ).toBeInTheDocument();
  });

  it('says so when a target margin is unreachable in range', async () => {
    const user = userEvent.setup();
    renderWithStudy(<PrecisionPage />);

    const target = screen.getByLabelText(/target margin/i);
    await user.clear(target);
    await user.type(target, '0.01');

    expect(neededTable().getAllByText(/more than 200/i).length).toBeGreaterThan(0);
  });

  it('renders PROTOCOL STUDIO pillar badge and NextSteps workflow bridge cards', () => {
    renderWithStudy(<PrecisionPage />);

    expect(screen.getByText('PROTOCOL STUDIO')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /report studio: launch gates/i })).toBeInTheDocument();
  });
});
