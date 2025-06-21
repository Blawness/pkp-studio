
'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import type { CertificateFormData } from '@/components/certificates/CertificateForm';
import type { UserSubmitData } from '@/components/users/UserForm';
import type { TanahGarapanFormData } from '@/components/tanah-garapan/TanahGarapanForm';
import type { AuthUser } from './types';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

// --- AUTH ACTIONS ---
export async function login(email: string, pass: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(pass, user.password);
  if (!isPasswordValid) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role as 'admin' | 'user' };
}

// --- DASHBOARD ACTIONS ---
export async function getDashboardData() {
  const [certificatesCount, usersCount, logsCount, recentCertificates, certificateTypeCounts, userRoleCounts] = await Promise.all([
    prisma.certificate.count(),
    prisma.user.count(),
    prisma.activityLog.count(),
    prisma.certificate.findMany({
      take: 5,
      orderBy: { tgl_terbit: 'desc' },
    }),
    prisma.certificate.groupBy({
      by: ['surat_hak'],
      _count: { surat_hak: true },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })
  ]);

  return {
    certificatesCount,
    usersCount,
    logsCount,
    recentCertificates,
    certificateTypeCounts,
    userRoleCounts,
  };
}

// --- CERTIFICATE ACTIONS ---
export async function getCertificates() {
  return prisma.certificate.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addCertificate(data: CertificateFormData) {
  try {
    const namesArray = data.nama_pemegang.split(',').map(name => name.trim()).filter(name => name.length > 0);
    await prisma.certificate.create({
      data: {
        ...data,
        nama_pemegang: namesArray,
      },
    });
    revalidatePath('/certificates');
    revalidatePath('/dashboard');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`A certificate with number '${data.no_sertifikat}' already exists.`);
    }
    throw new Error('An unexpected error occurred while adding the certificate.');
  }
}

export async function updateCertificate(id: string, data: CertificateFormData) {
  try {
    const namesArray = data.nama_pemegang.split(',').map(name => name.trim()).filter(name => name.length > 0);
    await prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        nama_pemegang: namesArray,
      },
    });
    revalidatePath('/certificates');
    revalidatePath('/dashboard');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`A certificate with number '${data.no_sertifikat}' already exists.`);
    }
    throw new Error('An unexpected error occurred while updating the certificate.');
  }
}

export async function deleteCertificate(id: string) {
  await prisma.certificate.delete({ where: { id } });
  revalidatePath('/certificates');
  revalidatePath('/dashboard');
}

// --- USER ACTIONS ---
export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addUser(data: UserSubmitData) {
  try {
    if (!data.password) {
      throw new Error('Password is required for new users.');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        password: hashedPassword,
      },
    });
    revalidatePath('/users');
    revalidatePath('/dashboard');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`A user with email '${data.email}' already exists.`);
    }
    throw new Error('An unexpected error occurred while adding the user.');
  }
}

export async function updateUser(id: string, data: UserSubmitData) {
  try {
    const updateData: { name: string; email: string; role: 'admin' | 'user'; password?: string } = {
      name: data.name,
      email: data.email,
      role: data.role,
    };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/users');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`A user with email '${data.email}' already exists.`);
    }
    throw new Error('An unexpected error occurred while updating the user.');
  }
}


export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath('/users');
  revalidatePath('/dashboard');
}

// --- LOG ACTIONS ---
export async function getLogs() {
  return prisma.activityLog.findMany({
    orderBy: { timestamp: 'desc' },
  });
}

// --- TANAH GARAPAN ACTIONS ---
export async function getTanahGarapanEntries() {
  return prisma.tanahGarapanEntry.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function addTanahGarapanEntry(data: TanahGarapanFormData) {
  await prisma.tanahGarapanEntry.create({ data });
  revalidatePath('/tanah-garapan');
}

export async function updateTanahGarapanEntry(id: string, data: TanahGarapanFormData) {
  await prisma.tanahGarapanEntry.update({
    where: { id },
    data,
  });
  revalidatePath('/tanah-garapan');
}

export async function deleteTanahGarapanEntry(id: string) {
  await prisma.tanahGarapanEntry.delete({ where: { id } });
  revalidatePath('/tanah-garapan');
}
