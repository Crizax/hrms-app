import { createContext, useContext, useEffect, useState } from 'react'
import { AUTH_STORAGE_KEY, api } from './api'

const Ctx = createContext(null)

function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) ?? null
  } catch {
    return null
  }
}

export function RoleProvider({ children }) {
  const [user, setUser] = useState(loadAuth)

  useEffect(() => {
    try {
      if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      /* storage unavailable */
    }
  }, [user])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    setUser(res.data) // { token, userId, email, role }
    return res.data
  }

  const logout = () => setUser(null)

  // Map backend role ("ROLE_EMPLOYER" | "ROLE_JOBSEEKER") to UI role ("employer" | "candidate")
  const role = user?.role === 'ROLE_EMPLOYER' ? 'employer' : user?.role === 'ROLE_JOBSEEKER' ? 'candidate' : 'guest'

  const value = {
    user,
    role,
    actorId: user?.userId ? Number(user.userId) : null,
    isAuthenticated: !!user?.token,
    login,
    logout,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useRole = () => useContext(Ctx)