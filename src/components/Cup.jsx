import { useId } from 'react'
import { TEA } from '../constants.js'

const INK = '#2b1650'
const BODY = 'M44 76 L156 76 L142 254 Q140.5 268 126 268 L74 268 Q59.5 268 58 254 Z'

const BEAD_ROWS = [
  { y: 256, xs: [66, 79.6, 93.2, 106.8, 120.4, 134] },
  { y: 244, xs: [72.8, 86.4, 100, 113.6, 127.2] },
  { y: 232, xs: [79.6, 93.2, 106.8, 120.4] },
]
const PUDDING = [[64, 240], [88, 240], [112, 240], [76, 218], [100, 218]]
// [x, y, cạnh, góc xoay]
const ICE = [[66, 98, 24, -12], [102, 94, 26, 10], [80, 134, 24, 16], [116, 136, 24, -8], [98, 176, 24, 6]]

/**
 * Ly trà sữa SVG, đổi màu / đá / topping theo công thức.
 * - size: 'sm' | 'md' | 'lg'
 * - fill: mức nước 0..1 (mặc định đầy)
 * - badge: nhãn dán trên ly. Mặc định hiển thị độ ngọt; truyền false để ẩn,
 *   hoặc { small, big } để tuỳ biến.
 */
export default function Cup({ recipe, label, size = 'md', fill = 1, badge }) {
  const { teaType, milkType, sugarLevel, iceLevel, topping } = recipe
  const uid = useId().replace(/:/g, '')
  const tea = TEA.find((t) => t.value === teaType)?.color
  const milk = milkType === 'FRESH_MILK' ? 0.55 : milkType === 'MILK_POWDER' ? 0.36 : 0
  const iceCount = iceLevel === 'NORMAL' ? 5 : iceLevel === 'LESS' ? 2 : 0
  const surface = 268 - Math.max(0, Math.min(1, fill)) * 172
  const wave = `M30 ${surface} q20 -7 40 0 t40 0 t40 0 t40 0 V290 H30 Z`
  const hasLiquid = !!tea || milk > 0
  const sticker =
    badge === false ? null : badge ?? { small: 'Đường', big: sugarLevel == null ? '–' : `${sugarLevel}%` }
  const pearl = topping === 'BLACK_PEARL' || topping === 'WHITE_PEARL'

  return (
    <figure className={`cup cup--${size}`}>
      <svg viewBox="0 0 200 294" role="img" aria-label={label ? `Ly ${label}` : 'Ly trà sữa'}>
        <defs>
          <clipPath id={`clip-${uid}`}>
            <path d={BODY} />
          </clipPath>
          <linearGradient id={`shade-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".16" />
            <stop offset="1" stopColor="#000" stopOpacity=".16" />
          </linearGradient>
          <radialGradient id={`bp-${uid}`} cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#5b3d3d" />
            <stop offset="1" stopColor="#1d1010" />
          </radialGradient>
          <radialGradient id={`wp-${uid}`} cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#eadfc6" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="284" rx="52" ry="6" fill={INK} opacity=".14" />

        {/* thân ly (kính) */}
        <path d={BODY} fill="#fff" fillOpacity=".6" />

        <g clipPath={`url(#clip-${uid})`}>
          {hasLiquid && (
            <g key={tea ? teaType : 'milk'} className="cup-liquid">
              <path d={wave} fill={tea ?? '#f4ecda'} />
              {tea && milk > 0 && <path key={milkType} className="cup-milk" d={wave} fill="#fff8ee" opacity={milk} />}
              <path d={wave} fill={`url(#shade-${uid})`} />
            </g>
          )}

          {ICE.slice(0, iceCount).map(([x, y, s, r], i) => (
            <g key={`${iceLevel}-${i}`} className="cup-ice" style={{ animationDelay: `${i * 50}ms` }}>
              <g transform={`rotate(${r} ${x + s / 2} ${y + s / 2})`}>
                <rect x={x} y={y} width={s} height={s} rx="6" fill="#fff" fillOpacity=".4" stroke="#fff" strokeOpacity=".9" strokeWidth="2" />
                <path d={`M${x + 5} ${y + 7}h${s * 0.36}`} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".9" />
              </g>
            </g>
          ))}

          {pearl && (
            <g key={topping}>
              {BEAD_ROWS.flatMap((row, ri) =>
                row.xs.map((cx, i) => (
                  <g key={`${ri}-${i}`} className="cup-bead" style={{ animationDelay: `${(ri * 6 + i) * 22}ms` }}>
                    <circle cx={cx} cy={row.y} r="6.6" fill={`url(#${topping === 'BLACK_PEARL' ? 'bp' : 'wp'}-${uid})`} stroke={INK} strokeOpacity=".35" strokeWidth="1" />
                    <circle cx={cx - 2.2} cy={row.y - 2.4} r="1.7" fill="#fff" opacity={topping === 'BLACK_PEARL' ? 0.5 : 0.95} />
                  </g>
                ))
              )}
            </g>
          )}

          {topping === 'PUDDING' && (
            <g key="pudding">
              {PUDDING.map(([x, y], i) => (
                <g key={i} className="cup-bead" style={{ animationDelay: `${i * 60}ms` }}>
                  <rect x={x} y={y} width="22" height="22" rx="6" fill="#f7cf6a" stroke={INK} strokeOpacity=".5" strokeWidth="1.5" />
                  <rect x={x + 3} y={y + 3} width="16" height="6" rx="3" fill="#c07a2c" opacity=".85" />
                </g>
              ))}
            </g>
          )}
        </g>

        {/* nắp + ống hút */}
        <path d="M42 76 C42 52 70 40 100 40 C130 40 158 52 158 76 Z" fill="#fff" fillOpacity=".78" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <rect x="34" y="70" width="132" height="12" rx="6" fill={INK} />
        <line x1="126" y1="4" x2="96" y2="250" stroke={INK} strokeWidth="12" strokeLinecap="round" />
        <line x1="126" y1="4" x2="96" y2="250" stroke="#ff5c8f" strokeWidth="7" strokeLinecap="round" />
        <path d="M124.4 16 122 36" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />

        <path d={BODY} fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M54 94 L61 228" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".55" />

        {sticker && (
          <g transform="translate(100 170) rotate(-4)">
            <rect x="-33" y="-21" width="66" height="42" rx="10" fill="#fffcf3" stroke={INK} strokeWidth="2.5" />
            <text x="0" y="-6" textAnchor="middle" fontSize="10" fontWeight="600" fill="#645878">{sticker.small}</text>
            <text x="0" y="13" textAnchor="middle" fontSize={String(sticker.big).length > 4 ? 15 : 20} fontWeight="800" fill={INK} style={{ fontFamily: 'var(--font-display)' }}>
              {sticker.big}
            </text>
          </g>
        )}
      </svg>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  )
}
