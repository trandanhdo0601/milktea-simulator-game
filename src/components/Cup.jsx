import { TEA } from '../constants.js'

/** Ly trà sữa SVG: đổi màu/đá/topping theo lựa chọn hiện tại. */
export default function Cup({ recipe, label }) {
  const { teaType, milkType, sugarLevel, iceLevel, topping } = recipe
  const tea = TEA.find((t) => t.value === teaType)?.color ?? '#d9d4e4'
  const milkOpacity = milkType === 'FRESH_MILK' ? 0.5 : milkType === 'MILK_POWDER' ? 0.32 : 0
  const ice = iceLevel === 'NORMAL' ? 5 : iceLevel === 'LESS' ? 2 : 0
  const iceSpots = [[78, 108, 14], [112, 96, 16], [96, 142, 13], [124, 138, 15], [76, 168, 14]].slice(0, ice)
  const id = label.replace(/\W/g, '') || 'cup'

  const beads = []
  if (topping === 'BLACK_PEARL' || topping === 'WHITE_PEARL') {
    const fill = topping === 'BLACK_PEARL' ? '#2a1a1a' : '#f6f1e7'
    for (let i = 0; i < 11; i++) {
      const row = Math.floor(i / 5)
      beads.push(<circle key={i} cx={68 + (i % 5) * 16 + (row % 2) * 8} cy={246 - row * 14} r="7" fill={fill} stroke="#00000022" />)
    }
  } else if (topping === 'PUDDING') {
    for (let i = 0; i < 3; i++)
      beads.push(<rect key={i} x={68 + i * 24} y={226 + (i % 2) * 8} width="22" height="22" rx="6" fill="#f2c85b" stroke="#a9792a55" />)
  }

  return (
    <figure className="cup">
      <svg viewBox="0 0 200 290" role="img" aria-label={`Ly ${label}`}>
        <defs>
          <clipPath id={`c-${id}`}>
            <path d="M42 64 L158 64 L144 252 Q142 264 130 264 L70 264 Q58 264 56 252 Z" />
          </clipPath>
        </defs>
        <line x1="112" y1="6" x2="132" y2="64" stroke="#e86a92" strokeWidth="7" strokeLinecap="round" />
        <g clipPath={`url(#c-${id})`}>
          <rect x="30" y="76" width="140" height="200" fill={tea} />
          <rect x="30" y="76" width="140" height="200" fill="#fffaf5" opacity={milkOpacity} />
          {iceSpots.map(([x, y, s], i) => (
            <rect key={i} x={x} y={y} width={s * 1.6} height={s * 1.6} rx="4" fill="#fff" opacity="0.5" transform={`rotate(${i * 17 - 20} ${x} ${y})`} />
          ))}
          {beads}
        </g>
        <path d="M42 64 L158 64 L144 252 Q142 264 130 264 L70 264 Q58 264 56 252 Z" fill="none" stroke="#2b1d2e" strokeWidth="4" strokeLinejoin="round" />
        <rect x="36" y="54" width="128" height="14" rx="7" fill="#2b1d2e" />
      </svg>
      <figcaption>
        <strong>{label}</strong>
        {sugarLevel != null && <span>Đường {sugarLevel}%</span>}
      </figcaption>
    </figure>
  )
}
