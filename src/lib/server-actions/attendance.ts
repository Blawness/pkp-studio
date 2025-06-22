'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

// --- ATTENDANCE ACTIONS ---
export async function getTodaysAttendanceForUser(userId: string) {
  const today = startOfDay(new Date());

  return prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function getUserAttendanceHistory(userId: string) {
  return prisma.attendance.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30, // Limit to last 30 entries
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function checkIn(userId: string, userName: string) {
  const today = startOfDay(new Date());
  
  const existing = await prisma.attendance.findUnique({
    where: { 
      userId_date: {
        userId,
        date: today,
      }
    }
  });

  if (existing) {
    throw new Error('User has already checked in today.');
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId: userId,
      date: today,
      checkIn: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      user: userName,
      action: 'CHECK_IN',
      details: `User ${userName} checked in.`,
    }
  });

  revalidatePath('/attendance');
  return attendance;
}

export async function checkOut(attendanceId: string, userName: string) {
  const attendance = await prisma.attendance.findUnique({ where: { id: attendanceId } });
  if (!attendance) {
    throw new Error('Attendance record not found.');
  }
  if (attendance.checkOut) {
    throw new Error('User has already checked out.');
  }

  const updatedAttendance = await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      checkOut: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      user: userName,
      action: 'CHECK_OUT',
      details: `User ${userName} checked out.`,
    }
  });

  revalidatePath('/attendance');
  return updatedAttendance;
}

export async function getAttendanceRecords(filters: { userId?: string; startDate?: Date; endDate?: Date } = {}) {
    const whereClause: Prisma.AttendanceWhereInput = {};

    if (filters.userId) {
        whereClause.userId = filters.userId;
    }
    if (filters.startDate && filters.endDate) {
        whereClause.date = {
            gte: startOfDay(filters.startDate),
            lte: endOfDay(filters.endDate),
        };
    }

    return prisma.attendance.findMany({
        where: whereClause,
        include: {
            user: {
                select: { id: true, name: true }
            }
        },
        orderBy: { date: 'desc' },
    });
}

export async function updateAttendance(id: string, data: { checkIn?: Date; checkOut?: Date | null }, performedBy: string) {
  const updatedAttendance = await prisma.attendance.update({
    where: { id },
    data: {
      checkIn: data.checkIn,
      checkOut: data.checkOut,
    },
    include: { user: true },
  });

  await prisma.activityLog.create({
    data: {
      user: performedBy,
      action: 'UPDATE_ATTENDANCE',
      details: `Updated attendance for ${updatedAttendance.user.name} on ${updatedAttendance.date.toLocaleDateString()}.`,
    }
  });

  revalidatePath('/attendance');
  revalidatePath('/logs');
  return updatedAttendance;
}


export async function deleteAttendance(id: string, performedBy: string) {
  const attendanceToDelete = await prisma.attendance.findUnique({
    where: { id },
    include: { user: true },
  });

  if (attendanceToDelete) {
    await prisma.attendance.delete({ where: { id } });
    await prisma.activityLog.create({
      data: {
        user: performedBy,
        action: 'DELETE_ATTENDANCE',
        details: `Deleted attendance for ${attendanceToDelete.user.name} on ${attendanceToDelete.date.toLocaleDateString()}.`,
        payload: attendanceToDelete,
      }
    });
    revalidatePath('/attendance');
    revalidatePath('/logs');
  }
}

export async function exportAttendanceToCSV(): Promise<{ data?: string; error?: string }> {
  try {
    const records = await prisma.attendance.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });

    if (records.length === 0) {
      return { error: 'No attendance records to export.' };
    }

    const headers = ['ID', 'User Name', 'Date', 'Check In', 'Check Out'];
    
    const escapeCsvField = (field: any) => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      return /[",\n]/.test(stringField) ? `"${stringField.replace(/"/g, '""')}"` : stringField;
    };

    const csvRows = records.map(r => {
      const row = [
        r.id,
        r.user.name,
        r.date.toISOString().split('T')[0],
        r.checkIn.toISOString(),
        r.checkOut?.toISOString() ?? '',
      ];
      return row.map(escapeCsvField).join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    return { data: csvString };

  } catch (error) {
    console.error('Failed to export attendance:', error);
    return { error: 'An unexpected error occurred during export.' };
  }
}
