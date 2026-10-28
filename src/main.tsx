import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App.tsx';
import { applyStoredTheme } from './theme/theme.ts';
import { BRAND_CONFIG } from './config/brand.ts';

// Stamp the stored theme onto <html> before React mounts, so the page never
// paints one theme and then flips to the other.
applyStoredTheme();

if (typeof document !== 'undefined') {
  document.title = BRAND_CONFIG.siteName;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
