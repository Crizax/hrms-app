import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

export const display = { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }

/** Palette: ink #17233A, muted #627085, line #DDE3EA, page #F3F5F7, primary teal #0B7A75 */
export function useList(path) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!!path)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    if (!path) { setItems([]); setLoading(false); return }
    setLoading(true)
    try {
      const r = await api.get(path)
      setItems(Array.isArray(r.data) ? r.data : [])
      setError('')
    } catch (e) {
      setItems([]); setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [path])
  useEffect(() => { reload() }, [reload])
  return { items, loading, error, reload }
}

export const inputCls =
  'w-full rounded-md border border-[#CBD3DC] bg-white px-3 py-2 text-sm text-[#17233A] placeholder:text-[#9AA5B4] ' +
  'focus:border-[#0B7A75] focus:outline-none focus:ring-2 focus:ring-[#0B7A75]/30'

export function Notice({ ok, children }) {
  return (
    <p role="status" className={`rounded-md px-3 py-2 text-sm ${ok ? 'bg-[#DDF1E4] text-[#17603A]' : 'bg-[#F8E1DE] text-[#8C2820]'}`}>
      {children}
    </p>
  )
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = variant === 'primary'
    ? 'bg-[#0B7A75] text-white hover:bg-[#096560]'
    : 'border border-[#CBD3DC] bg-white text-[#17233A] hover:bg-[#F3F5F7]'
  return (
    <button
      {...props}
      className={`rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7A75]/50 disabled:opacity-50 ${styles} ${className}`}
    />
  )
}

const tones = {
  slate: 'bg-[#E8ECF1] text-[#44536A]',
  amber: 'bg-[#FBF0D0] text-[#8A5A00]',
  green: 'bg-[#DDF1E4] text-[#17603A]',
  red: 'bg-[#F8E1DE] text-[#8C2820]',
}
export function Badge({ tone = 'slate', children }) {
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

export function PageHeader({ title, intro, action }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 style={display} className="text-3xl font-bold tracking-tight text-[#17233A]">{title}</h1>
        <p className="mt-1 max-w-prose text-[#627085]">{intro}</p>
      </div>
      {action}
    </header>
  )
}

export function Empty({ children }) {
  return <p className="rounded-lg border border-dashed border-[#CBD3DC] px-4 py-10 text-center text-sm text-[#627085]">{children}</p>
}

/** Right-hand slide-over used for every "add" form. Closes on Esc or backdrop click. */
export function Drawer({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#17233A]/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 style={display} className="text-xl font-semibold text-[#17233A]">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-xl leading-none text-[#627085] hover:bg-[#F3F5F7]">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** fields: [{ name, label, type?, numeric?, options?, placeholder? }]. onSubmit(payload) must throw on failure. */
export function EntityForm({ fields, submitLabel, onSubmit }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, ''])))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError(''); setFieldErrors({})
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
          <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-[#17233A]">{f.label}</label>
          {f.options ? (
            <select id={f.name} className={inputCls} value={values[f.name]}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}>
              <option value="">Select…</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input id={f.name} className={inputCls} type={f.type || 'text'} placeholder={f.placeholder}
              value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
          )}
          {fieldErrors[f.name] && <p className="mt-1 text-xs text-[#B3342B]">{String(fieldErrors[f.name])}</p>}
        </div>
      ))}
      {error && <Notice ok={false}>{error}</Notice>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? 'Saving…' : submitLabel}</Button>
    </form>
  )
}
