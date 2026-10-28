import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import ReferenceDevicesPage from './ReferenceDevicesPage.tsx';

describe('ReferenceDevicesPage', () => {
  it('renders the page header, eyebrow, and default SpO2 reference devices', () => {
    renderWithStudy(<ReferenceDevicesPage />);

    expect(
      screen.getByRole('heading', {
        name: /which reference standard should i validate against/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/PROTOCOL STUDIO • TOOL 00/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Radiometer ABL90 FLEX CO-Oximeter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Masimo Radical-7 with SET/i }),
    ).toBeInTheDocument();
  });

  it('switches between biometric feature domains', () => {
    renderWithStudy(<ReferenceDevicesPage />);

    // Click on Heart Rate & HRV
    const hrButton = screen.getByRole('button', { name: /heart rate & hrv/i });
    fireEvent.click(hrButton);

    expect(
      screen.getByRole('heading', { name: /GE Healthcare SEER 1000 Holter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Bittium Faros 180 \/ 360/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Polar H10 Heart Rate Strap/i }),
    ).toBeInTheDocument();

    // Click on Running Dynamics & Gait Biomechanics
    const runningButton = screen.getByRole('button', { name: /running dynamics/i });
    fireEvent.click(runningButton);

    expect(
      screen.getByRole('heading', { name: /Vicon Optical MoCap \+ Bertec Force Plate/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Stryd Next Gen \/ Stryd Duo/i }),
    ).toBeInTheDocument();
  });

  it('filters reference devices by tier', () => {
    renderWithStudy(<ReferenceDevicesPage />);

    const tierSelect = screen.getByLabelText(/filter reference tier/i);
    // Select Gold only
    fireEvent.change(tierSelect, { target: { value: 'gold' } });

    expect(
      screen.getByRole('heading', { name: /Radiometer ABL90 FLEX CO-Oximeter/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Masimo Radical-7 with SET/i }),
    ).not.toBeInTheDocument();
  });

  it('opens and closes the 10-dimension engineering spec sheet dossier modal', () => {
    renderWithStudy(<ReferenceDevicesPage />);

    const fullDossierButtons = screen.getAllByRole('button', { name: /full dossier/i });
    expect(fullDossierButtons.length).toBeGreaterThan(0);
    fireEvent.click(fullDossierButtons[0]!);

    // Modal should now be visible
    expect(screen.getByText(/1\. Regulatory Pedigree & Predicate/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Data Pipeline & File Infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Signal Alignment & Multi-Stream Sync/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Economics, Consumables & Lifecycle/i)).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByRole('button', { name: /close dossier/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/1\. Regulatory Pedigree & Predicate/i)).not.toBeInTheDocument();
  });

  it('carries adjusted sample size to study plan on button click', () => {
    renderWithStudy(<ReferenceDevicesPage />);

    const carryButton = screen.getByRole('button', { name: /carry n =/i });
    expect(carryButton).toBeInTheDocument();

    fireEvent.click(carryButton);
    expect(carryButton).toBeInTheDocument();
  });
});
