import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import SniffTestExplainerPage from './SniffTestExplainerPage.tsx';

describe('SniffTestExplainerPage', () => {
  it('renders the explainer heading, author, and key sections', () => {
    renderWithStudy(<SniffTestExplainerPage />);

    expect(
      screen.getByRole('heading', {
        name: /the sniff test trap: why n=5 cannot pick a winner, but can safely eliminate a loser/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/interactive prototyping screen/i)).toBeInTheDocument();
    expect(screen.getByText(/the selection trap \(winner's curse\)/i)).toBeInTheDocument();
    expect(screen.getByText(/the elimination superpower/i)).toBeInTheDocument();
    expect(screen.getByText(/the golden rule of rapid prototyping/i)).toBeInTheDocument();
  });

  it('updates sample size when using quick presets and sliders', async () => {
    const user = userEvent.setup();
    renderWithStudy(<SniffTestExplainerPage />);

    // Check initial N=5 state
    expect(screen.getByText(/N = 5 subjects/i)).toBeInTheDocument();

    // Click "Scaled N=30 Trial" preset button
    const scaledBtn = screen.getByRole('button', { name: /scaled n=30 trial/i });
    await user.click(scaledBtn);

    expect(screen.getByText(/N = 30 subjects/i)).toBeInTheDocument();

    // Adjust the noise slider
    const sdSlider = screen.getByLabelText(/measurement & subject noise/i);
    fireEvent.change(sdSlider, { target: { value: '4.5' } });

    expect(screen.getByText(/σ = 4.5 bpm/i)).toBeInTheDocument();

    // Return to N=5 preset
    const defaultBtn = screen.getByRole('button', { name: /default n=5 sniff test/i });
    await user.click(defaultBtn);

    expect(screen.getByText(/N = 5 subjects/i)).toBeInTheDocument();
  });

  it('displays candidate prototypes and elimination metrics in table', () => {
    renderWithStudy(<SniffTestExplainerPage />);

    expect(screen.getByText('Prototype A (True Best)')).toBeInTheDocument();
    expect(screen.getByText('Prototype E (Catastrophic Flaw)')).toBeInTheDocument();
    expect(screen.getByText(/gold-standard lens geometry/i)).toBeInTheDocument();
  });

  it('renders PITFALL EXPLORER pillar badge and NextSteps workflow bridge cards', () => {
    renderWithStudy(<SniffTestExplainerPage />);

    expect(screen.getByText('PITFALL EXPLORER')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /report studio: pass by chance\?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /protocol studio: paired non-inferiority/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /report studio: two-gate visualizer/i })).toBeInTheDocument();
  });
});
