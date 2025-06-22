'use server';

import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import type { AuthUser } from '../types';

// --- AUTH ACTIONS ---
export async function login(email: string, pass: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(pass, user.password);
  if (!isPasswordValid) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role as AuthUser['role'] };
}
