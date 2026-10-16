import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Stats() {
  const [s, setS] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.statistics().then(setS).catch((e) => setError(e.message)) }, [])

  if (error) return <p className="error">{error}</p>
  if (!s) return <p className="muted">Đang tải thống kê…</p>
  if (s.totalPlays === 0)
    return <div className="panel"><h2>Chưa có thống kê</h2><p className="muted">Hoàn thành một lượt pha chế để xem điểm của bạn.</p></div>

  const pct = Math.round((s.perfectPlays / s.totalPlays) * 100)
  return (
    <div className="panel stats">
      <h2>Thống kê của bạn</h2>
      <dl>
        <div><dt>Tổng lượt chơi</dt><dd>{s.totalPlays}</dd></div>
        <div><dt>Điểm cao nhất</dt><dd>{s.highestScore}</dd></div>
        <div><dt>Điểm trung bình</dt><dd>{s.averageScore}</dd></div>
        <div><dt>Lượt hoàn hảo</dt><dd>{s.perfectPlays}</dd></div>
      </dl>
      <div className="meter" role="img" aria-label={`${pct}% lượt đạt 100 điểm`}>
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="muted">{pct}% lượt chơi đạt 100 điểm.</p>
    </div>
  )
}
