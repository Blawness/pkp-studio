
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { login as loginAction } from '@/lib/actions';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);
    try {
      const loggedInUser = await loginAction(email, pass);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('authUser', JSON.stringify(loggedInUser));
        toast({ title: "Login Successful", description: `Welcome back, ${loggedInUser.name}!` });
        return true;
      } else {
        const errorMsg = 'Invalid email or password.';
        setAuthError(errorMsg);
        toast({ variant: "destructive", title: "Login Failed", description: errorMsg });
        return false;
      }
    } catch (error) {
      const errorMsg = 'An unexpected error occurred.';
      setAuthError(errorMsg);
      toast({ variant: "destructive", title: "Login Error", description: errorMsg });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem('authUser');
    router.push('/login');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
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
