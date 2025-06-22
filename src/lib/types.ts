
export interface Certificate {
  id: string; 
  kode: string;
  nama_pemegang: string[] | any; // Allow 'any' for Prisma Json type
  surat_hak: string;
  no_sertifikat: string;
  lokasi_tanah: string;
  luas_m2: number;
  tgl_terbit: Date; 
  surat_ukur: string;
  nib: string;
  pendaftaran_pertama: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: Date;
  payload?: any; // This type is for client-side use, it doesn't represent the DB schema accurately
}

export interface StatCardData {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
};

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'manager' | 'user';
}

export interface TanahGarapanEntry {
  id: string;
  letakTanah: string;
  namaPemegangHak: string;
  letterC: string;
  nomorSuratKeteranganGarapan: string;
  luas: number;
  keterangan: string | null;
  createdAt: Date;
}

export type TanahGarapanFormInput = Omit<TanahGarapanEntry, 'id' | 'createdAt' | 'updatedAt'>;
