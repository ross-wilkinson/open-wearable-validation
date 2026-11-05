import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AstroCalValPage from './AstroCalValPage.tsx';
import AstroStudyProtocolPage from './AstroStudyProtocolPage.tsx';
import AstroPrimersPage from './AstroPrimersPage.tsx';

describe('AstroCalValPage & Companion Guides', () => {
  it('renders Test Details, always-visible 6-row KPI Summary with Definitions, and zero HRL references', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/academy/astro-calval']}>
        <AstroCalValPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Rubin Commissioning Photometric Redshift Validation Report/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Test Details & Study Configuration/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Upper bound of the 95% confidence interval for the median absolute error across all pooled observations/i,
      ),
    ).toBeInTheDocument();

    // Ensure no mention of HRL anywhere in the rendered page
    expect(container.textContent).not.toMatch(/\bHRL\b/);
  });

  it('switches cleanly between Pipeline A, Pipeline B, and Head-to-Head across Agreement, Correlation+KDEs, ECDF, and Time-Series', () => {
    render(
      <MemoryRouter initialEntries={['/academy/astro-calval']}>
        <AstroCalValPage />
      </MemoryRouter>,
    );

    // Default is Pipeline B vs. Reference on Tab 2 (Agreement)
    expect(
      screen.getByText(/202 Individual Galaxies \(Core \+ Catastrophic Outliers\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pipeline B \(Deep Learning Hybrid\) · Detection Sensitivity/i),
    ).toBeInTheDocument();

    // Toggle to Square 1:1 Correlation + Marginal KDEs view
    const corrBtn = screen.getByRole('button', { name: /1:1 Correlation \+ KDEs/i });
    fireEvent.click(corrBtn);
    expect(
      screen.getByText(/Square 1:1 Joint Correlation & Marginal KDE View/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Reference z_spec Marginal Distribution \(KDE\)/i),
    ).toBeInTheDocument();

    // Switch to Head-to-Head mode
    const h2hBtn = screen.getByRole('button', { name: /Head-to-Head \(A vs\. B\)/i });
    fireEvent.click(h2hBtn);

    expect(
      screen.getByText(/Head-to-Head Practical Equivalence & Dominance Scorecard/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Practical Equivalence & Dominance Test/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Head-to-Head Detection Sensitivity Comparison \(A vs\. B\)/i),
    ).toBeInTheDocument();

    // Navigate to Tab 3 (ECDF) in H2H mode
    const ecdfTabBtn = screen.getByRole('button', { name: /Cumulative Error \(ECDF\)/i });
    fireEvent.click(ecdfTabBtn);
    expect(
      screen.getByText(/Direct Comparison of Cumulative Absolute Error: Pipeline A vs\. Pipeline B/i),
    ).toBeInTheDocument();

    // Navigate to Tab 4 (Error Over Time) and verify strict split between H2H and Pipeline A
    const timeTabBtn = screen.getByRole('button', { name: /Error Over Time/i });
    fireEvent.click(timeTabBtn);
    expect(
      screen.getByText(/Head-to-Head Paired Advantage Trajectory Over Time/i),
    ).toBeInTheDocument();

    const pipeABtn = screen.getByRole('button', { name: /Pipeline A vs\. Reference/i });
    fireEvent.click(pipeABtn);
    expect(
      screen.getByText(/Pipeline A \(Legacy Template Fitting\): Population Error Quantile Fan Over Time/i),
    ).toBeInTheDocument();
  });

  it('renders Study Protocol page with Cross-Domain Translation Matrix and Glossary', () => {
    render(
      <MemoryRouter initialEntries={['/academy/astro-calval/study-protocol']}>
        <AstroStudyProtocolPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/What Is This Study\? — Rubin Commissioning Photo-z Benchmark/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cross-Domain Translation Matrix: Same Math, Different Photons/i),
    ).toBeInTheDocument();
  });

  it('renders Methodological Primers page and supports deep-linking to specific topics', () => {
    render(
      <MemoryRouter initialEntries={['/academy/astro-calval/primers/detectability']}>
        <Routes>
          <Route path="/academy/astro-calval/primers/:topic" element={<AstroPrimersPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Smallest Real Change Reliably Detected Above Noise \(ISO 11843-1\)/i),
    ).toBeInTheDocument();
  });
});
