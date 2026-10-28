import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import HomePage from './HomePage.tsx';

describe('HomePage Portal', () => {
  it('renders hero title and subtitle', () => {
    renderWithStudy(<HomePage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /measure ground truth\. validate with confidence\./i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/the open-source suite for wearable sensors and health algorithms\./i),
    ).toBeInTheDocument();
  });

  it('renders all 4 pillars and academy workspaces with exact titles and eyebrows', () => {
    renderWithStudy(<HomePage />);

    // Verify Pillar 1: The Validation Academy and its 4 workspaces
    expect(screen.getByRole('heading', { level: 2, name: /the validation academy/i })).toBeInTheDocument();

    const tiles = [
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
        eyebrow: 'LEARNING STUDIO',
        title: 'Learn wearable validation hands-on',
        destination: '/academy',
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
      expect(screen.getByRole('heading', { level: 2, name: tile.title })).toBeInTheDocument();
    }
  });

  it('renders updated brand action CTAs on all portal tiles', () => {
    renderWithStudy(<HomePage />);

    expect(screen.getByText('Enter Protocol Studio')).toBeInTheDocument();
    expect(screen.getByText('Enter Report Studio')).toBeInTheDocument();
    expect(screen.getByText('Enter Pitfall Explorer')).toBeInTheDocument();
    expect(screen.getByText('Enter Validation Academy')).toBeInTheDocument();
    expect(screen.getByText('Enter agreekit Hub')).toBeInTheDocument();
    expect(screen.getByText('Enter Health Data Hub')).toBeInTheDocument();
  });

  it('contains the refined Tile 02 subtitle without p-value preamble', () => {
    renderWithStudy(<HomePage />);

    expect(
      screen.getByText(
        'Discover the right metrics and KPI frameworks to evaluate wearable performance, and synthesize your results into clear decision scorecards that your stakeholders can all understand and trust.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/commonly reported metrics like p-values fail to tell you/i),
    ).not.toBeInTheDocument();
  });

  it('has correct navigation links for all 7 portal tiles directly to their landing hubs', () => {
    renderWithStudy(<HomePage />);

    const protocolStudioLink = screen.getByRole('link', { name: /design your validation study/i });
    expect(protocolStudioLink).toHaveAttribute('href', '/protocol-studio');

    const reportStudioLink = screen.getByRole('link', {
      name: /evaluate product launch readiness/i,
    });
    expect(reportStudioLink).toHaveAttribute('href', '/report-studio/overview');

    const explainersLink = screen.getByRole('link', { name: /avoid costly statistical pitfalls/i });
    expect(explainersLink).toHaveAttribute('href', '/explainers');

    const academyLink = screen.getByRole('link', { name: /learn wearable validation hands-on/i });
    expect(academyLink).toHaveAttribute('href', '/academy');

    const pythonLink = screen.getByRole('link', {
      name: /execute agreement analyses in python/i,
    });
    expect(pythonLink).toHaveAttribute('href', '/agreekit');

    const popDataLink = screen.getByRole('link', {
      name: /ground your protocol in population data/i,
    });
    expect(popDataLink).toHaveAttribute('href', '/health-data-distributions');

    const refCatalogLink = screen.getByRole('link', {
      name: /evaluate clinical reference standards/i,
    });
    expect(refCatalogLink).toHaveAttribute('href', '/reference-device-catalog');

    // Verify separate 10,000 ft welcome strip has been removed completely
    expect(
      screen.queryByRole('region', { name: /ecosystem hubs & architecture overviews/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the minimalist provenance strip with zero-telemetry guarantee and credentials link', () => {
    renderWithStudy(<HomePage />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /engineered for zero data upload & exact mathematics/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/all calculations execute entirely in your local browser with zero telemetry/i),
    ).toBeInTheDocument();

    const aboutLink = screen.getByRole('link', { name: /author credentials & rationale/i });
    expect(aboutLink).toHaveAttribute('href', '/about');

    expect(
      screen.getByText(/ross d\. wilkinson, phd \(ex-google research scientist\)/i),
    ).toBeInTheDocument();
  });

  it('renders the Python tile visual with pip install command and capabilities', () => {
    renderWithStudy(<HomePage />);

    expect(screen.getByText('pip install agreekit')).toBeInTheDocument();
    expect(screen.getByText(/bland-altman/i)).toBeInTheDocument();
    expect(screen.getByText(/bootstrap ci/i)).toBeInTheDocument();
    expect(screen.getByText(/non-inferiority/i)).toBeInTheDocument();
  });

  it('uses balanced responsive grid layout (3-col desktop, 2-col tablet, 1-col mobile)', () => {
    const { container } = renderWithStudy(<HomePage />);

    const grid = container.querySelector(
      '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3',
    );
    expect(grid).toBeInTheDocument();
  });
});
