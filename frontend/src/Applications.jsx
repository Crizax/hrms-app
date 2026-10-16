import { useMemo, useState } from 'react'
import { api } from './api'
import { useRole } from './role'
import { Badge, Empty, Notice, PageHeader, display, inputCls, useList } from './ui'

// Edit these to match your JobApplicationStatus enum. The keys are sent to the backend exactly as written.
const STATUS_META = {
  PENDING: { label: 'Pending', color: '#627085', tone: 'slate' },
  REVIEWING: { label: 'Reviewing', color: '#B7791F', tone: 'amber' },
  ACCEPTED: { label: 'Accepted', color: '#1B7A43', tone: 'green' },
  REJECTED: { label: 'Rejected', color: '#B3342B', tone: 'red' },
}

const dateOf = (v) => (v ? new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

/** Candidate view: read-only list of the current candidate's applications. */
export function MyApplications() {
  const { actorId } = useRole()
  const apps = useList(actorId ? `/api/applications/by-jobseeker/${actorId}` : null)

  return (
    <>
      <PageHeader title="My applications" intro="Follow where each of your applications stands." />
      {apps.error && <Notice ok={false}>{apps.error}</Notice>}
      {!actorId ? <Empty>Choose a profile in “Acting as” (top right) to see your applications.</Empty>
        : apps.loading ? <p className="text-sm text-[#627085]">Loading…</p>
        : apps.items.length === 0 && !apps.error ? <Empty>You haven’t applied to anything yet. Browse jobs to get started.</Empty>
        : (
          <ul className="space-y-3">
            {apps.items.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#DDE3EA] bg-white p-5">
                <div>
                  <p className="font-semibold text-[#17233A]">{a.jobTitle}</p>
                  <p className="text-sm text-[#627085]">{a.employerCompanyName} · applied {dateOf(a.applicationDate)}</p>
                </div>
                <Badge tone={STATUS_META[a.status]?.tone ?? 'slate'}>{STATUS_META[a.status]?.label ?? a.status}</Badge>
              </li>
            ))}
          </ul>
        )}
    </>
  )
}

/** Employer view: pipeline board for one of the current employer's advertisements. */
export default function Applications() {
  const { actorId } = useRole()
  const employers = useList('/api/employers/getAll')
  const ads = useList('/api/jobPost/getAll')
  const seekers = useList('/api/candidateController/getAll')
  const [selected, setSelected] = useState('')
  const [moveError, setMoveError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const me = employers.items.find((e) => e.id === actorId)
  const myAds = ads.items.filter((a) => me && a.companyName === me.companyName)
  const apps = useList(selected ? `/api/applications/by-advertisement/${selected}` : null)
  const seekerById = useMemo(() => Object.fromEntries(seekers.items.map((s) => [s.id, s])), [seekers.items])

  // Known stages first, then any status the backend returns that isn't listed above.
  const statuses = useMemo(() => {
    const extra = [...new Set(apps.items.map((a) => a.status))].filter((s) => s && !STATUS_META[s])
    return [...Object.keys(STATUS_META), ...extra]
  }, [apps.items])

  const move = async (app, status) => {
    setBusyId(app.id); setMoveError('')
    try {
      await api.post('/api/applications/update-status', { applicationId: app.id, status })
      await apps.reload()
    } catch (e) {
      setMoveError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHeader title="Applications" intro="Review who applied and move each application through your hiring stages." />
      {!actorId ? <Empty>Choose your company in “Acting as” (top right) to review applications.</Empty> : (
        <>
          <div className="mb-6">
            <select aria-label="Advertisement" value={selected} onChange={(e) => setSelected(e.target.value)} className={`${inputCls} w-auto min-w-64`}>
              <option value="">{myAds.length ? 'Choose an advertisement…' : 'No advertisements posted yet'}</option>
              {myAds.map((a) => <option key={a.id} value={a.id}>{a.jobTitle}{a.city && ` · ${a.city}`}</option>)}
            </select>
          </div>
          {(apps.error || moveError) && <div className="mb-4"><Notice ok={false}>{apps.error || moveError}</Notice></div>}
          {!selected ? <Empty>Choose an advertisement to see its applicants.</Empty>
            : apps.loading ? <p className="text-sm text-[#627085]">Loading…</p>
            : apps.items.length === 0 && !apps.error ? <Empty>No applications yet.</Empty>
            : (
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
                {statuses.map((s) => {
                  const col = apps.items.filter((a) => a.status === s)
                  return (
                    <section key={s} aria-label={STATUS_META[s]?.label ?? s} className="rounded-lg bg-[#E9EDF2] p-3"
                      style={{ borderTop: `4px solid ${STATUS_META[s]?.color ?? '#627085'}` }}>
                      <h2 style={display} className="mb-3 flex items-baseline justify-between px-1 font-semibold text-[#17233A]">
                        {STATUS_META[s]?.label ?? s}
                        <span className="text-sm font-normal text-[#627085]">{col.length}</span>
                      </h2>
                      <ul className="space-y-2">
                        {col.map((app) => {
                          const p = seekerById[app.jobSeekerId]
                          const name = p ? `${p.name} ${p.lastName}` : `Candidate #${app.jobSeekerId}`
                          return (
                            <li key={app.id} className="rounded-md border border-[#DDE3EA] bg-white p-3">
                              <p className="font-medium text-[#17233A]">{name}</p>
                              {p?.email && <p className="truncate text-sm text-[#627085]">{p.email}</p>}
                              <p className="mt-1 text-xs text-[#627085]">Applied {dateOf(app.applicationDate)}</p>
                              <select aria-label={`Move ${name} to another stage`} value={app.status} disabled={busyId === app.id}
                                onChange={(e) => move(app, e.target.value)} className={`${inputCls} mt-3 py-1.5`}>
                                {statuses.map((o) => <option key={o} value={o}>{STATUS_META[o]?.label ?? o}</option>)}
                              </select>
                            </li>
                          )
                        })}
                      </ul>
                    </section>
                  )
                })}
              </div>
            )}
        </>
      )}
    </>
  )
}
