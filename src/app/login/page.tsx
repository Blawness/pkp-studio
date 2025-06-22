
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loading: authLoading, authError, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    const success = await login(data.email, data.password);
    if (success) {
      router.push('/dashboard');
    }
    setIsSubmitting(false);
  };
  
  if (authLoading && !isSubmitting) { // Show full page loader only for initial auth check
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading application...</p>
      </div>
    );
  }
  
  if (user) { // If user becomes available while on login page (e.g. due to fast local storage restore)
     return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/50">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" className="h-16 w-16">
              <path fill="#b08b41" d="M2.5 143.5c29.8 21.2 65.2 24.8 97.5 24.8s67.7-3.6 97.5-24.8C167.7 154.7 136.3 156 100 156s-67.7-1.3-97.5-12.5z" />
              <path fill="#2c8a9e" d="M3.7 131.2c28.2-22.3 64.8-29.3 96.3-29.3s68.1 7 96.3 29.3c-28.2-19.3-62.5-28.5-96.3-28.5S31.9 111.9 3.7 131.2z" />
              <path fill="#2c8a9e" d="M12.3 120.3c27.1-22.7 61.4-27.1 87.7-27.1s60.6 4.4 87.7 27.1c-27.1-18.7-58.8-26.6-87.7-26.6s-60.6 7.9-87.7 26.6z" />
              <path fill="#1a5e4f" d="M32 6.8c12.3 0 21.3 7.8 31.4 17.2 9.3-11.8 18.4-23.2 31.8-23.2 12.8 0 22.3 8.1 32.2 17.8C142.3 1.1 125.2 0 108.3 0 91.8 0 75.3 13.9 64.9 33.6 54.3 14 38.3 0 21.7 0 8.5 0-4.3 13.9 11.2 38.8 1.9 24.1-10.4 6.8 32 6.8zm99.6 126.9c-7.3-1.4-15.9-2.5-19.2-11.3-3.4-9 1-21.4 1.3-22.4.9-2.8.1-6.7-1.6-8.5-2.5-2.9-20-21-23.2-24.3s-6.1-4.7-9.9-4.7-6.8 1.5-9.9 4.7c-3.2 3.3-20.7 21.4-23.2 24.3-1.7 1.8-2.5 5.7-1.6 8.5.3 1 8.6 21.4 1.3 22.4-3.3 8.8-11.9 9.9-19.2 11.3-10.2 1.9-30.9 7.1-30.9 15 0 1.4 1.1 2.5 2.5 2.5h147.2c1.4 0 2.5-1.1 2.5-2.5.1-7.9-20.6-13.1-30.8-15z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-headline">{APP_NAME}</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {authError && !errors.email && !errors.password && (
              <p className="text-sm text-destructive text-center">{authError}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
              {isSubmitting || authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting || authLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Contact Admin
            </a>
          </p>
          <p className="mt-4 text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
