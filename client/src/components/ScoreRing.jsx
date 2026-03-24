import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getLabel(score) {
  if (score >= 80) return { text: 'Excellent Match', color: '#10b981' };
  if (score >= 60) return { text: 'Good Match', color: '#f59e0b' };
  if (score >= 40) return { text: 'Fair Match', color: '#f97316' };
  return { text: 'Weak Match', color: '#ef4444' };
}

export default function ScoreRing({ score = 0 }) {
  const [animated, setAnimated] = useState(0);
  const label = getLabel(score);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = CIRCUMFERENCE * (1 - animated / 100);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-slate-500 text-[10px] uppercase tracking-[0.25em] font-semibold">
        AI Match Accuracy
      </p>

      <div className="relative w-52 h-52">
        <svg width="208" height="208" viewBox="0 0 208 208" className="-rotate-90">
          {/* Track */}
          <circle
            cx="104" cy="104" r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="14"
          />
          {/* Progress arc */}
          <motion.circle
            cx="104" cy="104" r={RADIUS}
            fill="none"
            stroke={label.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 10px ${label.color}80)` }}
          />
        </svg>

        {/* Centre Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'backOut' }}
            className="text-6xl font-extrabold text-white leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {score}
          </motion.span>
          <span className="text-slate-500 text-sm mt-1">/ 100</span>
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-widest"
        style={{
          color: label.color,
          borderColor: label.color + '50',
          background: label.color + '15',
        }}
      >
        {label.text}
      </motion.div>
    </div>
  );
}
