// Giá trị phải khớp đúng với backend (xem bảng "Thành phần pha chế" trong README)
export const TEA = [
  { value: 'BLACK_TEA', label: 'Trà đen', color: '#8a4b2a' },
  { value: 'GREEN_TEA', label: 'Trà xanh', color: '#9bb86b' },
  { value: 'OOLONG_TEA', label: 'Trà ô long', color: '#c98a3d' },
]
export const MILK = [
  { value: 'FRESH_MILK', label: 'Sữa tươi' },
  { value: 'MILK_POWDER', label: 'Bột sữa' },
]
export const SUGAR = [0, 25, 50, 75, 100].map((v) => ({ value: v, label: `${v}%` }))
export const ICE = [
  { value: 'NO_ICE', label: 'Không đá' },
  { value: 'LESS', label: 'Ít đá' },
  { value: 'NORMAL', label: 'Đá thường' },
]
export const TOPPING = [
  { value: 'NONE', label: 'Không' },
  { value: 'BLACK_PEARL', label: 'Trân châu đen' },
  { value: 'WHITE_PEARL', label: 'Trân châu trắng' },
  { value: 'PUDDING', label: 'Pudding' },
]

export const FIELDS = [
  { key: 'teaType', title: 'Loại trà', options: TEA, points: 25 },
  { key: 'milkType', title: 'Loại sữa', options: MILK, points: 20 },
  { key: 'sugarLevel', title: 'Độ ngọt', options: SUGAR, points: 20 },
  { key: 'iceLevel', title: 'Lượng đá', options: ICE, points: 15 },
  { key: 'topping', title: 'Topping', options: TOPPING, points: 20 },
]

export const RATING = {
  PERFECT: { label: 'Hoàn hảo', tone: 'perfect' },
  GREAT: { label: 'Rất tốt', tone: 'great' },
  NEEDS_IMPROVEMENT: { label: 'Cần cải thiện', tone: 'ok' },
  FAILED: { label: 'Thất bại', tone: 'fail' },
}

export function labelOf(key, value) {
  const f = FIELDS.find((x) => x.key === key)
  const o = f?.options.find((x) => String(x.value) === String(value))
  return o ? (key === 'sugarLevel' ? `${o.label} đường` : o.label) : String(value)
}
export const titleOf = (key) => FIELDS.find((x) => x.key === key)?.title ?? key
