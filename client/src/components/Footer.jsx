import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Analyse Resume', to: '/analyse' },
  { label: 'Sign Up', to: '/signup' },
  { label: 'Login', to: '/login' },
];

const supportLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'Career Guide', href: '#guide' },
];

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      zIndex: 1,
      borderTop: '1px solid var(--border)',
      background: 'rgba(13,12,24,0.8)',
      backdropFilter: 'blur(20px)',
      padding: '48px 56px 28px',
    }}>
      {/* Top gradient line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(124,111,247,0.4), transparent)',
      }} />

      {/* Main footer grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: 48,
        marginBottom: 40,
      }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #7c6ff7, #a89af9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(124,111,247,0.35)',
            }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: '#fff' }}>N</span>
            </div>
            <span
              className="nh-font-display"
              style={{
                fontWeight: 800,
                fontSize: 15,
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
          <p style={{
            fontSize: 13,
            color: 'var(--muted)',
            lineHeight: 1.7,
            maxWidth: 260,
          }}>
            AI-powered resume analysis that matches your skills to job descriptions — instantly, accurately, and intelligently.
          </p>
          {/* Social icons row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {[
              { label: 'GitHub', icon: '⌨️' },
              { label: 'LinkedIn', icon: '💼' },
              { label: 'Twitter', icon: '🐦' },
            ].map(({ label, icon }) => (
              <button
                key={label}
                title={label}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,111,247,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(124,111,247,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 16,
          }}>
            Product
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quickLinks.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  style={{
                    textDecoration: 'none',
                    fontSize: 13.5,
                    color: 'rgba(255,255,255,0.55)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.target.style.color = '#fff')}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.55)')}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support links */}
        <div>
          <h4 style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 16,
          }}>
            Support
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {supportLinks.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  style={{
                    textDecoration: 'none',
                    fontSize: 13.5,
                    color: 'rgba(255,255,255,0.55)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.target.style.color = '#fff')}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.55)')}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        paddingTop: 20,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} NeuraHire · Built with ❤️ using AI
        </span>
        <span style={{
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 6px #4ade80',
          }} />
          All systems operational
        </span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}
