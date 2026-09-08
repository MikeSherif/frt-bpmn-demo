import { createContext, useContext, useState, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState('user');

  const value = useMemo(
    () => ({
      role,
      isAdmin: role === 'admin',
      toggleRole: () => setRole((r) => (r === 'admin' ? 'user' : 'admin')),
    }),
    [role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
