
import type { Certificate, User, ActivityLog, TanahGarapanEntry } from './types';
import { SURAT_HAK_OPTIONS } from './constants';

export const mockCertificates: Certificate[] = Array.from({ length: 25 }, (_, i) => {
  const singleHolder = [`Pemegang ${i + 1}`];
  const multipleHolders = [
    `Pemegang Utama ${i + 1}`,
    `Pemegang Tambahan A${i + 1}`,
    `Pemegang Tambahan B${i + 1}`
  ];
  return {
    id: `cert-${i + 1}`,
    kode: `K00${i + 1}`,
    nama_pemegang: (i % 3 === 0) ? multipleHolders : singleHolder,
    surat_hak: SURAT_HAK_OPTIONS[i % SURAT_HAK_OPTIONS.length], // Diversified surat_hak
    no_sertifikat: `SERT-00${i + 1}`,
    lokasi_tanah: `Lokasi Tanah Contoh No. ${i + 1}, Kota Contoh`,
    luas_m2: Math.floor(Math.random() * 400) + 100 + (i * 10), // More varied luas
    tgl_terbit: new Date(2020 + Math.floor(i/5), i % 12, (i % 28) + 1),
    surat_ukur: `SU00${i + 1}`,
    nib: `NIB00${i + 1}`,
    pendaftaran_pertama: new Date(2019 + Math.floor(i/5), i % 12, (i % 28) + 1),
  };
});

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@auracert.com', role: 'admin', createdAt: new Date('2023-01-15T10:00:00Z') },
  { id: 'user-2', name: 'Regular User', email: 'user@auracert.com', role: 'user', createdAt: new Date('2023-02-20T11:30:00Z') },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `user-${i + 3}`,
    name: `User Person ${i + 1}`,
    email: `user${i+1}@example.com`,
    role: (i % 2 === 0) ? 'admin' : 'user', // Slightly more admins for variety
    createdAt: new Date(2023, i+2, (i*3)%28 + 1, 10+i, 30* (i%2)),
  })),
];

export const mockActivityLogs: ActivityLog[] = Array.from({ length: 50 }, (_, i) => {
  const actions = ["Created certificate", "Updated certificate", "Deleted certificate", "Created user", "Updated user"];
  const user = mockUsers[i % mockUsers.length];
  const action = actions[i % actions.length];
  return {
    id: `log-${i + 1}`,
    user: user.name,
    action: action,
    details: `${action.split(' ')[0]} ${action.split(' ')[1]} ID: XYZ-${i+1}`,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * (Math.random() * 5 + 1)), 
  };
});

export const mockTanahGarapanData: TanahGarapanEntry[] = [
  {
    id: 'tg-1',
    letakTanah: 'Blok Sawah A1',
    namaPemegangHak: 'Budi Santoso',
    letterC: 'C-101',
    nomorSuratKeteranganGarapan: 'SKG/001/IV/2023',
    luas: 1500,
    keterangan: 'Sawah produktif, dekat irigasi',
    createdAt: new Date('2023-04-10T08:00:00Z'),
  },
  {
    id: 'tg-2',
    letakTanah: 'Blok Sawah A1',
    namaPemegangHak: 'Siti Aminah',
    letterC: 'C-102',
    nomorSuratKeteranganGarapan: 'SKG/002/IV/2023',
    luas: 1200,
    keterangan: 'Sebelah sawah Budi Santoso',
    createdAt: new Date('2023-04-12T09:30:00Z'),
  },
  {
    id: 'tg-3',
    letakTanah: 'Blok Kebun B2',
    namaPemegangHak: 'Ahmad Dahlan',
    letterC: 'C-205',
    nomorSuratKeteranganGarapan: 'SKG/003/V/2023',
    luas: 2500,
    keterangan: 'Tanaman jagung dan singkong',
    createdAt: new Date('2023-05-01T14:15:00Z'),
  },
  {
    id: 'tg-4',
    letakTanah: 'Area Hutan Lindung Tepi',
    namaPemegangHak: 'Komunitas Adat XYZ',
    letterC: 'C-500 (Kolektif)',
    nomorSuratKeteranganGarapan: 'SKG/KOM/001/I/2024',
    luas: 10000,
    keterangan: 'Pengelolaan hutan oleh masyarakat adat',
    createdAt: new Date('2024-01-20T10:00:00Z'),
  },
  {
    id: 'tg-5',
    letakTanah: 'Blok Kebun B2',
    namaPemegangHak: 'Dewi Lestari',
    letterC: 'C-208',
    nomorSuratKeteranganGarapan: 'SKG/004/VI/2023',
    luas: 800,
    keterangan: 'Tanaman sayuran organik',
    createdAt: new Date('2023-06-15T11:00:00Z'),
  },
];
