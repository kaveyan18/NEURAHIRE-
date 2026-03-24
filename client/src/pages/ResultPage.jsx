import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ScoreRing from '../components/ScoreRing';

const suggestionIcons = [
  // Lightbulb
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>,
  // Arrows expand
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>,
  // Link
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>,
];

const iconBgs = [
  'bg-violet-500/15 text-violet-400',
  'bg-indigo-500/15 text-indigo-400',
  'bg-cyan-500/15 text-cyan-400',
];

const TABS = ['Overview', 'Analysis', 'Suggestions', 'Keywords'];

// Mock fallback for preview
const MOCK = {
  score: 94,
  matched_keywords: ['Python', 'UX Design', 'React', 'Figma', 'System Design', 'Collaboration', 'Agile', 'TypeScript', 'Prototyping', 'User Research', 'Accessibility', 'CSS'],
  missing_keywords: ['Kubernetes', 'AWS', 'Terraform', 'Jenkins'],
  suggestions: [
    'Quantify your impact in the experience section using metrics like "Increased conversion by 20%" to show concrete results.',
    "Add 'Kubernetes' to your technical skills section — it is a high-priority requirement for this role.",
    'Include a link to your portfolio. Design roles heavily prioritise visual evidence of your previous work.',
  ],
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Analysis');
  const [downloaded, setDownloaded] = useState(false);

  const state = location.state || {};
  const result = state.result || MOCK;
  const fileName = state.fileName || 'Senior_Product_Designer_v2.pdf';
  const jobDescription = state.jobDescription || 'Senior Product Designer @ Google\n\nGoogle is looking for a Senior Product Designer to join our Workspace team. You will lead design initiatives for next-generation collaboration tools, requiring expertise in complex...';

  const { score, matched_keywords = [], missing_keywords = [], suggestions = [] } = result;

  const totalKeywords = matched_keywords.length + missing_keywords.length;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Sub-navigation tabs */}
      <motion.div {...fadeUp(0)} className="flex items-center gap-1 border-b border-white/5 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-white border-indigo-500'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Left — Score Ring */}
        <motion.div
          {...fadeUp(0.1)}
          className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col items-center gap-6 min-w-[260px]"
        >
          <ScoreRing score={score} />
        </motion.div>

        {/* Right — Resume Info + Stats */}
        <div className="flex flex-col gap-4">
          {/* Analyzed Resume card */}
          <motion.div {...fadeUp(0.15)} className="glass-card rounded-2xl p-5 border border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Analyzed Resume</p>
                  <p className="text-white text-sm font-semibold font-mono">{fileName}</p>
                </div>
              </div>
              <button className="text-slate-600 hover:text-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Target Role card */}
          <motion.div {...fadeUp(0.2)} className="glass-card rounded-2xl p-5 border border-white/5">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-2">Target Role</p>
            <p className="text-white text-lg font-bold mb-2 leading-tight">
              {jobDescription.split('\n')[0] || 'Job Role'}
            </p>
            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
              {jobDescription.split('\n').slice(2).join(' ') || jobDescription}
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div {...fadeUp(0.25)} className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-white/5">
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Total Keywords</p>
              <p className="text-3xl font-bold text-white">
                {totalKeywords} <span className="text-slate-500 text-base font-normal">Found</span>
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-indigo-500/20" style={{ background: 'rgba(99,102,241,0.05)' }}>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Match Potential</p>
              <p className="text-2xl font-bold gradient-text">
                {score >= 80 ? 'High Priority' : score >= 60 ? 'Medium Priority' : 'Needs Work'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <motion.div {...fadeUp(0.3)} className="glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-white font-semibold text-sm">
              {matched_keywords.length} Matched Keywords
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {matched_keywords.map((kw, i) => (
              <motion.span
                key={kw}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              >
                {kw}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Missing Keywords */}
        <motion.div {...fadeUp(0.35)} className="glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-white font-semibold text-sm">
              {missing_keywords.length} Missing Keywords
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {missing_keywords.map((kw, i) => (
              <motion.span
                key={kw}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300"
              >
                {kw}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.span>
            ))}
            {missing_keywords.length === 0 && (
              <p className="text-slate-500 text-sm">🎉 No missing keywords — great coverage!</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Intelligence Insights */}
      <motion.div {...fadeUp(0.45)}>
        <h2 className="text-white font-bold text-xl mb-4">Intelligence Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((tip, i) => {
            // Split at first period to get a short title
            const dotIdx = tip.indexOf('.');
            const title = dotIdx > 0 ? tip.slice(0, dotIdx + 1) : tip.slice(0, 60) + '…';
            const body = dotIdx > 0 ? tip.slice(dotIdx + 1).trim() : '';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-4 cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgs[i % 3]}`}>
                  {suggestionIcons[i % 3]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-snug mb-2">{title}</p>
                  {body && <p className="text-slate-500 text-xs leading-relaxed">{body}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        {...fadeUp(0.6)}
        className="flex flex-wrap items-center justify-center gap-4 pt-4"
      >
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white font-semibold text-sm px-7 py-3 rounded-full transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloaded ? '✓ Downloaded!' : 'Download PDF Report'}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-gradient flex items-center gap-2 text-white font-semibold text-sm px-7 py-3 rounded-full shadow-lg shadow-indigo-500/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Analyse Again
        </button>
      </motion.div>
    </div>
  );
}
