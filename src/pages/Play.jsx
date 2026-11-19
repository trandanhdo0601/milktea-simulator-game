import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { useCombo } from '../combo.js'
import { sfx, setSoundOn, useSoundOn } from '../sfx.js'
import Confetti from '../components/Confetti.jsx'
import Cup from '../components/Cup.jsx'
import Swatch from '../components/Swatch.jsx'
import { ErrorNote } from '../components/Ui.jsx'
import { IconCheck, IconCross, IconFlame, IconMute, IconRefresh, IconSound, IconTimer } from '../components/Icons.jsx'
import { FIELDS, RATING, labelOf, titleOf } from '../constants.js'
import { fmtSecs } from '../format.js'

const EMPTY = { teaType: null, milkType: null, sugarLevel: null, iceLevel: null, topping: null }
const MAX_POINTS = FIELDS.reduce((s, f) => s + f.points, 0)
const MODES = [
  { id: 'chill', label: 'Thư giãn', secs: 0 },
  { id: 'normal', label: 'Bình thường', secs: 30 },
  { id: 'rush', label: 'Giờ cao điểm', secs: 15 },
]
const MODE_KEY = 'mt_mode'
const secsOf = (id) => MODES.find((m) => m.id === id)?.secs ?? 0
const readMode = () => {
  try {
    const v = localStorage.getItem(MODE_KEY)
    return MODES.some((m) => m.id === v) ? v : 'normal'
  } catch {
    return 'normal'
  }
}
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Play() {
  const { username } = useAuth()
  const combo = useCombo(username)
  const soundOn = useSoundOn()

  const [order, setOrder] = useState(null)
  const [recipe, setRecipe] = useState(EMPTY)
  const [result, setResult] = useState(null)
  const [extra, setExtra] = useState(null) // { elapsed, cur, record, lost }
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [modeId, setModeId] = useState(readMode)
  const [limit, setLimit] = useState(0) // giây của đơn hiện tại, 0 = không giới hạn
  const [left, setLeft] = useState(null) // ms còn lại
  const [timedOut, setTimedOut] = useState(false)
  const [burst, setBurst] = useState(0)

  const modeRef = useRef(modeId)
  modeRef.current = modeId
  const recipeRef = useRef(recipe)
  recipeRef.current = recipe
  const orderRef = useRef(order)
  orderRef.current = order
  const startedAt = useRef(0)
  const expired = useRef(false)
  const timeUp = useRef(() => {})

  const nextOrder = useCallback(async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setExtra(null)
    setRecipe(EMPTY)
    setTimedOut(false)
    expired.current = false
    try {
      const o = await api.randomOrder()
      setLimit(secsOf(modeRef.current)) // chế độ mới chỉ áp dụng từ đơn này
      setOrder(o)
    } catch (e) {
      setOrder(null)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { nextOrder() }, [nextOrder])

  // Bắt đầu tính giờ khi đơn mới hiện ra (không tính thời gian chờ tải)
  useEffect(() => {
    if (!order) return
    startedAt.current = Date.now()
    setLeft(limit ? limit * 1000 : null)
  }, [order, limit])

  // Đồng hồ: dựa trên mốc thời gian tuyệt đối nên không bị lệch khi tab bị treo
  useEffect(() => {
    if (!order || !limit || result || timedOut || busy || expired.current) return
    const end = startedAt.current + limit * 1000
    const id = setInterval(() => {
      const rem = Math.max(0, end - Date.now())
      setLeft(rem)
      if (rem === 0) {
        clearInterval(id)
        timeUp.current()
      }
    }, 100)
    return () => clearInterval(id)
  }, [order, limit, result, timedOut, busy])

  // Tiếng tích tắc 5 giây cuối
  const secLeft = left == null ? null : Math.ceil(left / 1000)
  useEffect(() => {
    if (secLeft != null && secLeft > 0 && secLeft <= 5 && !result && !busy && !timedOut) sfx.tick()
  }, [secLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  const done = FIELDS.filter((f) => recipe[f.key] !== null).length
  const complete = done === FIELDS.length

  async function submit() {
    const o = orderRef.current
    if (!o) return
    const elapsed = (Date.now() - startedAt.current) / 1000
    // BE nhận durationSeconds trong khoảng 0..3600 (nếu vượt sẽ trả 400)
    const durationSeconds = Math.min(3600, Math.max(0, Math.round(elapsed * 100) / 100))
    setBusy(true)
    setError('')
    try {
      const res = await api.submit({ orderId: o.id, ...recipeRef.current, durationSeconds })
      const c = res.rating === 'PERFECT' ? combo.hit() : combo.miss()
      setExtra({ elapsed: res.durationSeconds ?? durationSeconds, ...c }) // ưu tiên số BE đã lưu
      setResult(res)
      sfx.rating(res.rating, c.cur)
      if (res.rating === 'PERFECT') setBurst((b) => b + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  // Hết giờ: nếu ly đã đủ 5 thành phần thì tự nộp, nếu chưa thì khách bỏ đi
  timeUp.current = () => {
    if (expired.current) return
    expired.current = true
    setLeft(0)
    if (FIELDS.every((f) => recipeRef.current[f.key] !== null)) {
      submit()
    } else {
      const c = combo.miss()
      setExtra({ elapsed: limit, ...c })
      setTimedOut(true)
      sfx.fail()
    }
  }

  function pick(key, value) {
    sfx.pick()
    setRecipe({ ...recipe, [key]: value })
  }

  function chooseMode(id) {
    setModeId(id)
    try { localStorage.setItem(MODE_KEY, id) } catch { /* bỏ qua */ }
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
      {burst > 0 && <Confetti key={burst} />}
      <aside className="play-order">
        <OrderTicket order={order} />
      </aside>

      <section className="panel bench">
        <header className="bench-head">
          <h2>Quầy pha chế</h2>
          <Progress done={done} total={FIELDS.length} />
        </header>

        <div className="bench-tools">
          <div className="seg" role="radiogroup" aria-label="Chế độ chơi">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={modeId === m.id}
                onClick={() => chooseMode(m.id)}
              >
                {m.label}{m.secs ? ` ${m.secs}s` : ''}
              </button>
            ))}
          </div>
          <div className="tools-right">
            <div className="combo" data-hot={combo.cur >= 2} title={`Kỷ lục: ${combo.best} ly hoàn hảo liên tiếp`}>
              <IconFlame size={16} />
              <span>Combo</span>
              <b key={combo.cur}>×{combo.cur}</b>
              <small>Kỷ lục {combo.best}</small>
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
              onClick={() => setSoundOn(!soundOn)}
            >
              {soundOn ? <IconSound size={18} /> : <IconMute size={18} />}
            </button>
          </div>
          {secsOf(modeId) !== limit && !result && (
            <p className="tools-hint muted small">Chế độ mới sẽ áp dụng từ đơn tiếp theo.</p>
          )}
        </div>

        <div className="bench-body">
          <div className="bench-cup">
            <Cup recipe={recipe} label="Ly của bạn" size="lg" />
          </div>

          <div className="steps">
            {FIELDS.map((f) => {
              const detail = result?.details.find((d) => d.ingredient === f.key)
              const picked = recipe[f.key] !== null
              return (
                <fieldset key={f.key} className="step" disabled={!!result || timedOut}>
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
                          onClick={() => pick(f.key, o.value)}
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
          {!result && !timedOut && limit > 0 && left != null && <Patience left={left} total={limit * 1000} />}
          {result ? (
            <Result result={result} extra={extra} onNext={nextOrder} />
          ) : timedOut ? (
            <TimeUp lost={extra?.lost ?? 0} onNext={nextOrder} />
          ) : (
            <button className="btn big" disabled={!complete || busy} onClick={submit}>
              {busy ? 'Đang chấm điểm…' : complete ? 'Nộp ly trà' : `Còn thiếu ${FIELDS.length - done} thành phần`}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

function Patience({ left, total }) {
  const pct = Math.max(0, Math.min(1, left / total))
  const secs = Math.ceil(left / 1000)
  const state = pct > 0.5 ? 'ok' : pct > 0.25 ? 'warn' : 'danger'
  return (
    <div className="patience" data-state={state}>
      <span className="patience-label"><IconTimer size={16} />Độ kiên nhẫn</span>
      <div
        className="patience-track"
        role="progressbar"
        aria-label="Thời gian còn lại"
        aria-valuemin={0}
        aria-valuemax={Math.round(total / 1000)}
        aria-valuenow={secs}
      >
        <i style={{ width: `${pct * 100}%` }} />
      </div>
      <b className="patience-num">{secs}s</b>
    </div>
  )
}

function TimeUp({ lost, onNext }) {
  return (
    <div className="result fail" role="status">
      <div className="result-head">
        <b className="timeup-title">Hết giờ!</b>
        <div className="stamp" aria-hidden="true">Khách bỏ đi</div>
      </div>
      <p className="result-blurb">
        Bạn chưa kịp nộp ly này nên đơn không được tính điểm.
        {lost >= 2 && ` Combo ×${lost} đã bị ngắt.`}
      </p>
      <button className="btn big" onClick={onNext}>Nhận đơn mới</button>
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

function Result({ result, extra, onNext }) {
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
      {extra && (
        <p className="result-meta">
          <span><IconTimer size={15} />{fmtSecs(extra.elapsed)}</span>
          {extra.cur >= 2 && <span className="hot"><IconFlame size={15} />Combo ×{extra.cur}</span>}
          {extra.record && extra.cur >= 2 && <span className="rec">Kỷ lục mới!</span>}
          {extra.lost >= 2 && <span className="lost">Combo ×{extra.lost} đã bị ngắt</span>}
        </p>
      )}
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
