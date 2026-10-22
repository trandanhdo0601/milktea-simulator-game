import { TEA } from '../constants.js'

const INK = '#2b1650'
const line = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round', strokeLinecap: 'round' }

const NoneMark = () => (
  <>
    <circle cx="20" cy="20" r="12" fill="none" stroke={INK} strokeWidth="2.2" strokeDasharray="3.5 3.5" opacity=".55" />
    <path d="M12 28 28 12" stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
  </>
)

const IceCube = ({ x, y, s = 15, r = 0 }) => (
  <g transform={`rotate(${r} ${x + s / 2} ${y + s / 2})`}>
    <rect x={x} y={y} width={s} height={s} rx="4" fill="#e6f5ff" {...line} />
    <path d={`M${x + 3.5} ${y + 5.5}h${s * 0.35}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </g>
)

const Pearl = ({ cx, cy, dark }) => (
  <g>
    <circle cx={cx} cy={cy} r="6" fill={dark ? '#3a2323' : '#fffaf0'} {...line} />
    <circle cx={cx - 2} cy={cy - 2} r="1.5" fill="#fff" opacity={dark ? 0.55 : 0.9} />
  </g>
)

function shape(field, value) {
  switch (field) {
    case 'teaType': {
      const color = TEA.find((t) => t.value === value)?.color ?? '#d9d4e4'
      return (
        <>
          <path d="M20 5C20 5 8 18 8 25a12 12 0 0 0 24 0C32 18 20 5 20 5Z" fill={color} {...line} />
          <path d="M14 26a6 6 0 0 0 4 5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
        </>
      )
    }
    case 'milkType':
      return value === 'FRESH_MILK' ? (
        <>
          <path d="M16 6h8v6c4 3 6 5 6 10v12a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V22c0-5 2-7 6-10Z" fill="#fffaf2" {...line} />
          <rect x="11.5" y="22" width="17" height="9" rx="2" fill="#bfe0f5" />
        </>
      ) : (
        <>
          <path d="M7 31Q8 20 20 13Q32 20 33 31Z" fill="#fff4e0" {...line} />
          <circle cx="15" cy="26" r="1.3" fill="#e4cfa6" />
          <circle cx="22" cy="23" r="1.3" fill="#e4cfa6" />
          <circle cx="25" cy="28" r="1.3" fill="#e4cfa6" />
          <rect x="5" y="30" width="30" height="6" rx="3" fill="#9ad0f0" {...line} />
        </>
      )
    case 'sugarLevel': {
      const p = Math.max(0, Math.min(1, Number(value) / 100))
      return (
        <>
          <rect x="8" y="8" width="24" height="24" rx="6" fill="#fff" {...line} />
          {p > 0 ? (
            <rect x="11.5" y={11.5 + 17 * (1 - p)} width="17" height={17 * p} rx="2.5" fill="#ff8fb1" />
          ) : (
            <path d="M13 27 27 13" stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
          )}
        </>
      )
    }
    case 'iceLevel':
      if (value === 'NO_ICE') return <NoneMark />
      if (value === 'LESS') return <IceCube x={11} y={11} s={18} r={10} />
      return (
        <>
          <IceCube x={6} y={17} s={15} r={-8} />
          <IceCube x={19} y={9} s={15} r={10} />
          <IceCube x={14} y={22} s={15} r={4} />
        </>
      )
    case 'topping':
      if (value === 'BLACK_PEARL' || value === 'WHITE_PEARL') {
        const dark = value === 'BLACK_PEARL'
        return (
          <>
            <Pearl cx={13} cy={26} dark={dark} />
            <Pearl cx={27} cy={26} dark={dark} />
            <Pearl cx={20} cy={14} dark={dark} />
          </>
        )
      }
      if (value === 'PUDDING')
        return (
          <>
            <rect x="9" y="10" width="22" height="22" rx="6" fill="#f7cf6a" {...line} />
            <rect x="12" y="13" width="16" height="6" rx="3" fill="#c07a2c" />
          </>
        )
      return <NoneMark />
    default:
      return null
  }
}

/** Icon nhỏ minh hoạ từng lựa chọn (loại trà, sữa, đường, đá, topping). */
export default function Swatch({ field, value, size = 34 }) {
  return (
    <svg className="swatch" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {shape(field, value)}
    </svg>
  )
}
