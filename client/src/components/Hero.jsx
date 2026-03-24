import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 text-center overflow-hidden">

      {/* Central radial glow behind text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center gap-7 max-w-3xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
        >
          Architect Your Career{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            with Precision.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp}
          className="text-slate-400 text-lg max-w-xl leading-relaxed"
        >
          Bridge the gap between your potential and your dream role. Our neural
          analyzer identifies hidden keyword voids and optimizes your resume
          for modern recruiter algorithms.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="btn-gradient text-white font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
          >
            Get Analyzed Free
          </Link>
          <button className="text-slate-300 font-semibold px-8 py-4 rounded-2xl text-base hover:text-white transition-colors duration-200">
            View Sample Report
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={fadeUp}
          className="flex gap-10 mt-4 pt-6 border-t border-slate-800/60"
        >
          {[
            { value: '50K+', label: 'Professionals' },
            { value: '94%', label: 'Avg Match Score' },
            { value: '3x', label: 'Interview Rate' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
