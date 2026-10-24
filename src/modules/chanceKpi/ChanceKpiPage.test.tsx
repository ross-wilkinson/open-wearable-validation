import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import ChanceKpiPage from './ChanceKpiPage.tsx';

describe('ChanceKpiPage', () => {
  it('renders the page with default Ambulatory SpO2 preset and severe false-pass hazard verdict', () => {
    renderWithStudy(<ChanceKpiPage />);

    // Page title and method
    expect(
      screen.getByRole('heading', {
        name: /did we pass our kpis by chance\?/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/permutation null distribution & preiss–fisher separation index/i),
    ).toBeInTheDocument();

    // Hazard verdict card
    expect(
      screen.getByText(/severe false-pass hazard: kpi passed by chance/i),
    ).toBeInTheDocument();

    // Defensible threshold and chance pass rate in scorecards
    expect(screen.getAllByText(/chance passing rate/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/defensible 5% kpi threshold/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/preiss–fisher separation index/i).length).toBeGreaterThan(0);
  });

  it('switches between presets and updates the hazard verdict', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ChanceKpiPage />);

    // Initially Ambulatory SpO2 is active (Critical Hazard)
    expect(
      screen.getByText(/severe false-pass hazard: kpi passed by chance/i),
    ).toBeInTheDocument();

    // Switch to Hypoxia SpO2 (Broad dynamic range)
    const hypoxiaBtn = screen.getByRole('button', {
      name: /hypoxia spo2/i,
    });
    await user.click(hypoxiaBtn);

    // Hazard verdict turns to Statistically Defensible
    expect(
      screen.getByText(/statistically defensible.*passing is not by chance/i),
    ).toBeInTheDocument();

    // Switch to Resting Temperature (Narrow dynamic range)
    const tempBtn = screen.getByRole('button', {
      name: /resting temp/i,
    });
    await user.click(tempBtn);

    expect(
      screen.getByText(/severe false-pass hazard: kpi passed by chance/i),
    ).toBeInTheDocument();
  });

  it('allows changing evaluation metric between RMSE, MAE, and LoA', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ChanceKpiPage />);

    const metricSelect = screen.getByLabelText(/evaluation metric/i);
    expect(metricSelect).toHaveValue('rmse');

    // Change to Bland-Altman LoA
    await user.selectOptions(metricSelect, 'loa');
    expect(metricSelect).toHaveValue('loa');

    // Change to MAE
    await user.selectOptions(metricSelect, 'mae');
    expect(metricSelect).toHaveValue('mae');
  });

  it('allows configuring desired false-positive rate alpha (1%, 5%, 10%)', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ChanceKpiPage />);

    const alphaSelect = screen.getByLabelText(/desired false-positive rate/i);
    expect(alphaSelect).toHaveValue('0.05');

    // Change to 1% ceiling (99% confidence)
    await user.selectOptions(alphaSelect, '0.01');
    expect(alphaSelect).toHaveValue('0.01');
    expect(screen.getAllByText(/defensible 1% kpi threshold/i).length).toBeGreaterThan(0);

    // Change to 10% ceiling (90% confidence)
    await user.selectOptions(alphaSelect, '0.10');
    expect(alphaSelect).toHaveValue('0.10');
    expect(screen.getAllByText(/defensible 10% kpi threshold/i).length).toBeGreaterThan(0);
  });

  it('supports toggling data source to Custom Paired Data and parsing observations', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ChanceKpiPage />);

    const customTab = screen.getByRole('button', { name: /custom paired data/i });
    await user.click(customTab);

    // The textarea should be present
    const textarea = screen.getByPlaceholderText(/97\.5, 97\.2/i);
    expect(textarea).toBeInTheDocument();

    // Input 4 custom paired observations
    fireEvent.change(textarea, {
      target: { value: '98.0, 98.2\n97.0, 97.1\n99.0, 98.9\n96.0, 96.3' },
    });

    expect(screen.getByText(/4 pairs loaded/i)).toBeInTheDocument();
  });

  it('renders the analytical reference table with matching variance decomposition', () => {
    renderWithStudy(<ChanceKpiPage />);

    expect(
      screen.getByText(/mathematical foundations & closed-form analytical references/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/analytical null \(cov = 0\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/empirical null \(10k permutations\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/var_pop\(x\) \+ var_pop\(y\)/i).length,
    ).toBeGreaterThan(0);
  });

  it('renders the methods text citing Preiss & Fisher (2008)', () => {
    renderWithStudy(<ChanceKpiPage />);

    expect(
      screen.getByText(/preiss–fisher permutation analysis was performed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/preiss d, fisher j/i),
    ).toBeInTheDocument();
  });

  it('carries sample size into the study plan when clicked', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ChanceKpiPage />);

    const carryButton = screen.getByRole('button', {
      name: /carry 100 participants into my plan/i,
    });
    await user.click(carryButton);

    expect(
      screen.getByText(/participants is in your plan/i),
    ).toBeInTheDocument();
  });

  it('renders SVG chart bars and reference lines', () => {
    const { container } = renderWithStudy(<ChanceKpiPage />);
    const svg = container.querySelector('svg.recharts-surface');
    expect(svg).toBeInTheDocument();
    const bars = container.querySelectorAll('.recharts-bar-rectangle');
    expect(bars.length).toBeGreaterThan(0);
    const refLines = container.querySelectorAll('.recharts-reference-line');
    expect(refLines.length).toBeGreaterThan(0);
  });
});
