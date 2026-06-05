import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import SOSButton from './components/common/SOSButton';
import EmergencyBanner from './components/common/EmergencyBanner';
import OfflineBanner from './components/common/OfflineBanner';

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Chat = lazy(() => import('./pages/Chat'));
const HelplineDirectoryPage = lazy(() => import('./pages/HelplineDirectoryPage'));
const ProcedurePage = lazy(() => import('./pages/ProcedurePage'));
const NearbyServicesPage = lazy(() => import('./pages/NearbyServicesPage'));
const SessionHistory = lazy(() => import('./pages/SessionHistory'));
const Profile = lazy(() => import('./pages/Profile'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center page-bg">
      <div className="glass-card p-8 text-center">
        <div className="w-12 h-12 border-4 border-sos-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sos-secondary font-sans">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-sos-bg text-sos-primary font-sans">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <OfflineBanner />
      <Navbar />
      <main id="main-content">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/helplines" element={<HelplineDirectoryPage />} />
            <Route path="/helplines/:category" element={<HelplineDirectoryPage />} />
            <Route path="/procedures" element={<ProcedurePage />} />
            <Route path="/procedures/:id" element={<ProcedurePage />} />
            <Route path="/nearby" element={<NearbyServicesPage />} />
            <Route path="/history" element={<SessionHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
      </main>
      <EmergencyBanner />
      <SOSButton />
    </div>
  );
}
