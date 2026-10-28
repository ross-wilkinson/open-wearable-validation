import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StudyProvider } from '../../app/study/StudyContext.tsx';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import ReportStudioPage from './ReportStudioPage.tsx';

describe('ReportStudioPage', () => {
  it('renders the page with default SpO2 preset and executive scorecard', () => {
    renderWithStudy(<ReportStudioPage />);

    expect(
      screen.getByRole('heading', {
        name: /how do i present and report validation findings\?/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /1\. cross-functional executive scorecard/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/systems that scale: client-side portability/i),
    ).toBeInTheDocument();

    // SpO2 default tolerance is +/- 3.0 %
    expect(screen.getAllByText(/±3/i).length).toBeGreaterThan(0);
  });

  it('switches between presets (e.g. Exercise Heart Rate and Sleep Staging)', () => {
    renderWithStudy(<ReportStudioPage />);

    const select = screen.getByLabelText(/domain preset/i);
    fireEvent.change(select, { target: { value: 'heart-rate' } });

    expect(
      screen.getByText(/sports & cardiovascular \/ cta-2065/i),
    ).toBeInTheDocument();

    // Switch to Sleep Staging
    fireEvent.change(select, { target: { value: 'sleep-staging' } });

    expect(
      screen.getByText(/sleep staging multi-class confusion matrix/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cohen's kappa/i),
    ).toBeInTheDocument();
  });

  it('filters scorecard items when stakeholder lens button is clicked', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    // Click 'clinical' lens button
    const clinicalBtn = screen.getByRole('button', { name: /^clinical$/i });
    await user.click(clinicalBtn);

    expect(screen.getByText(/root mean square error \/ arms/i)).toBeInTheDocument();
    expect(screen.getByText(/95% limits of agreement \(loa\)/i)).toBeInTheDocument();
  });

  it('toggles Bland-Altman view between all observations and subject centroids', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    const centroidsBtn = screen.getByRole('button', { name: /24 subject centroids/i });
    expect(centroidsBtn).toBeInTheDocument();

    await user.click(centroidsBtn);
    expect(centroidsBtn).toHaveClass('bg-surface');
  });

  it('renders survival of error and cumulative error coverage sections', () => {
    renderWithStudy(<ReportStudioPage />);

    expect(
      screen.getByRole('heading', {
        name: /"survival of error" & cumulative coverage/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /survival of error: p/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /cumulative coverage: p/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the Two-Gate 4-Quadrant Visualizer and switches candidate archetypes', () => {
    renderWithStudy(<ReportStudioPage />);

    expect(
      screen.getByRole('heading', {
        name: /2\. two-gate 4-quadrant commercial launch visualizer/i,
      }),
    ).toBeInTheDocument();

    // Default is Ideal Candidate (Quadrant 1: Green Go)
    expect(screen.getAllByText(/quadrant 1: green go/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/🟢 APPROVED/i).length).toBeGreaterThan(0);

    // Switch to Regressive Upgrade archetype
    const regressiveBtn = screen.getByRole('button', {
      name: /regressive upgrade \(quadrant 2: amber parity risk\)/i,
    });
    fireEvent.click(regressiveBtn);

    expect(screen.getAllByText(/quadrant 2: amber \(parity risk\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/🟡 CAUTION \(PARITY RISK\)/i).length).toBeGreaterThan(0);

    // Mock clipboard and test copy briefing
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const copyBriefingBtn = screen.getByRole('button', {
      name: /copy executive briefing/i,
    });
    fireEvent.click(copyBriefingBtn);
    expect(writeTextMock).toHaveBeenCalled();
  });

  it('handles export standalone HTML and copy JSON clicks', async () => {
    renderWithStudy(<ReportStudioPage />);

    // Mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    const copyBtn = screen.getByRole('button', { name: /copy plx \/ json metrics/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    expect(
      await screen.findByText(/json dashboard summary copied to clipboard!/i),
    ).toBeInTheDocument();
  });

  it('renders REPORT STUDIO pillar badge and NextSteps workflow bridge cards', () => {
    renderWithStudy(<ReportStudioPage />);

    expect(screen.getByText('REPORT STUDIO')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /validation academy: 8 interactive case studies/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /protocol studio: sample size & sizing/i }),
    ).toBeInTheDocument();
  });

  it('navigates to Vector 3 and verifies Head-to-Head 21 of 25 participants dominance conclusion', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    // Click Vector 3 tab in sticky outline bar
    const v3Btn = screen.getByRole('button', { name: /3\. head-to-head \(21 of 25\)/i });
    expect(v3Btn).toBeInTheDocument();
    await user.click(v3Btn);

    // Dynamic Page Header for Vector 3
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /head-to-head algorithm dominance: comparing two devices against ecg/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('REPORT STUDIO • HEAD-TO-HEAD COMPARISON')).toBeInTheDocument();
    expect(screen.getByText('Synchronized Paired Difference Analysis')).toBeInTheDocument();
    expect(
      screen.getByText(/Overcoming the pairing discard fallacy by evaluating synchronized error differences/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Device 1, Device 2, and the reference were collected synchronously/i),
    ).toBeInTheDocument();

    // Scaling Callout should NOT be rendered when a specific vector is selected
    expect(
      screen.queryByText(/systems that scale: client-side portability/i),
    ).not.toBeInTheDocument();

    // Section heading for Vector 3
    expect(
      screen.getByRole('heading', { name: /three-way head-to-head dominance/i }),
    ).toBeInTheDocument();

    // Overcoming pairing discard fallacy note
    expect(
      screen.getByText(/overcoming the "pairing discard" fallacy in comparative validation/i),
    ).toBeInTheDocument();

    // Exact headline conclusion:
    expect(
      screen.getByText(/during high-intensity interval running, device 1 meaningfully outperformed device 2 in 21 of 25 participants\./i),
    ).toBeInTheDocument();

    // Check participant dominance distribution is rendered
    expect(screen.getByText(/participant dominance distribution/i)).toBeInTheDocument();
  });

  it('navigates to Vector 2 and verifies subject-weighted ECDF envelope and KS trap warning', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    const v2Btn = screen.getByRole('button', { name: /2\. ecdf morphology/i });
    await user.click(v2Btn);

    // Dynamic Page Header for Vector 2
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /subject-weighted error distributions & morphology/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('REPORT STUDIO • ERROR DISTRIBUTIONS')).toBeInTheDocument();
    expect(screen.getByText('Distribution Curves & Repeated Measures')).toBeInTheDocument();
    expect(
      screen.getByText(/Evaluating empirical error distributions, subject-weighted envelopes, and morphology crossover points/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Repeated observations within each subject are correlated/i),
    ).toBeInTheDocument();

    // Scaling Callout should NOT be rendered
    expect(
      screen.queryByText(/systems that scale: client-side portability/i),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /ecdf & error morphology/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/repeated measures consideration: naive pooling vs cluster-honest testing/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/subject-weighted ecdf envelopes vs\. naive pooled rows/i),
    ).toBeInTheDocument();
  });

  it('navigates to Vector 5 and verifies silent software drift canary alarm', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    const v5Btn = screen.getByRole('button', { name: /5\. drift canary/i });
    await user.click(v5Btn);

    // Dynamic Page Header for Vector 5
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /catching silent algorithmic drift across firmware generations/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('REPORT STUDIO • SOFTWARE EVOLUTION')).toBeInTheDocument();
    expect(screen.getByText('Multi-Generation Transitive Canary Testing')).toBeInTheDocument();
    expect(
      screen.getByText(/Detecting creeping performance degradation across firmware iterations/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Transitive network comparisons assume bridge studies maintain consistent/i),
    ).toBeInTheDocument();

    // Scaling Callout should NOT be rendered
    expect(
      screen.queryByText(/systems that scale: client-side portability/i),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /multi-generation transitive drift canary/i }),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/canary alarm: silent algorithmic drift detected!/i).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getByText(/why transitive canary testing matters:/i),
    ).toBeInTheDocument();
  });

  it('opens Export Report utility dropdown and opens export modal for FDA Table 1 and Methods', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    const exportBtn = screen.getByRole('button', { name: /export report/i });
    await user.click(exportBtn);

    expect(screen.getByRole('menuitem', { name: /fda 510\(k\) table 1/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /citable methods paragraph/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /executive launch brief/i })).toBeInTheDocument();

    // Click FDA Table 1 menuitem to open modal
    const table1Item = screen.getByRole('menuitem', { name: /fda 510\(k\) table 1/i });
    await user.click(table1Item);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getAllByText(/fda 510\(k\) pre-market notification \/ iso 80601-2-61/i).length,
    ).toBeGreaterThan(0);

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /^close$/i });
    await user.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates to Vector 1 and displays live Pearson r and taxonomy items', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    const v1Btn = screen.getByRole('button', { name: /1\. kpi taxonomy/i });
    await user.click(v1Btn);

    // Dynamic Page Header for Vector 1
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /recommended accuracy metrics & kpi standards/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('REPORT STUDIO • METRICS & KPIS')).toBeInTheDocument();
    expect(screen.getByText('Accuracy Metrics & Reporting Standards')).toBeInTheDocument();
    expect(
      screen.getByText(/Evaluating continuous physiological sensor error across RMSE, MAE, Bland-Altman Limits of Agreement/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Evaluations assume repeated measures across human participants/i),
    ).toBeInTheDocument();

    // Scaling Callout should NOT be rendered
    expect(
      screen.queryByText(/systems that scale: client-side portability/i),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /kpi & metric taxonomy/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/why pearson correlation r is deceptive/i)).toBeInTheDocument();
    // Live Pearson r card shows (Deceptive) badge
    expect(screen.getAllByText(/\(deceptive\)/i).length).toBeGreaterThan(0);
  });

  it('navigates to Vector 4 and verifies unique header and Two-Gate Launch Plane', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    const v4Btn = screen.getByRole('button', { name: /4\. two-gate plane/i });
    await user.click(v4Btn);

    // Dynamic Page Header for Vector 4
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /the two-gate commercial launch matrix/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('REPORT STUDIO • COMMERCIAL LAUNCH PLANE')).toBeInTheDocument();
    expect(screen.getByText('Release Governance & Risk Balancing')).toBeInTheDocument();
    expect(
      screen.getByText(/Balancing Gate 1 \(Absolute Clinical Safety\) against Gate 2 \(Predecessor Parity\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gate 1 enforces absolute clinical safety thresholds/i),
    ).toBeInTheDocument();

    // Visualizer section
    expect(
      screen.getByRole('heading', {
        name: /2\. two-gate 4-quadrant commercial launch visualizer/i,
      }),
    ).toBeInTheDocument();

    // Scaling Callout should NOT be rendered
    expect(
      screen.queryByText(/systems that scale: client-side portability/i),
    ).not.toBeInTheDocument();
  });

  it('switches back to All Vectors and restores the consolidated header and Scaling Callout', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    // Switch to Vector 1
    const v1Btn = screen.getByRole('button', { name: /1\. kpi taxonomy/i });
    await user.click(v1Btn);
    expect(screen.queryByText(/systems that scale: client-side portability/i)).not.toBeInTheDocument();

    // Switch back to All Vectors
    const allBtn = screen.getByRole('button', { name: /all vectors/i });
    await user.click(allBtn);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /how do i present and report validation findings\?/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('REPORT STUDIO')).toBeInTheDocument();
    expect(screen.getByText('Validation Reporting & Evidence Synthesis')).toBeInTheDocument();
    expect(
      screen.getByText(/systems that scale: client-side portability/i),
    ).toBeInTheDocument();
  });

  it('renders Overview Hub link in sticky outline bar pointing to /report-studio/overview', () => {
    renderWithStudy(<ReportStudioPage />);

    const overviewLink = screen.getByRole('link', { name: /overview hub/i });
    expect(overviewLink).toBeInTheDocument();
    expect(overviewLink).toHaveAttribute('href', '/report-studio/overview');
  });

  it('renders synchronized paired epochs table in Vector 3', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    const v3Btn = screen.getByRole('button', { name: /3\. head-to-head \(21 of 25\)/i });
    await user.click(v3Btn);

    expect(
      screen.getAllByText(/sample synchronized paired epochs: paired error differences/i).length,
    ).toBeGreaterThan(0);
  });

  it('supports deep-linking via search params (?vector=vector3)', () => {
    render(
      <MemoryRouter initialEntries={['/report-studio?vector=vector3']}>
        <StudyProvider>
          <ReportStudioPage />
        </StudyProvider>
      </MemoryRouter>,
    );

    // Vector 3 dynamic page title
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /head-to-head algorithm dominance: comparing two devices against ecg/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('REPORT STUDIO • HEAD-TO-HEAD COMPARISON')).toBeInTheDocument();

    // Vector 3 should be directly visible
    expect(
      screen.getByRole('heading', { name: /three-way head-to-head dominance/i }),
    ).toBeInTheDocument();

    // Scaling callout is NOT present when vector is selected
    expect(
      screen.queryByText(/systems that scale: client-side portability/i),
    ).not.toBeInTheDocument();

    // The entry deck ("Validation Reporting Focus Areas") should NOT be present when a single vector is selected
    expect(
      screen.queryByRole('heading', { name: /validation reporting focus areas/i }),
    ).not.toBeInTheDocument();
  });
});

