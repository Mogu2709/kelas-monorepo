import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useApi } from '../hooks/useApi';
import { kelasApi, authApi } from '../lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser: authUser, setCurrentUser } = useAuth();
  const [activeChannel, setActiveChannel] = useState('dashboard');

  const role = authUser?.role ?? 'mahasiswa';

  const {
    data: kelas,
    refetch: refetchKelas,
  } = useApi(
    () => authUser ? kelasApi.info() : Promise.resolve(null),
    [authUser]
  );

  // Refresh data user dari /auth/me (dipanggil setelah update profil)
  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      if (setCurrentUser) setCurrentUser(me);
    } catch {
      // silent
    }
  }, [setCurrentUser]);

  // Refresh data kelas (dipanggil setelah update server)
  const refreshKelas = useCallback(async () => {
    await refetchKelas();
  }, [refetchKelas]);

  function setChannel(ch) {
    // channel yang hanya bisa diakses admin
    const adminOnly = ['mahasiswa', 'matkul', 'server'];
    if (adminOnly.includes(ch) && role !== 'admin') return;
    setActiveChannel(ch);
  }

  return (
    <AppContext.Provider value={{
      role,
      activeChannel,
      setActiveChannel: setChannel,
      currentUser: authUser,
      kelas,
      refreshUser,
      refreshKelas,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}