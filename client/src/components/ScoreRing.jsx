import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getLabel(score) {
  if (score >= 80) return { text: 'Excellent Match', color: '#16a34a', glow: 'rgba(22,163,74,0.25)', track: 'rgba(22,163,74,0.1)', bg: '#f0fdf4', border: '#bbf7d0' };
  if (score >= 60) return { text: 'Good Match',      color: '#d97706', glow: 'rgba(217,119,6,0.25)', track: 'rgba(217,119,6,0.08)', bg: '#fffbeb', border: '#fde68a' };
  if (score >= 40) return { text: 'Fair Match',      color: '#ea580c', glow: 'rgba(234,88,12,0.22)', track: 'rgba(234,88,12,0.08)', bg: '#fff7ed', border: '#fed7aa' };
  return            { text: 'Needs Work',             color: '#dc2626', glow: 'rgba(220,38,38,0.22)', track: 'rgba(220,38,38,0.08)', bg: '#fef2f2', border: '#fecaca' };
}

export default function ScoreRing({ score = 0 }) {
  const [animated, setAnimated] = useState(0);
  const label = getLabel(score);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 250);
    return () => clearTimeout(t);
  }, [score]);

  const offset = CIRCUMFERENCE * (1 - animated / 100);
  const size = 192;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        AI MATCH SCORE
      </p>

      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Subtle glow bg */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `radial-gradient(circle, ${label.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle cx={size/2} cy={size/2} r={RADIUS} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="11" />

          {/* Tick marks */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i / 24) * 2 * Math.PI;
            const r1 = RADIUS + 7, r2 = RADIUS + 13;
            const cx = size/2, cy = size/2;
            return (
              <line
                key={i}
                x1={cx + r1 * Math.cos(angle)} y1={cy + r1 * Math.sin(angle)}
                x2={cx + r2 * Math.cos(angle)} y2={cy + r2 * Math.sin(angle)}
                stroke="rgba(0,0,0,0.07)" strokeWidth="1.5"
              />
            );
          })}

          {/* Arc */}
          <motion.circle
            cx={size/2} cy={size/2} r={RADIUS}
            fill="none"
            stroke={label.color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${label.glow})` }}
          />
        </svg>

        {/* Centre */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              fontSize: 48, fontWeight: 800, color: label.color, lineHeight: 1,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {score}
          </motion.span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>/ 100</span>
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 1 }}
        style={{
          padding: '6px 16px', borderRadius: 50,
          background: label.bg, border: `1px solid ${label.border}`,
          color: label.color, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}
      >
        {label.text}
      </motion.div>
    </div>
  );
}
