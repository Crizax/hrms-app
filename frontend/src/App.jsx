import { BrowserRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Applications, { MyApplications } from './Applications'
import AuthPage from './AuthPages'
import JobAds from './JobAds'
import { Candidates, Cities, Employers, JobPositions } from './pages'
import { RoleProvider, useRole } from './role'
import { Badge, Button, display } from './ui'

const ROUTES = [
  {
    path: '/jobs',
    el: <JobAds />,
    roles: ['guest', 'candidate', 'employer'],
    label: { guest: 'Explore Jobs', candidate: 'Explore Jobs', employer: 'Job Postings' },
  },
  { path: '/my-applications', el: <MyApplications />, roles: ['candidate'], label: 'My Applications' },
  { path: '/applications', el: <Applications />, roles: ['employer'], label: 'Applicant Pipeline' },
  { path: '/positions', el: <JobPositions />, roles: ['employer'], label: 'Positions' },
  { path: '/cities', el: <Cities />, roles: ['employer'], label: 'Cities' },
  { path: '/employers', el: <Employers />, roles: ['employer'], label: 'Companies' },
  { path: '/candidates', el: <Candidates />, roles: ['employer'], label: 'Talent Pool' },
]

const labelFor = (r, role) => (typeof r.label === 'string' ? r.label : r.label[role])

function AuthHeaderBar() {
  const { user, role, isAuthenticated, logout } = useRole()
  const navigate = useNavigate()

  return (
    <div className="ml-auto flex items-center gap-3">
      {isAuthenticated ? (
        <div className="flex items-center gap-3 rounded-full border border-slate-200/90 bg-slate-50/80 py-1 pr-2 pl-3">
          <Badge tone={role === 'employer' ? 'amber' : 'green'}>
            {role === 'employer' ? 'Employer' : 'Candidate'}
          </Badge>
          <span className="hidden max-w-44 truncate text-xs font-semibold text-slate-700 sm:inline">
            {user.email}
          </span>
          <button
            onClick={() => {
              logout()
              navigate('/auth')
            }}
            className="cursor-pointer rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-2xs ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Button onClick={() => navigate('/auth')} className="py-2 text-xs">
          Sign in / Register
        </Button>
      )}
    </div>
  )
}

function Shell() {
  const { role, isAuthenticated } = useRole()
  const links = ROUTES.filter((r) => r.roles.includes(role))

  return (
    <div
      className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900 selection:bg-[#0B7A75]/15 selection:text-[#0B7A75]"
      style={{ fontFamily: "'Figtree', system-ui, sans-serif" }}
    >
      {/* Top ambient gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#17233A] via-[#0B7A75] to-emerald-500" />

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-8">
          <NavLink to="/jobs" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#17233A] to-[#0B7A75] text-white shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span style={display} className="text-lg font-bold tracking-tight text-slate-900">
                TalentFlow
              </span>
              <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                HRMS
              </span>
            </div>
          </NavLink>

          <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto pt-1 md:order-none md:w-auto md:pt-0">
            {links.map((r) => (
              <NavLink
                key={r.path}
                to={r.path}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#0B7A75]/10 font-semibold text-[#0B7A75]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {labelFor(r, role)}
              </NavLink>
            ))}
          </nav>

          <AuthHeaderBar />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/jobs" replace /> : <AuthPage />} />
          {ROUTES.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={r.roles.includes(role) ? r.el : <Navigate to={isAuthenticated ? '/jobs' : '/auth'} replace />}
            />
          ))}
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>

      <footer className="mt-16 border-t border-slate-200/80 bg-white px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-500 md:px-8">
          <p className="font-medium text-slate-700">TalentFlow HRMS · Next-Gen Recruitment & Applicant Tracking</p>
          <p>Powered by Spring Boot 3, Spring Security & Stateless JWT</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <Shell />
      </RoleProvider>
    </BrowserRouter>
  )
}