import { motion } from 'framer-motion';

const steps = [
  {
    num: 'Step 01',
    title: 'Upload your resume',
    desc: 'Drop in your PDF resume. We parse every section — skills, experience, education — in under two seconds.',
  },
  {
    num: 'Step 02',
    title: 'Paste the job description',
    desc: "Copy the job posting you're applying for. Our model maps your resume against every requirement listed.",
  },
  {
    num: 'Step 03',
    title: 'Get your match report',
    desc: 'Receive a detailed score, keyword breakdown, and prioritized improvements — ready in seconds, not days.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      style={{ position: 'relative', zIndex: 1, padding: '0 56px 100px', maxWidth: 1100, margin: '0 auto' }}
    >
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--purple-light)', marginBottom: 16, fontWeight: 500 }}
      >
        How it works
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="nh-font-display"
        style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, maxWidth: 480, marginBottom: 40 }}
      >
        Three steps to a stronger resume.
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          background: 'var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {steps.map(({ num, title, desc }) => (
          <div
            key={num}
            style={{
              background: 'var(--bg2)',
              padding: '36px 32px',
            }}
          >
            <div
              className="nh-font-display"
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--purple)', marginBottom: 16 }}
            >
              {num}
            </div>
            <h3
              className="nh-font-display"
              style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px', color: 'var(--white)' }}
            >
              {title}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>
              {desc}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
