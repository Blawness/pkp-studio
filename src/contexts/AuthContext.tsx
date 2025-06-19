
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

// A simpler user type for the auth context
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user credentials
const MOCK_ADMIN_EMAIL = "admin@databasepkp.com";
const MOCK_ADMIN_PASSWORD = "password123";
const MOCK_USER_EMAIL = "user@databasepkp.com";
const MOCK_USER_PASSWORD = "password123";


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check for persisted user in localStorage
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse authUser from localStorage", error);
      localStorage.removeItem('authUser');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    let authenticatedUser: AuthUser | null = null;

    if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
      authenticatedUser = { id: 'user-1', name: 'Admin PKP', email: MOCK_ADMIN_EMAIL, role: 'admin' };
    } else if (email === MOCK_USER_EMAIL && password === MOCK_USER_PASSWORD) {
      authenticatedUser = { id: 'user-2', name: 'User PKP', email: MOCK_USER_EMAIL, role: 'user' };
    }

    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('authUser', JSON.stringify(authenticatedUser));
      toast({ title: "Login Successful", description: `Welcome back, ${authenticatedUser.name}!` });
      router.push('/dashboard');
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
