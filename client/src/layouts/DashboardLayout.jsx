import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Top Navigation — stays dark */}
      <Navbar />

      {/* Main Content Area — light */}
      <main style={{ flex: 1, paddingTop: 72, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 32px 0' }}>
          <Outlet />
        </div>
      </main>

      {/* Footer strip */}
      <div style={{
        borderTop: '1px solid var(--surface-border)',
        background: 'var(--surface-card)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12,
            background: 'linear-gradient(90deg, var(--purple), var(--purple-light))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>NEURAHIRE</span>
          — AI-powered resume analysis
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          Powered by Google Gemini 2.5 Flash · 🔒 Privacy first
        </span>
      </div>
    </div>
  );
}