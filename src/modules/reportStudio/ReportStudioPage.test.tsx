import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('switches between presets (e.g. Exercise Heart Rate and Sleep Staging)', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ReportStudioPage />);

    const select = screen.getByLabelText(/domain preset/i);
    await user.selectOptions(select, 'heart-rate');

    expect(
      screen.getByText(/sports & cardiovascular \/ cta-2065/i),
    ).toBeInTheDocument();

    // Switch to Sleep Staging
    await user.selectOptions(select, 'sleep-staging');

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
        name: /3\. "survival of error" & cumulative coverage/i,
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

  it('handles export standalone HTML and copy JSON clicks', async () => {
    const user = userEvent.setup();
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
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    expect(
      await screen.findByText(/json dashboard summary copied to clipboard!/i),
    ).toBeInTheDocument();
  });
});
