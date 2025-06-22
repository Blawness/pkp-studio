'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import type { UserSubmitData } from '@/components/users/UserForm';

// --- USER ACTIONS ---
export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addUser(data: UserSubmitData, performedBy: string) {
  try {
    const existing = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existing) {
        throw new Error(`A user with email '${data.email}' already exists.`);
    }

    if (!data.password) {
      throw new Error('Password is required for new users.');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        password: hashedPassword,
      },
    });
    await prisma.activityLog.create({
      data: {
        user: performedBy,
        action: 'CREATE_USER',
        details: `Created new user '${newUser.name}' with role '${newUser.role}'.`,
      }
    });
    revalidatePath('/users');
    revalidatePath('/dashboard');
    revalidatePath('/logs');
  } catch (error) {
    console.error("Add User Error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unexpected error occurred while adding the user.');
  }
}

export async function updateUser(id: string, data: UserSubmitData, performedBy: string) {
  try {
    const conflictingUser = await prisma.user.findFirst({
      where: { email: data.email, id: { not: id } },
    });

    if (conflictingUser) {
      throw new Error(`A user with email '${data.email}' already exists.`);
    }

    const updateData: { name: string; email: string; role: string; password?: string } = {
      name: data.name,
      email: data.email,
      role: data.role,
    };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    await prisma.activityLog.create({
      data: {
        user: performedBy,
        action: 'UPDATE_USER',
        details: `Updated user '${updatedUser.name}'.`,
      }
    });
    revalidatePath('/users');
    revalidatePath('/logs');
  } catch (error) {
    console.error("Update User Error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unexpected error occurred while updating the user.');
  }
}


export async function deleteUser(id: string, performedBy: string) {
  try {
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete) {
      await prisma.user.delete({ where: { id } });
       await prisma.activityLog.create({
        data: {
          user: performedBy,
          action: 'DELETE_USER',
          details: `Deleted user '${userToDelete.name}'.`,
          payload: userToDelete,
        }
      });
      revalidatePath('/users');
      revalidatePath('/dashboard');
      revalidatePath('/logs');
    }
  } catch(error) {
    console.error("Delete User Error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unexpected error occurred while deleting the user.');
  }
}
