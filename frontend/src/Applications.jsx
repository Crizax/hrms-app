import { useState } from 'react'
import { api } from './api'
import { useRole } from './role'
import { Badge, Empty, Notice, PageHeader, SkeletonList, display, inputCls, useList } from './ui'

const STATUS_META = {
  PENDING: { label: 'Pending Review', color: '#F59E0B', tone: 'amber', bg: 'bg-amber-50/70 border-amber-200/80' },
  ACCEPTED: { label: 'Accepted / Hired', color: '#10B981', tone: 'green', bg: 'bg-emerald-50/70 border-emerald-200/80' },
  REJECTED: { label: 'Rejected', color: '#F43F5E', tone: 'red', bg: 'bg-rose-50/70 border-rose-200/80' },
}

const dateOf = (v) =>
  v ? new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export function MyApplications() {
  const apps = useList('/api/applications/my-applications')

  return (
    <>
      <PageHeader
        badge="Candidate Portal"
        title="My Applications"
        intro="Track the real-time status of every role you have applied for."
      />
      {apps.error && <Notice ok={false}>{apps.error}</Notice>}
      {apps.loading ? (
        <SkeletonList count={3} />
      ) : apps.items.length === 0 && !apps.error ? (
        <Empty title="No applications submitted yet">
          Browse open roles on the job board and apply with one click to start tracking your progress here.
        </Empty>
      ) : (
        <ul className="space-y-3">
          {apps.items.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#17233A] text-sm font-bold text-white">
                  {(a.employerCompanyName || 'CO').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={display} className="text-base font-bold text-slate-900">{a.jobTitle}</p>
                  <p className="text-sm text-slate-500">
                    <span className="font-medium text-slate-700">{a.employerCompanyName}</span> · Applied on {dateOf(a.applicationDate)}
                  </p>
                </div>
              </div>
              <Badge tone={STATUS_META[a.status]?.tone ?? 'slate'}>
                {STATUS_META[a.status]?.label ?? a.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function Applications() {
  const { actorId } = useRole()
  const myAds = useList(actorId ? `/api/jobPost/active/by-employer?employerId=${actorId}` : null)
  const [selected, setSelected] = useState('')
  const [moveError, setMoveError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const apps = useList(selected ? `/api/applications/by-advertisement/${selected}` : null)
  const statuses = Object.keys(STATUS_META)

  const move = async (app, status) => {
    setBusyId(app.id)
    setMoveError('')
    try {
      await api.post('/api/applications/update-status', { applicationId: app.id, status })
      await apps.reload()
      await myAds.reload()
    } catch (e) {
      setMoveError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHeader
        badge="Hiring Pipeline"
        title="Applicant Tracking Board"
        intro="Select one of your active job postings below to review candidates and move them through stages."
      />

      {/* Advertisement Selector Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Active Job Posting:</span>
          <select
            aria-label="Advertisement"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className={`${inputCls} w-auto min-w-72 font-medium`}
          >
            <option value="">
              {myAds.items.length ? 'Select a job advertisement…' : 'No active advertisements found'}
            </option>
            {myAds.items.map((a) => (
              <option key={a.id} value={a.id}>
                {a.jobTitle} {a.city && `· ${a.city}`} ({a.openPositionCount} openings)
              </option>
            ))}
          </select>
        </div>

        {selected && !apps.loading && (
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>Total: <strong className="text-slate-900">{apps.items.length}</strong></span>
            <span className="text-amber-700">Pending: {apps.items.filter((a) => a.status === 'PENDING').length}</span>
            <span className="text-emerald-700">Accepted: {apps.items.filter((a) => a.status === 'ACCEPTED').length}</span>
            <span className="text-rose-700">Rejected: {apps.items.filter((a) => a.status === 'REJECTED').length}</span>
          </div>
        )}
      </div>

      {(apps.error || moveError) && (
        <div className="mb-6">
          <Notice ok={false}>{apps.error || moveError}</Notice>
        </div>
      )}

      {!selected ? (
        <Empty title="Select a job advertisement">
          Choose one of your company’s active job postings from the dropdown above to load its applicant pipeline.
        </Empty>
      ) : apps.loading ? (
        <SkeletonList count={3} />
      ) : apps.items.length === 0 && !apps.error ? (
        <Empty title="No applicants yet">
          No candidates have applied to this job advertisement yet. Check back soon!
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {statuses.map((s) => {
            const col = apps.items.filter((a) => a.status === s)
            const meta = STATUS_META[s]
            return (
              <section
                key={s}
                aria-label={meta?.label ?? s}
                className="flex flex-col rounded-2xl border border-slate-200/90 bg-slate-100/70 p-4"
                style={{ borderTop: `4px solid ${meta?.color ?? '#64748B'}` }}
              >
                <div className="mb-4 flex items-center justify-between px-1">
                  <h2 style={display} className="text-base font-bold text-slate-900">
                    {meta?.label ?? s}
                  </h2>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-2xs ring-1 ring-slate-200">
                    {col.length}
                  </span>
                </div>

                {col.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300/80 py-10 text-xs text-slate-400">
                    No candidates in this stage
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {col.map((app) => {
                      const fullName =
                        [app.candidateFirstName, app.candidateLastName].filter(Boolean).join(' ') ||
                        `Candidate #${app.jobSeekerId}`
                      const initials = fullName
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()

                      return (
                        <li
                          key={app.id}
                          className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B7A75]/15 text-xs font-bold text-[#0B7A75]">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-slate-900">{fullName}</p>
                              {app.candidateEmail && (
                                <a
                                  href={`mailto:${app.candidateEmail}`}
                                  className="block truncate text-xs text-[#0B7A75] hover:underline"
                                >
                                  {app.candidateEmail}
                                </a>
                              )}
                              <p className="mt-1 text-[11px] text-slate-400">Applied {dateOf(app.applicationDate)}</p>
                            </div>
                          </div>

                          <div className="mt-3.5 border-t border-slate-100 pt-3">
                            <label
                              htmlFor={`stage-${app.id}`}
                              className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase"
                            >
                              Move stage
                            </label>
                            <select
                              id={`stage-${app.id}`}
                              aria-label={`Move ${fullName} to another stage`}
                              value={app.status}
                              disabled={busyId === app.id}
                              onChange={(e) => move(app, e.target.value)}
                              className={`${inputCls} py-1.5 text-xs font-semibold`}
                            >
                              {statuses.map((o) => (
                                <option key={o} value={o}>
                                  {STATUS_META[o]?.label ?? o}
                                </option>
                              ))}
                            </select>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}