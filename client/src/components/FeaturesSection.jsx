import { motion } from 'framer-motion';

const features = [
  {
    title: 'Keyword gap analysis',
    desc: "Instantly surfaces the exact keywords recruiters and ATS systems are scanning for — and shows you what's missing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: 'Match score engine',
    desc: 'A precision score from 0–100 showing how well your resume aligns to any specific job description in seconds.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: 'Actionable rewrites',
    desc: 'Not just scores — specific, concrete suggestions on exactly what to rewrite, add, or remove from each section.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    title: 'ATS compatibility',
    desc: "Checks formatting and structure against real ATS parsers so your resume doesn't get filtered before a human ever reads it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: 'Recruiter lens',
    desc: 'See your resume the way a hiring manager sees it — with attention heatmaps and first-impression analysis built in.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Progress tracking',
    desc: 'Track your score improvements across multiple resume versions and job applications over time in one dashboard.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
  },
];

function FeatureCard({ feature, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay }}
      className="feat-card"
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 28,
      }}
    >
      {/* Icon box */}
      <div
        style={{
          width: 38,
          height: 38,
          background: 'var(--purple-dim)',
          border: '1px solid var(--border2)',
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        {feature.icon}
      </div>

      <h3
        className="nh-font-display"
        style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.2px', color: 'var(--white)' }}
      >
        {feature.title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>
        {feature.desc}
      </p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{ position: 'relative', zIndex: 1, padding: '100px 56px', maxWidth: 1100, margin: '0 auto' }}
    >
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--purple-light)', marginBottom: 16, fontWeight: 500 }}
      >
        What we do
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="nh-font-display"
        style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, maxWidth: 480, marginBottom: 56 }}
      >
        Everything your resume needs to win.
      </motion.h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
        className="block"
      >
        {features.map((f, i) => (
          <FeatureCard key={f.title} feature={f} delay={i * 0.08} />
        ))}
      </div>
    </section>
  );
}
