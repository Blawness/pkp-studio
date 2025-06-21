
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserTable } from '@/components/users/UserTable';
import { UserForm, type UserSubmitData } from '@/components/users/UserForm';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/actions';

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[] | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
      setUsers([]);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleAddUser = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({ variant: "destructive", title: "User Deleted", description: `User has been removed.` });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }, [toast, fetchUsers]);

  const handleFormSubmit = useCallback(async (data: UserSubmitData) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        toast({ title: "User Updated", description: `User ${data.name} has been updated.` });
      } else {
        await addUser(data);
        toast({ title: "User Added", description: `User ${data.name} has been added.` });
      }
      fetchUsers();
      setIsModalOpen(false);
      setEditingUser(undefined);
    } catch (error) {
      console.error("Failed to save user:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Save Failed", description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingUser, toast, fetchUsers]);

  if (users === null) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-semibold">User Management</h1>
        <div className="rounded-xl border shadow-xs p-4 text-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-headline font-semibold">User Management</h1>
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingUser(undefined); }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddUser} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>{editingUser ? 'Update user details.' : 'Fill in the form to add a new user.'}</DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleFormSubmit}
              initialData={editingUser}
              isEditing={!!editingUser}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users by name, email, or role..."
          className="pl-10 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <UserTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
