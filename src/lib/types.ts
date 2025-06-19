
// The Certificate type definition can be removed or adapted if
// you primarily use the generated types from @firebasegen/default-connector.
// For now, it's kept for reference but might not be directly used by pages
// that consume Data Connect generated types.
export interface Certificate {
  id: string; // In DataConnect schema, 'kode' is used as 'id'
  kode: string;
  nama_pemegang: string;
  surat_hak: string;
  no_sertifikat: string;
  lokasi_tanah: string;
  luas_m2: number;
  tgl_terbit: Date; // Will be string or Timestamp from DataConnect, convert to Date in frontend
  surat_ukur: string;
  nib: string;
  pendaftaran_pertama: Date; // Will be string or Timestamp from DataConnect
  actions?: boolean; // Optional: to indicate if actions column should be rendered
  createdAt?: Date;
  updatedAt?: Date;
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
