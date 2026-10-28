import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy, seedStudy } from '../../test/renderWithStudy.tsx';
import NavBar from './NavBar.tsx';
import { BRAND_CONFIG } from '../../config/brand.ts';

describe('NavBar', () => {
  it('renders brand title and desktop navigation pebble links to overview pages', () => {
    renderWithStudy(<NavBar />);

    expect(
      screen.getByRole('link', { name: new RegExp(BRAND_CONFIG.siteName, 'i') }),
    ).toBeInTheDocument();

    const protocolStudioLink = screen.getByRole('link', { name: /protocol studio/i });
    expect(protocolStudioLink).toBeInTheDocument();
    expect(protocolStudioLink).toHaveAttribute('href', '/protocol-studio');

    const reportStudioLink = screen.getByRole('link', { name: /report studio/i });
    expect(reportStudioLink).toBeInTheDocument();
    expect(reportStudioLink).toHaveAttribute('href', '/report-studio/overview');

    const pitfallExplorerLink = screen.getByRole('link', { name: /pitfall explorer/i });
    expect(pitfallExplorerLink).toBeInTheDocument();
    expect(pitfallExplorerLink).toHaveAttribute('href', '/explainers');

    expect(screen.getByRole('link', { name: /validation academy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });

  it('opens and closes dropdown menus on hover and escape', async () => {
    renderWithStudy(<NavBar />);

    const protocolStudioLink = screen.getByRole('link', { name: /protocol studio/i });
    const container = protocolStudioLink.closest('div');
    expect(container).not.toBeNull();

    // Hover to reveal dropdown
    fireEvent.mouseEnter(container!);
    const menu = screen.getByRole('menu');
    expect(menu).toHaveTextContent(/protocol tools/i);
    expect(screen.getByRole('menuitem', { name: /sample size/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /repeated measures/i })).toBeInTheDocument();

    // Mouse leave to close (with debounce)
    fireEvent.mouseLeave(container!);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());

    // Re-hover and press Escape to close
    fireEvent.mouseEnter(container!);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('toggles mobile drawer on hamburger button click and renders all four component headers', async () => {
    const user = userEvent.setup();
    renderWithStudy(<NavBar />);

    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    await user.click(menuBtn);

    const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
    expect(mobileNav).toBeInTheDocument();

    // Verify all four component names appear as section headers in the mobile drawer
    expect(mobileNav).toHaveTextContent(/protocol studio/i);
    expect(mobileNav).toHaveTextContent(/report studio/i);
    expect(mobileNav).toHaveTextContent(/pitfall explorer/i);
    expect(mobileNav).toHaveTextContent(/validation academy/i);

    const closeBtn = screen.getByRole('button', { name: /close menu/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it('displays the active study plan pill when a plan is staged', () => {
    seedStudy({ n: 42, confidence: 0.95 });
    renderWithStudy(<NavBar />);

    expect(screen.getByText(/plan:/i)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('closes dropdown when a menu item is clicked', async () => {
    const user = userEvent.setup();
    renderWithStudy(<NavBar />);

    const protocolStudioLink = screen.getByRole('link', { name: /protocol studio/i });
    const container = protocolStudioLink.closest('div');
    fireEvent.mouseEnter(container!);

    const sampleSizeLink = screen.getByRole('menuitem', { name: /sample size/i });
    await user.click(sampleSizeLink);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders unnumbered ecosystem links without numeric prefix badges', async () => {
    renderWithStudy(<NavBar />);

    const ecosystemLink = screen.getByRole('link', { name: /ecosystem/i });
    const container = ecosystemLink.closest('div');
    fireEvent.mouseEnter(container!);

    expect(screen.getByRole('menuitem', { name: /agreekit \(python\)/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /health data catalog/i })).toBeInTheDocument();

    const menu = screen.getByRole('menu');
    expect(menu).not.toHaveTextContent(/\b05\b/);
    expect(menu).not.toHaveTextContent(/\b06\b/);
  });
});
