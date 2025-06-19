
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { User } from '@/lib/types';

const getUserSchema = (isEditing: boolean) => {
  const baseFields = {
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(['admin', 'user'], { required_error: "Role is required" }),
  };

  if (isEditing) {
    return z.object({
      ...baseFields,
      password: z.string().optional().or(z.literal('')), // Optional, allow empty string
      confirmPassword: z.string().optional().or(z.literal('')),
    }).superRefine((data, ctx) => {
      const pass = data.password || ""; // Treat undefined/null as empty string
      const confirmPass = data.confirmPassword || "";

      if (pass.length > 0) { // If password is being set/changed
        if (pass.length < 8) {
          ctx.addIssue({
            path: ['password'],
            message: 'Password must be at least 8 characters',
            code: z.ZodIssueCode.too_small,
            minimum: 8,
            type: 'string',
            inclusive: true,
          });
        }
        if (confirmPass.length === 0) {
             ctx.addIssue({
                path: ['confirmPassword'],
                message: 'Please confirm your new password',
                code: z.ZodIssueCode.custom,
             });
        } else if (pass !== confirmPass) {
          ctx.addIssue({
            path: ['confirmPassword'],
            message: 'Passwords do not match',
            code: z.ZodIssueCode.custom,
          });
        }
      } else if (confirmPass.length > 0 && pass.length === 0) {
        // If confirm password is set but main password is not (which is an invalid state for changing password)
        ctx.addIssue({
            path: ['password'],
            message: 'Enter a new password if you wish to change it, or clear confirm password field.',
            code: z.ZodIssueCode.custom,
        });
      }
    });
  } else { // Adding new user
    return z.object({
      ...baseFields,
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
    }).refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
};

// This type can be used for the data passed to onSubmit
type UserSubmitData = {
  name: string;
  email: string;
  role: 'admin' | 'user';
  password?: string; // Password is optional in the submission data
};

interface UserFormProps {
  onSubmit: (data: UserSubmitData) => void;
  initialData?: Partial<User>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export function UserForm({ onSubmit, initialData, isEditing = false, isSubmitting }: UserFormProps) {
  const formSchema = React.useMemo(() => getUserSchema(isEditing), [isEditing]);
  type CurrentFormValues = z.infer<typeof formSchema>;

  const form = useForm<CurrentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || 'user',
      password: '', // Passwords always start empty in the form
      confirmPassword: '',
    },
  });

  const handleFormSubmit = (data: CurrentFormValues) => {
    const { confirmPassword, password, ...submissionDataFields } = data;
    
    const finalSubmitData: UserSubmitData = {
        name: submissionDataFields.name,
        email: submissionDataFields.email,
        role: submissionDataFields.role,
    };

    if (password && (password as string).length > 0) {
      finalSubmitData.password = password as string;
    }
    
    onSubmit(finalSubmitData);
  };
  
  const watchedPassword = form.watch("password");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="e.g., jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value as 'admin' | 'user'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEditing ? "New Password (optional)" : "Password"}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter new password" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm {isEditing && watchedPassword && (watchedPassword as string).length > 0 ? "New " : ""}Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirm password" 
                    {...field} 
                    value={field.value || ''}
                    disabled={isEditing && (!watchedPassword || (watchedPassword as string).length === 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => {form.reset();}} className="w-full sm:w-auto">Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Submitting...' : (isEditing ? 'Update User' : 'Add User')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
