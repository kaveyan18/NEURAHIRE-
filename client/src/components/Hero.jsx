import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut', delay: i * 0.12 },
  }),
};

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '100px 56px 80px',
        maxWidth: 860,
        margin: '0 auto',
      }}
    >
      {/* Ambient glow orbs */}
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'rgba(124,111,247,0.14)',
          filter: 'blur(90px)',
          top: -160,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(79,209,197,0.07)',
          filter: 'blur(90px)',
          top: 200,
          right: -80,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: 'var(--purple-light)',
              background: 'var(--purple-dim)',
              border: '1px solid var(--border2)',
              padding: '7px 16px',
              borderRadius: 100,
              marginBottom: 36,
            }}
          >
            <span
              className="nh-pulse"
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--teal)',
                display: 'inline-block',
              }}
            />
            AI-Powered Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="nh-font-display"
          style={{
            fontWeight: 800,
            fontSize: 'clamp(42px, 6vw, 72px)',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            color: 'var(--white)',
            marginBottom: 8,
          }}
        >
          Architect Your Career
          <br />
          <span style={{ color: 'var(--purple-light)' }}>with Precision.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontSize: 16,
            color: 'var(--muted)',
            lineHeight: 1.75,
            maxWidth: 520,
            margin: '22px auto 44px',
            fontWeight: 300,
          }}
        >
          Bridge the gap between your potential and your dream role. Our neural
          analyzer identifies hidden keyword voids and optimizes your resume
          for modern recruiter algorithms.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}
        >
          <Link to="/signup" className="btn-gradient" style={{ textDecoration: 'none' }}>
            Get Analyzed Free
          </Link>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            View Sample Report <span style={{ fontSize: 16 }}>→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
