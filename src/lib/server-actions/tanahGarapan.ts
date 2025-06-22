
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import type { TanahGarapanFormData } from '@/components/tanah-garapan/TanahGarapanForm';

// --- TANAH GARAPAN ACTIONS ---
export async function getTanahGarapanEntries() {
  return prisma.tanahGarapanEntry.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTanahGarapanEntryById(id: string) {
  const entry = await prisma.tanahGarapanEntry.findUnique({
    where: { id },
  });
  if (!entry) {
    throw new Error('Data tanah garapan tidak ditemukan');
  }
  return entry;
}

export async function getTanahGarapanEntriesByLetakTanah(letakTanah: string) {
  const entries = await prisma.tanahGarapanEntry.findMany({
    where: { letakTanah },
    orderBy: { namaPemegangHak: 'asc' },
  });
  if (!entries || entries.length === 0) {
    throw new Error(`Data tanah garapan untuk lokasi "${letakTanah}" tidak ditemukan`);
  }
  return entries;
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
  try {
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
  } catch (error) {
    console.error("Delete Tanah Garapan Error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unexpected error occurred while deleting the Tanah Garapan entry.');
  }
}

export async function exportTanahGarapanToCSV(): Promise<{ data?: string; error?: string }> {
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
