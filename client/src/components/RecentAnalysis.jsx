import { motion } from 'framer-motion';

const recentFiles = [
  { name: 'Senior_Product_Designer_v2.pdf', status: 'READY', score: 92, barColor: 'bg-emerald-400' },
  { name: 'Creative_Lead_Resume_24.docx', status: 'ANALYZING', score: null, barColor: 'bg-indigo-400' },
  { name: 'UX_Researcher_Resume.pdf', status: 'READY', score: 78, barColor: 'bg-amber-400' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    READY: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    ANALYZING: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  };
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {status === 'ANALYZING' ? 'Analyzing…' : status}
    </span>
  );
};

export default function RecentAnalysis() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-2xl overflow-hidden border border-white/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm">Recent Analysis</h3>
        <button className="text-indigo-400 text-xs font-medium hover:text-indigo-300 flex items-center gap-1 transition-colors">
          View All
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Table Head */}
      <div className="grid grid-cols-[1fr_120px_100px] px-6 py-3 border-b border-white/5">
        {['Document Name', 'Status', 'Score'].map((h) => (
          <p key={h} className="text-slate-600 text-[11px] font-semibold uppercase tracking-widest">{h}</p>
        ))}
      </div>

      {/* Rows */}
      {recentFiles.map((file, i) => (
        <motion.div
          key={file.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
          className="grid grid-cols-[1fr_120px_100px] items-center px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-default group"
        >
          {/* Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-slate-300 text-sm font-medium truncate group-hover:text-white transition-colors">
              {file.name}
            </span>
          </div>

          {/* Status */}
          <StatusBadge status={file.status} />

          {/* Score */}
          <div className="flex items-center gap-2">
            {file.score !== null ? (
              <>
                <span className="text-white text-sm font-bold w-6">{file.score}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${file.score}%` }}
                    transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${file.barColor}`}
                  />
                </div>
              </>
            ) : (
              <div className="flex gap-1">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${j * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
