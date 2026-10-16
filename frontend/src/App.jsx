import { useEffect } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Applications, { MyApplications } from './Applications'
import JobAds from './JobAds'
import { Candidates, Cities, Employers, JobPositions } from './pages'
import { RoleProvider, useRole } from './role'
import { display, inputCls, useList } from './ui'

const ROUTES = [
  { path: '/jobs', el: <JobAds />, roles: ['candidate', 'employer'], label: { candidate: 'Jobs', employer: 'My advertisements' } },
  { path: '/my-applications', el: <MyApplications />, roles: ['candidate'], label: 'My applications' },
  { path: '/applications', el: <Applications />, roles: ['employer'], label: 'Applications' },
  { path: '/positions', el: <JobPositions />, roles: ['employer'], label: 'Positions' },
  { path: '/cities', el: <Cities />, roles: ['employer'], label: 'Cities' },
  { path: '/candidates', el: <Candidates />, roles: ['candidate'], label: 'Create profile' },
  { path: '/employers', el: <Employers />, roles: ['employer'], label: 'Register company' },
]
const labelFor = (r, role) => (typeof r.label === 'string' ? r.label : r.label[role])

function RoleSwitcher() {
  const { role, setRole, actorId, setActor } = useRole()
  const { pathname } = useLocation()
  const { items, reload } = useList(role === 'candidate' ? '/api/candidateController/getAll' : '/api/employers/getAll')
  useEffect(() => { reload() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ml-auto flex flex-wrap items-center gap-2 py-2">
      <div role="group" aria-label="Role" className="inline-flex rounded-md border border-[#CBD3DC] bg-[#F3F5F7] p-0.5 text-sm">
        {['candidate', 'employer'].map((r) => (
          <button key={r} aria-pressed={role === r} onClick={() => setRole(r)}
            className={`rounded px-3 py-1.5 capitalize transition ${role === r ? 'bg-[#17233A] text-white' : 'text-[#627085] hover:text-[#17233A]'}`}>
            {r}
          </button>
        ))}
      </div>
      <select aria-label="Acting as" value={actorId ?? ''} onChange={(e) => setActor(e.target.value)} className={`${inputCls} w-auto max-w-48 py-1.5`}>
        <option value="">{items.length ? 'Acting as…' : 'No profiles yet'}</option>
        {items.map((p) => (
          <option key={p.id} value={p.id}>{role === 'candidate' ? `${p.name} ${p.lastName}` : p.companyName}</option>
        ))}
      </select>
    </div>
  )
}

function Shell() {
  const { role } = useRole()
  const links = ROUTES.filter((r) => r.roles.includes(role))
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F5F7] text-[#17233A]" style={{ fontFamily: "'Figtree', system-ui, sans-serif" }}>
      <header className="sticky top-0 z-30 border-b border-[#DDE3EA] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 px-4 md:px-8">
          <span style={display} className="py-4 text-xl font-bold">HRMS</span>
          <RoleSwitcher />
          <nav className="-mb-px flex w-full gap-1 overflow-x-auto md:order-none md:w-auto">
            {links.map((r) => (
              <NavLink key={r.path} to={r.path}
                className={({ isActive }) =>
                  `whitespace-nowrap border-b-2 px-3 py-3 text-sm transition focus:outline-none focus-visible:bg-[#F3F5F7] ${
                    isActive ? 'border-[#0B7A75] font-semibold text-[#17233A]' : 'border-transparent text-[#627085] hover:text-[#17233A]'}`}>
                {labelFor(r, role)}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          {ROUTES.map((r) => (
            <Route key={r.path} path={r.path} element={r.roles.includes(role) ? r.el : <Navigate to="/jobs" replace />} />
          ))}
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-[#DDE3EA] px-4 py-4 text-center text-xs text-[#627085]">
        Demo roles: switching roles changes the view only. There is no login yet.
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RoleProvider><Shell /></RoleProvider>
    </BrowserRouter>
  )
}
