import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import HealthDataLandingPage from './HealthDataLandingPage.tsx';

describe('HealthDataLandingPage', () => {
  it('renders hero title, eyebrow, and CDC NHANES description', () => {
    renderWithStudy(<HealthDataLandingPage />);

    expect(screen.getByText('HEALTH DATA CATALOG')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /health data catalog: grounding studies in real populations/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/CDC NHANES • SCIN/i)).toBeInTheDocument();
  });

  it('renders reference metric cards and displays empirical quantiles', () => {
    renderWithStudy(<HealthDataLandingPage />);

    expect(screen.getByText('Resting Heart Rate (Adults 18–65)')).toBeInTheDocument();
    expect(screen.getByText(/CDC NHANES 2017–2020 Continuous/i)).toBeInTheDocument();
    expect(screen.getByText(/P50 \(Median\)/i)).toBeInTheDocument();
    expect(screen.getByText(/P95 \(Upper Bound\)/i)).toBeInTheDocument();
  });

  it('switches cohort reference explorer metric tabs', async () => {
    const user = userEvent.setup();
    renderWithStudy(<HealthDataLandingPage />);

    const normativeBtn = screen.getByRole('button', { name: /^normative$/i });
    await user.click(normativeBtn);

    expect(screen.getByText('Normative Ambulatory Pulse Oximetry (SpO2)')).toBeInTheDocument();
  });

  it('links to external live Health Data Distributions app', () => {
    renderWithStudy(<HealthDataLandingPage />);

    const liveAppLink = screen.getByRole('link', { name: /launch live distributions tool/i });
    expect(liveAppLink).toHaveAttribute(
      'href',
      'https://ross-wilkinson.github.io/health-data-distributions/',
    );
    expect(liveAppLink).toHaveAttribute('target', '_blank');
  });
});
