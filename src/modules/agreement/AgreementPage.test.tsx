import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import AgreementPage from './AgreementPage.tsx';

describe('AgreementPage', () => {
  it('renders the page and the paired algorithm non-inferiority section', () => {
    renderWithStudy(<AgreementPage />);

    expect(
      screen.getByRole('heading', {
        name: /how many participants do i need\?/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /paired algorithm non-inferiority \(firmware update on same data\)/i,
      }),
    ).toBeInTheDocument();

    // Default Paired Algorithm preset should show 12 subjects (at rho = 0.94) vs 191 uncoupled
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/191/).length).toBeGreaterThan(0);
  });

  it('updates sample size when the correlation slider changes', () => {
    renderWithStudy(<AgreementPage />);

    const slider = screen.getByLabelText(/paired error correlation/i);
    expect(slider).toBeInTheDocument();

    // Change rho to 0.00 (uncorrelated)
    fireEvent.change(slider, { target: { value: '0' } });

    // When rho = 0, required sample size climbs to 191
    expect(screen.getAllByText('191').length).toBeGreaterThan(0);
  });

  it('switches between paired algorithm presets', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AgreementPage />);

    // Click SpO2 Calibration Pipeline preset
    const spo2Btn = screen.getByRole('button', {
      name: /spo2 r-curve calibration pipeline/i,
    });
    await user.click(spo2Btn);

    // SpO2 preset has pairedN = 9
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);

    // Click Sleep Staging Kappa preset
    const sleepBtn = screen.getByRole('button', {
      name: /sleep staging predecessor parity/i,
    });
    await user.click(sleepBtn);

    // Sleep Staging preset has pairedN = 71
    expect(screen.getAllByText('71').length).toBeGreaterThan(0);
    // Uncorrelated N is 707
    expect(screen.getAllByText(/707/).length).toBeGreaterThan(0);
  });

  it('updates required enrolled participants when protocol yield slider changes', () => {
    renderWithStudy(<AgreementPage />);

    // Default firmware-hr has pairedN = 12. At 70% yield, 12 / 0.70 = 17.14 -> 18 enrolled
    expect(screen.getByText(/18 participants/i)).toBeInTheDocument();

    const yieldSlider = screen.getByLabelText(/expected study protocol yield percentage/i);
    fireEvent.change(yieldSlider, { target: { value: '50' } });

    // At 50% yield, 12 / 0.50 = 24 enrolled
    expect(screen.getByText(/24 participants/i)).toBeInTheDocument();
  });

  it('carries paired non-inferiority sample size into study plan on button click', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AgreementPage />);

    const carryBtn = screen.getByRole('button', {
      name: /carry 18 into study plan/i,
    });
    expect(carryBtn).toBeInTheDocument();
    await user.click(carryBtn);
  });

  it('renders PROTOCOL STUDIO pillar badge and NextSteps workflow bridge cards', () => {
    renderWithStudy(<AgreementPage />);

    expect(screen.getByText('PROTOCOL STUDIO')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /report studio: launch gates/i })).toBeInTheDocument();
  });
});
