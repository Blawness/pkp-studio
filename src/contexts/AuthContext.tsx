
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_ADMIN_EMAIL = 'admin@pkp.com';
const MOCK_USER_EMAIL = 'user@pkp.com';
const MOCK_SHARED_PASSWORD = 'password'; // Template password

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true to check initial auth status
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Mock initial auth check. In a real app, you'd verify a token or session.
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (
          (email.toLowerCase() === MOCK_ADMIN_EMAIL && pass === MOCK_SHARED_PASSWORD) ||
          (email.toLowerCase() === MOCK_USER_EMAIL && pass === MOCK_SHARED_PASSWORD)
        ) {
          const mockUser: AuthUser = { 
            id: `user-${Date.now()}`, 
            email, 
            name: email.split('@')[0] 
          };
          setUser(mockUser);
          localStorage.setItem('authUser', JSON.stringify(mockUser));
          setTimeout(() => {
            toast({ title: "Login Successful", description: `Welcome back, ${mockUser.name}!` });
          }, 0);
          resolve(true);
        } else {
          setAuthError('Invalid email or password.');
          setTimeout(() => {
            toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
          }, 0);
          resolve(false);
        }
        setLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem('authUser');
    router.push('/login'); // Redirect to login after logout
    setTimeout(() => {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    }, 0);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

