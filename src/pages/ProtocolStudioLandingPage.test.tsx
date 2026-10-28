import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import ProtocolStudioLandingPage from './ProtocolStudioLandingPage.tsx';

describe('ProtocolStudioLandingPage', () => {
  it('renders hero title, eyebrow, and quick stats', () => {
    renderWithStudy(<ProtocolStudioLandingPage />);

    expect(screen.getByText('PROTOCOL STUDIO')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /design rigorous wearable validation protocols/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders all protocol tool cards as fully clickable tiles linking to individual calculators', () => {
    renderWithStudy(<ProtocolStudioLandingPage />);

    expect(
      screen.getByRole('heading', { level: 3, name: /reference standard selector/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /sample size for agreement/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /repeated measures & clustering/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /precision vs sample size/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /demographic quotas & equity/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /study timeline monte carlo/i }),
    ).toBeInTheDocument();

    const referenceLink = screen.getByRole('link', { name: /reference standard selector/i });
    expect(referenceLink).toHaveAttribute('href', '/reference-devices');

    const agreementLink = screen.getByRole('link', { name: /sample size for agreement/i });
    expect(agreementLink).toHaveAttribute('href', '/agreement');

    const repeatedLink = screen.getByRole('link', { name: /repeated measures & clustering/i });
    expect(repeatedLink).toHaveAttribute('href', '/repeated-measures');

    const precisionLink = screen.getByRole('link', { name: /precision vs sample size/i });
    expect(precisionLink).toHaveAttribute('href', '/precision');

    const demographicsLink = screen.getByRole('link', { name: /demographic quotas & equity/i });
    expect(demographicsLink).toHaveAttribute('href', '/demographics');

    const timelineLink = screen.getByRole('link', { name: /study timeline monte carlo/i });
    expect(timelineLink).toHaveAttribute('href', '/timeline');
  });

  it('renders workflow bridge linking to Report Studio', () => {
    renderWithStudy(<ProtocolStudioLandingPage />);

    expect(
      screen.getByRole('link', { name: /report studio: launch gates & scorecards/i }),
    ).toHaveAttribute('href', '/report-studio');
  });
});
