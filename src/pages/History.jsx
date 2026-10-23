import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Swatch from '../components/Swatch.jsx'
import { EmptyState, ErrorNote, PageHead } from '../components/Ui.jsx'
import { IconChevronLeft, IconChevronRight, IconTimer } from '../components/Icons.jsx'
import { FIELDS, RATING, labelOf } from '../constants.js'
import { fmtSecs } from '../format.js'

export default function History() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api.history(page, 10).then(setData).catch((e) => setError(e.message))
  }, [page])

  if (error) return <ErrorNote>{error}</ErrorNote>
  if (!data)
    return (
      <div className="panel" aria-busy="true">
        <p className="sr-only">Đang tải lịch sử…</p>
        <div className="skeleton sk-title" />
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton sk-row" />)}
      </div>
    )
  if (data.content.length === 0)
    return <EmptyState title="Chưa có lượt chơi nào">Hoàn thành một đơn ở tab Pha chế, kết quả sẽ hiện ở đây.</EmptyState>

  return (
    <div>
      <PageHead title="Lịch sử chơi">
        {data.totalElements != null ? `${data.totalElements} lượt pha chế gần đây của bạn.` : 'Các lượt pha chế gần đây của bạn.'}
      </PageHead>
      <div className="panel flush">
        <div className="table-wrap">
          <table className="history">
            <thead>
              <tr><th>Thời gian</th><th>Đơn</th><th>Thời gian pha</th><th>Công thức đã nộp</th><th>Điểm</th><th>Xếp loại</th></tr>
            </thead>
            <tbody>
              {data.content.map((h) => {
                const d = new Date(h.createdAt)
                const rating = RATING[h.rating]
                return (
                  <tr key={h.id}>
                    <td className="c-time">
                      <b>{d.toLocaleDateString('vi-VN')}</b>
                      <span>{d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="c-order">#{h.orderId}</td>
                    <td className="c-dur">
                      {h.durationSeconds > 0 ? <span><IconTimer size={14} />{fmtSecs(h.durationSeconds)}</span> : <span className="muted" title="Lượt chơi cũ chưa ghi thời gian">—</span>}
                    </td>
                    <td className="c-recipe">
                      <ul className="rtags">
                        {FIELDS.map((f) => (
                          <li key={f.key}><Swatch field={f.key} value={h[f.key]} size={20} />{labelOf(f.key, h[f.key])}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="c-score">
                      <span className="score-pill">
                        <b>{h.score}</b>
                        <i style={{ '--p': `${Math.max(0, Math.min(100, h.score))}%` }} />
                      </span>
                    </td>
                    <td className="c-rating"><span className={`tag ${rating?.tone}`}>{rating?.label ?? h.rating}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <button className="btn ghost" disabled={data.first} onClick={() => setPage(page - 1)}><IconChevronLeft size={18} />Trang trước</button>
          <span><span className="pg-word">Trang </span>{data.number + 1} / {Math.max(data.totalPages, 1)}</span>
          <button className="btn ghost" disabled={data.last} onClick={() => setPage(page + 1)}>Trang sau<IconChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  )
}
