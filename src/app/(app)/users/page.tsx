"use client";

import React, { useState, useMemo } from 'react';
import { UserTable } from '@/components/users/UserTable';
import { UserForm } from '@/components/users/UserForm';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mockData';
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

export default function UsersPage() {
  const { toast } = useToast();
  // This is a mock for role-based access. In a real app, this would be handled by authentication.
  const isAdmin = true; // Assume current user is admin for UI purposes

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = useMemo(() => {
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

  const handleDeleteUser = (userId: string) => {
    // Mock deletion
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({ variant: "destructive", title: "User Deleted", description: `User ID ${userId} has been removed.` });
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingUser) {
      // Mock update
      setUsers(prev => prev.map(user => user.id === editingUser.id ? { ...user, ...data, id: user.id, createdAt: user.createdAt } : user));
      toast({ title: "User Updated", description: `User ${data.name} has been updated.` });
    } else {
      // Mock add
      const newUser: User = { ...data, id: `user-${Date.now()}`, createdAt: new Date() };
      setUsers(prev => [newUser, ...prev]);
      toast({ title: "User Added", description: `User ${data.name} has been added.` });
    }
    setIsSubmitting(false);
    setIsModalOpen(false);
    setEditingUser(undefined);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-semibold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-headline font-semibold">User Management</h1>
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingUser(undefined); }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddUser}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update the details of the existing user.' : 'Fill in the form to add a new user.'}
              </DialogDescription>
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
