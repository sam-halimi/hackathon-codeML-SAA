// Petites illustrations douces, dessinées en SVG dans la palette Boussole.
// Personnages sans visage ni détail identifiable, pour que chacun puisse s'y projeter.
type P = { className?: string }
const SKIN = ['#F2C4A8', '#C98E6B', '#8D5B43']

function Person({ x, y, body, skin = SKIN[0], hair = '#2D2440', s = 1 }: { x: number; y: number; body: string; skin?: string; hair?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-26 70 C-26 30 26 30 26 70 Z" fill={body} />
      <circle cx="0" cy="12" r="15" fill={skin} />
      <path d="M-15 10 C-15 -6 15 -6 15 10 C10 2 -8 2 -15 10 Z" fill={hair} />
    </g>
  )
}

export function Welcome({ className }: P) {
  return (
    <svg viewBox="0 0 260 200" className={className} aria-hidden>
      <circle cx="130" cy="105" r="88" fill="#FFE6DC" />
      <path d="M70 175 V100 L130 55 L190 100 V175 Z" fill="#FFF9F3" />
      <path d="M62 104 L130 50 L198 104" fill="none" stroke="#6A4CE0" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="112" y="120" width="36" height="55" rx="18" fill="#FFD08A" />
      <path d="M130 108 c-6 -9 -20 -4 -14 7 l14 12 l14 -12 c6 -11 -8 -16 -14 -7 z" fill="#FF8A65" />
      <ellipse cx="130" cy="178" rx="80" ry="7" fill="#EADFD4" />
      <g className="float"><circle cx="210" cy="60" r="6" fill="#E9A23B" /><circle cx="48" cy="80" r="4" fill="#6A4CE0" /></g>
      <path d="M200 175 c-4 -20 6 -32 14 -36 c-2 12 -4 24 -14 36 z" fill="#2F9E78" />
      <path d="M58 175 c4 -18 -4 -28 -12 -32 c1 10 4 22 12 32 z" fill="#2F9E78" />
    </svg>
  )
}

