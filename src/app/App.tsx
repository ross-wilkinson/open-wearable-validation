import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StudyProvider } from './study/StudyContext.tsx';
import ScrollToTop from '../components/layout/ScrollToTop.tsx';
import NavBar from '../components/layout/NavBar.tsx';
import Footer from '../components/layout/Footer.tsx';
import HomePage from '../pages/HomePage.tsx';
import ReferenceDeviceCatalogLandingPage from '../pages/ReferenceDeviceCatalogLandingPage.tsx';
import ReferenceDevicesPage from '../modules/referenceDevices/ReferenceDevicesPage.tsx';
import PrecisionPage from '../modules/precision/PrecisionPage.tsx';
import AgreementPage from '../modules/agreement/AgreementPage.tsx';
import RepeatedMeasuresPage from '../modules/repeatedMeasures/RepeatedMeasuresPage.tsx';
import DemographicsPage from '../modules/demographics/DemographicsPage.tsx';
import TimelinePage from '../modules/timeline/TimelinePage.tsx';
import EffectSizePage from '../modules/effectSize/EffectSizePage.tsx';
import ReportStudioPage from '../modules/reportStudio/ReportStudioPage.tsx';
import ChanceKpiPage from '../modules/chanceKpi/ChanceKpiPage.tsx';
import ExplainersPage from '../pages/ExplainersPage.tsx';
import AboutPage from '../pages/AboutPage.tsx';
import RmseExplainerPage from '../modules/explainers/RmseExplainerPage.tsx';
import IccExplainerPage from '../modules/explainers/IccExplainerPage.tsx';
import SniffTestExplainerPage from '../modules/explainers/SniffTestExplainerPage.tsx';
import AcademyPage from '../modules/academy/AcademyPage.tsx';
import ProtocolStudioLandingPage from '../pages/ProtocolStudioLandingPage.tsx';
import ReportStudioLandingPage from '../pages/ReportStudioLandingPage.tsx';
import AgreekitLandingPage from '../pages/AgreekitLandingPage.tsx';
import HealthDataLandingPage from '../pages/HealthDataLandingPage.tsx';
import LogoConcepts from '../components/brand/LogoConcepts.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';

/**
 * BrowserRouter for clean URLs and client-side deep linking.
 *
 * Configured with SPA rewrite rules in `vercel.json` so direct hits and refreshes
 * on deep routes (e.g. `/agreement`, `/report-studio`, `/academy`) route cleanly
 * through `/index.html` without hash fragments.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <StudyProvider>
        <div className="flex min-h-screen flex-col">
          <NavBar />
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reference-device-catalog" element={<ReferenceDeviceCatalogLandingPage />} />
              <Route path="/reference-devices" element={<ReferenceDevicesPage />} />
              <Route path="/protocol/reference-devices" element={<ReferenceDevicesPage />} />
              <Route path="/agreement" element={<AgreementPage />} />
              <Route path="/repeated-measures" element={<RepeatedMeasuresPage />} />
              <Route path="/precision" element={<PrecisionPage />} />
              <Route path="/demographics" element={<DemographicsPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/effect-size" element={<EffectSizePage />} />
              <Route path="/report-studio" element={<ReportStudioPage />} />
              <Route path="/chance-kpi" element={<ChanceKpiPage />} />
              <Route path="/explainers" element={<ExplainersPage />} />
              <Route path="/explainers/rmse-mae" element={<RmseExplainerPage />} />
              <Route
                path="/explainers/agreement-vs-icc"
                element={<IccExplainerPage />}
              />
              <Route
                path="/explainers/sniff-test"
                element={<SniffTestExplainerPage />}
              />
              <Route path="/academy" element={<AcademyPage />} />
              <Route path="/curriculum" element={<AcademyPage />} />
              <Route path="/protocol-studio" element={<ProtocolStudioLandingPage />} />
              <Route path="/protocol" element={<ProtocolStudioLandingPage />} />
              <Route path="/report-studio-overview" element={<ReportStudioLandingPage />} />
              <Route path="/report-studio/overview" element={<ReportStudioLandingPage />} />
              <Route path="/report-overview" element={<ReportStudioLandingPage />} />
              <Route path="/agreekit" element={<AgreekitLandingPage />} />
              <Route path="/health-data-distributions" element={<HealthDataLandingPage />} />
              <Route path="/health-data-catalog" element={<HealthDataLandingPage />} />
              <Route path="/logo-concepts" element={<LogoConcepts />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </StudyProvider>
    </BrowserRouter>
  );
}
