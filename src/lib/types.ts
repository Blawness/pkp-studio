
export interface Certificate {
  id: string;
  kode: string;
  nama_pemegang: string;
  surat_hak: string;
  no_sertifikat: string;
  lokasi_tanah: string;
  luas_m2: number;
  tgl_terbit: Date;
  surat_ukur: string;
  nib: string;
  pendaftaran_pertama: Date;
  actions?: boolean; // Optional: to indicate if actions column should be rendered
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  user: string; // User who performed the action
  action: string; // e.g., "Created certificate", "Updated user"
  details: string; // e.g., "Certificate Kode: C001", "User: John Doe"
  timestamp: Date;
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
  // Add other relevant user properties
}

export interface TanahGarapanEntry {
  id: string;
  letakTanah: string; // e.g., "Blok A Sawah"
  namaPemegangHak: string;
  letterC: string;
  nomorSuratKeteranganGarapan: string;
  luas: number; // in m2
  keterangan?: string;
  createdAt: Date;
}
