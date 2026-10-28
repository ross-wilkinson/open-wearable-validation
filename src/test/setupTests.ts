import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  // Reset window history pathname and hash across tests so routing state
  // doesn't leak between tests.
  window.history.pushState({}, '', '/');
  window.location.hash = '';
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  cleanup();
});

// jsdom implements neither of these, and Recharts' <ResponsiveContainer> needs
// both: it measures its parent with a ResizeObserver and renders nothing at all
// while that reports zero size.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

class ResizeObserverStub {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    // Firing synchronously is the point. A no-op stub satisfies the type but
    // leaves ResponsiveContainer waiting forever for a size report.
    this.callback(
      [{ target, contentRect: { width: 800, height: 400 } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }

  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  value: 800,
});
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 400,
});

window.scrollTo = vi.fn();
