import { useState } from 'react'
import { api } from './api'
import { useRole } from './role'
import { Badge, Button, Drawer, Empty, EntityForm, Notice, PageHeader, inputCls, useList } from './ui'

const money = (n) => (n == null ? '—' : Number(n).toLocaleString())

function ApplyBox({ adId, seekerId }) {
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const apply = async () => {
    setBusy(true); setStatus(null)
    try {
      const r = await api.post('/api/applications/apply', { jobSeekerId: seekerId, jobAdvertisementId: adId })
      setStatus({ ok: true, text: r.message || 'Application sent.' })
    } catch (e) {
      setStatus({ ok: false, text: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#EDF0F4] pt-4">
      <Button onClick={apply} disabled={!seekerId || busy}>{busy ? 'Applying…' : 'Apply'}</Button>
      {!seekerId && <span className="text-sm text-[#627085]">Choose a profile in “Acting as” (top right) to apply.</span>}
      {status && <Notice ok={status.ok}>{status.text}</Notice>}
    </div>
  )
}

export default function JobAds() {
  const { role, actorId } = useRole()
  const isEmployer = role === 'employer'
  const ads = useList('/api/jobPost/getAll')
  const cities = useList('/api/cities/getAll')
  const employers = useList('/api/employers/getAll')
  const positions = useList('/api/jobPosition/getAll')
  const [cityFilter, setCityFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState('')

  const me = employers.items.find((e) => e.id === actorId)
  // The ad DTO has no employer id, so "my ads" are matched by company name.
  const shown = ads.items
    .filter((a) => !cityFilter || a.city === cityFilter)
    .filter((a) => !isEmployer || (me && a.companyName === me.companyName))

  const fields = [
    { name: 'jobPositionId', label: 'Job position', numeric: true, options: positions.items.map((p) => ({ value: p.id, label: p.title })) },
    { name: 'cityId', label: 'City', numeric: true, options: cities.items.map((c) => ({ value: c.id, label: c.cityName })) },
    { name: 'description', label: 'Description (at least 10 characters)' },
    { name: 'openPositionCount', label: 'Open positions', type: 'number' },
    { name: 'minSalary', label: 'Minimum salary', type: 'number' },
    { name: 'maxSalary', label: 'Maximum salary', type: 'number' },
    { name: 'applicationDeadline', label: 'Application deadline', type: 'date' },
  ]

  return (
    <>
      <PageHeader
        title={isEmployer ? 'My advertisements' : 'Job advertisements'}
        intro={isEmployer ? (me ? `Roles posted by ${me.companyName}.` : 'Choose your company in “Acting as” to see and post advertisements.') : 'Browse open roles and apply with one click.'}
        action={isEmployer && <Button disabled={!actorId} onClick={() => { setFlash(''); setOpen(true) }}>Post advertisement</Button>}
      />
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="cityFilter" className="text-sm text-[#627085]">City</label>
        <select id="cityFilter" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">All cities</option>
          {cities.items.map((c) => <option key={c.id} value={c.cityName}>{c.cityName}</option>)}
        </select>
      </div>
      <div className="space-y-4">
        {flash && <Notice ok>{flash}</Notice>}
        {ads.error && <Notice ok={false}>{ads.error}</Notice>}
        {ads.loading ? <p className="text-sm text-[#627085]">Loading…</p>
          : shown.length === 0 && !ads.error ? <Empty>{isEmployer ? 'No advertisements yet. Post your first role.' : 'No advertisements here yet.'}</Empty>
          : (
            <ul className="space-y-3">
              {shown.map((ad) => (
                <li key={ad.id} className={`rounded-lg border border-[#DDE3EA] bg-white p-5 ${ad.active ? '' : 'opacity-75'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-[#17233A]">{ad.jobTitle}</h3>
                      <p className="text-sm text-[#627085]">{ad.companyName}{ad.city && ` in ${ad.city}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#17233A]">
                        {ad.minSalary == null && ad.maxSalary == null ? 'Salary not listed' : `${money(ad.minSalary)} – ${money(ad.maxSalary)}`}
                      </p>
                      <div className="mt-1"><Badge tone={ad.active ? 'green' : 'slate'}>{ad.active ? 'Open' : 'Closed'}</Badge></div>
                    </div>
                  </div>
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#627085]">
                    <div><dt className="inline">Positions: </dt><dd className="inline text-[#17233A]">{ad.openPositionCount ?? '—'}</dd></div>
                    <div><dt className="inline">Posted: </dt><dd className="inline text-[#17233A]">{ad.releaseDate ?? '—'}</dd></div>
                    <div><dt className="inline">Apply by: </dt><dd className="inline text-[#17233A]">{ad.applicationDeadline ?? '—'}</dd></div>
                  </dl>
                  {!isEmployer && (ad.active
                    ? <ApplyBox adId={ad.id} seekerId={actorId} />
                    : <p className="mt-4 border-t border-[#EDF0F4] pt-4 text-sm text-[#627085]">Applications are closed for this advertisement.</p>)}
                </li>
              ))}
            </ul>
          )}
      </div>
      <Drawer open={open} title="Post an advertisement" onClose={() => setOpen(false)}>
        <EntityForm
          fields={fields}
          submitLabel="Publish advertisement"
          onSubmit={async (payload) => {
            const r = await api.post('/api/jobPost/add', { ...payload, employerId: actorId })
            setFlash(r.message || 'Advertisement published.')
            setOpen(false)
            ads.reload()
          }}
        />
      </Drawer>
    </>
  )
}
