import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { EmptyState, ErrorNote, PageHead } from '../components/Ui.jsx'
import { fmtSecs, fmtTotal } from '../format.js'

// Giá trị `type` phải khớp enum LeaderboardType ở BE
const TYPES = [
  { id: 'TOTAL_SCORE', label: 'Tổng điểm', hint: 'Xếp theo tổng điểm tích lũy.' },
  { id: 'PERFECT_COUNT', label: 'Hoàn hảo', hint: 'Xếp theo số ly đạt 100 điểm.' },
  { id: 'SPEEDRUN', label: 'Tốc độ', hint: 'Xếp theo ly 100 điểm pha nhanh nhất. Chỉ tính người đã từng đạt 100 điểm.' },
]
const LIMIT = 20
const MEDAL = { 1: 'gold', 2: 'silver', 3: 'bronze' }

export default function Leaderboard() {
  const { username } = useAuth()
  const [type, setType] = useState('TOTAL_SCORE')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setError('')
    setData(null)
    api.leaderboard(type, LIMIT).then((d) => alive && setData(d)).catch((e) => alive && setError(e.message))
    return () => { alive = false }
  }, [type])

  const cur = TYPES.find((t) => t.id === type)
  const mine = data?.myRank
  const inTop = mine && data.topPlayers.some((p) => p.userId === mine.userId)

  return (
    <div>
      <PageHead title="Bảng xếp hạng">{cur.hint}</PageHead>

      <div className="seg lb-tabs" role="radiogroup" aria-label="Tiêu chí xếp hạng">
        {TYPES.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={type === t.id} onClick={() => setType(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <ErrorNote className="mt">{error}</ErrorNote>}

      {!error && !data && (
        <div className="panel mt" aria-busy="true">
          <p className="sr-only">Đang tải bảng xếp hạng…</p>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton sk-row" />)}
        </div>
      )}

      {data && data.topPlayers.length === 0 && (
        <div className="mt">
          <EmptyState title="Chưa có ai trên bảng">
            {type === 'SPEEDRUN' ? 'Chưa có ai đạt 100 điểm. Hãy là người đầu tiên!' : 'Hoàn thành một lượt pha chế để lên bảng.'}
          </EmptyState>
        </div>
      )}

      {data && data.topPlayers.length > 0 && (
        <div className="panel flush mt">
          <div className="table-wrap">
            <table className="board">
              <thead>
                <tr>
                  <th>Hạng</th><th>Người chơi</th>
                  <th className="num">Tổng điểm</th><th className="num">Hoàn hảo</th><th className="num">Số lượt</th>
                  <th className="num">Điểm TB</th><th className="num">Nhanh nhất</th><th className="num">Tổng giờ chơi</th>
                </tr>
              </thead>
              <tbody>
                {data.topPlayers.map((p) => <Row key={p.userId} p={p} type={type} me={p.userId === mine?.userId || p.username === username} />)}
                {mine && !inTop && (
                  <>
                    <tr className="board-gap" aria-hidden="true"><td colSpan={8}>•••</td></tr>
                    <Row p={mine} type={type} me />
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && !mine && data.topPlayers.length > 0 && (
        <p className="muted small mt">
          {type === 'SPEEDRUN' ? 'Bạn chưa có ly 100 điểm nào nên chưa có hạng ở bảng này.' : 'Bạn chưa chơi lượt nào nên chưa có hạng.'}
        </p>
      )}
    </div>
  )
}

function Row({ p, type, me }) {
  const hl = (t) => (type === t ? 'hl' : '')
  return (
    <tr className={me ? 'me' : ''}>
      <td className="c-rank"><span className={`rank-badge ${MEDAL[p.rank] ?? ''}`}>{p.rank}</span></td>
      <td className="c-name"><b>{p.username}</b>{me && <span className="you">Bạn</span>}</td>
      <td className={`num ${hl('TOTAL_SCORE')}`} data-label="Tổng điểm">{p.totalScore}</td>
      <td className={`num ${hl('PERFECT_COUNT')}`} data-label="Hoàn hảo">{p.perfectPlays}</td>
      <td className="num" data-label="Số lượt">{p.totalPlays}</td>
      <td className="num" data-label="Điểm TB">{Number(p.avgScore).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</td>
      <td className={`num ${hl('SPEEDRUN')}`} data-label="Nhanh nhất">{fmtSecs(p.fastestPerfectSeconds)}</td>
      <td className="num" data-label="Giờ chơi">{fmtTotal(p.totalPlayTimeSeconds)}</td>
    </tr>
  )
}
