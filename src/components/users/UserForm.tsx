
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

// Base schema representing the form's data structure.
// Passwords are optional and can be empty strings (for edit mode).
const baseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(['admin', 'user'] as const, { required_error: "Role is required" }),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
});

type UserFormData = z.infer<typeof baseFormSchema>;

// This type is for the data passed to the parent component's onSubmit handler.
export type UserSubmitData = Omit<UserFormData, 'confirmPassword'>;

// Refinement logic for password confirmation
const passwordConfirmationRefinement = (data: { password?: string; confirmPassword?: string }) => {
  // If a password is provided (not undefined, not an empty string for form purposes), it must match confirmation.
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true; // Passes if no new password is being set
};
const passwordConfirmationParams = {
  message: "Passwords do not match",
  path: ["confirmPassword"],
};

// Schema for adding a new user (passwords are required)
const addUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(['admin', 'user'] as const, { required_error: "Role is required" }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"), // Ensure confirm is not empty
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


// Schema for editing an existing user (passwords are optional, but if provided, must match)
const editUserSchema = baseFormSchema.refine(passwordConfirmationRefinement, passwordConfirmationParams);

interface UserFormProps {
  onSubmit: (data: UserSubmitData) => void;
  initialData?: Partial<User>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export function UserForm({ onSubmit, initialData, isEditing = false, isSubmitting }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(isEditing ? editUserSchema : addUserSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || 'user',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = form.watch('password');

  // This function prepares the data for the parent component.
  const handleFormSubmit = (data: UserFormData) => {
    // The confirmPassword field is not needed by the parent.
    const { confirmPassword, ...submitData } = data;
    onSubmit(submitData);
  };
  
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
