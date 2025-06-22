'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import type { CertificateFormData } from '@/components/certificates/CertificateForm';

// --- CERTIFICATE ACTIONS ---
export async function getCertificates() {
  return prisma.certificate.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getCertificateById(id: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
  });
  if (!certificate) {
    throw new Error('Certificate not found');
  }
  return certificate;
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
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unexpected error occurred while deleting the certificate.');
  }
}

export async function exportCertificatesToCSV(): Promise<{ data?: string; error?: string }> {
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
        Array.isArray(cert.nama_pemegang) ? (cert.nama_pemegang as string[]).join('; ') : '',
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