import { motion } from 'framer-motion';

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

const floatVariants2 = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
  },
};

const floatVariants3 = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
  },
};

function ResumeAnalysisCard() {
  return (
    <motion.div
      variants={floatVariants}
      animate="animate"
      className="glass-card rounded-2xl p-5 w-72 shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-slate-500 ml-auto font-mono">analysis_v2_final.pdf</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400">Analysis Progress</span>
          <span className="text-xs text-indigo-400 font-medium">78%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '78%' }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            className="h-full gradient-bg rounded-full"
          />
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
        <p className="text-xs text-amber-400 font-medium">⚠ Missing Keyword: Neural Architecture</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-xs text-slate-500">Scanning semantic patterns…</span>
      </div>
    </motion.div>
  );
}

function ScoreCard() {
  return (
    <motion.div
      variants={floatVariants2}
      animate="animate"
      className="glass-card rounded-2xl p-5 w-44 shadow-2xl text-center"
    >
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Match Score</p>
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'backOut' }}
        className="text-5xl font-bold gradient-text"
      >
        94%
      </motion.p>
      <div className="mt-3 flex justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-1 w-5 rounded-full ${i < 4 ? 'gradient-bg' : 'bg-slate-700'}`} />
        ))}
      </div>
    </motion.div>
  );
}

function MarketInsightsCard() {
  return (
    <motion.div
      variants={floatVariants3}
      animate="animate"
      className="glass-card rounded-2xl p-5 w-60 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400 font-medium">Market Insights</p>
        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">Live</span>
      </div>
      <p className="text-2xl font-bold text-white mb-1">ML Engineer</p>
      <p className="text-xs text-slate-500 mb-4">San Francisco, CA</p>
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Demand</span>
          <span className="text-indigo-400">High</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '85%' }}
            transition={{ duration: 2, delay: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroCards() {
  return (
    <div className="relative w-full h-full flex flex-col items-center gap-4 pt-8">
      <ResumeAnalysisCard />
      <div className="flex gap-4 items-start">
        <ScoreCard />
        <MarketInsightsCard />
      </div>
    </div>
  );
}
