'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Fetch additional user data if needed
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [session, status]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: status === 'authenticated', isLoading: status === 'loading' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);