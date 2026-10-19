import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import Cup from '../components/Cup.jsx'
import Swatch from '../components/Swatch.jsx'
import { ErrorNote } from '../components/Ui.jsx'
import { IconCheck, IconCross, IconRefresh } from '../components/Icons.jsx'
import { FIELDS, RATING, labelOf, titleOf } from '../constants.js'

const EMPTY = { teaType: null, milkType: null, sugarLevel: null, iceLevel: null, topping: null }
const MAX_POINTS = FIELDS.reduce((s, f) => s + f.points, 0)
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

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

  const done = FIELDS.filter((f) => recipe[f.key] !== null).length
  const complete = done === FIELDS.length

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

  if (loading)
    return (
      <div className="play" aria-busy="true">
        <p className="sr-only">Đang lấy đơn hàng…</p>
        <div className="skeleton sk-ticket" />
        <div className="skeleton sk-bench" />
      </div>
    )
  if (!order) return <ErrorBox error={error} retry={nextOrder} />

  return (
    <div className="play">
      <aside className="play-order">
        <OrderTicket order={order} />
      </aside>

      <section className="panel bench">
        <header className="bench-head">
          <h2>Quầy pha chế</h2>
          <Progress done={done} total={FIELDS.length} />
        </header>

        <div className="bench-body">
          <div className="bench-cup">
            <Cup recipe={recipe} label="Ly của bạn" size="lg" />
          </div>

          <div className="steps">
            {FIELDS.map((f) => {
              const detail = result?.details.find((d) => d.ingredient === f.key)
              const picked = recipe[f.key] !== null
              return (
                <fieldset key={f.key} className="step" disabled={!!result}>
                  <legend>
                    <span className="step-head">
                      <span className="step-title">{f.title}</span>
                      <span className="pts">{f.points} điểm</span>
                      {picked && !result && <span className="step-ok" aria-hidden="true"><IconCheck size={14} /></span>}
                    </span>
                  </legend>
                  <div className="opts" data-n={f.options.length} style={{ '--n': f.options.length }}>
                    {f.options.map((o) => {
                      const on = recipe[f.key] === o.value
                      const cls =
                        'opt' +
                        (on ? ' on' : '') +
                        (detail && on ? (detail.correct ? ' good' : ' bad') : '') +
                        (detail && !detail.correct && String(o.value) === String(detail.expected) ? ' expected' : '')
                      return (
                        <button
                          key={o.value}
                          type="button"
                          className={cls}
                          aria-pressed={on}
                          onClick={() => setRecipe({ ...recipe, [f.key]: o.value })}
                        >
                          <Swatch field={f.key} value={o.value} size={f.key === 'sugarLevel' ? 30 : 34} />
                          <span>{o.label}</span>
                          {on && (
                            <span className="opt-check" aria-hidden="true">
                              {detail && !detail.correct ? <IconCross size={12} /> : <IconCheck size={12} />}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              )
            })}
          </div>
        </div>

        {error && <ErrorNote className="mt">{error}</ErrorNote>}

        <div className="bench-foot">
          {!result ? (
            <button className="btn big" disabled={!complete || busy} onClick={submit}>
              {busy ? 'Đang chấm điểm…' : complete ? 'Nộp ly trà' : `Còn thiếu ${FIELDS.length - done} thành phần`}
            </button>
          ) : (
            <Result result={result} onNext={nextOrder} />
          )}
        </div>
      </section>
    </div>
  )
}

function Progress({ done, total }) {
  return (
    <div className="progress" role="img" aria-label={`Đã chọn ${done} trên ${total} thành phần`}>
      <div className="progress-bar">
        {Array.from({ length: total }, (_, i) => <i key={i} className={i < done ? 'on' : ''} />)}
      </div>
      <span>{done}/{total}</span>
    </div>
  )
}

/** Phiếu order của khách, trình bày như hóa đơn dán trên quầy. */
function OrderTicket({ order }) {
  return (
    <article className="ticket" aria-label={`Đơn số ${order.id}`}>
      <div className="ticket-top">
        <span className="ticket-no">Đơn #{order.id}</span>
        <span className="ticket-note">Khách đang chờ</span>
      </div>
      <div className="ticket-body">
        <h2 className="ticket-name">{order.name}</h2>
        <p className="muted small">Pha đúng theo đơn này.</p>
        <Cup recipe={order} size="sm" label="Đơn khách" />
        <div className="ticket-cut" aria-hidden="true" />
        <dl className="ticket-spec">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <dt><Swatch field={f.key} value={order[f.key]} size={26} />{f.title}</dt>
              <span className="leader" aria-hidden="true" />
              <dd>{labelOf(f.key, order[f.key])}</dd>
            </div>
          ))}
        </dl>
        <p className="ticket-total"><span>Điểm tối đa</span><b>{MAX_POINTS}</b></p>
      </div>
    </article>
  )
}

function useCountUp(target, ms = 700) {
  const [v, setV] = useState(reduceMotion() ? target : 0)
  useEffect(() => {
    if (reduceMotion()) { setV(target); return }
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

function Result({ result, onNext }) {
  const r = RATING[result.rating] ?? { label: result.rating, tone: 'ok', blurb: '' }
  const score = useCountUp(result.score)
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest' })
  }, [])
  return (
    <div className={`result ${r.tone}`} role="status" ref={ref}>
      <div className="result-head">
        <div className="result-score">
          <span className="sr-only">{result.score} trên 100 điểm. {r.label}.</span>
          <b aria-hidden="true">{score}</b>
          <span aria-hidden="true">/100</span>
        </div>
        <div className="stamp" aria-hidden="true">{r.label}</div>
      </div>
      {r.blurb && <p className="result-blurb">{r.blurb}</p>}
      <ul className="result-list">
        {result.details.map((d) => (
          <li key={d.ingredient} className={d.correct ? 'good' : 'bad'}>
            <span className="mark" aria-hidden="true">{d.correct ? <IconCheck size={13} /> : <IconCross size={13} />}</span>
            <span className="result-what">{titleOf(d.ingredient)}</span>
            <span className="result-detail">
              {d.correct
                ? `Đúng, +${d.earnedPoints}`
                : `Bạn chọn ${labelOf(d.ingredient, d.submitted)}, đơn cần ${labelOf(d.ingredient, d.expected)}`}
            </span>
          </li>
        ))}
      </ul>
      <button className="btn big" onClick={onNext}>Nhận đơn mới</button>
    </div>
  )
}

function ErrorBox({ error, retry }) {
  return (
    <div className="panel empty">
      <div>
        <ErrorNote>{error || 'Không lấy được đơn hàng.'}</ErrorNote>
        <button className="btn mt" onClick={retry}><IconRefresh size={18} />Thử lại</button>
      </div>
    </div>
  )
}
