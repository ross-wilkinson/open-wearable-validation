import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import AgreekitLandingPage from './AgreekitLandingPage.tsx';

describe('AgreekitLandingPage', () => {
  it('renders hero title, install command, and DuckDB badge', () => {
    renderWithStudy(<AgreekitLandingPage />);

    expect(screen.getByText('AGREEKIT')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /agreekit: exact agreement statistics in python/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('pip install agreekit')).toBeInTheDocument();
    expect(screen.getByText(/duckdb \+ columnar parquet/i)).toBeInTheDocument();
  });

  it('switches between code example tabs', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AgreekitLandingPage />);

    expect(screen.getByText(/texas instruments optical ppg vs ecg reference/i)).toBeInTheDocument();

    const spo2Tab = screen.getByRole('button', { name: /^spo2$/i });
    await user.click(spo2Tab);

    expect(screen.getAllByText(/iso 80601-2-61/i).length).toBeGreaterThan(0);
  });

  it('renders the agreekit-mcp server specification section', () => {
    renderWithStudy(<AgreekitLandingPage />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /augmenting ai agents with agreekit-mcp/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('agreekit_agreement_table')).toBeInTheDocument();
    expect(screen.getByText('agreekit_sample_size_agreement')).toBeInTheDocument();
    expect(screen.getByText('agreekit_tost_equivalence')).toBeInTheDocument();
    expect(screen.getByText('agreekit_demographic_quotas')).toBeInTheDocument();
    expect(screen.getByText(/claude_desktop_config\.json/i)).toBeInTheDocument();
  });

  it('links to external GitHub repository', () => {
    renderWithStudy(<AgreekitLandingPage />);

    const githubLink = screen.getByRole('link', { name: /view on github/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/ross-wilkinson/agreekit');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });
});
