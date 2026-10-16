import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { RATING, labelOf } from '../constants.js'

export default function History() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api.history(page, 10).then(setData).catch((e) => setError(e.message))
  }, [page])

  if (error) return <p className="error">{error}</p>
  if (!data) return <p className="muted">Đang tải lịch sử…</p>
  if (data.content.length === 0)
    return <div className="panel"><h2>Chưa có lượt chơi nào</h2><p className="muted">Pha ly đầu tiên ở tab Pha chế để bắt đầu.</p></div>

  return (
    <div className="panel">
      <h2>Lịch sử chơi</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Thời gian</th><th>Đơn</th><th>Công thức đã nộp</th><th>Điểm</th><th>Xếp loại</th></tr>
          </thead>
          <tbody>
            {data.content.map((h) => (
              <tr key={h.id}>
                <td>{new Date(h.createdAt).toLocaleString('vi-VN')}</td>
                <td>#{h.orderId}</td>
                <td className="recipe">
                  {labelOf('teaType', h.teaType)}, {labelOf('milkType', h.milkType)}, {labelOf('sugarLevel', h.sugarLevel)}, {labelOf('iceLevel', h.iceLevel)}, {labelOf('topping', h.topping)}
                </td>
                <td><b>{h.score}</b></td>
                <td><span className={`tag ${RATING[h.rating]?.tone}`}>{RATING[h.rating]?.label ?? h.rating}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <button className="btn ghost" disabled={data.first} onClick={() => setPage(page - 1)}>Trang trước</button>
        <span>Trang {data.number + 1} / {Math.max(data.totalPages, 1)}</span>
        <button className="btn ghost" disabled={data.last} onClick={() => setPage(page + 1)}>Trang sau</button>
      </div>
    </div>
  )
}
