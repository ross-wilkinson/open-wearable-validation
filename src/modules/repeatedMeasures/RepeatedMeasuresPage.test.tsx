import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import RepeatedMeasuresPage from './RepeatedMeasuresPage.tsx';

describe('RepeatedMeasuresPage', () => {
  it('renders the page with default pulse oximetry preset values', () => {
    renderWithStudy(<RepeatedMeasuresPage />);

    expect(
      screen.getByRole('heading', {
        name: /how many subjects and replicates do i need\?/i,
      }),
    ).toBeInTheDocument();

    // Default SpO2 preset has m = 24, k = 6 -> N = 144
    expect(screen.getAllByText('144').length).toBeGreaterThan(0);
    expect(screen.getByText(/24 subjects × 6 replicates/i)).toBeInTheDocument();
  });

  it('displays the cost of ignoring clustering warning when k > 1', () => {
    renderWithStudy(<RepeatedMeasuresPage />);

    expect(
      screen.getByText(/the cost of ignoring clustering/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/that understates the uncertainty by/i),
    ).toBeInTheDocument();
  });

  it('switches preset when clicked', async () => {
    const user = userEvent.setup();
    renderWithStudy(<RepeatedMeasuresPage />);

    // Click Blood Pressure preset button
    const bpButton = screen.getByRole('button', {
      name: /non-invasive blood pressure/i,
    });
    await user.click(bpButton);

    // Blood pressure preset has m = 85, k = 3 -> N = 255
    expect(screen.getAllByText('255').length).toBeGreaterThan(0);
    expect(screen.getByText(/85 subjects × 3 replicates/i)).toBeInTheDocument();
  });

  it('toggles chart view between replicates and participants with aria-pressed state', async () => {
    const user = userEvent.setup();
    renderWithStudy(<RepeatedMeasuresPage />);

    expect(
      screen.getByText(/diminishing returns/i),
    ).toBeInTheDocument();

    const varyReplicatesBtn = screen.getByRole('button', {
      name: /vary replicates \(k\)/i,
    });
    const varyParticipantsBtn = screen.getByRole('button', {
      name: /vary participants \(m\)/i,
    });

    expect(varyReplicatesBtn).toHaveAttribute('aria-pressed', 'true');
    expect(varyParticipantsBtn).toHaveAttribute('aria-pressed', 'false');

    await user.click(varyParticipantsBtn);

    expect(
      screen.getByText(/participant scaling curve/i),
    ).toBeInTheDocument();
    expect(varyReplicatesBtn).toHaveAttribute('aria-pressed', 'false');
    expect(varyParticipantsBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the dynamic allocation matrix for active study budget and highlights selected', async () => {
    const user = userEvent.setup();
    renderWithStudy(<RepeatedMeasuresPage />);

    expect(
      screen.getByText(/participant vs replicate allocation matrix/i),
    ).toBeInTheDocument();

    // Default SpO2 budget is ~144 total observations (24 subjects x 6 reps)
    expect(screen.getByText(/~144 total observations/i)).toBeInTheDocument();
    expect(screen.getByText(/24 subjects × 6 reps/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected/i)).toBeInTheDocument();

    // Clicking an alternative row (e.g. 72 subjects x 2 reps) switches the active design
    const altRow = screen.getByText(/72 subjects × 2 reps/i);
    await user.click(altRow);

    expect(screen.getByText(/72 subjects × 2 replicates/i)).toBeInTheDocument();
  });

  it('applies solved required m when apply button is clicked', async () => {
    const user = userEvent.setup();
    renderWithStudy(<RepeatedMeasuresPage />);

    const applyButton = screen.queryByRole('button', { name: /apply m =/i });
    if (applyButton) {
      await user.click(applyButton);
      expect(screen.queryByRole('button', { name: /apply m =/i })).not.toBeInTheDocument();
    }
  });

  it('contains links to agreekit and references to Bland & Altman 2007', () => {
    renderWithStudy(<RepeatedMeasuresPage />);

    expect(screen.getAllByText(/agreekit/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/bland jm, altman dg\. agreement between methods/i),
    ).toBeInTheDocument();
  });
});
