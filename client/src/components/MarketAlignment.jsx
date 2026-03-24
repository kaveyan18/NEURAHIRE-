import { motion } from 'framer-motion';

const tags = ['Architecture', 'Security', 'AI Integration'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 + i * 0.15 } }),
};

export default function MarketAlignment() {
  return (
    <div className="flex flex-col gap-4">
      {/* Career Growth */}
      <motion.div
        custom={0} variants={cardVariants} initial="hidden" animate="visible"
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Career Growth</p>
            <p className="text-3xl font-bold text-white">
              <span className="gradient-text">+14.2%</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">Salary potential increase since last month</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '62%' }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
      </motion.div>

      {/* Key Match */}
      <motion.div
        custom={1} variants={cardVariants} initial="hidden" animate="visible"
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-2">Key Match</p>
        <p className="text-white text-xl font-bold mb-3">FinTech Sector</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        custom={2} variants={cardVariants} initial="hidden" animate="visible"
        className="relative rounded-2xl p-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(99,102,241,0.3)' }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-30 blur-2xl"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <p className="text-white font-bold text-sm leading-snug max-w-[160px]">Unlock AI Career Coaching</p>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <p className="text-slate-400 text-xs mb-4 leading-relaxed">Get tailored interview questions based on your resume analysis.</p>
          <button className="btn-gradient text-white text-xs font-bold px-4 py-2 rounded-lg w-full">
            Upgrade to Pro
          </button>
        </div>
      </motion.div>
    </div>
  );
}
