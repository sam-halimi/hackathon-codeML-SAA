// Logo Boussole : une aiguille de boussole dans une cellule, dont la moitié nord porte l'accent.
// Le motif (aiguille + repères cardinaux) se décline dans toute l'interface.
export function Mark({ size = 28, animate = false, invert = false }: { size?: number; animate?: boolean; invert?: boolean }) {
  const bg = invert ? '#F7F5F0' : '#16181D'
  const fg = invert ? '#16181D' : '#F7F5F0'
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="6" fill={bg} />
      <g stroke={fg} strokeOpacity="0.35" strokeWidth="1.2">
        <line x1="16" y1="2.5" x2="16" y2="4.5" /><line x1="16" y1="27.5" x2="16" y2="29.5" />
        <line x1="2.5" y1="16" x2="4.5" y2="16" /><line x1="27.5" y1="16" x2="29.5" y2="16" />
      </g>
      <g className={animate ? 'needle' : undefined}>
        <path d="M16 6 L19.2 16 L16 26 L12.8 16 Z" fill={fg} />
        <path d="M16 6 L19.2 16 L12.8 16 Z" fill="#0F7A64" />
      </g>
    </svg>
  )
}

export function Wordmark({ invert = false, animate = false }: { invert?: boolean; animate?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark animate={animate} invert={invert} />
      <span className={`text-[17px] font-semibold tracking-[-0.02em] ${invert ? 'text-paper' : 'text-ink'}`}>Boussole</span>
    </span>
  )
}
