import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures that on any route or search parameter transition,
 * the window resets immediately to the top of the viewport.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    } catch {
      // Environments like jsdom
    }
    if (typeof document !== 'undefined') {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}
