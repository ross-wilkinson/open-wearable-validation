import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import HomePage from './HomePage.tsx';

describe('HomePage Portal', () => {
  it('renders hero title, exact subtitle, Academy CTA, and borderless raw PPG vs ECG traces', () => {
    renderWithStudy(<HomePage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /validate wearable sensors & health algorithms/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Purpose-built tools for sensor engineers, researchers, and data scientists validating physiological algorithms and wearable biosensors. Plan robust protocols, calculate defensible sample sizes, evaluate performance against clinical reference standards, and make confident product launch decisions.',
      ),
    ).toBeInTheDocument();

    const heroCta = screen.getByRole('link', { name: /explore the academy/i });
    expect(heroCta).toHaveAttribute('href', '/academy');

    expect(
      screen.getByRole('img', {
        name: /stacked physiological waveform comparison showing optical ppg systolic peaks/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders all 7 vertical narrative sections as full-row clickable links with exact titles and eyebrows', () => {
    renderWithStudy(<HomePage />);

    const tiles = [
      {
        eyebrow: 'LEARNING STUDIO',
        title: 'The Validation Academy: Learn wearable validation hands-on',
        destination: '/academy',
      },
      {
        eyebrow: 'PROTOCOL STUDIO',
        title: 'Design your validation study',
        destination: '/protocol-studio',
      },
      {
        eyebrow: 'REPORT STUDIO',
        title: 'Evaluate product launch readiness',
        destination: '/report-studio/overview',
      },
      {
        eyebrow: 'PITFALL EXPLORER',
        title: 'Avoid costly statistical pitfalls',
        destination: '/explainers',
      },
      {
        eyebrow: 'AGREEKIT',
        title: 'Execute agreement analyses in Python',
        destination: '/agreekit',
      },
      {
        eyebrow: 'HEALTH DATA CATALOG',
        title: 'Ground your protocol in population data',
        destination: '/health-data-distributions',
      },
      {
        eyebrow: 'REFERENCE DEVICE CATALOG',
        title: 'Evaluate clinical reference standards',
        destination: '/reference-device-catalog',
      },
    ];

    for (const tile of tiles) {
      expect(screen.getByText(tile.eyebrow)).toBeInTheDocument();
      const heading = screen.getByRole('heading', { level: 2, name: tile.title });
      expect(heading).toBeInTheDocument();
      expect(heading.closest('a')).toHaveAttribute('href', tile.destination);
    }
  });

  it('renders Report Studio GO and NO GO decision quadrants and Pitfall Explorer Bias Trap visual', () => {
    renderWithStudy(<HomePage />);

    expect(screen.getByText('GO')).toBeInTheDocument();
    expect(screen.getByText('NO GO')).toBeInTheDocument();
    expect(screen.getByText(/r = 0\.96/i)).toBeInTheDocument();
  });

  it('renders the Python agreekit section with pip install command and capabilities', () => {
    renderWithStudy(<HomePage />);

    expect(screen.getAllByText('$ pip install agreekit').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/bland-altman/i)).toBeInTheDocument();
    expect(screen.getByText(/bootstrap ci/i)).toBeInTheDocument();
    expect(screen.getByText(/non-inferiority/i)).toBeInTheDocument();
  });

  it('uses equal 320px vertical cadence across all 7 full-width narrative sections', () => {
    const { container } = renderWithStudy(<HomePage />);

    const verticalSlots = container.querySelectorAll('a.lg\\:h-\\[320px\\]');
    expect(verticalSlots.length).toBe(7);
  });
});
