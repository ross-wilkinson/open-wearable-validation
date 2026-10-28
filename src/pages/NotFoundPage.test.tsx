import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithStudy } from '../test/renderWithStudy.tsx';
import NotFoundPage from './NotFoundPage.tsx';

describe('NotFoundPage', () => {
  it('renders 404 heading and helpful hub links', () => {
    renderWithStudy(<NotFoundPage />);

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /protocol studio: repeated measures sizing/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /protocol studio: agreement sample size/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /report studio: validation report studio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pitfall explorer: statistical explainers/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /validation academy: 8 interactive modules/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to the modules overview/i })).toBeInTheDocument();
  });
});
