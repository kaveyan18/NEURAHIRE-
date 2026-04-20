import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatsStrip from '../components/StatsStrip';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorks from '../components/HowItWorks';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ paddingTop: 68 }}>
        <Hero />
        <StatsStrip />
        <FeaturesSection />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
