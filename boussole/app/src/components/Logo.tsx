// Logo Boussole : une aiguille de boussole dans un cercle violet, pointe corail.
export function Mark({ size = 30, animate = false }: { size?: number; animate?: boolean; invert?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#6A4CE0" />
      <g className={animate ? 'needle' : undefined}>
        <path d="M16 5.5 L19.4 16 L16 26.5 L12.6 16 Z" fill="#FFF9F3" />
        <path d="M16 5.5 L19.4 16 L12.6 16 Z" fill="#FF8A65" />
      </g>
    </svg>
  )
}

export function Wordmark({ invert = false, animate = false }: { invert?: boolean; animate?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark animate={animate} />
      <span className={`text-[19px] font-extrabold tracking-[-0.01em] ${invert ? 'text-white' : 'text-ink'}`}>Boussole</span>
    </span>
  )
}
