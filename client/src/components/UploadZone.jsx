import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadZone({ onFileSelect }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      setFileName(file.name);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center cursor-pointer group
        ${dragging
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
          : 'border-slate-700 hover:border-indigo-500/60 hover:bg-white/[0.02]'
        }`}
    >
      {/* Upload Icon */}
      <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-colors duration-300
        ${dragging ? 'gradient-bg' : 'bg-indigo-500/15 group-hover:bg-indigo-500/25'}`}>
        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {fileName ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-full">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-indigo-300 text-sm font-medium">{fileName}</span>
            </div>
            <p className="text-slate-500 text-xs mt-1">File selected — add a job description and analyse</p>
          </motion.div>
        ) : (
          <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-white text-lg font-semibold mb-1">Drag &amp; Drop Resume</p>
            <p className="text-slate-500 text-sm mb-6">Supports PDF, DOCX up to 10MB</p>
          </motion.div>
        )}
      </AnimatePresence>

      <label className="inline-block">
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleChange}
        />
        <span className="inline-block cursor-pointer border border-slate-600 hover:border-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-200 hover:bg-indigo-500/10">
          Browse Local Files
        </span>
      </label>
    </motion.div>
  );
}
