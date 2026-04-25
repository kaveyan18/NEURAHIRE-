import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';
import PremiumModal from './PremiumModal';

// Landing page nav links (public)
const landingLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Career Guide', href: '#guide' },
];

const dashboardLinks = [
  { label: 'Dashboard', to: '/analyse' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isAuthenticated = !!user;
  const isDashboard = location.pathname.startsWith('/analyse');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!avatarOpen) return;
    const handleClick = () => setAvatarOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [avatarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: isDashboard
            ? 'rgba(12,11,22,0.97)'
            : scrolled ? 'rgba(12,11,22,0.95)' : 'rgba(12,11,22,0.0)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          transition: 'background 0.35s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 56px' }}>

          {/* ── Logo ── */}
          <Link to={isAuthenticated ? '/analyse' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #7c6ff7, #a89af9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(124,111,247,0.4)',
            }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#fff' }}>N</span>
            </div>
            <span
              className="nh-font-display"
              style={{
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: '-0.3px',
                background: 'linear-gradient(90deg, #a89af9, #7c6ff7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              NEURAHIRE
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <ul style={{ gap: 32, listStyle: 'none', padding: 0, margin: 0 }} className="navbar-desktop-links">
            {(isDashboard ? dashboardLinks : landingLinks).map(({ label, href, to }) => (
              <li key={label}>
                {to ? (
                  <Link
                    to={to}
                    style={{
                      textDecoration: 'none',
                      fontSize: 13,
                      color: location.pathname === to ? '#fff' : '#a89af9',
                      fontWeight: location.pathname === to ? 600 : 400,
                      transition: 'color 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => (e.target.style.color = '#fff')}
                    onMouseLeave={e => (e.target.style.color = location.pathname === to ? '#fff' : '#a89af9')}
                  >
                    {label}
                    {location.pathname === to && (
                      <span style={{
                        position: 'absolute',
                        bottom: -4,
                        left: 0,
                        right: 0,
                        height: 2,
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #7c6ff7, #a89af9)',
                      }} />
                    )}
                  </Link>
                ) : (
                  <a
                    href={href}
                    style={{
                      textDecoration: 'none',
                      fontSize: 13,
                      color: '#a89af9',
                      fontWeight: 400,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.target.style.color = '#fff')}
                    onMouseLeave={e => (e.target.style.color = '#a89af9')}
                  >
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* ── Desktop right side ── */}
          <div className="navbar-desktop-actions" style={{ alignItems: 'center', gap: 12 }}>
            {isAuthenticated ? (
              <>
                {!isDashboard && (
                  <Link to="/analyse" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    Start Analysing
                  </Link>
                )}

                <div 
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(124,111,247,0.15)',
                    padding: '6px 12px', borderRadius: 20,
                    border: '1px solid rgba(124,111,247,0.3)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => setPremiumModalOpen(true)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,111,247,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,111,247,0.15)'}
                >
                  <SparklesIcon style={{ width: 14, height: 14, color: '#a89af9' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {user?.credits || 0} Credits
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAvatarOpen(!avatarOpen); }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c6ff7, #a89af9)',
                      border: '2px solid rgba(124,111,247,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 700,
                      fontSize: 12,
                      color: '#fff',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: avatarOpen ? '0 0 0 3px rgba(124,111,247,0.3)' : 'none',
                    }}
                    aria-label="User menu"
                  >
                    {getInitials(user?.name)}
                  </button>

                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -8 }}
                        transition={{ duration: 0.18 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 12px)',
                          right: 0,
                          minWidth: 200,
                          background: 'rgba(18,17,31,0.98)',
                          border: '1px solid var(--border)',
                          borderRadius: 14,
                          padding: '8px 0',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,111,247,0.1)',
                          backdropFilter: 'blur(20px)',
                        }}
                      >
                        <div style={{ padding: '10px 16px 12px', borderBottom: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                            {user?.name || 'User'}
                          </p>
                          <p style={{ fontSize: 11.5, color: 'var(--muted)' }}>{user?.email || ''}</p>
                        </div>
                        <div style={{ padding: '6px 8px' }}>
                          <Link
                            to="/analyse"
                            onClick={() => setAvatarOpen(false)}
                            style={{
                              display: 'block',
                              padding: '9px 10px',
                              borderRadius: 8,
                              textDecoration: 'none',
                              fontSize: 13,
                              color: 'var(--muted)',
                              transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,111,247,0.1)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
                          >
                            📄 &nbsp;My Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: '9px 10px',
                              borderRadius: 8,
                              border: 'none',
                              background: 'transparent',
                              fontSize: 13,
                              color: '#f87171',
                              cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            🚪 &nbsp;Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
                <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="navbar-hamburger"
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XMarkIcon style={{ width: 24, height: 24 }} /> : <Bars3Icon style={{ width: 24, height: 24 }} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden', background: 'rgba(13,12,24,0.97)' }}
            >
              <div style={{ padding: '24px 24px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(isDashboard ? dashboardLinks : landingLinks).map(({ label, href, to }) => (
                  <div key={label}>
                    {to ? (
                      <Link
                        to={to}
                        style={{
                          textDecoration: 'none',
                          fontSize: 15,
                          color: location.pathname === to ? '#fff' : 'var(--muted)',
                          fontWeight: location.pathname === to ? 600 : 400,
                        }}
                        onClick={() => setMobileOpen(false)}
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        style={{
                          textDecoration: 'none',
                          fontSize: 15,
                          color: 'var(--muted)',
                          fontWeight: 400,
                        }}
                        onClick={() => setMobileOpen(false)}
                      >
                        {label}
                      </a>
                    )}
                  </div>
                ))}

                {isAuthenticated ? (
                  <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{user?.name}</p>
                        <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0 }}>{user?.email}</p>
                      </div>
                      <div 
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: 'rgba(124,111,247,0.15)',
                          padding: '4px 10px', borderRadius: 20,
                          border: '1px solid rgba(124,111,247,0.3)',
                        }}
                        onClick={() => { setMobileOpen(false); setPremiumModalOpen(true); }}
                      >
                        <SparklesIcon style={{ width: 12, height: 12, color: '#a89af9' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user?.credits || 0} Credits</span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        padding: '10px',
                        width: '100%',
                        borderRadius: 8,
                        fontSize: 14,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <button className="btn-ghost" onClick={() => { navigate('/login'); setMobileOpen(false); }} style={{ width: '100%' }}>Sign in</button>
                    <Link to="/signup" className="btn-primary" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <PremiumModal isOpen={premiumModalOpen} onClose={() => setPremiumModalOpen(false)} />
    </>
  );
}
