import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App.tsx';
import { applyStoredTheme } from './theme/theme.ts';

// Stamp the stored theme onto <html> before React mounts, so the page never
// paints one theme and then flips to the other.
applyStoredTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
