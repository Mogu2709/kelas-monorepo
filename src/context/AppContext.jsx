import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useApi } from '../hooks/useApi';
import { kelasApi } from '../lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  const [activeChannel, setActiveChannel] = useState('dashboard');

  const role = currentUser?.role ?? 'mahasiswa';

  const { data: kelas } = useApi(
    () => currentUser ? kelasApi.info() : Promise.resolve(null),
    [currentUser]
  );

  function setChannel(ch) {
    if (ch === 'mahasiswa' && role !== 'admin') return;
    setActiveChannel(ch);
  }

  return (
    <AppContext.Provider value={{
      role,
      activeChannel,
      setActiveChannel: setChannel,
      currentUser,
      kelas,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}