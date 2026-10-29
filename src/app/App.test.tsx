import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.tsx';

describe('App shell', () => {
  it('renders the home page at the default route', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', {
        name: /validate wearable sensors & health algorithms/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders all portal tiles on the home page', () => {
    render(<App />);
    const tileHeadings = [
      'Design your validation study',
      'Evaluate product launch readiness',
      'Avoid costly statistical pitfalls',
      'The Validation Academy: Learn wearable validation hands-on',
      'Execute agreement analyses in Python',
      'Ground your protocol in population data',
      'Evaluate clinical reference standards',
    ];
    for (const title of tileHeadings) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  });

  it('displays links to Health Data Catalog and agreekit', () => {
    render(<App />);
    expect(
      screen.getAllByRole('link', { name: /health data (catalog|distributions|hub)/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: /agreekit/i }).length,
    ).toBeGreaterThan(0);
  });

  it('shows a not-found page for an unknown route', () => {
    window.history.pushState({}, '', '/does-not-exist');
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
