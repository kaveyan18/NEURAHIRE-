import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '0 56px 100px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65 }}
        style={{
          position: 'relative',
          border: '1px solid var(--border2)',
          borderRadius: 20,
          padding: '72px 56px',
          textAlign: 'center',
          background: 'var(--purple-dim2)',
          overflow: 'hidden',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {/* Glow behind heading */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 400,
            height: 300,
            background: 'rgba(124,111,247,0.12)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Score chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(79,209,197,0.1)',
              border: '1px solid rgba(79,209,197,0.22)',
              borderRadius: 100,
              padding: '6px 14px 6px 8px',
              fontSize: 12,
              color: 'var(--teal)',
              fontWeight: 500,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                background: 'var(--teal)',
                color: '#0d0c18',
                fontWeight: 700,
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 100,
              }}
            >
              94
            </span>
            Avg match score achieved
          </div>

          <h2
            className="nh-font-display"
            style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 14 }}
          >
            Your next interview starts here.
          </h2>

          <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 36, fontWeight: 300 }}>
            Join 50,000+ professionals who have already optimized their resumes with NeuraHire.
          </p>

          <Link to="/dashboard" className="btn-gradient" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Get Analyzed Free
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
