import { useEffect, useMemo, useState } from 'react'

const COLORS = ['#d62a68', '#ffcf5c', '#6d4cc9', '#2f7d3c', '#ffffff', '#ff8fb3']
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Pháo giấy rơi khi pha ly hoàn hảo. Dùng `key={lượt}` để bắn lại mỗi lần. */
export default function Confetti({ count = 44 }) {
  const [alive, setAlive] = useState(true)
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: `${Math.round(Math.random() * 100)}%`,
        dx: `${Math.round((Math.random() - 0.5) * 220)}px`,
        r: `${Math.round(360 + Math.random() * 540)}deg`,
        d: `${Math.round(Math.random() * 350)}ms`,
        c: COLORS[i % COLORS.length],
      })),
    [count],
  )
  useEffect(() => {
    const t = setTimeout(() => setAlive(false), 2600)
    return () => clearTimeout(t)
  }, [])
  if (!alive || reduce()) return null
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ '--x': p.x, '--dx': p.dx, '--r': p.r, '--d': p.d, '--c': p.c }} />
      ))}
    </div>
  )
}
