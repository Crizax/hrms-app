import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { useRole } from './role'
import { Button, EntityForm, Notice, display, inputCls } from './ui'

const CANDIDATE_FIELDS = [
  { name: 'name', label: 'First name', placeholder: 'Zohair' },
  { name: 'lastName', label: 'Last name', placeholder: 'Alam' },
  { name: 'nationalId', label: 'National ID (10–20 chars)', placeholder: '4210112345671' },
  { name: 'birthDate', label: 'Date of birth', type: 'date' },
  { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
  { name: 'password', label: 'Password (min 6 chars)', type: 'password' },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
]

const EMPLOYER_FIELDS = [
  { name: 'companyName', label: 'Company name', placeholder: 'Tech Corp' },
  { name: 'companyWebPage', label: 'Company website', placeholder: 'https://techcorp.com' },
  { name: 'email', label: 'Work email', type: 'email', placeholder: 'hr@techcorp.com' },
  { name: 'phoneNumber', label: 'Phone number (10–30 chars)', placeholder: '+92-300-1234567' },
  { name: 'password', label: 'Password (min 6 chars)', type: 'password' },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
]

export default function AuthPage() {
  const { login } = useRole()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
      navigate('/jobs')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-12">
      {/* Left Brand Showcase Column */}
      <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#17233A] via-[#13314A] to-[#0B7A75] p-8 text-white lg:col-span-5 lg:p-10">
        <div>
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-xs">
            TalentFlow HRMS
          </span>
          <h1 style={display} className="mt-5 text-3xl leading-tight font-bold">
            Hire faster. Apply smarter.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            A unified human resource platform connecting verified employers with engineering, product, and operations talent.
          </p>
        </div>

        <ul className="mt-8 space-y-4 text-sm text-slate-100">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-300">✓</span>
            <span><strong>Multi-filter job discovery</strong> with real-time salary & city filtering.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-300">✓</span>
            <span><strong>Kanban applicant pipeline</strong> that auto-closes roles when openings fill.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-300">✓</span>
            <span><strong>Stateless JWT security</strong> protecting company and candidate data.</span>
          </li>
        </ul>

        <p className="mt-8 text-xs text-slate-300/80">
          Secured with BCrypt & Spring Security 6
        </p>
      </div>

      {/* Right Form Column */}
      <div className="p-6 sm:p-10 lg:col-span-7">
        <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold sm:text-sm">
          {[
            { id: 'login', label: 'Sign In' },
            { id: 'register-candidate', label: 'Candidate Sign Up' },
            { id: 'register-employer', label: 'Employer Sign Up' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setMode(t.id); setError('') }}
              className={`flex-1 cursor-pointer rounded-lg py-2 transition ${
                mode === t.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mode === 'login' && (
          <div>
            <h2 style={display} className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">Enter your email and password to access your account.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  className={inputCls}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  className={inputCls}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error && <Notice ok={false}>{error}</Notice>}
              <div className="pt-2">
                <Button type="submit" disabled={busy} className="w-full py-3">
                  {busy ? 'Signing in…' : 'Sign In to Workspace →'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {mode === 'register-candidate' && (
          <div>
            <h2 style={display} className="text-2xl font-bold text-slate-900">Create Candidate Profile</h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">Apply to verified openings and track your application status.</p>
            <EntityForm
              key="candidate-form"
              fields={CANDIDATE_FIELDS}
              submitLabel="Create Candidate Account →"
              onSubmit={async (payload) => {
                await api.post('/api/candidateController/register', payload)
                await login(payload.email, payload.password)
                navigate('/jobs')
              }}
            />
          </div>
        )}

        {mode === 'register-employer' && (
          <div>
            <h2 style={display} className="text-2xl font-bold text-slate-900">Register Company Account</h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">Publish job postings and manage applicants on a Kanban board.</p>
            <EntityForm
              key="employer-form"
              fields={EMPLOYER_FIELDS}
              submitLabel="Create Employer Account →"
              onSubmit={async (payload) => {
                await api.post('/api/employers/register', payload)
                await login(payload.email, payload.password)
                navigate('/jobs')
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}