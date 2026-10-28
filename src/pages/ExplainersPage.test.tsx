import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import ExplainersPage from './ExplainersPage.tsx';

describe('ExplainersPage', () => {
  it('renders heading and cards for all explainers', () => {
    renderWithStudy(<ExplainersPage />);

    expect(
      screen.getByRole('heading', { name: /interactive statistical explainers/i }),
    ).toBeInTheDocument();

    expect(screen.getByText('Error Distribution Trap')).toBeInTheDocument();
    expect(screen.getByText('Correlation Fallacy')).toBeInTheDocument();
    expect(screen.getByText('Prototyping Strategy')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /misled by rmse and mae/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /agreement is not icc/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /the sniff test trap/i })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /tool: report studio ↗/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tool: repeated measures ↗/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tool: sample size ↗/i })).toBeInTheDocument();
  });
});
