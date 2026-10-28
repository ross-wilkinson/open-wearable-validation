import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import { ValidationMaturityMatrix } from './ValidationMaturityMatrix.tsx';

describe('ValidationMaturityMatrix', () => {
  it('renders matrix heading, description, and all 4 quadrants', () => {
    renderWithStudy(<ValidationMaturityMatrix />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /where does your validation team sit\?/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByText('The Gold Standard Engine').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('The Academic Bottleneck').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('The Fragile Shortcut').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('The Ad-Hoc Silos').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/low operational efficiency/i)).toBeInTheDocument();
    expect(screen.getByText(/high operational efficiency/i)).toBeInTheDocument();
    expect(screen.getAllByText(/right system/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/wrong system/i).length).toBeGreaterThanOrEqual(1);
  });

  it('switches between quadrants and updates deep dive content', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ValidationMaturityMatrix initialQuadrant="gold-standard" />);

    // Initially Gold Standard
    expect(screen.getByText(/High Efficiency • Right System \(The Ideal Destination\)/i)).toBeInTheDocument();

    // Click Academic Bottleneck
    const academicBtn = screen.getByRole('button', { name: /the academic bottleneck/i });
    await user.click(academicBtn);
    expect(screen.getByText(/Low Efficiency • Right System \(Rigorous but Trapped\)/i)).toBeInTheDocument();

    // Click Fragile Shortcut
    const fragileBtn = screen.getByRole('button', { name: /the fragile shortcut/i });
    await user.click(fragileBtn);
    expect(screen.getByText(/High Efficiency • Wrong System \(Fast but Deceptive\)/i)).toBeInTheDocument();

    // Click Ad-Hoc Silos
    const silosBtn = screen.getByRole('button', { name: /the ad-hoc silos/i });
    await user.click(silosBtn);
    expect(screen.getByText(/Low Efficiency • Wrong System \(Chaotic & Expensive\)/i)).toBeInTheDocument();
  });

  it('renders View Target Gold Standard action when a non-ideal quadrant is selected', async () => {
    const user = userEvent.setup();
    renderWithStudy(<ValidationMaturityMatrix initialQuadrant="fragile-shortcut" />);

    const goldTargetBtn = screen.getByRole('button', { name: /view target gold standard/i });
    expect(goldTargetBtn).toBeInTheDocument();

    await user.click(goldTargetBtn);
    expect(screen.getByText(/High Efficiency • Right System \(The Ideal Destination\)/i)).toBeInTheDocument();
  });

  it('displays hallmarks and operational hazards for selected quadrant', () => {
    renderWithStudy(<ValidationMaturityMatrix initialQuadrant="gold-standard" />);

    expect(screen.getByText(/typical hallmarks & workflow/i)).toBeInTheDocument();
    expect(screen.getByText(/operational & scientific hazards/i)).toBeInTheDocument();
    expect(screen.getByText(/how validation study designer accelerates the transition:/i)).toBeInTheDocument();
  });
});
