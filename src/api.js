const BASE = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'mt_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn)

/** Gọi API, bóc ApiResponse { success, message, data } và trả về data. */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new Error('Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy ở cổng 8080 chưa.')
  }

  const json = await res.json().catch(() => null)

  // Backend hiện trả 403 (không phải 401) khi thiếu/hết hạn token
  if (auth && token && (res.status === 401 || res.status === 403)) {
    onUnauthorized()
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Lỗi ${res.status}`)
  }
  return json?.data ?? json
}

export const api = {
  register: (b) => request('/api/auth/register', { method: 'POST', body: b, auth: false }),
  login: (b) => request('/api/auth/login', { method: 'POST', body: b, auth: false }),
  randomOrder: () => request('/api/game/orders/random'),
  orderById: (id) => request(`/api/game/orders/${id}`),
  submit: (b) => request('/api/game/submit', { method: 'POST', body: b }),
  history: (page = 0, size = 10) => request(`/api/game/history?page=${page}&size=${size}`),
  statistics: () => request('/api/game/statistics'),
  // type: TOTAL_SCORE | PERFECT_COUNT | SPEEDRUN, limit: 1..100 (BE mặc định 20)
  leaderboard: (type = 'TOTAL_SCORE', limit = 20) =>
    request(`/api/game/leaderboard?type=${encodeURIComponent(type)}&limit=${limit}`),
}
