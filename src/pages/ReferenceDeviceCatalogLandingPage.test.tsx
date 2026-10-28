import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import ReferenceDeviceCatalogLandingPage from './ReferenceDeviceCatalogLandingPage.tsx';

describe('ReferenceDeviceCatalogLandingPage', () => {
  it('renders hero title, eyebrow, and stat badges', () => {
    renderWithStudy(<ReferenceDeviceCatalogLandingPage />);

    expect(
      screen.getByText(/open-source biometric reference ecosystem/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /clinical reference device catalog for wearable biometrics/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('12 Domains')).toBeInTheDocument();
    expect(screen.getByText('3 Tiers')).toBeInTheDocument();
    expect(screen.getByText('10 Dimensions')).toBeInTheDocument();
  });

  it('renders 3-tier reference standard hierarchy cards', () => {
    renderWithStudy(<ReferenceDeviceCatalogLandingPage />);

    expect(screen.getByRole('heading', { name: /clinical criterion/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /clinical research benchmark/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /consumer & field surrogate/i }),
    ).toBeInTheDocument();
  });

  it('renders the 10-dimension reference dossier framework', () => {
    renderWithStudy(<ReferenceDeviceCatalogLandingPage />);

    expect(screen.getByText(/regulatory & predicate/i)).toBeInTheDocument();
    expect(screen.getByText(/clearance accuracy/i)).toBeInTheDocument();
    expect(screen.getByText(/data pipeline & files/i)).toBeInTheDocument();
    expect(screen.getByText(/multi-stream sync/i)).toBeInTheDocument();
    expect(screen.getByText(/hardware capex/i)).toBeInTheDocument();
    expect(screen.getByText(/subject consumables/i)).toBeInTheDocument();
    expect(screen.getByText(/calibration cadence/i)).toBeInTheDocument();
    expect(screen.getByText(/vendor clinical sla/i)).toBeInTheDocument();
    expect(screen.getByText(/field gotchas & traps/i)).toBeInTheDocument();
    expect(screen.getByText(/noise floor \(σ_ref\)/i)).toBeInTheDocument();
  });

  it('filters biometric feature domains between all and priority core 5', () => {
    renderWithStudy(<ReferenceDeviceCatalogLandingPage />);

    // Initially all 12 domains shown
    expect(screen.getByText('Heart Rate & HRV')).toBeInTheDocument();
    expect(screen.getByText('Running Dynamics & Gait Biomechanics')).toBeInTheDocument();

    // Click Priority Core 5
    const priorityButton = screen.getByRole('button', { name: /priority core 5/i });
    fireEvent.click(priorityButton);

    expect(screen.getByText('Heart Rate & HRV')).toBeInTheDocument();
    expect(screen.getByText('Blood Oxygen Saturation')).toBeInTheDocument();
    expect(screen.queryByText('Running Dynamics & Gait Biomechanics')).not.toBeInTheDocument();

    // Click All 12 Domains
    const allButton = screen.getByRole('button', { name: /all 12 domains/i });
    fireEvent.click(allButton);
    expect(screen.getByText('Running Dynamics & Gait Biomechanics')).toBeInTheDocument();
  });

  it('provides a direct CTA linking to the interactive reference selector workbench', () => {
    renderWithStudy(<ReferenceDeviceCatalogLandingPage />);

    const ctaLink = screen.getByRole('link', {
      name: /launch interactive selector workbench/i,
    });
    expect(ctaLink).toHaveAttribute('href', '/reference-devices');
  });
});