export function Choice({ className }: P) {
  return (
    <svg viewBox="0 0 260 200" className={className} aria-hidden>
      <circle cx="130" cy="105" r="88" fill="#EEE8FF" />
      <rect x="120" y="40" width="96" height="120" rx="20" fill="white" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(134 ${62 + i * 32})`}>
          <rect width="34" height="20" rx="10" fill={i === 1 ? '#EADFD4' : '#6A4CE0'} />
          <circle cx={i === 1 ? 10 : 24} cy="10" r="7" fill="white" />
          <rect x="44" y="6" width="26" height="8" rx="4" fill="#EADFD4" />
        </g>
      ))}
      <Person x={84} y={98} body="#FF8A65" skin={SKIN[1]} />
      <ellipse cx="130" cy="178" rx="80" ry="7" fill="#EADFD4" />
      <g className="float"><path d="M210 40 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4 z" fill="#E9A23B" /></g>
    </svg>
  )
}

export function Talk({ className }: P) {
  return (
    <svg viewBox="0 0 260 200" className={className} aria-hidden>
      <circle cx="130" cy="105" r="88" fill="#DDF3E8" />
      <path d="M40 150 q0 -32 26 -32 h16 q14 0 14 18 v34 h-56 z" fill="#3D86D6" />
      <path d="M220 150 q0 -32 -26 -32 h-16 q-14 0 -14 18 v34 h56 z" fill="#6A4CE0" />
      <Person x={70} y={70} body="#FFD08A" skin={SKIN[0]} hair="#8D5B43" s={0.9} />
      <Person x={190} y={70} body="#FF8A65" skin={SKIN[2]} s={0.9} />
      <rect x="92" y="26" width="52" height="30" rx="15" fill="white" />
      <path d="M104 52 l-6 10 l14 -8 z" fill="white" />
      <circle cx="108" cy="41" r="3" fill="#948BA3" /><circle cx="118" cy="41" r="3" fill="#948BA3" /><circle cx="128" cy="41" r="3" fill="#948BA3" />
      <path d="M160 34 c-5 -8 -18 -4 -13 6 l13 11 l13 -11 c5 -10 -8 -14 -13 -6 z" fill="#FF8A65" />
      <ellipse cx="130" cy="182" rx="88" ry="7" fill="#EADFD4" />
      <path d="M128 182 c-3 -22 2 -34 12 -40 c-1 14 -4 28 -12 40 z" fill="#2F9E78" />
    </svg>
  )
}

export function Care({ className }: P) {
  return (
    <svg viewBox="0 0 260 200" className={className} aria-hidden>
      <circle cx="130" cy="105" r="88" fill="#E1EEFB" />
      <rect x="70" y="60" width="120" height="115" rx="18" fill="white" />
      <rect x="110" y="40" width="40" height="40" rx="12" fill="#FF8A65" />
      <path d="M130 48 v24 M118 60 h24" stroke="white" strokeWidth="8" strokeLinecap="round" />
      {[0, 1].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={86 + c * 32} y={94 + r * 28} width="24" height="16" rx="6" fill="#E1EEFB" />))}
      <rect x="116" y="148" width="28" height="27" rx="10" fill="#6A4CE0" />
      <ellipse cx="130" cy="178" rx="84" ry="7" fill="#EADFD4" />
      <g className="float"><circle cx="44" cy="70" r="5" fill="#E9A23B" /><circle cx="214" cy="56" r="4" fill="#2F9E78" /></g>
    </svg>
  )
}

export function Space({ className }: P) {
  return (
    <svg viewBox="0 0 260 200" className={className} aria-hidden>
      <circle cx="130" cy="105" r="88" fill="#FFF1D6" />
      <rect x="92" y="30" width="76" height="140" rx="20" fill="#2D2440" />
      <rect x="99" y="44" width="62" height="112" rx="12" fill="#FFF9F3" />
      <rect x="114" y="90" width="32" height="28" rx="8" fill="#6A4CE0" />
      <path d="M120 90 v-8 a10 10 0 0 1 20 0 v8" fill="none" stroke="#6A4CE0" strokeWidth="5" />
      <circle cx="130" cy="104" r="4" fill="white" />
      <rect x="110" y="128" width="40" height="6" rx="3" fill="#EADFD4" />
      <rect x="116" y="138" width="28" height="6" rx="3" fill="#EADFD4" />
      <g className="float">
        <path d="M200 70 c-5 -8 -18 -4 -13 6 l13 11 l13 -11 c5 -10 -8 -14 -13 -6 z" fill="#FF8A65" />
        <path d="M58 60 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4 z" fill="#6A4CE0" />
      </g>
      <ellipse cx="130" cy="180" rx="70" ry="7" fill="#EADFD4" />
    </svg>
  )
}

export function Folder({ className }: P) {
  return (
    <svg viewBox="0 0 260 200" className={className} aria-hidden>
      <circle cx="130" cy="105" r="88" fill="#FFE6DC" />
      <path d="M60 70 q0 -12 12 -12 h40 l12 14 h64 q12 0 12 12 v76 q0 12 -12 12 h-116 q-12 0 -12 -12 z" fill="#E9A23B" />
      <rect x="78" y="78" width="104" height="70" rx="10" fill="white" />
      <rect x="92" y="92" width="60" height="7" rx="3.5" fill="#EADFD4" />
      <rect x="92" y="106" width="76" height="7" rx="3.5" fill="#EADFD4" />
      <rect x="92" y="120" width="44" height="7" rx="3.5" fill="#EADFD4" />
      <path d="M60 100 h140 v60 q0 12 -12 12 h-116 q-12 0 -12 -12 z" fill="#FFB86B" />
      <circle cx="176" cy="150" r="18" fill="#2F9E78" />
      <path d="M168 150 l6 6 l11 -12" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="130" cy="182" rx="80" ry="7" fill="#EADFD4" />
    </svg>
  )
}
