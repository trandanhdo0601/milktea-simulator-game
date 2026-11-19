import { useCallback, useRef, useState } from 'react'

// Combo = số ly HOÀN HẢO liên tiếp. Lưu theo từng tài khoản trong localStorage.
const key = (u) => `mt_combo_${u || 'guest'}`

function load(u) {
  try {
    const o = JSON.parse(localStorage.getItem(key(u)))
    return { cur: o?.cur | 0, best: o?.best | 0 }
  } catch {
    return { cur: 0, best: 0 }
  }
}

export function useCombo(username) {
  const [state, setState] = useState(() => load(username))
  const ref = useRef(state)

  const commit = useCallback((next) => {
    ref.current = next
    setState(next)
    try { localStorage.setItem(key(username), JSON.stringify(next)) } catch { /* bỏ qua */ }
  }, [username])

  /** Ly hoàn hảo: tăng combo. Trả về combo mới và có phá kỷ lục không. */
  const hit = useCallback(() => {
    const cur = ref.current.cur + 1
    const best = Math.max(ref.current.best, cur)
    const record = best > ref.current.best
    commit({ cur, best })
    return { cur, record, lost: 0 }
  }, [commit])

  /** Ly chưa hoàn hảo / hết giờ: ngắt combo. Trả về combo vừa mất. */
  const miss = useCallback(() => {
    const lost = ref.current.cur
    commit({ cur: 0, best: ref.current.best })
    return { cur: 0, record: false, lost }
  }, [commit])

  return { ...state, hit, miss }
}
