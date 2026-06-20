/**
 * Small decorative Chinese hanging lantern (红灯笼) rendered as crisp SVG:
 * gold caps, ribbed red body, a string above and a tassel below.
 * Purely decorative — hidden from assistive tech.
 */
export function Lantern({
  size = 30,
  string = 14,
  className,
  style,
}: {
  size?: number;
  string?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const w = size;
  const h = size * 1.5 + string;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 40 ${64 + (string / size) * 40}`}
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <defs>
        <radialGradient id="lant-body" cx="38%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#F0524A" />
          <stop offset="55%" stopColor="#D22B25" />
          <stop offset="100%" stopColor="#8E1B20" />
        </radialGradient>
        <linearGradient id="lant-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2D79A" />
          <stop offset="50%" stopColor="#D8A24A" />
          <stop offset="100%" stopColor="#A9762B" />
        </linearGradient>
      </defs>

      {/* string */}
      <line x1="20" y1="0" x2="20" y2={(string / size) * 40} stroke="#7c5a33" strokeWidth="1.2" />
      <g transform={`translate(0, ${(string / size) * 40})`}>
        {/* top cap */}
        <rect x="13" y="2" width="14" height="5" rx="1.5" fill="url(#lant-gold)" />
        {/* body */}
        <ellipse cx="20" cy="30" rx="16" ry="20" fill="url(#lant-body)" />
        {/* ribs */}
        <path d="M20 10 C 9 19, 9 41, 20 50" stroke="#5e1216" strokeWidth="0.9" opacity="0.55" />
        <path d="M20 10 C 31 19, 31 41, 20 50" stroke="#5e1216" strokeWidth="0.9" opacity="0.55" />
        <line x1="20" y1="11" x2="20" y2="49" stroke="#5e1216" strokeWidth="0.9" opacity="0.4" />
        {/* highlight */}
        <ellipse cx="15" cy="22" rx="4.5" ry="7" fill="#FF8E72" opacity="0.35" />
        {/* bottom cap */}
        <rect x="13" y="48" width="14" height="5" rx="1.5" fill="url(#lant-gold)" />
        {/* tassel */}
        <line x1="20" y1="53" x2="20" y2="62" stroke="#D8A24A" strokeWidth="1.4" />
        <line x1="17" y1="53" x2="16.5" y2="60" stroke="#D8A24A" strokeWidth="1" opacity="0.8" />
        <line x1="23" y1="53" x2="23.5" y2="60" stroke="#D8A24A" strokeWidth="1" opacity="0.8" />
      </g>
    </svg>
  );
}
