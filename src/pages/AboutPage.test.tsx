import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import AboutPage from './AboutPage.tsx';

describe('AboutPage', () => {
  it('renders author credentials, Google Pixel Watch experience, and FDA submissions', () => {
    renderWithStudy(<AboutPage />);

    expect(
      screen.getByRole('heading', { name: /why validation study designer was built/i }),
    ).toBeInTheDocument();

    const authorSection = document.getElementById('author-credentials');
    expect(authorSection).toBeInTheDocument();
    expect(authorSection).toHaveTextContent('15+');
    expect(authorSection).toHaveTextContent(/pixel watch algorithms validated/i);
    expect(authorSection).toHaveTextContent(/2/);
    expect(authorSection).toHaveTextContent(/fda regulatory submissions/i);
    expect(authorSection).toHaveTextContent(/3\.5 yrs/);
    expect(authorSection).toHaveTextContent(/research scientist at google/i);
    expect(authorSection).toHaveTextContent('100%');
    expect(authorSection).toHaveTextContent(/client-side \(zero data egress\)/i);
  });

  it('details all five multi-million dollar statistical traps', () => {
    renderWithStudy(<AboutPage />);

    expect(screen.getByText(/the multi-million dollar statistical traps/i)).toBeInTheDocument();
    expect(screen.getByText(/pseudoreplication in repeated measures/i)).toBeInTheDocument();
    expect(screen.getByText(/the g\*power \/ hypothesis testing fallacy/i)).toBeInTheDocument();
    expect(screen.getByText(/generic ai & llm hallucinations/i)).toBeInTheDocument();
    expect(screen.getByText(/the rapid prototyping "winner's curse"/i)).toBeInTheDocument();
    expect(screen.getByText(/spreadsheet fragility & silent cell errors/i)).toBeInTheDocument();
  });

  it('renders peer-reviewed publications and clinical credentials', () => {
    renderWithStudy(<AboutPage />);

    expect(screen.getByText(/rethinking the statistical analysis of neuromechanical data/i)).toBeInTheDocument();
    expect(screen.getByText(/good clinical practice \(ich gcp\) certificate/i)).toBeInTheDocument();
    expect(screen.getByText(/17% sleep algorithm gain & claims/i)).toBeInTheDocument();
  });

  it('links to author scholar profile and ecosystem tools', () => {
    renderWithStudy(<AboutPage />);

    const scholarLink = screen.getByRole('link', { name: /google scholar/i });
    expect(scholarLink).toHaveAttribute('href', expect.stringContaining('scholar.google.com'));

    expect(
      screen.getByRole('link', { name: /health data distributions ↗/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /agreekit \(python\) ↗/i }),
    ).toBeInTheDocument();

    const ecosystemSection = document.getElementById('ecosystem');
    expect(ecosystemSection).toBeInTheDocument();
    const phase0Index = ecosystemSection!.textContent!.indexOf('Phase 0: Reference Data');
    const phase1Index = ecosystemSection!.textContent!.indexOf('Phase 1: Sizing & Architecture');
    const phase2Index = ecosystemSection!.textContent!.indexOf('Phase 2: Post-Collection Analysis');
    expect(phase0Index).toBeLessThan(phase1Index);
    expect(phase1Index).toBeLessThan(phase2Index);
  });

  it('renders NextSteps workflow bridge cards linking to all four components', () => {
    renderWithStudy(<AboutPage />);

    expect(screen.getByRole('link', { name: /protocol studio: study design & sizing/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /report studio: launch gates & scorecards/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pitfall explorer: statistical pitfalls/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /validation academy: 8 interactive modules/i })).toBeInTheDocument();
  });

  it('renders quick jump navigation bar and signpost badges for reading rhythm', () => {
    renderWithStudy(<AboutPage />);

    expect(screen.getByRole('navigation', { name: /about page sections/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /1\. 5 statistical traps/i })).toHaveAttribute('href', '#statistical-traps');
    expect(screen.getByRole('link', { name: /2\. creator & track record/i })).toHaveAttribute('href', '#author-credentials');
    expect(screen.getByRole('link', { name: /3\. maturity matrix/i })).toHaveAttribute('href', '#maturity-matrix');
    expect(screen.getByRole('link', { name: /4\. architecture & privacy/i })).toHaveAttribute('href', '#engineering');
    expect(screen.getByRole('link', { name: /5\. research trifecta/i })).toHaveAttribute('href', '#ecosystem');
    expect(screen.getByRole('link', { name: /6\. regulatory guidance/i })).toHaveAttribute('href', '#caveats');

    expect(screen.getByText(/section 1 • statistical failure modes/i)).toBeInTheDocument();
    expect(screen.getByText(/section 2 • provenance & credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/section 3 • organizational diagnostic/i)).toBeInTheDocument();
    expect(screen.getByText(/section 4 • architecture & privacy/i)).toBeInTheDocument();
    expect(screen.getByText(/section 5 • connected tools/i)).toBeInTheDocument();
    expect(screen.getByText(/section 6 • regulatory guidance/i)).toBeInTheDocument();
  });
});
