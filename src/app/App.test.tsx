import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.tsx';
import { MODULE_ROUTES } from './navigation.ts';

describe('App shell', () => {
  it('renders the home page at the default route', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', {
        name: /everything you need to design, size, and analyze human-subject validation studies/i,
      }),
    ).toBeInTheDocument();
  });

  it('lists every module on the home page', () => {
    render(<App />);
    for (const route of MODULE_ROUTES) {
      expect(screen.getByRole('heading', { name: route.title })).toBeInTheDocument();
    }
  });

  it('displays links to Health Data Distributions and agreekit', () => {
    render(<App />);
    expect(
      screen.getAllByRole('link', { name: /health data distributions/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: /agreekit/i }).length,
    ).toBeGreaterThan(0);
  });

  it('shows a not-found page for an unknown route', () => {
    window.location.hash = '#/does-not-exist';
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument();
  });

  it('cycles the theme and stamps it on the document element', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Starts on 'system', which is represented by the *absence* of the
    // attribute rather than a value.
    expect(document.documentElement).not.toHaveAttribute('data-theme');

    await user.click(screen.getByRole('button', { name: /theme: follow system/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    await user.click(screen.getByRole('button', { name: /theme: light/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    await user.click(screen.getByRole('button', { name: /theme: dark/i }));
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });
});
