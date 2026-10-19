import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

export const display = { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }

export function useList(path) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!!path)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    if (!path) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const r = await api.get(path)
      setItems(Array.isArray(r.data) ? r.data : [])
      setError('')
    } catch (e) {
      setItems([])
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [path])
  useEffect(() => {
    reload()
  }, [reload])
  return { items, loading, error, reload }
}

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'transition duration-150 focus:border-[#0B7A75] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0B7A75]/10'

export function Notice({ ok, children }) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xs ${
        ok
          ? 'border-emerald-200 bg-emerald-50/90 text-emerald-900'
          : 'border-rose-200 bg-rose-50/90 text-rose-900'
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
          ok ? 'bg-emerald-600' : 'bg-rose-600'
        }`}
      >
        {ok ? '✓' : '!'}
      </span>
      <span>{children}</span>
    </div>
  )
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-b from-[#0D8A84] to-[#0B7A75] text-white shadow-sm shadow-[#0B7A75]/20 hover:from-[#0B7A75] hover:to-[#085E5A]'
      : variant === 'danger'
      ? 'border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100'
      : 'border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900'

  return (
    <button
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B7A75]/20 disabled:pointer-events-none disabled:opacity-50 ${styles} ${className}`}
    />
  )
}

const tones = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  red: 'bg-rose-50 text-rose-800 ring-rose-200',
}

const dotTones = {
  slate: 'bg-slate-400',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
  red: 'bg-rose-500',
}

export function Badge({ tone = 'slate', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        tones[tone] ?? tones.slate
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotTones[tone] ?? dotTones.slate}`} />
      {children}
    </span>
  )
}

export function PageHeader({ title, intro, badge, action }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
      <div>
        {badge && (
          <span className="mb-2 inline-block rounded-full bg-[#0B7A75]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#0B7A75] uppercase">
            {badge}
          </span>
        )}
        <h1 style={display} className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {intro && <p className="mt-1.5 max-w-2xl text-sm text-slate-500 sm:text-base">{intro}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </header>
  )
}

export function Empty({ title = 'Nothing here yet', children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p style={display} className="text-base font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">{children}</p>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-slate-200" />
                <div className="h-3 w-32 rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-6 w-24 rounded-full bg-slate-100" />
          </div>
          <div className="mt-5 flex gap-4">
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Drawer({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 style={display} className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

export function EntityForm({ fields, submitLabel, onSubmit }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, ''])))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setFieldErrors({})
    const payload = Object.fromEntries(
      fields.map((f) => {
        const v = values[f.name]
        return [f.name, f.numeric || f.type === 'number' ? (v === '' ? null : Number(v)) : v]
      })
    )
    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
      if (err.data && typeof err.data === 'object' && !Array.isArray(err.data)) setFieldErrors(err.data)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-700 uppercase">
            {f.label}
          </label>
          {f.options ? (
            <select
              id={f.name}
              className={inputCls}
              value={values[f.name]}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            >
              <option value="">Select…</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea
              id={f.name}
              rows={4}
              className={inputCls}
              placeholder={f.placeholder}
              value={values[f.name]}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            />
          ) : (
            <input
              id={f.name}
              className={inputCls}
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={values[f.name]}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            />
          )}
          {fieldErrors[f.name] && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{String(fieldErrors[f.name])}</p>
          )}
        </div>
      ))}
      {error && <Notice ok={false}>{error}</Notice>}
      <div className="pt-2">
        <Button type="submit" disabled={busy} className="w-full py-3">
          {busy ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}