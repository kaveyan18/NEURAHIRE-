import { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const WORD_COUNT_WARN = 50;

const FEATURES = [
  { icon: '🎯', title: 'Keyword Analysis', desc: 'Match job-specific terms in your resume' },
  { icon: '🤖', title: 'Gemini AI Engine', desc: 'Google Gemini 2.5 Flash' },
  { icon: '💡', title: 'Actionable Tips', desc: '3 tailored improvement suggestions' },
  { icon: '⚡', title: 'Instant Results', desc: 'Results ready in seconds' },
];

const STEPS = [
  { n: '01', label: 'Upload Resume', desc: 'PDF format, up to 5 MB' },
  { n: '02', label: 'Paste Job Description', desc: 'Include all requirements' },
  { n: '03', label: 'Get AI Score', desc: 'Instant match analysis' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [jdFocused, setJdFocused] = useState(false);

  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;
  const canAnalyse = !!selectedFile && wordCount >= WORD_COUNT_WARN;
  const progressPct = Math.min((wordCount / WORD_COUNT_WARN) * 100, 100);

  const LOADING_MESSAGES = [
    'Parsing your resume…',
    'Scanning job requirements…',
    'Running Gemini AI…',
    'Generating insights…',
  ];

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.pdf')) { setError('Only PDF files are accepted.'); return; }
    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const handleRemove = (e) => { e.stopPropagation(); setSelectedFile(null); if (inputRef.current) inputRef.current.value = ''; };

  const handleAnalyse = async () => {
    if (!canAnalyse) return;
    setLoading(true); setError(null); setLoadingStep(0);
    const t1 = setTimeout(() => setLoadingStep(1), 900);
    const t2 = setTimeout(() => setLoadingStep(2), 2000);
    const t3 = setTimeout(() => setLoadingStep(3), 3200);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('jobDescription', jobDescription);
      const response = await fetch('http://localhost:3001/api/analyse', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Analysis failed'); }
      const result = await response.json();
      [t1, t2, t3].forEach(clearTimeout);
      navigate('/analyse/result', { state: { result, fileName: selectedFile.name, jobDescription } });
    } catch (err) {
      [t1, t2, t3].forEach(clearTimeout);
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Page header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 12px', borderRadius: 50,
            background: 'var(--purple-dim)',
            border: '1px solid var(--surface-border2)',
          }}>
            <span className="nh-pulse" style={{
              width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
              background: 'var(--purple)', boxShadow: '0 0 8px rgba(124,111,247,0.8)',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--purple)' }}>
              AI Resume Analysis
            </span>
          </div>
        </div>
        <h1 className="nh-font-display" style={{
          fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800,
          letterSpacing: '-1.2px', lineHeight: 1.15,
          color: 'var(--text-primary)', marginBottom: 12,
        }}>
          {user?.name ? `Hey, ${user.name.split(' ')[0]} 👋` : 'Analyse Your Resume.'}
          <br />
          <span className="gradient-text">Land your dream role.</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 520, lineHeight: 1.7, fontWeight: 400 }}>
          Drop your resume and paste a job description. Gemini AI finds keyword gaps, scores ATS compatibility, and gives actionable improvements — in seconds.
        </p>
      </motion.div>

      {/* ── 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }} className="analyse-grid">

        {/* ── LEFT: Main card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card"
          style={{ borderRadius: 20, overflow: 'hidden' }}
        >
          {/* Card header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--surface-border)',
            background: 'var(--surface-card2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'var(--purple-dim)',
                border: '1px solid var(--surface-border2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>New Analysis</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upload & analyse your resume</p>
              </div>
            </div>
            {/* Step progress dots */}
            <div style={{ display: 'flex', gap: 5 }}>
              {[0,1,2].map(i => {
                const active = (!selectedFile && i===0) || (selectedFile && wordCount<WORD_COUNT_WARN && i===1) || (canAnalyse && i===2);
                return <div key={i} style={{ height: 5, width: active ? 18 : 5, borderRadius: 3, background: active ? 'var(--purple)' : 'var(--surface-border)', transition: 'all 0.4s' }} />;
              })}
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Step 1 */}
            <div>
              <StepLabel n="1" text="Upload your resume" />
              <label style={{ display: 'block', cursor: 'pointer', marginTop: 12 }}>
                <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                <motion.div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  animate={{
                    borderColor: dragging ? 'rgba(124,111,247,0.7)' : selectedFile ? 'rgba(22,163,74,0.5)' : 'rgba(0,0,0,0.12)',
                    background: dragging ? 'rgba(124,111,247,0.04)' : selectedFile ? 'rgba(22,163,74,0.04)' : 'var(--surface-bg)',
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ border: '2px dashed rgba(0,0,0,0.12)', borderRadius: 14, padding: '24px 20px', textAlign: 'center', position: 'relative' }}
                >
                  <AnimatePresence mode="wait">
                    {selectedFile ? (
                      <motion.div key="file" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                          </svg>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)', padding: '6px 14px', borderRadius: 50 }}>
                          <span style={{ color: '#16a34a', fontSize: 12.5, fontWeight: 600 }}>
                            {selectedFile.name.length > 30 ? selectedFile.name.slice(0,27)+'…' : selectedFile.name}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>•</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{(selectedFile.size/1024).toFixed(1)} KB</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                          Ready for analysis
                        </div>
                        <button onClick={handleRemove}
                          style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 11, padding: '4px 12px', borderRadius: 50, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--text-muted)'; e.currentTarget.style.color='var(--text-secondary)'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--surface-border)'; e.currentTarget.style.color='var(--text-muted)'; }}
                        >Remove</button>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <motion.div animate={{ y: dragging ? -6 : 0 }} transition={{ type: 'spring', stiffness: 300 }}
                          style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: dragging ? 'var(--purple-dim)' : 'rgba(0,0,0,0.04)',
                            border: `1px solid ${dragging ? 'rgba(124,111,247,0.4)' : 'rgba(0,0,0,0.10)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                          }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={dragging ? 'var(--purple)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </motion.div>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>
                            {dragging ? 'Drop it here!' : 'Drop your resume here'}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            PDF only · max 5 MB · <span style={{ color: 'var(--purple)', textDecoration: 'underline', fontWeight: 500 }}>browse files</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </label>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--surface-border)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase' }}>Then</span>
              <div style={{ flex: 1, height: 1, background: 'var(--surface-border)' }} />
            </div>

            {/* Step 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <StepLabel n="2" text="Paste job description" />
                <span style={{
                  fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 50,
                  border: `1px solid ${wordCount >= WORD_COUNT_WARN ? 'rgba(22,163,74,0.35)' : 'var(--surface-border)'}`,
                  background: wordCount >= WORD_COUNT_WARN ? 'rgba(22,163,74,0.07)' : 'var(--surface-bg)',
                  color: wordCount >= WORD_COUNT_WARN ? '#16a34a' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {wordCount}/{WORD_COUNT_WARN} {wordCount >= WORD_COUNT_WARN ? '✓' : 'words'}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  rows={8} value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  onFocus={() => setJdFocused(true)}
                  onBlur={() => setJdFocused(false)}
                  placeholder="Paste the full job description here — include responsibilities, requirements, and qualifications for the most accurate AI match."
                  style={{
                    width: '100%',
                    background: 'var(--surface-bg)',
                    border: `1.5px solid ${jdFocused ? 'var(--purple)' : wordCount >= WORD_COUNT_WARN ? 'rgba(22,163,74,0.5)' : 'var(--surface-border)'}`,
                    borderRadius: 12, padding: '16px 18px',
                    color: 'var(--text-primary)', fontSize: 13.5, lineHeight: 1.75,
                    outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                    boxShadow: jdFocused ? '0 0 0 3px var(--purple-dim)' : 'none',
                  }}
                />
                {/* Progress bar */}
                <div style={{ position: 'absolute', bottom: 1, left: 1, right: 1, height: 3, borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} style={{
                    height: '100%',
                    background: wordCount >= WORD_COUNT_WARN ? 'linear-gradient(90deg, #16a34a, #22d3ee)' : 'linear-gradient(90deg, var(--purple), var(--purple-light))',
                  }} />
                </div>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '11px 16px', color: '#dc2626', fontSize: 13 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyse Button */}
            <motion.button
              onClick={handleAnalyse} disabled={loading || !canAnalyse}
              whileHover={canAnalyse && !loading ? { y: -2, boxShadow: '0 12px 36px rgba(124,111,247,0.45)' } : {}}
              whileTap={canAnalyse && !loading ? { scale: 0.98 } : {}}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 12, border: 'none',
                cursor: canAnalyse && !loading ? 'pointer' : 'not-allowed',
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14.5,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                position: 'relative', overflow: 'hidden', transition: 'all 0.25s',
                background: canAnalyse && !loading ? 'linear-gradient(135deg, #7c6ff7, #5a50d8)' : 'rgba(0,0,0,0.06)',
                boxShadow: canAnalyse && !loading ? '0 4px 20px rgba(124,111,247,0.35)' : 'none',
                opacity: !canAnalyse && !loading ? 0.6 : 1,
              }}
            >
              {canAnalyse && !loading && (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite' }} />
              )}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/>
                    </svg>
                    <AnimatePresence mode="wait">
                      <motion.span key={loadingStep} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                        {LOADING_MESSAGES[loadingStep]}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                    </svg>
                    {!selectedFile ? 'Upload your resume first' : wordCount < WORD_COUNT_WARN ? `Add ${WORD_COUNT_WARN - wordCount} more words` : 'Analyse My Resume'}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: -12 }}>
              🔒 &nbsp;Your resume is never stored — processed in memory only
            </p>
          </div>
        </motion.div>

        {/* ── RIGHT: Side panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Features card */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ borderRadius: 18, padding: 20 }}>
            <p className="nh-font-display" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>What you'll get</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FEATURES.map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>{icon}</div>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ borderRadius: 18, padding: 20 }}>
            <p className="nh-font-display" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>How it works</p>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                {i < STEPS.length - 1 && <div style={{ position: 'absolute', left: 12, top: 30, bottom: 0, width: 1, background: 'var(--surface-border)' }} />}
                <div className="nh-font-display" style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0, zIndex: 1,
                  background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9.5, fontWeight: 800, color: 'var(--purple)',
                }}>{s.n}</div>
                <div style={{ paddingBottom: i < STEPS.length - 1 ? 18 : 0, paddingTop: 2 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{s.label}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Tip */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 15 }}>💡</span>
            <p style={{ fontSize: 12, color: '#15803d', lineHeight: 1.6 }}>
              <strong style={{ fontWeight: 700 }}>Pro tip:</strong>{' '}
              Include the full JD — even "nice to haves" — for the most accurate keyword gap analysis.
            </p>
          </motion.div>
        </div>
      </div>

      <style>{`
        .analyse-grid { grid-template-columns: 1fr 320px; }
        @media (max-width: 900px) { .analyse-grid { grid-template-columns: 1fr !important; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function StepLabel({ n, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div className="nh-font-display" style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9.5, fontWeight: 800, color: 'var(--purple)',
      }}>{n}</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{text}</span>
    </div>
  );
}
