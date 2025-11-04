import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthContextType = {
  userId: string | null;
  setUserId: (userId: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserIdState(storedUserId);
    } else {
      const newUserId = `user_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('userId', newUserId);
      setUserIdState(newUserId);
    }
  }, []);

  const setUserId = (id: string) => {
    localStorage.setItem('userId', id);
    setUserIdState(id);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    const newUserId = `user_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('userId', newUserId);
    setUserIdState(newUserId);
  };

  return (
    <AuthContext.Provider value={{ userId, setUserId, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
