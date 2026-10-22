// Âm thanh tổng hợp bằng Web Audio API: không cần file mp3, không tăng dung lượng bundle.
import { useSyncExternalStore } from 'react'

const KEY = 'mt_sound'
const listeners = new Set()
let ctx = null
let enabled = (() => {
  try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
})()

export function setSoundOn(on) {
  enabled = on
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* bỏ qua */ }
  listeners.forEach((fn) => fn())
}
export function useSoundOn() {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
    () => enabled,
  )
}

function audio() {
  if (!enabled) return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx ??= new AC()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/** Phát một nốt. `at` = độ trễ (giây), `to` = tần số đích (trượt cao độ). */
function tone(freq, at, dur, { type = 'sine', vol = 0.12, to } = {}) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + at
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.03)
}

const NOTE = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, A4: 440, D5: 587.33 }

export const sfx = {
  pick: () => tone(720, 0, 0.07, { type: 'triangle', vol: 0.09, to: 980 }),
  tick: () => tone(880, 0, 0.05, { type: 'square', vol: 0.04 }),
  perfect: () => [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => tone(f, i * 0.09, 0.22, { type: 'triangle', vol: 0.13 })),
  good: () => [NOTE.E5, NOTE.G5].forEach((f, i) => tone(f, i * 0.1, 0.2, { type: 'triangle', vol: 0.11 })),
  bad: () => [NOTE.D5, NOTE.A4].forEach((f, i) => tone(f, i * 0.12, 0.22, { type: 'sine', vol: 0.12 })),
  fail: () => tone(220, 0, 0.45, { type: 'sawtooth', vol: 0.07, to: 110 }),
  combo: (n) => {
    const base = 600 + Math.min(n, 8) * 60
    tone(base, 0, 0.1, { type: 'square', vol: 0.05 })
    tone(base * 1.5, 0.08, 0.16, { type: 'square', vol: 0.05 })
  },
  rating(rating, combo = 0) {
    if (rating === 'PERFECT') {
      this.perfect()
      if (combo >= 2) setTimeout(() => this.combo(combo), 420)
    } else if (rating === 'GREAT') this.good()
    else if (rating === 'NEEDS_IMPROVEMENT') this.bad()
    else this.fail()
  },
}
