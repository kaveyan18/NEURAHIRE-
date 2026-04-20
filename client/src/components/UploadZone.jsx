import { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadZone({ onFileSelect }) {
  const [dragging, setDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
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

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileInfo(null);
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ display: 'block', width: '100%', cursor: 'pointer' }}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          animate={{
            borderColor: dragging ? 'rgba(124,111,247,0.8)' : fileInfo ? 'rgba(124,111,247,0.4)' : 'rgba(255,255,255,0.08)',
            background: dragging ? 'rgba(124,111,247,0.06)' : fileInfo ? 'rgba(124,111,247,0.03)' : 'rgba(255,255,255,0.01)',
            scale: dragging ? 1.01 : 1,
          }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'relative',
            borderRadius: 20,
            border: '2px dashed rgba(255,255,255,0.08)',
            padding: '32px 24px',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Corner accents when dragging */}
          <AnimatePresence>
            {dragging && (
              <>
                {[['0','0'], ['0','auto'], ['auto','0'], ['auto','auto']].map(([t, b], i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{
                      position: 'absolute',
                      top: t !== 'auto' ? 12 : 'auto',
                      bottom: b !== 'auto' ? 12 : 'auto',
                      left: i % 2 === 0 ? 12 : 'auto',
                      right: i % 2 === 1 ? 12 : 'auto',
                      width: 16,
                      height: 16,
                      borderTop: i < 2 ? '2px solid #7c6ff7' : 'none',
                      borderBottom: i >= 2 ? '2px solid #7c6ff7' : 'none',
                      borderLeft: i % 2 === 0 ? '2px solid #7c6ff7' : 'none',
                      borderRight: i % 2 === 1 ? '2px solid #7c6ff7' : 'none',
                      borderRadius: 4,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {fileInfo ? (
              /* ── File selected state ── */
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              >
                {/* PDF icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(124,111,247,0.2), rgba(168,154,249,0.1))',
                  border: '1px solid rgba(124,111,247,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(124,111,247,0.15)',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a89af9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>

                {/* File name chip */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(124,111,247,0.12)',
                  border: '1px solid rgba(124,111,247,0.25)',
                  padding: '8px 16px', borderRadius: 50,
                }}>
                  <span style={{ color: '#a89af9', fontSize: 13, fontWeight: 600 }}>
                    {fileInfo.name.length > 30 ? fileInfo.name.slice(0, 27) + '…' : fileInfo.name}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>•</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{fileInfo.size}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: 12, fontWeight: 600 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Ready for AI analysis
                </div>

                {/* Replace button */}
                <button
                  onClick={handleRemove}
                  style={{
                    marginTop: 2,
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 11,
                    padding: '5px 14px',
                    borderRadius: 50,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
                >
                  Replace file
                </button>
              </motion.div>
            ) : (
              /* ── Empty / drag state ── */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
              >
                {/* Upload icon */}
                <motion.div
                  animate={{ y: dragging ? -6 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: dragging ? 'rgba(124,111,247,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${dragging ? 'rgba(124,111,247,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.25s, border-color 0.25s',
                    boxShadow: dragging ? '0 0 24px rgba(124,111,247,0.2)' : 'none',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#a89af9' : 'rgba(255,255,255,0.35)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </motion.div>

                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
                    {dragging ? 'Drop it here!' : 'Drop your resume here'}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                    PDF only · max 5 MB ·{' '}
                    <span style={{ color: '#a89af9', textDecoration: 'underline' }}>browse files</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </label>
    </div>
  );
}
