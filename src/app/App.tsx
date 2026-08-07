import { HashRouter, Route, Routes } from 'react-router-dom';
import NavBar from '../components/layout/NavBar.tsx';
import Footer from '../components/layout/Footer.tsx';
import HomePage from '../pages/HomePage.tsx';
import PrecisionPage from '../modules/precision/PrecisionPage.tsx';
import AgreementPage from '../modules/agreement/AgreementPage.tsx';
import DemographicsPage from '../modules/demographics/DemographicsPage.tsx';
import TimelinePage from '../modules/timeline/TimelinePage.tsx';
import EffectSizePage from '../modules/effectSize/EffectSizePage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';

/**
 * HashRouter, not BrowserRouter — deliberately.
 *
 * This deploys to GitHub Pages, a static file server with no rewrite rules. A
 * BrowserRouter deep link like /precision would be requested from the server as
 * a real path, 404, and never reach the app. With `#/precision` the browser
 * never sends the fragment to the server at all, so no 404.html shim is needed.
 */
export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/precision" element={<PrecisionPage />} />
            <Route path="/agreement" element={<AgreementPage />} />
            <Route path="/demographics" element={<DemographicsPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/effect-size" element={<EffectSizePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}
