import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import AcademyPage from './AcademyPage.tsx';
import { ACADEMY_MODULES } from './academyData.ts';

describe('AcademyPage', () => {
  it('renders the Academy title, Meridian Biosystems narrative header, and tabs', () => {
    renderWithStudy(<AcademyPage />);

    expect(
      screen.getByRole('heading', {
        name: /the validation academy: mastering wearable clinical studies/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByText(/meridian biosystems/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pulseband 2/i).length).toBeGreaterThan(0);

    expect(screen.getByRole('button', { name: /all 8 modules/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /curriculum roadmap/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /walkthrough canvas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^hardware change matrix$/i })).toBeInTheDocument();
  });

  it('renders cards for all 8 curriculum modules on default tab', () => {
    renderWithStudy(<AcademyPage />);

    for (const m of ACADEMY_MODULES) {
      expect(screen.getByText(m.title)).toBeInTheDocument();
      expect(screen.getAllByText(m.actRoman).length).toBeGreaterThan(0);
    }
  });

  it('filters modules by category when category filter button is clicked', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AcademyPage />);

    // Click 'sizing' category filter button
    await user.click(screen.getByRole('button', { name: 'sizing' }));

    // Module 2 (Paired dividend) and Module 3 (Repeated measures) are in sizing
    expect(
      screen.getByText('The Paired Correlation Dividend'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The Pseudoreplication Trap'),
    ).toBeInTheDocument();

    // Module 1 (prototyping) should be filtered out
    expect(
      screen.queryByText("The Rapid Prototyping Winner's Curse"),
    ).not.toBeInTheDocument();
  });

  it('switches to Curriculum Roadmap tab and displays lifecycle phases', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AcademyPage />);

    await user.click(screen.getByRole('button', { name: /curriculum roadmap/i }));

    expect(
      screen.getByRole('heading', {
        name: /the meridian biosystems product journey/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/phase 1: rapid prototyping & algorithmic sizing/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/phase 4: commercial launch & multi-generation legacy/i),
    ).toBeInTheDocument();
  });

  it('switches to Walkthrough Canvas tab and allows stepping through steps and interacting with sandbox', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AcademyPage />);

    // Click Walkthrough Canvas tab
    await user.click(screen.getByRole('button', { name: /walkthrough canvas/i }));

    // Module 1 is default selected module
    expect(
      screen.getByRole('heading', {
        name: /the rapid prototyping winner's curse/i,
      }),
    ).toBeInTheDocument();

    // Guided step buttons
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();

    // Click next step button
    const nextBtn = screen.getByRole('button', { name: /next step/i });
    await user.click(nextBtn);

    expect(screen.getByText(/step 2: standard error inflation/i)).toBeInTheDocument();

    // Interactive sandbox elements for Module 1
    expect(screen.getByText(/winner's curse risk/i)).toBeInTheDocument();
    expect(screen.getByText(/catastrophic elimination power/i)).toBeInTheDocument();
  });

  it('launches Walkthrough Canvas when Interactive Tour is clicked on a module card', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AcademyPage />);

    // Find and click the first "Interactive Tour" button
    const tourButtons = screen.getAllByRole('button', { name: /interactive tour/i });
    expect(tourButtons.length).toBe(8);

    await user.click(tourButtons[0]!);

    // Should switch to Walkthrough Canvas
    expect(screen.getByText(/interactive mathematical sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/back to 8-module curriculum roadmap/i)).toBeInTheDocument();
  });

  it('switches to Hardware Change Matrix tab', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AcademyPage />);

    // Click Hardware Change Matrix tab
    await user.click(screen.getByRole('button', { name: /^hardware change matrix$/i }));
    expect(screen.getByText(/validation tier decision matrix/i)).toBeInTheDocument();
  });

  it('renders Module 5 Cadence Lock Provocation chart when selected', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AcademyPage />);

    // Click Walkthrough Canvas tab
    await user.click(screen.getByRole('button', { name: /walkthrough canvas/i }));

    // Find and click Module 5 from modules tab or switch module
    await user.click(screen.getByRole('button', { name: /all 8 modules/i }));
    const act5TourBtn = screen.getAllByRole('button', { name: /interactive tour/i })[4]!;
    await user.click(act5TourBtn);

    // Verify Module 5 heading and provocation time-series chart
    expect(screen.getByRole('heading', { name: /edge-case crisis: cadence lock/i })).toBeInTheDocument();
    expect(screen.getByText(/treadmill speed-ramp provocation time series/i)).toBeInTheDocument();
    expect(screen.getByText(/harmonic contamination index/i)).toBeInTheDocument();
  });

  it('renders Module 4 Monk skin tone scale swatches and Module 7 2x2 decision plane', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AcademyPage />);

    // Go to Module 4
    const act4TourBtn = screen.getAllByRole('button', { name: /interactive tour/i })[3]!;
    await user.click(act4TourBtn);

    expect(screen.getByRole('heading', { name: /demographic equity & regulatory quotas/i })).toBeInTheDocument();
    expect(screen.getByText('MST 01')).toBeInTheDocument();
    expect(screen.getByText('MST 10')).toBeInTheDocument();
    expect(screen.getByText(/fda ≥15% dark skin quota check/i)).toBeInTheDocument();

    // Go to Module 7
    await user.click(screen.getByRole('button', { name: /all 8 modules/i }));
    const act7TourBtn = screen.getAllByRole('button', { name: /interactive tour/i })[6]!;
    await user.click(act7TourBtn);

    expect(screen.getByRole('heading', { name: /the commercial launch engine/i })).toBeInTheDocument();
    expect(screen.getByText(/two-gate 4-quadrant commercial decision plane/i)).toBeInTheDocument();
    expect(screen.getByText(/quadrant i: green light/i)).toBeInTheDocument();
    expect(screen.getByText(/quadrant iv: red light/i)).toBeInTheDocument();

    // Go to Module 8
    await user.click(screen.getByRole('button', { name: /all 8 modules/i }));
    const act8TourBtn = screen.getAllByRole('button', { name: /interactive tour/i })[7]!;
    await user.click(act8TourBtn);

    expect(screen.getByRole('heading', { name: /the multi-year legacy & transitive bridge/i })).toBeInTheDocument();
    expect(screen.getByText(/transitive predecessor bridge flow/i)).toBeInTheDocument();
    expect(screen.getByText(/longitudinal drift canary/i)).toBeInTheDocument();
  });

  it('renders VALIDATION ACADEMY pillar badge and NextSteps workflow bridge cards', () => {
    renderWithStudy(<AcademyPage />);

    expect(screen.getByText('VALIDATION ACADEMY')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /protocol studio: study design & sizing/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /report studio: launch gates & scorecards/i }),
    ).toBeInTheDocument();
  });
});
