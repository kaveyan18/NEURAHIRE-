import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ScoreRing from '../components/ScoreRing';

const ICONS = [
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>,
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>,
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>,
];

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const state = location.state;
  if (!state || !state.result) return <Navigate to="/analyse" replace />;

  const { result, fileName, jobDescription } = state;
  const { score, matched_keywords = [], missing_keywords = [], suggestions = [] } = result;
  const totalKeywords = matched_keywords.length + missing_keywords.length;
  const matchPct = totalKeywords > 0 ? Math.round((matched_keywords.length / totalKeywords) * 100) : 0;

  const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : score >= 40 ? '#ea580c' : '#dc2626';
  const scoreBg = score >= 80 ? '#f0fdf4' : score >= 60 ? '#fffbeb' : score >= 40 ? '#fff7ed' : '#fef2f2';
  const scoreBorder = score >= 80 ? '#bbf7d0' : score >= 60 ? '#fde68a' : score >= 40 ? '#fed7aa' : '#fecaca';
  const scoreLabel = score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Fair Match' : 'Needs Work';

  const handleCopy = () => {
    const text = suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48 }}>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 50, background: scoreBg, border: `1px solid ${scoreBorder}`, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: scoreColor, display: 'inline-block', boxShadow: `0 0 6px ${scoreColor}99` }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: scoreColor }}>Analysis Complete</span>
          </div>
          <h1 className="nh-font-display" style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: 6 }}>
            Your Resume Results
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Analysed against: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{jobDescription.split('\n')[0].slice(0, 65)}{jobDescription.split('\n')[0].length > 65 ? '…' : ''}</span>
          </p>
        </div>
        <button onClick={() => navigate('/analyse')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
            color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
            padding: '9px 16px', borderRadius: 9, cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Analyse Again
        </button>
      </motion.div>

      {/* ── Score row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'stretch' }} className="result-top-grid">

        {/* Score card */}
        <motion.div {...fadeUp(0.08)} className="glass-card glow-border" style={{ borderRadius: 20, padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 240 }}>
          <ScoreRing score={score} />
          {/* Coverage bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Keyword Coverage</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{matchPct}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-border)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${matchPct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Right info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* File + JD */}
          <motion.div {...fadeUp(0.12)} className="glass-card" style={{ borderRadius: 16, padding: '18px 22px', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Analysed Resume</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, wordBreak: 'break-all' }}>{fileName}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Target Role</p>
                <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {jobDescription.split('\n')[0] || 'Job Role'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp(0.16)} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <StatCard val={matched_keywords.length} label="Matched" color="#16a34a" bg="#f0fdf4" border="#bbf7d0" delay={0.2} />
            <StatCard val={missing_keywords.length} label="Missing" color="#dc2626" bg="#fef2f2" border="#fecaca" delay={0.24} />
            <StatCard val={suggestions.length} label="Tips" color="var(--purple)" bg="var(--purple-dim)" border="var(--surface-border2)" delay={0.28} />
          </motion.div>
        </div>
      </div>

      {/* ── Keywords ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="result-kw-grid">
        {/* Matched */}
        <motion.div {...fadeUp(0.22)} className="glass-card" style={{ borderRadius: 18, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13.5 }}>Matched Keywords</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{matched_keywords.length} found in your resume</p>
            </div>
          </div>
          {matched_keywords.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No keywords matched</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {matched_keywords.map((kw, i) => (
                <motion.span key={kw} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.24 + i * 0.035 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 50, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a' }}>
                  {kw}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Missing */}
        <motion.div {...fadeUp(0.26)} className="glass-card" style={{ borderRadius: 18, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13.5 }}>Missing Keywords</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{missing_keywords.length > 0 ? `Add these to boost your score` : 'Great coverage!'}</p>
            </div>
          </div>
          {missing_keywords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: 28, marginBottom: 6 }}>🎉</p>
              <p style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>No missing keywords!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {missing_keywords.map((kw, i) => (
                <motion.span key={kw} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28 + i * 0.045 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 50, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626' }}>
                  {kw}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Suggestions ── */}
      <motion.div {...fadeUp(0.3)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="nh-font-display" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.4px', marginBottom: 4 }}>AI Suggestions</h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Personalized improvements to boost your resume score</p>
          </div>
          <button onClick={handleCopy} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: copied ? '#f0fdf4' : 'var(--surface-card)',
            border: `1px solid ${copied ? '#bbf7d0' : 'var(--surface-border)'}`,
            color: copied ? '#16a34a' : 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {copied ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg> Copied!</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy All</>
            )}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {suggestions.map((tip, i) => {
            const dot = tip.indexOf('.');
            const title = dot > 0 && dot < 80 ? tip.slice(0, dot + 1) : tip.slice(0, 70) + '…';
            const body = dot > 0 && dot < 80 ? tip.slice(dot + 1).trim() : '';
            const palettes = [
              { bg: 'var(--purple-dim)', border: 'var(--surface-border2)', icon: 'var(--purple)', num: '#7c6ff7' },
              { bg: 'rgba(8,145,178,0.07)', border: 'rgba(8,145,178,0.2)', icon: '#0891b2', num: '#0891b2' },
              { bg: 'rgba(217,119,6,0.07)', border: 'rgba(217,119,6,0.2)', icon: '#d97706', num: '#d97706' },
            ];
            const p = palettes[i % 3];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.35 + i * 0.08 }}
                whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.1)', transition: { duration: 0.2 } }}
                className="glass-card"
                style={{ borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: p.bg, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.icon }}>
                    {ICONS[i % 3]}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: p.num, fontFamily: 'Syne,sans-serif', opacity: 0.65 }}>0{i + 1}</span>
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13.5, lineHeight: 1.45, marginBottom: body ? 6 : 0 }}>{title}</p>
                  {body && <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.65 }}>{body}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Bottom CTA banner ── */}
      <motion.div {...fadeUp(0.45)}
        style={{
          borderRadius: 18, padding: '20px 24px',
          background: 'linear-gradient(135deg, #f5f4ff, #ede9fe)',
          border: '1px solid var(--surface-border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🤖</div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {score >= 80 ? 'Strong candidate — apply with confidence!' : score >= 60 ? 'Good fit — a few tweaks will make it stronger.' : 'Resume needs improvement before applying.'}
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Powered by Google Gemini 2.5 Flash</p>
          </div>
        </div>
        <button onClick={() => navigate('/analyse')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #7c6ff7, #5a50d8)',
            border: 'none', color: '#fff', fontWeight: 700, fontSize: 13.5,
            padding: '11px 20px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 16px rgba(124,111,247,0.35)', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,111,247,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,111,247,0.35)'; }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Analyse Again
        </button>
      </motion.div>

      <style>{`
        @media (max-width: 900px) {
          .result-top-grid { grid-template-columns: 1fr !important; }
          .result-kw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ val, label, color, bg, border, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ borderRadius: 14, padding: '16px 16px', textAlign: 'center', background: bg, border: `1px solid ${border}` }}>
      <p style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, marginBottom: 4, fontFamily: 'Syne,sans-serif' }}>{val}</p>
      <p style={{ fontSize: 10.5, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.75 }}>{label}</p>
    </motion.div>
  );
}