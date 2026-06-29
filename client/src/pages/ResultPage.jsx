import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ScoreRing from '../components/ScoreRing';

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const TipIcons = [
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
];

// ─── Dimension config ─────────────────────────────────────────────────────────
const BREAKDOWN_DIMS = [
  { key: 'keywordCoverage',  label: 'Keyword Match',    color: '#7c6ff7', weight: '20%' },
  { key: 'semanticMatch',    label: 'Semantic Match',   color: '#0891b2', weight: '20%' },
  { key: 'experienceScore',  label: 'Experience',       color: '#d97706', weight: '20%' },
  { key: 'projectScore',     label: 'Projects',         color: '#16a34a', weight: '15%' },
  { key: 'resumeQuality',    label: 'Resume Quality',   color: '#9333ea', weight: '10%' },
  { key: 'achievementScore', label: 'Achievements',     color: '#db2777', weight: '5%'  },
  { key: 'educationScore',   label: 'Education',        color: '#0d9488', weight: '5%'  },
  { key: 'formattingScore',  label: 'Formatting',       color: '#ea580c', weight: '5%'  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BreakdownBar({ label, value, color, weight, delay }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 500, opacity: 0.7 }}>{weight}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'Syne, sans-serif' }}>{value}</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: 'var(--surface-border)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1.0, delay: delay + 0.1, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 4,
            background: `linear-gradient(90deg, ${color}, ${color}bb)`,
            boxShadow: `0 0 8px ${color}44`,
          }}
        />
      </div>
    </motion.div>
  );
}

