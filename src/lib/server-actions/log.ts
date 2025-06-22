'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { Prisma } from '@prisma/client';
import type { Attendance, Certificate, User, TanahGarapanEntry } from '../types';
import bcrypt from 'bcryptjs';

// --- LOG ACTIONS ---
export async function getLogs() {
  return prisma.activityLog.findMany({
    orderBy: { timestamp: 'desc' },
  });
}

// --- DATA RECOVERY ---
export async function restoreData(logId: string, userName: string): Promise<{ success: boolean; message: string }> {
  const log = await prisma.activityLog.findUnique({ where: { id: logId } });

  if (!log || !log.payload) {
    return { success: false, message: 'Log entry not found or no data to restore.' };
  }
  
  const payload = log.payload as Prisma.JsonValue;

  try {
    let restoredItemDetails = '';
    const revalidationPaths: string[] = [];

    switch (log.action) {
      case 'DELETE_CERTIFICATE': {
        const certData = payload as any as Certificate;
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
        const userData = payload as any as User;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, ...restorableUserData } = userData;
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const restoredUser = await prisma.user.create({
          data: {
            ...(restorableUserData as any),
            password: hashedPassword,
          },
        });
        restoredItemDetails = `Restored user '${restoredUser.name}'. A new temporary password was set.`;
        revalidationPaths.push('/users', '/dashboard', '/logs');
        break;
      }
      case 'DELETE_TANAH_GARAPAN': {
        const tgData = payload as any as TanahGarapanEntry;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, updatedAt, ...restorableTgData } = tgData;
        const restoredTg = await prisma.tanahGarapanEntry.create({
          data: restorableTgData,
        });
        restoredItemDetails = `Restored Tanah Garapan entry for '${restoredTg.namaPemegangHak}'.`;
        revalidationPaths.push('/tanah-garapan', '/logs');
        break;
      }
       case 'DELETE_ATTENDANCE': {
        const attendanceData = payload as any as Attendance;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, updatedAt, user, ...restorableData } = attendanceData;
        const restored = await prisma.attendance.create({
          data: {
            ...restorableData,
            date: new Date(restorableData.date),
            checkIn: new Date(restorableData.checkIn),
            checkOut: restorableData.checkOut ? new Date(restorableData.checkOut) : null,
            userId: restorableData.userId,
          },
        });
        restoredItemDetails = `Restored attendance for user ID '${restored.userId}' on ${restored.date.toLocaleDateString()}.`;
        revalidationPaths.push('/attendance', '/logs');
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
