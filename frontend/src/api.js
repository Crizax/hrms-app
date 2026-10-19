// Backend base URL. Set VITE_API_URL in .env (see .env.example); defaults to local Spring Boot.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')
export const AUTH_STORAGE_KEY = 'hrms-auth'

export class ApiError extends Error {
  constructor(message, data, status) {
    super(message)
    this.data = data // field-level errors from the validation handler, if any
    this.status = status
  }
}

function getStoredToken() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw)?.token : null
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const token = getStoredToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  let res
  try {
    res = await fetch(BASE + path, { ...options, headers })
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running on port 8080.')
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    /* empty or non-JSON body */
  }

  const isLogicalError = body?.success === false || body?.succes === false

  if (!res.ok || isLogicalError) {
    // Handle GlobalExceptionHandler maps: { error: "..." } or { fieldName: "must not be blank" }
    const isFieldMap =
      body && typeof body === 'object' && !('succes' in body) && !('success' in body) && !('error' in body)
    const message =
      body?.message ||
      body?.error ||
      (isFieldMap ? 'Please fix the highlighted fields.' : null) ||
      (res.status === 401 ? 'Please sign in to continue.' : null) ||
      (res.status === 403 ? 'You do not have permission to perform this action.' : null) ||
      `Request failed (${res.status}).`

    throw new ApiError(message, isFieldMap ? body : body?.data, res.status)
  }

  return body // { message, succes/success, data }
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', ...(data ? { body: JSON.stringify(data) } : {}) }),
}