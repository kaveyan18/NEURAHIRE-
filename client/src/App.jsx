import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Landing page sections
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedSection from './components/TrustedSection';
import FeaturesSection from './components/FeaturesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// Dashboard
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ResultPage from './pages/ResultPage';

function LandingPage() {
  return (
    <div className="min-h-screen text-slate-100 overflow-x-hidden" style={{ background: 'linear-gradient(160deg, #0d0f1e 0%, #0a0c18 60%, #060810 100%)' }}>
      {/* Subtle top-center ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, #4f46e5 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
      </div>
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <TrustedSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard shell */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="result" element={<ResultPage />} />
          <Route path="analysis" element={<Dashboard />} />
          <Route path="keywords" element={<Dashboard />} />
          <Route path="settings" element={<Dashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
