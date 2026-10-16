import { createContext, useContext, useEffect, useState } from 'react'

// Demo-only roles: this is NOT authentication. It only changes what the UI shows.
const KEY = 'hrms-demo-role'
const Ctx = createContext(null)

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {} } catch { return {} }
}

export function RoleProvider({ children }) {
  const [saved] = useState(load)
  const [role, setRole] = useState(saved.role === 'employer' ? 'employer' : 'candidate')
  const [actors, setActors] = useState({ candidate: saved.actors?.candidate ?? '', employer: saved.actors?.employer ?? '' })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ role, actors })) } catch { /* storage unavailable */ }
  }, [role, actors])

  const value = {
    role,
    setRole,
    // id of the candidate or employer the person is "acting as" in the current role
    actorId: actors[role] ? Number(actors[role]) : null,
    setActor: (id) => setActors((a) => ({ ...a, [role]: id })),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useRole = () => useContext(Ctx)