function SectionCard({ title, icon, score, strengths = [], weaknesses = [], delay, color = '#7c6ff7', extraContent }) {
  const [open, setOpen] = useState(false);
  const bgColor = score >= 70 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2';
  const txtColor = score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  const borderColor = score >= 70 ? '#bbf7d0' : score >= 50 ? '#fde68a' : '#fecaca';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{strengths.length + weaknesses.length} signals detected</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: '4px 10px', borderRadius: 50, background: bgColor, border: `1px solid ${borderColor}` }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: txtColor, fontFamily: 'Syne, sans-serif' }}>{score}</span>
            <span style={{ fontSize: 10, color: txtColor, opacity: 0.7 }}>/100</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ borderTop: '1px solid var(--surface-border)', overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {strengths.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#16a34a', marginBottom: 8 }}>✓ Strengths</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {strengths.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }}><CheckIcon /></span>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {weaknesses.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#dc2626', marginBottom: 8 }}>✗ Improvements</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {weaknesses.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }}><XIcon /></span>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {extraContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ val, label, color, bg, border, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ borderRadius: 14, padding: '16px 12px', textAlign: 'center', background: bg, border: `1px solid ${border}` }}>
      <p style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, marginBottom: 4, fontFamily: 'Syne,sans-serif' }}>{val}</p>
      <p style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.75 }}>{label}</p>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const state = location.state;
  if (!state || !state.result) return <Navigate to="/analyse" replace />;

  const { result, fileName, jobDescription } = state;

  // Field normalization — supports both old and new API shape
  const scoreObj        = result.score || {};
  const finalScore      = typeof scoreObj === 'number' ? scoreObj : (scoreObj.finalATS ?? 0);
  const breakdown       = (typeof scoreObj === 'object' && scoreObj.breakdown) ? scoreObj.breakdown : null;
  const matchedSkills   = result.matchedSkills   ?? result.matched_keywords  ?? [];
  const missingSkills   = result.missingSkills   ?? result.missing_keywords  ?? [];
  const semanticMatches = result.semanticMatches ?? [];
  const suggestions     = result.suggestions     ?? [];
  const sectionScores   = result.sectionScores   ?? null;
  const resumeStrengths = result.resumeStrengths ?? [];
  const resumeWeaknesses= result.resumeWeaknesses?? [];

  const totalKeywords = matchedSkills.length + missingSkills.length;
  const matchPct = totalKeywords > 0 ? Math.round((matchedSkills.length / totalKeywords) * 100) : 0;

  const scoreColor  = finalScore >= 80 ? '#16a34a' : finalScore >= 60 ? '#d97706' : finalScore >= 40 ? '#ea580c' : '#dc2626';
  const scoreBg     = finalScore >= 80 ? '#f0fdf4' : finalScore >= 60 ? '#fffbeb' : finalScore >= 40 ? '#fff7ed' : '#fef2f2';
  const scoreBorder = finalScore >= 80 ? '#bbf7d0' : finalScore >= 60 ? '#fde68a' : finalScore >= 40 ? '#fed7aa' : '#fecaca';

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  const handleCopy = () => {
    const text = suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 56 }}>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 50, background: scoreBg, border: `1px solid ${scoreBorder}`, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: scoreColor, display: 'inline-block', boxShadow: `0 0 6px ${scoreColor}99` }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: scoreColor }}>Analysis Complete</span>
          </div>
          <h1 className="nh-font-display" style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: 6 }}>
            Your ATS Report
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Analysed against: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{jobDescription.split('\n')[0].slice(0, 65)}{jobDescription.split('\n')[0].length > 65 ? '…' : ''}</span>
          </p>
        </div>
        <button onClick={() => navigate('/analyse')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, padding: '9px 16px', borderRadius: 9, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Analyse Again
        </button>
      </motion.div>

      {/* ── Top row: Score Ring + Breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }} className="result-top-grid">

        {/* Score card */}
        <motion.div {...fadeUp(0.06)} className="glass-card glow-border" style={{ borderRadius: 20, padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 230 }}>
          <ScoreRing score={finalScore} />
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Skill Coverage</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{matchPct}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-border)', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${matchPct}%` }} transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)` }} />
            </div>
          </div>
        </motion.div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stats row */}
          <motion.div {...fadeUp(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <StatCard val={matchedSkills.length} label="Matched" color="#16a34a" bg="#f0fdf4" border="#bbf7d0" delay={0.14} />
            <StatCard val={missingSkills.length} label="Missing" color="#dc2626" bg="#fef2f2" border="#fecaca" delay={0.17} />
            <StatCard val={semanticMatches.length} label="Semantic" color="#0891b2" bg="rgba(8,145,178,0.07)" border="rgba(8,145,178,0.2)" delay={0.2} />
            <StatCard val={suggestions.length} label="Tips" color="var(--purple)" bg="var(--purple-dim)" border="var(--surface-border2)" delay={0.23} />
          </motion.div>

          {/* 8-dim breakdown */}
          {breakdown && (
            <motion.div {...fadeUp(0.12)} className="glass-card" style={{ borderRadius: 16, padding: '18px 22px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Score Breakdown — 8 Dimensions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {BREAKDOWN_DIMS.map(({ key, label, color, weight }, i) => (
                  <BreakdownBar key={key} label={label} value={breakdown[key] ?? 0} color={color} weight={weight} delay={0.15 + i * 0.04} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── File info strip ── */}
      <motion.div {...fadeUp(0.22)} className="glass-card" style={{ borderRadius: 14, padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          </div>
          <div>
            <p style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Resume</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600 }}>{fileName}</p>
          </div>
        </div>
        <div>
          <p style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 2 }}>Target Role</p>
          <p style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {jobDescription.split('\n')[0] || 'Job Role'}
          </p>
        </div>
      </motion.div>

      {/* ── Section Analysis Cards ── */}
      {sectionScores && (
        <motion.div {...fadeUp(0.28)}>
          <div style={{ marginBottom: 16 }}>
            <h2 className="nh-font-display" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.4px', marginBottom: 4 }}>Section-by-Section Analysis</h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Click any card to expand strengths and improvements</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SectionCard
              title="Experience" icon="💼" delay={0.3}
              score={sectionScores.experience?.score ?? 0}
              strengths={sectionScores.experience?.strengths ?? []}
              weaknesses={sectionScores.experience?.weaknesses ?? []}
            />
            <SectionCard
              title="Projects" icon="🚀" delay={0.33}
              score={sectionScores.projects?.score ?? 0}
              strengths={sectionScores.projects?.strengths ?? []}
              weaknesses={sectionScores.projects?.weaknesses ?? []}
            />
            <SectionCard
              title="Resume Quality" icon="📋" delay={0.36}
              score={sectionScores.quality?.score ?? 0}
              strengths={sectionScores.quality?.strengths ?? []}
              weaknesses={sectionScores.quality?.issues ?? []}
              extraContent={
                sectionScores.quality?.wordCount > 0 && (
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                    Word count: <strong style={{ color: 'var(--text-secondary)' }}>{sectionScores.quality.wordCount}</strong>
                    {sectionScores.quality.wordCount < 250 ? ' — too short' : sectionScores.quality.wordCount > 900 ? ' — consider trimming' : ' — ideal range'}
                  </p>
                )
              }
            />
            <SectionCard
              title="Achievements & Impact" icon="🏆" delay={0.39}
              score={sectionScores.achievements?.score ?? 0}
              strengths={sectionScores.achievements?.strengths ?? []}
              weaknesses={sectionScores.achievements?.weaknesses ?? []}
              extraContent={
                (sectionScores.achievements?.achievements || []).length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Detected achievements</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {sectionScores.achievements.achievements.slice(0, 3).map((a, i) => (
                        <p key={i} style={{ fontSize: 11.5, color: 'var(--text-secondary)', background: 'var(--surface-bg)', borderRadius: 6, padding: '5px 10px', lineHeight: 1.4 }}>"{a}"</p>
                      ))}
                    </div>
                  </div>
                )
              }
            />
            <SectionCard
              title="Education" icon="🎓" delay={0.42}
              score={sectionScores.education?.score ?? 0}
              strengths={sectionScores.education?.strengths ?? []}
              weaknesses={sectionScores.education?.weaknesses ?? []}
              extraContent={
                sectionScores.education?.degreeLevel && sectionScores.education.degreeLevel !== 'none' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 50, background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)', color: 'var(--purple)', fontWeight: 600 }}>
                      {sectionScores.education.degreeLevel}
                    </span>
                    {sectionScores.education.relevant && (
                      <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 50, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontWeight: 600 }}>
                        CS/Engineering field
                      </span>
                    )}
                  </div>
                )
              }
            />
          </div>
        </motion.div>
      )}

      {/* ── Matched / Missing Skills ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="result-kw-grid">
        <motion.div {...fadeUp(0.44)} className="glass-card" style={{ borderRadius: 18, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13.5 }}>Matched Skills</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{matchedSkills.length} found across your resume</p>
            </div>
          </div>
          {matchedSkills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No skills matched</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {matchedSkills.map((kw, i) => (
                <motion.span key={kw} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.46 + i * 0.03 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 50, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a' }}>
                  {kw}<CheckIcon />
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.47)} className="glass-card" style={{ borderRadius: 18, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13.5 }}>Missing Skills</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{missingSkills.length > 0 ? 'Add these to boost your score' : 'Great coverage!'}</p>
            </div>
          </div>
          {missingSkills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: 28, marginBottom: 6 }}>🎉</p>
              <p style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>No missing skills!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {missingSkills.map((kw, i) => (
                <motion.span key={kw} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.49 + i * 0.04 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 50, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626' }}>
                  {kw}<XIcon />
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Semantic Matches ── */}
      {semanticMatches.length > 0 && (
        <motion.div {...fadeUp(0.5)} className="glass-card" style={{ borderRadius: 16, padding: '18px 22px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
            🔗 Near Matches via Semantic Analysis ({semanticMatches.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {semanticMatches.map((m, i) => (
              <div key={i} style={{ fontSize: 11.5, padding: '5px 12px', borderRadius: 50, background: 'rgba(8,145,178,0.07)', border: '1px solid rgba(8,145,178,0.2)', color: '#0891b2', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ opacity: 0.7 }}>{m.resumeSkill}</span>
                <span style={{ opacity: 0.4 }}>≈</span>
                <span style={{ fontWeight: 700 }}>{m.jdSkill}</span>
                <span style={{ fontSize: 9.5, opacity: 0.55, marginLeft: 2 }}>{Math.round(m.similarity * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Suggestions ── */}
      <motion.div {...fadeUp(0.52)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="nh-font-display" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.4px', marginBottom: 4 }}>
              ATS Improvement Plan
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Ranked by impact on your score — fix the top items first</p>
          </div>
          <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, background: copied ? '#f0fdf4' : 'var(--surface-card)', border: `1px solid ${copied ? '#bbf7d0' : 'var(--surface-border)'}`, color: copied ? '#16a34a' : 'var(--text-secondary)', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
            {copied ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg> Copied!</> : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy All</>}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 14 }}>
          {suggestions.map((tip, i) => {
            const cleanTip = tip.replace(/^[\p{Emoji}\s]+/u, '').trim();
            const dot = cleanTip.indexOf('.');
            const title = dot > 0 && dot < 110 ? cleanTip.slice(0, dot + 1) : cleanTip.slice(0, 90) + '…';
            const body = dot > 0 && dot < 110 ? cleanTip.slice(dot + 1).trim() : '';
            const palettes = [
              { bg: 'var(--purple-dim)', border: 'var(--surface-border2)', icon: 'var(--purple)', num: '#7c6ff7' },
              { bg: 'rgba(8,145,178,0.07)', border: 'rgba(8,145,178,0.2)', icon: '#0891b2', num: '#0891b2' },
              { bg: 'rgba(217,119,6,0.07)', border: 'rgba(217,119,6,0.2)', icon: '#d97706', num: '#d97706' },
            ];
            const p = palettes[i % 3];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.55 + i * 0.07 }}
                whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.09)', transition: { duration: 0.2 } }}
                className="glass-card"
                style={{ borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: p.bg, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.icon }}>
                    {TipIcons[i % 3]}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: p.num, fontFamily: 'Syne,sans-serif', opacity: 0.6 }}>0{i + 1}</span>
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, lineHeight: 1.5, marginBottom: body ? 5 : 0 }}>{title}</p>
                  {body && <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.65 }}>{body}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── CTA Banner ── */}
      <motion.div {...fadeUp(0.6)}
        style={{ borderRadius: 18, padding: '20px 24px', background: 'linear-gradient(135deg, #f5f4ff, #ede9fe)', border: '1px solid var(--surface-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--purple-dim)', border: '1px solid var(--surface-border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🤖</div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {finalScore >= 80 ? 'Strong candidate — apply with confidence!' : finalScore >= 60 ? 'Good fit — a few targeted improvements will get you there.' : 'Resume needs work before applying — focus on the top suggestions above.'}
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              NEURAHIRE ATS Engine · {result.meta?.skills_db_size ?? 0} skills · {result.meta?.jd_skills_found ?? 0} JD skills analysed
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/analyse')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #7c6ff7, #5a50d8)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13.5, padding: '11px 20px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(124,111,247,0.35)', whiteSpace: 'nowrap' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,111,247,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,111,247,0.35)'; }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Analyse Again
        </button>
      </motion.div>

      <style>{`
        @media (max-width: 960px) {
          .result-top-grid { grid-template-columns: 1fr !important; }
          .result-kw-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}