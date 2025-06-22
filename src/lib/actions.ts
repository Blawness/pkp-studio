
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

export async function addCertificate(data: CertificateFormData, userName: string) {
  try {
    const namesArray = data.nama_pemegang.split(',').map(name => name.trim()).filter(name => name.length > 0);
    const newCertificate = await prisma.certificate.create({
      data: {
        ...data,
        nama_pemegang: namesArray,
      },
    });
    await prisma.activityLog.create({
      data: {
        user: userName,
        action: 'CREATE_CERTIFICATE',
        details: `Created certificate '${newCertificate.no_sertifikat}' for ${newCertificate.nama_pemegang.join(', ')}.`,
      }
    });
    revalidatePath('/certificates');
    revalidatePath('/dashboard');
    revalidatePath('/logs');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`A certificate with number '${data.no_sertifikat}' already exists.`);
    }
    console.error("Add Certificate Error:", error);
    throw new Error('An unexpected error occurred while adding the certificate.');
  }
}

export async function updateCertificate(id: string, data: CertificateFormData, userName: string) {
  try {
    const existing = await prisma.certificate.findUnique({
      where: { no_sertifikat: data.no_sertifikat },
    });

    if (existing && existing.id !== id) {
      throw new Error(`A certificate with number '${data.no_sertifikat}' already exists.`);
    }

    const namesArray = data.nama_pemegang.split(',').map(name => name.trim()).filter(name => name.length > 0);
    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        nama_pemegang: namesArray,
      },
    });
    await prisma.activityLog.create({
      data: {
        user: userName,
        action: 'UPDATE_CERTIFICATE',
        details: `Updated certificate '${updatedCertificate.no_sertifikat}'.`,
      }
    });
    revalidatePath('/certificates');
    revalidatePath('/dashboard');
    revalidatePath('/logs');
  } catch (error) {
    if (error instanceof Error) {
        throw error;
    }
    console.error("Update Certificate Error:", error);
    throw new Error('An unexpected error occurred while updating the certificate.');
  }
}

export async function deleteCertificate(id: string, userName: string) {
  try {
    const certificate = await prisma.certificate.findUnique({ where: { id } });
    if (certificate) {
      await prisma.certificate.delete({ where: { id } });
      await prisma.activityLog.create({
        data: {
          user: userName,
          action: 'DELETE_CERTIFICATE',
          details: `Deleted certificate '${certificate.no_sertifikat}'.`,
        }
      });
      revalidatePath('/certificates');
      revalidatePath('/dashboard');
      revalidatePath('/logs');
    }
  } catch(error) {
    console.error("Delete Certificate Error:", error);
    throw new Error('An unexpected error occurred while deleting the certificate.');
  }
}

// --- USER ACTIONS ---
export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addUser(data: UserSubmitData, performedBy: string) {
  try {
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`A user with email '${data.email}' already exists.`);
    }
    console.error("Add User Error:", error);
    throw new Error('An unexpected error occurred while adding the user.');
  }
}

export async function updateUser(id: string, data: UserSubmitData, performedBy: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== id) {
      throw new Error(`A user with email '${data.email}' already exists.`);
    }

    const updateData: { name: string; email: string; role: 'admin' | 'user'; password?: string } = {
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
    if (error instanceof Error) {
        throw error;
    }
    console.error("Update User Error:", error);
    throw new Error('An unexpected error occurred while updating the user.');
  }
}


export async function deleteUser(id: string, performedBy: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      await prisma.user.delete({ where: { id } });
       await prisma.activityLog.create({
        data: {
          user: performedBy,
          action: 'DELETE_USER',
          details: `Deleted user '${user.name}'.`,
        }
      });
      revalidatePath('/users');
      revalidatePath('/dashboard');
      revalidatePath('/logs');
    }
  } catch(error) {
    console.error("Delete User Error:", error);
    throw new Error('An unexpected error occurred while deleting the user.');
  }
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

export async function addTanahGarapanEntry(data: TanahGarapanFormData, userName: string) {
  const newEntry = await prisma.tanahGarapanEntry.create({ data });
  await prisma.activityLog.create({
    data: {
      user: userName,
      action: 'CREATE_TANAH_GARAPAN',
      details: `Created new entry for '${newEntry.namaPemegangHak}' in '${newEntry.letakTanah}'.`,
    }
  });
  revalidatePath('/tanah-garapan');
  revalidatePath('/logs');
}

export async function updateTanahGarapanEntry(id: string, data: TanahGarapanFormData, userName: string) {
  const updatedEntry = await prisma.tanahGarapanEntry.update({
    where: { id },
    data,
  });
  await prisma.activityLog.create({
    data: {
      user: userName,
      action: 'UPDATE_TANAH_GARAPAN',
      details: `Updated entry for '${updatedEntry.namaPemegangHak}' in '${updatedEntry.letakTanah}'.`,
    }
  });
  revalidatePath('/tanah-garapan');
  revalidatePath('/logs');
}

export async function deleteTanahGarapanEntry(id: string, userName: string) {
  const entry = await prisma.tanahGarapanEntry.findUnique({ where: { id } });
  if (entry) {
    await prisma.tanahGarapanEntry.delete({ where: { id } });
    await prisma.activityLog.create({
      data: {
        user: userName,
        action: 'DELETE_TANAH_GARAPAN',
        details: `Deleted entry for '${entry.namaPemegangHak}' in '${entry.letakTanah}'.`,
      }
    });
    revalidatePath('/tanah-garapan');
    revalidatePath('/logs');
  }
}
