/**
 * NeuraHire Wordmark Logo — gradient text only, no icon.
 *
 * Props:
 *  textSize — Tailwind text class (default "text-2xl")
 *  className — optional extra classes
 */
export default function Logo({ textSize = 'text-2xl', className = '' }) {
  return (
    <span
      className={`font-extrabold tracking-tight leading-none select-none ${textSize} ${className}`}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <span
        style={{
          background: 'linear-gradient(90deg, #e879f9, #c084fc, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        NEURA
      </span>
      <span
        style={{
          background: 'linear-gradient(90deg, #818cf8, #38bdf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        HIRE
      </span>
    </span>
  );
}
