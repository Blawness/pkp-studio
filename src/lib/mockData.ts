
import type { User, ActivityLog } from './types'; // Removed Certificate type
// mockCertificates is removed as data will come from Data Connect
// export const mockCertificates: Certificate[] = Array.from({ length: 25 }, (_, i) => ({
//   id: `cert-${i + 1}`,
//   kode: `K00${i + 1}`,
//   nama_pemegang: `Pemegang ${i + 1}`,
//   surat_hak: `SHM`,
//   no_sertifikat: `SERT-00${i + 1}`,
//   lokasi_tanah: `Lokasi Tanah Contoh No. ${i + 1}, Kota Contoh`,
//   luas_m2: Math.floor(Math.random() * 500) + 100, // This was causing hydration issues
//   tgl_terbit: new Date(2020 + Math.floor(i/5), i % 12, (i % 28) + 1),
//   surat_ukur: `SU00${i + 1}`,
//   nib: `NIB00${i + 1}`,
//   pendaftaran_pertama: new Date(2019 + Math.floor(i/5), i % 12, (i % 28) + 1),
// }));

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@databasepkp.com', role: 'admin', createdAt: new Date('2023-01-15T10:00:00Z') },
  { id: 'user-2', name: 'Regular User', email: 'user@databasepkp.com', role: 'user', createdAt: new Date('2023-02-20T11:30:00Z') },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `user-${i + 3}`,
    name: `User Person ${i + 1}`,
    email: `user${i+1}@example.com`,
    role: (i % 3 === 0) ? 'admin' : 'user',
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
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * (Math.random() * 5 + 1)), // Logs from now to a few days ago
  };
});
