import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import Cup from '../components/Cup.jsx'
import { FIELDS, RATING, labelOf, titleOf } from '../constants.js'

const EMPTY = { teaType: null, milkType: null, sugarLevel: null, iceLevel: null, topping: null }

export default function Play() {
  const [order, setOrder] = useState(null)
  const [recipe, setRecipe] = useState(EMPTY)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const nextOrder = useCallback(async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setRecipe(EMPTY)
    try {
      setOrder(await api.randomOrder())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { nextOrder() }, [nextOrder])

  const complete = FIELDS.every((f) => recipe[f.key] !== null)

  async function submit() {
    setBusy(true)
    setError('')
    try {
      setResult(await api.submit({ orderId: order.id, ...recipe }))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="muted">Đang lấy đơn hàng…</p>
  if (!order) return <ErrorBox error={error} retry={nextOrder} />

  return (
    <div className="play">
      <section className="order panel">
        <h2>Đơn #{order.id}: {order.name}</h2>
        <p className="muted">Pha đúng theo đơn này.</p>
        <Cup recipe={order} label="Đơn khách" />
        <dl className="spec">
          {FIELDS.map((f) => (
            <div key={f.key}><dt>{f.title}</dt><dd>{labelOf(f.key, order[f.key])}</dd></div>
          ))}
        </dl>
      </section>

      <section className="panel mix">
        <h2>Ly của bạn</h2>
        <div className="mix-grid">
          <Cup recipe={recipe} label="Ly của bạn" />
          <div className="fields">
            {FIELDS.map((f) => {
              const wrong = result?.details.find((d) => d.ingredient === f.key)
              return (
                <fieldset key={f.key} disabled={!!result}>
                  <legend>{f.title} <small>{f.points} điểm</small></legend>
                  <div className="chips">
                    {f.options.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={'chip' + (recipe[f.key] === o.value ? ' on' : '') + (wrong && recipe[f.key] === o.value ? (wrong.correct ? ' good' : ' bad') : '')}
                        aria-pressed={recipe[f.key] === o.value}
                        onClick={() => setRecipe({ ...recipe, [f.key]: o.value })}
                      >{o.label}</button>
                    ))}
                  </div>
                </fieldset>
              )
            })}
          </div>
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        {!result ? (
          <button className="btn big" disabled={!complete || busy} onClick={submit}>
            {busy ? 'Đang chấm điểm…' : complete ? 'Nộp ly trà' : 'Chọn đủ 5 thành phần để nộp'}
          </button>
        ) : (
          <Result result={result} onNext={nextOrder} />
        )}
      </section>
    </div>
  )
}

function Result({ result, onNext }) {
  const r = RATING[result.rating] ?? { label: result.rating, tone: 'ok' }
  return (
    <div className={`result ${r.tone}`} role="status">
      <div className="score"><b>{result.score}</b>/100 — {r.label}</div>
      <ul>
        {result.details.map((d) => (
          <li key={d.ingredient} className={d.correct ? 'good' : 'bad'}>
            <span>{titleOf(d.ingredient)}</span>
            <span>
              {d.correct
                ? `Đúng, +${d.earnedPoints}`
                : `Bạn chọn ${labelOf(d.ingredient, d.submitted)}, đơn cần ${labelOf(d.ingredient, d.expected)}`}
            </span>
          </li>
        ))}
      </ul>
      <button className="btn" onClick={onNext}>Nhận đơn mới</button>
    </div>
  )
}

function ErrorBox({ error, retry }) {
  return (
    <div className="panel">
      <p className="error">{error || 'Không lấy được đơn hàng.'}</p>
      <button className="btn" onClick={retry}>Thử lại</button>
    </div>
  )
}
