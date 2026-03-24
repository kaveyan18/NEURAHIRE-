import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import RecentAnalysis from '../components/RecentAnalysis';
import MarketAlignment from '../components/MarketAlignment';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyse = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('http://localhost:3001/api/analyse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const result = await response.json();
      navigate('/result', { state: { result, fileName: selectedFile.name, jobDescription } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Your Career, <span className="gradient-text">Decoded.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md">
            Upload your professional resume for a deep-learning analysis of your market value and skill alignment.
          </p>
        </div>

        {/* Next Milestone */}
        <div className="hidden lg:flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5">
          <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold whitespace-nowrap">Next Milestone</span>
          <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              className="h-full gradient-bg rounded-full"
            />
          </div>
          <span className="text-indigo-400 text-xs font-semibold">65%</span>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <UploadZone onFileSelect={setSelectedFile} />

      {/* Job Description + Analyse (visible after file selected) */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <label className="block text-slate-300 text-sm font-medium">
            Job Description <span className="text-slate-600">(paste the full JD for best results)</span>
          </label>
          <textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here — e.g. 'We are looking for a Senior ML Engineer to join our team…'"
            className="w-full bg-slate-900/60 border border-slate-700 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-slate-300 text-sm placeholder-slate-600 resize-none transition-colors"
          />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyse}
            disabled={loading}
            className="btn-gradient text-white font-semibold px-8 py-3 rounded-full text-sm shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analysing with AI…
              </>
            ) : (
              'Analyse Resume →'
            )}
          </button>
        </motion.div>
      )}

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        <RecentAnalysis />
        <MarketAlignment />
      </div>
    </div>
  );
}
