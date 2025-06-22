
'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import { Prisma } from '@prisma/client';
import type { CertificateFormData } from '@/components/certificates/CertificateForm';
import type { UserSubmitData } from '@/components/users/UserForm';
import type { TanahGarapanFormData } from '@/components/tanah-garapan/TanahGarapanForm';
import type { AuthUser, Certificate, User, TanahGarapanEntry } from './types';
import bcrypt from 'bcryptjs';

// --- AUTH ACTIONS ---
export async function login(email: string, pass: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(pass, user.password);
  if (!isPasswordValid) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
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
    const existingBySertifikat = await prisma.certificate.findUnique({
      where: { no_sertifikat: data.no_sertifikat },
    });
    if (existingBySertifikat) {
      throw new Error(`A certificate with number '${data.no_sertifikat}' already exists.`);
    }
    
    const existingByNIB = await prisma.certificate.findUnique({
      where: { nib: data.nib },
    });
    if (existingByNIB) {
      throw new Error(`A certificate with NIB '${data.nib}' already exists.`);
    }

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
    console.error("Add Certificate Error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unexpected error occurred while adding the certificate.');
  }
}

export async function updateCertificate(id: string, data: CertificateFormData, userName: string) {
  try {
    const conflictingSertifikat = await prisma.certificate.findFirst({
      where: { no_sertifikat: data.no_sertifikat, id: { not: id } },
    });
    if (conflictingSertifikat) {
      throw new Error(`A certificate with number '${data.no_sertifikat}' already exists.`);
    }

    const conflictingNIB = await prisma.certificate.findFirst({
      where: { nib: data.nib, id: { not: id } },
    });
    if (conflictingNIB) {
      throw new Error(`A certificate with NIB '${data.nib}' already exists.`);
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
    console.error("Update Certificate Error:", error);
    if (error instanceof Error) {
        throw error;
    }
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
          payload: certificate,
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

export async function exportCertificatesToCSV(): Promise<{ data?: string; error?: string }> {
  // NOTE: This action is protected by UI logic that only shows the button to admins.
  // In a production app with higher security needs, you would implement
  // server-side session/role verification here.
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (certificates.length === 0) {
      return { error: 'No certificates to export.' };
    }

    const headers = [
      'ID', 'Kode', 'Nama Pemegang Hak', 'Surat Hak', 'No Sertifikat',
      'Lokasi Tanah', 'Luas (m2)', 'Tanggal Terbit', 'Surat Ukur', 'NIB',
      'Pendaftaran Pertama', 'Dibuat Pada', 'Diperbarui Pada'
    ];

    const escapeCsvField = (field: any) => {
      if (field === null || field === undefined) {
        return '';
      }
      const stringField = String(field);
      if (/[",\n]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const csvRows = certificates.map(cert => {
      const row = [
        cert.id,
        cert.kode,
        Array.isArray(cert.nama_pemegang) ? cert.nama_pemegang.join('; ') : '',
        cert.surat_hak,
        cert.no_sertifikat,
        cert.lokasi_tanah,
        cert.luas_m2,
        cert.tgl_terbit.toISOString(),
        cert.surat_ukur,
        cert.nib,
        cert.pendaftaran_pertama.toISOString(),
        cert.createdAt?.toISOString() ?? '',
        cert.updatedAt?.toISOString() ?? ''
      ];
      return row.map(escapeCsvField).join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    return { data: csvString };
  } catch (error) {
    console.error('Failed to export certificates:', error);
    return { error: 'An unexpected error occurred during the export.' };
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

    const updateData: { name: string; email: string; role: 'admin' | 'manager' | 'user'; password?: string } = {
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
      const { password, ...userPayload } = userToDelete;
       await prisma.activityLog.create({
        data: {
          user: performedBy,
          action: 'DELETE_USER',
          details: `Deleted user '${userToDelete.name}'.`,
          payload: userPayload,
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
        payload: entry,
      }
    });
    revalidatePath('/tanah-garapan');
    revalidatePath('/logs');
  }
}

export async function exportTanahGarapanToCSV(): Promise<{ data?: string; error?: string }> {
  // NOTE: This action is protected by UI logic that only shows the button to admins.
  // For higher security, implement server-side session/role verification here.
  try {
    const entries = await prisma.tanahGarapanEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (entries.length === 0) {
      return { error: 'No data Tanah Garapan to export.' };
    }

    const headers = [
      'id', 'letakTanah', 'namaPemegangHak', 'letterC', 
      'nomorSuratKeteranganGarapan', 'luas', 'keterangan'
    ];

    const escapeCsvField = (field: any) => {
      if (field === null || field === undefined) {
        return '';
      }
      const stringField = String(field);
      if (/[",\n]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const csvRows = entries.map(entry => {
      const row = [
        entry.id,
        entry.letakTanah,
        entry.namaPemegangHak,
        entry.letterC,
        entry.nomorSuratKeteranganGarapan,
        entry.luas,
        entry.keterangan,
      ];
      return row.map(escapeCsvField).join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    return { data: csvString };
  } catch (error) {
    console.error('Failed to export Tanah Garapan data:', error);
    return { error: 'An unexpected error occurred during the export.' };
  }
}

// --- DATA RECOVERY ---
export async function restoreData(logId: string, userName: string): Promise<{ success: boolean; message: string }> {
  const log = await prisma.activityLog.findUnique({ where: { id: logId } });

  if (!log || !log.payload) {
    return { success: false, message: 'Log entry not found or no data to restore.' };
  }

  try {
    let restoredItemDetails = '';
    const revalidationPaths: string[] = [];

    switch (log.action) {
      case 'DELETE_CERTIFICATE': {
        const certData = log.payload as Certificate;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, updatedAt, ...restorableCertData } = certData;
        const restoredCert = await prisma.certificate.create({
          data: {
            ...restorableCertData,
            nama_pemegang: Array.isArray(restorableCertData.nama_pemegang) ? restorableCertData.nama_pemegang : [],
            tgl_terbit: new Date(restorableCertData.tgl_terbit),
            pendaftaran_pertama: new Date(restorableCertData.pendaftaran_pertama),
          },
        });
        restoredItemDetails = `Restored certificate '${restoredCert.no_sertifikat}'.`;
        revalidationPaths.push('/certificates', '/dashboard', '/logs');
        break;
      }
      case 'DELETE_USER': {
        const userData = log.payload as User;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, ...restorableUserData } = userData;
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const restoredUser = await prisma.user.create({
          data: {
            ...restorableUserData,
            password: hashedPassword,
          },
        });
        restoredItemDetails = `Restored user '${restoredUser.name}'. A new temporary password was set.`;
        revalidationPaths.push('/users', '/dashboard', '/logs');
        break;
      }
      case 'DELETE_TANAH_GARAPAN': {
        const tgData = log.payload as TanahGarapanEntry;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, ...restorableTgData } = tgData;
        const restoredTg = await prisma.tanahGarapanEntry.create({
          data: restorableTgData,
        });
        restoredItemDetails = `Restored Tanah Garapan entry for '${restoredTg.namaPemegangHak}'.`;
        revalidationPaths.push('/tanah-garapan', '/logs');
        break;
      }
      default:
        return { success: false, message: 'This log entry is not a recoverable deletion.' };
    }

    await prisma.activityLog.create({
      data: {
        user: userName,
        action: 'RESTORE_DATA',
        details: restoredItemDetails,
        payload: log.payload,
      },
    });

    for (const path of revalidationPaths) {
      revalidatePath(path);
    }

    return { success: true, message: 'Data restored successfully.' };

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta as { target?: string[] })?.target?.join(', ');
      return { success: false, message: `Restore failed: An item with the same unique value (${target}) already exists.` };
    }
    console.error("Restore Data Error:", error);
    return { success: false, message: 'An unexpected error occurred during restoration.' };
  }
}
