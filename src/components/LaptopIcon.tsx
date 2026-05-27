interface LaptopIconProps {
  state: 'libre' | 'ocupado' | 'mio' | 'destacado' | 'preguntado';
  emoji?: string;
  label?: string;
  seatId?: string;
}

const STATE_COLORS: Record<LaptopIconProps['state'], { screen: string; body: string; glow?: string }> = {
  libre:     { screen: '#94a3b8', body: '#cbd5e1' },
  ocupado:   { screen: '#ef4444', body: '#fca5a5' },
  mio:       { screen: '#3b82f6', body: '#93c5fd' },
  destacado: { screen: '#f59e0b', body: '#fcd34d', glow: '#f59e0b' },
  preguntado:{ screen: '#8b5cf6', body: '#c4b5fd' },
};

export default function LaptopIcon({ state, emoji, label, seatId }: LaptopIconProps) {
  const c = STATE_COLORS[state];
  return (
    <div className={`laptop-wrap ${state}`}>
      <svg
        viewBox="0 0 64 52"
        width="64"
        height="52"
        xmlns="http://www.w3.org/2000/svg"
        className="laptop-svg"
      >
        {/* Screen */}
        <rect x="8" y="2" width="48" height="32" rx="3" fill={c.screen} />
        <rect x="11" y="5" width="42" height="26" rx="2" fill="#1e293b" />

        {/* Emoji / initial in screen */}
        {emoji ? (
          <text x="32" y="23" textAnchor="middle" fontSize="16" dominantBaseline="middle">
            {emoji}
          </text>
        ) : label ? (
          <text
            x="32" y="18"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#f1f5f9"
            dominantBaseline="middle"
          >
            {label.charAt(0).toUpperCase()}
          </text>
        ) : null}

        {/* Hinge */}
        <rect x="18" y="34" width="28" height="3" rx="1" fill={c.screen} />

        {/* Base / keyboard */}
        <rect x="4" y="37" width="56" height="13" rx="3" fill={c.body} />
        {/* Keyboard rows */}
        <rect x="10" y="40" width="44" height="2" rx="1" fill={c.screen} opacity="0.4" />
        <rect x="12" y="44" width="40" height="2" rx="1" fill={c.screen} opacity="0.4" />
        {/* Trackpad */}
        <rect x="24" y="40" width="16" height="8" rx="2" fill={c.screen} opacity="0.25" />
      </svg>

      {seatId && <span className="laptop-seat-id">{seatId}</span>}
      {label && <span className="laptop-label">{label}</span>}
    </div>
  );
}
