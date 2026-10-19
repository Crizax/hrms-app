import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { useRole } from './role'
import { Badge, Button, Drawer, Empty, EntityForm, Notice, PageHeader, SkeletonList, display, inputCls, useList } from './ui'

const money = (n) => (n == null ? null : Number(n).toLocaleString())

const avatarColors = [
  'from-teal-600 to-emerald-600',
  'from-slate-700 to-slate-900',
  'from-indigo-600 to-blue-600',
  'from-amber-600 to-orange-600',
  'from-rose-600 to-pink-600',
]

function CompanyAvatar({ name = 'Company' }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const colorIdx = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % avatarColors.length
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarColors[colorIdx]} text-sm font-bold text-white shadow-sm`}
    >
      {initials || 'CO'}
    </div>
  )
}

function ApplyBox({ adId, role }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const apply = async () => {
    if (role === 'guest') {
      navigate('/auth')
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      const r = await api.post('/api/applications/apply', { jobAdvertisementId: adId })
      setStatus({ ok: true, text: r.message || 'Application submitted!' })
    } catch (e) {
      setStatus({ ok: false, text: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div className="flex-1">
        {status ? (
          <Notice ok={status.ok}>{status.text}</Notice>
        ) : (
          <span className="text-xs text-slate-400">
            {role === 'guest' ? 'Sign in with a candidate account to apply immediately.' : 'One-click application with your candidate profile.'}
          </span>
        )}
      </div>
      <Button onClick={apply} disabled={busy} className="shrink-0">
        {busy ? 'Submitting…' : role === 'guest' ? 'Sign in to Apply →' : 'Apply Now →'}
      </Button>
    </div>
  )
}

export default function JobAds() {
  const { role, actorId } = useRole()
  const isEmployer = role === 'employer'

  const cities = useList('/api/cities/getAll')
  const positions = useList('/api/jobPosition/getAll')

  const [employerViewMode, setEmployerViewMode] = useState('mine')
  const [keyword, setKeyword] = useState('')
  const [cityId, setCityId] = useState('')
  const [jobPositionId, setJobPositionId] = useState('')
  const [minSalary, setMinSalary] = useState('')
  const [sortBy, setSortBy] = useState('releaseDate')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [size] = useState(6)

  const [pagedData, setPagedData] = useState({
    items: [],
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState('')
  const [deactivatingId, setDeactivatingId] = useState(null)

  const loadAds = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (isEmployer && employerViewMode === 'mine' && actorId) {
        const r = await api.get(`/api/jobPost/active/by-employer?employerId=${actorId}`)
        const list = Array.isArray(r.data) ? r.data : []
        setPagedData({
          items: list,
          currentPage: 0,
          totalItems: list.length,
          totalPages: 1,
          hasNext: false,
        })
      } else {
        const params = new URLSearchParams()
        if (cityId) params.set('cityId', cityId)
        if (jobPositionId) params.set('jobPositionId', jobPositionId)
        if (minSalary) params.set('minSalary', minSalary)
        if (keyword.trim()) params.set('keyword', keyword.trim())
        params.set('page', String(page))
        params.set('size', String(size))
        params.set('sortBy', sortBy)
        params.set('sortDir', sortDir)

        const r = await api.get(`/api/jobPost/search?${params.toString()}`)
        setPagedData(r.data ?? { items: [], currentPage: 0, totalItems: 0, totalPages: 0, hasNext: false })
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [isEmployer, employerViewMode, actorId, cityId, jobPositionId, minSalary, keyword, page, size, sortBy, sortDir])

  useEffect(() => {
    loadAds()
  }, [loadAds])

  const handleDeactivate = async (adId) => {
    setDeactivatingId(adId)
    setFlash('')
    setError('')
    try {
      const r = await api.put(`/api/jobPost/${adId}/deactivate`)
      setFlash(r.message || 'Advertisement closed.')
      await loadAds()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeactivatingId(null)
    }
  }

  const resetFilters = () => {
    setKeyword('')
    setCityId('')
    setJobPositionId('')
    setMinSalary('')
    setSortBy('releaseDate')
    setSortDir('desc')
    setPage(0)
  }

  const hasActiveFilters = Boolean(keyword || cityId || jobPositionId || minSalary)

  const fields = [
    { name: 'jobPositionId', label: 'Job position', numeric: true, options: positions.items.map((p) => ({ value: p.id, label: p.title })) },
    { name: 'cityId', label: 'City / Location', numeric: true, options: cities.items.map((c) => ({ value: c.id, label: c.cityName })) },
    { name: 'description', label: 'Role description (min 10 chars)', type: 'textarea', placeholder: 'Describe key responsibilities, tech stack, and candidate expectations…' },
    { name: 'openPositionCount', label: 'Number of openings', type: 'number', placeholder: '2' },
    { name: 'minSalary', label: 'Minimum salary', type: 'number', placeholder: '100000' },
    { name: 'maxSalary', label: 'Maximum salary', type: 'number', placeholder: '180000' },
    { name: 'applicationDeadline', label: 'Application deadline', type: 'date' },
  ]

  const showingSearchBar = !isEmployer || employerViewMode === 'all'

  return (
    <>
      <PageHeader
        badge={isEmployer ? 'Employer Workspace' : 'Career Opportunities'}
        title={isEmployer && employerViewMode === 'mine' ? 'My Active Job Postings' : 'Explore Open Roles'}
        intro={
          isEmployer
            ? 'Publish new openings, monitor active listings, or close filled positions.'
            : 'Filter verified roles by city, position, and compensation.'
        }
        action={
          isEmployer && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setEmployerViewMode('mine')}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
                    employerViewMode === 'mine' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Active Ads
                </button>
                <button
                  type="button"
                  onClick={() => setEmployerViewMode('all')}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
                    employerViewMode === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Public Ads
                </button>
              </div>
              <Button onClick={() => { setFlash(''); setOpen(true) }}>+ Post Advertisement</Button>
            </div>
          )
        }
      />

      {/* Multi-Filter Search Panel */}
      {showingSearchBar && (
        <div className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="keyword" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Search keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="Title, company, skill…"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(0) }}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="cityFilter" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Location
              </label>
              <select
                id="cityFilter"
                value={cityId}
                onChange={(e) => { setCityId(e.target.value); setPage(0) }}
                className={inputCls}
              >
                <option value="">All cities</option>
                {cities.items.map((c) => (
                  <option key={c.id} value={c.id}>{c.cityName}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="posFilter" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Role / Position
              </label>
              <select
                id="posFilter"
                value={jobPositionId}
                onChange={(e) => { setJobPositionId(e.target.value); setPage(0) }}
                className={inputCls}
              >
                <option value="">All positions</option>
                {positions.items.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="minSalFilter" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Minimum salary
              </label>
              <input
                id="minSalFilter"
                type="number"
                min="0"
                placeholder="e.g. 100,000"
                value={minSalary}
                onChange={(e) => { setMinSalary(e.target.value); setPage(0) }}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="sortFilter" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Sort results
              </label>
              <div className="flex gap-1.5">
                <select
                  id="sortFilter"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(0) }}
                  className={inputCls}
                >
                  <option value="releaseDate">Newest posted</option>
                  <option value="applicationDeadline">Closing soon</option>
                  <option value="minSalary">Min salary</option>
                  <option value="maxSalary">Max salary</option>
                </select>
                <button
                  type="button"
                  title="Toggle sort direction"
                  onClick={() => { setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); setPage(0) }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  {sortDir === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>
              Found <strong className="font-semibold text-slate-800">{pagedData.totalItems}</strong> matching active role{pagedData.totalItems === 1 ? '' : 's'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer font-semibold text-[#0B7A75] hover:underline"
              >
                Clear all filters ✕
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {flash && <Notice ok>{flash}</Notice>}
        {error && <Notice ok={false}>{error}</Notice>}

        {loading ? (
          <SkeletonList count={4} />
        ) : pagedData.items.length === 0 && !error ? (
          <Empty title={isEmployer && employerViewMode === 'mine' ? 'No active job postings' : 'No matching roles found'}>
            {isEmployer && employerViewMode === 'mine'
              ? 'Click "+ Post Advertisement" in the top right to publish your first job opening.'
              : 'Try clearing some search filters or broadening your keyword search.'}
          </Empty>
        ) : (
          <>
            <ul className="space-y-4">
              {pagedData.items.map((ad) => {
                const minS = money(ad.minSalary)
                const maxS = money(ad.maxSalary)
                const salaryLabel =
                  !minS && !maxS ? 'Competitive salary' : minS && maxS ? `${minS} – ${maxS}` : `From ${minS || maxS}`

                return (
                  <li
                    key={ad.id}
                    className={`group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-200 hover:border-[#0B7A75]/40 hover:shadow-md ${
                      ad.active ? '' : 'opacity-70'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <CompanyAvatar name={ad.companyName} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 style={display} className="text-lg font-bold text-slate-900 group-hover:text-[#0B7A75]">
                              {ad.jobTitle}
                            </h3>
                            <Badge tone={ad.active ? 'green' : 'slate'}>{ad.active ? 'Actively Hiring' : 'Closed'}</Badge>
                          </div>
                          <p className="mt-0.5 text-sm font-medium text-slate-600">{ad.companyName}</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-3.5 py-2 text-right ring-1 ring-slate-200/70">
                        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Compensation</p>
                        <p style={display} className="text-sm font-bold text-slate-900">{salaryLabel}</p>
                      </div>
                    </div>

                    {/* Metadata Pills */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                      {ad.city && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
                          {ad.city}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
                         {ad.openPositionCount ?? 1} opening{ad.openPositionCount === 1 ? '' : 's'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
                        🗓️ Posted {ad.releaseDate ?? '—'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800">
                        ⏳ Apply by {ad.applicationDeadline ?? '—'}
                      </span>
                    </div>

                    {!isEmployer &&
                      (ad.active ? (
                        <ApplyBox adId={ad.id} role={role} />
                      ) : (
                        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                          Applications are closed for this advertisement.
                        </p>
                      ))}

                    {isEmployer && employerViewMode === 'mine' && ad.active && (
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs text-slate-400">Closing this role prevents new candidate applications.</span>
                        <Button
                          variant="danger"
                          disabled={deactivatingId === ad.id}
                          onClick={() => handleDeactivate(ad.id)}
                          className="py-1.5 text-xs"
                        >
                          {deactivatingId === ad.id ? 'Closing…' : 'Close Advertisement'}
                        </Button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* Pagination Controls */}
            {showingSearchBar && pagedData.totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-600 shadow-2xs">
                <span>
                  Page <strong className="text-slate-900">{pagedData.currentPage + 1}</strong> of{' '}
                  <strong className="text-slate-900">{pagedData.totalPages}</strong> · {pagedData.totalItems} total roles
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={page <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="py-1.5 text-xs"
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!pagedData.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="py-1.5 text-xs"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Drawer open={open} title="Publish Job Advertisement" onClose={() => setOpen(false)}>
        <EntityForm
          fields={fields}
          submitLabel="Publish Advertisement"
          onSubmit={async (payload) => {
            const r = await api.post('/api/jobPost/add', payload)
            setFlash(r.message || 'Advertisement published.')
            setOpen(false)
            await loadAds()
          }}
        />
      </Drawer>
    </>
  )
}