import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Cup from '../components/Cup.jsx'
import { EmptyState, ErrorNote, PageHead } from '../components/Ui.jsx'
import { fmtSecs, fmtTotal } from '../format.js'

const R = 54
const C = 2 * Math.PI * R

// Danh hiệu tính ở phía FE từ điểm trung bình, chỉ để tạo cảm giác tiến bộ.
const RANKS = [
  { min: 90, name: 'Bậc thầy trà sữa' },
  { min: 75, name: 'Barista giỏi' },
  { min: 50, name: 'Barista' },
  { min: 0, name: 'Barista tập sự' },
]
const SHOWCASE = { teaType: 'BLACK_TEA', milkType: 'FRESH_MILK', sugarLevel: null, iceLevel: 'NO_ICE', topping: 'BLACK_PEARL' }

export default function Stats() {
  const [s, setS] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.statistics().then(setS).catch((e) => setError(e.message)) }, [])

  if (error) return <ErrorNote>{error}</ErrorNote>
  if (!s)
    return (
      <div aria-busy="true">
        <p className="sr-only">Đang tải thống kê…</p>
        <div className="skeleton sk-title" />
        <div className="skeleton sk-bento" />
      </div>
    )
  if (s.totalPlays === 0)
    return <EmptyState title="Chưa có thống kê">Hoàn thành một lượt pha chế để xem điểm của bạn.</EmptyState>

  const pct = Math.round((s.perfectPlays / s.totalPlays) * 100)
  const avg = Number(s.averageScore) || 0
  const avgText = avg.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
  const rank = RANKS.find((r) => avg >= r.min)

  return (
    <div>
      <PageHead title="Thống kê của bạn">Tổng hợp từ tất cả lượt pha chế.</PageHead>
      <div className="bento">
        <section className="tile tile-ring">
          <svg className="ring" viewBox="0 0 140 140" role="img" aria-label={`${pct}% lượt đạt 100 điểm`}>
            <circle className="ring-track" cx="70" cy="70" r={R} />
            <circle className="ring-bar" cx="70" cy="70" r={R} transform="rotate(-90 70 70)" strokeDasharray={C} style={{ '--len': C, '--off': C * (1 - pct / 100) }} />
            <text className="ring-num" x="70" y="80" textAnchor="middle">{pct}%</text>
          </svg>
          <h3>Lượt hoàn hảo</h3>
          <p className="muted">{s.perfectPlays} trên {s.totalPlays} lượt đạt 100 điểm.</p>
        </section>

        <section className="tile tile-rank">
          <div>
            <p className="tile-label">Danh hiệu</p>
            <h3 className="rank-name">{rank.name}</h3>
            <p>Điểm trung bình <b>{avgText}</b> / 100. Ly bên cạnh đầy theo điểm này.</p>
          </div>
          <Cup recipe={SHOWCASE} size="md" fill={Math.min(1, avg / 100)} badge={{ small: 'Trung bình', big: avgText }} />
        </section>

        <section className="tile">
          <p className="tile-label">Tổng lượt chơi</p>
          <p className="tile-num">{s.totalPlays}</p>
        </section>
        <section className="tile">
          <p className="tile-label">Điểm cao nhất</p>
          <p className="tile-num">{s.highestScore}<small>/100</small></p>
        </section>
        <section className="tile">
          <p className="tile-label">Tổng thời gian chơi</p>
          <p className="tile-num tile-num--sm">{fmtTotal(s.totalPlayTimeSeconds)}</p>
        </section>
        <section className="tile">
          <p className="tile-label">Thời gian TB mỗi ly</p>
          <p className="tile-num tile-num--sm">{fmtSecs(s.averageDurationSeconds)}</p>
        </section>
        <section className="tile tile-best">
          <p className="tile-label">Ly hoàn hảo nhanh nhất</p>
          {s.fastestPerfectSeconds != null
            ? <p className="tile-num tile-num--sm">{fmtSecs(s.fastestPerfectSeconds)}</p>
            : <p className="muted">Chưa có. Đạt 100 điểm để lập kỷ lục.</p>}
        </section>
      </div>
    </div>
  )
}
