// Backend base URL. Set VITE_API_URL in .env (see .env.example); defaults to local Spring Boot.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, data) {
    super(message)
    this.data = data // field-level errors from the validation handler, if any
  }
}

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...options })
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running on port 8080.')
  }
  let body = null
  try { body = await res.json() } catch { /* empty or non-JSON body */ }
  if (!res.ok || body?.success === false) {
    throw new ApiError(body?.message || `Request failed (${res.status}).`, body?.data)
  }
  return body // { message, success, data }
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
}