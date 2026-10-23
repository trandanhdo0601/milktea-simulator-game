// Định dạng thời gian (giây) cho các trang dùng dữ liệu durationSeconds từ BE.
const num = (v, d = 1) => Number(v).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d })

/** 4.85 -> "4,9s" · null/undefined -> "—" */
export const fmtSecs = (s) => (s == null || Number.isNaN(Number(s)) ? '—' : `${num(s)}s`)

/** Tổng thời gian: 92.4 -> "1p 32s" · 3725 -> "1g 2p" · < 60s -> "42,3s" */
export function fmtTotal(s) {
  const t = Number(s)
  if (!Number.isFinite(t) || t <= 0) return '0s'
  if (t < 60) return `${num(t)}s`
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = Math.round(t % 60)
  return h > 0 ? `${h}g ${m}p` : `${m}p ${sec}s`
}
