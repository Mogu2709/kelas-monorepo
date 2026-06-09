import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../lib/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'kelas_session';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  // Restore & validasi sesi saat load
  useEffect(() => {
    async function restore() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) { setLoading(false); return; }

        const session = JSON.parse(raw);
        if (!session?.token) { setLoading(false); return; }

        // Validasi token ke backend — kalau expired akan throw
        const user = await authApi.me();
        setCurrentUser({ ...user, token: session.token });
      } catch {
        // Token expired atau invalid — hapus sesi
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  async function login(username, password) {
    try {
      const data = await authApi.login(username, password);
      const session = { ...data.user, token: data.token };
      setCurrentUser(session);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function logout() {
    try { await authApi.logout(); } catch {}
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
