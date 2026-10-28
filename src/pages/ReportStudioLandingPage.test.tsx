import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import ReportStudioLandingPage from './ReportStudioLandingPage.tsx';

describe('ReportStudioLandingPage', () => {
  it('renders hero title and eyebrow', () => {
    renderWithStudy(<ReportStudioLandingPage />);

    expect(screen.getByText('REPORT STUDIO')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /evaluate product launch readiness & synthesize clinical evidence/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the 5 core reporting focus area tiles as fully clickable cards', () => {
    renderWithStudy(<ReportStudioLandingPage />);

    expect(
      screen.getByRole('heading', { level: 3, name: /accuracy metrics & kpi reporting/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /error distributions & morphology/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /head-to-head algorithm comparison/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /commercial launch decision plane/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /firmware drift canary tracking/i }),
    ).toBeInTheDocument();

    const kpiLink = screen.getByRole('link', { name: /accuracy metrics & kpi reporting/i });
    expect(kpiLink).toHaveAttribute('href', '/report-studio?vector=vector1');

    const ecdfLink = screen.getByRole('link', { name: /error distributions & morphology/i });
    expect(ecdfLink).toHaveAttribute('href', '/report-studio?vector=vector2');

    const h2hLink = screen.getByRole('link', { name: /head-to-head algorithm comparison/i });
    expect(h2hLink).toHaveAttribute('href', '/report-studio?vector=vector3');

    const launchPlaneLink = screen.getByRole('link', { name: /commercial launch decision plane/i });
    expect(launchPlaneLink).toHaveAttribute('href', '/report-studio?vector=vector4');

    const canaryLink = screen.getByRole('link', { name: /firmware drift canary tracking/i });
    expect(canaryLink).toHaveAttribute('href', '/report-studio?vector=vector5');
  });

  it('renders specialized validation auditor tiles linking to chance-kpi and effect-size', () => {
    renderWithStudy(<ReportStudioLandingPage />);

    const chanceLink = screen.getByRole('link', { name: /pass-by-chance permutation auditor/i });
    expect(chanceLink).toHaveAttribute('href', '/chance-kpi');

    const effectLink = screen.getByRole('link', { name: /exact effect size & equivalence bounds/i });
    expect(effectLink).toHaveAttribute('href', '/effect-size');
  });

  it('renders workflow bridge linking to Protocol Studio and Validation Academy', () => {
    renderWithStudy(<ReportStudioLandingPage />);

    expect(
      screen.getByRole('link', { name: /protocol studio: study design & sizing/i }),
    ).toHaveAttribute('href', '/protocol-studio');
    expect(
      screen.getByRole('link', { name: /validation academy: 8 interactive modules/i }),
    ).toHaveAttribute('href', '/academy');
  });
});
