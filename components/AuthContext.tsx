import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Role = 'user' | 'merchant';

export interface User {
  id: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (role: Role) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  signIn: () => { },
  signOut: () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initial check (mock)
  useEffect(() => {
    // Check local storage or similar in real app
  }, []);

  const signIn = (role: Role) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: '123',
        name: role === 'merchant' ? 'IKEA Merchant' : 'John Doe',
        role,
      });
      setIsLoading(false);
    }, 1000);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
