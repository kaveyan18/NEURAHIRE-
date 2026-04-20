import { motion } from 'framer-motion';

const stats = [
  { value: '50K+', label: 'Professionals' },
  { value: '94%',  label: 'Avg Match Score' },
  { value: '3x',   label: 'Interview Rate' },
];

export default function StatsStrip() {
  return (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', padding: '0 56px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.55 }}
        style={{
          display: 'flex',
          maxWidth: 500,
          width: '100%',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        {stats.map(({ value, label }, i) => (
          <div
            key={label}
            style={{
              flex: 1,
              padding: '22px 24px',
              textAlign: 'center',
              borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              className="nh-font-display"
              style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple-light)', letterSpacing: '-0.5px' }}
            >
              {value}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
