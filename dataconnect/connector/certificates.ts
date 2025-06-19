
import {getDatabase, Timestamp} from 'firebase-admin/dataconnect';
import {HttpsError} from 'firebase-functions/v2/https';

// Interface for the Certificate data stored in the database
// Note: Firebase Data Connect typically uses Timestamp for dates.
// The client SDK will handle conversion to/from JavaScript Date objects or strings.
interface CertificateDbModel {
  id: string; // Typically 'kode' will be used as the primary key or a unique identifier.
  kode: string;
  nama_pemegang: string;
  surat_hak: string;
  no_sertifikat: string;
  lokasi_tanah: string;
  luas_m2: number;
  tgl_terbit: Timestamp;
  surat_ukur: string;
  nib: string;
  pendaftaran_pertama: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Input type for creating a certificate - for resolver arguments
interface CertificateCreateResolverArgs {
  kode: string;
  nama_pemegang: string;
  surat_hak: string;
  no_sertifikat: string;
  lokasi_tanah: string;
  luas_m2: number;
  tgl_terbit: Timestamp; // Expect Timestamp from DataConnect runtime
  surat_ukur: string;
  nib: string;
  pendaftaran_pertama: Timestamp; // Expect Timestamp from DataConnect runtime
}

// Input type for updating a certificate - for resolver arguments
interface CertificateUpdateResolverArgs {
  kode: string; // Used to identify the certificate to update
  nama_pemegang?: string;
  surat_hak?: string;
  no_sertifikat?: string;
  lokasi_tanah?: string;
  luas_m2?: number;
  tgl_terbit?: Timestamp; // Expect Timestamp from DataConnect runtime
  surat_ukur?: string;
  nib?: string;
  pendaftaran_pertama?: Timestamp; // Expect Timestamp from DataConnect runtime
}

// Helper to convert Date to Timestamp for DB operations if necessary
// This is safe as it only converts actual JS Date instances.
function convertDatesToTimestamps<T extends Record<string, any>>(obj: T): T {
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] instanceof Date) {
      newObj[key] = Timestamp.fromDate(newObj[key] as Date);
    }
  }
  return newObj;
}


export const listCertificates = async (): Promise<CertificateDbModel[]> => {
  const db = getDatabase();
  const result = await db.select().from('Certificate').orderBy('kode', 'asc');
  return result as CertificateDbModel[];
};

export const getCertificateByKode = async ({kode}: {kode: string;}): Promise<CertificateDbModel | null> => {
  const db = getDatabase();
  const result = await db.select().from('Certificate').where({kode}).first();
  return result as CertificateDbModel | null;
};

export const createCertificate = async ({input}: {input: CertificateCreateResolverArgs;}): Promise<CertificateDbModel> => {
  const db = getDatabase();
  
  const existingCert = await db.select().from('Certificate').where({kode: input.kode}).first();
  if (existingCert) {
    throw new HttpsError('already-exists', `Certificate with kode ${input.kode} already exists.`);
  }

  // Data Connect runtime provides Timestamp objects for tgl_terbit and pendaftaran_pertama.
  // The convertDatesToTimestamps helper won't modify them if they are already Timestamps.
  // It's kept for safety or if this function were called from server-side code with JS Dates.
  const dbInput = convertDatesToTimestamps({
    ...input,
    id: input.kode, // Using kode as id
  });

  const result = await db.insert(dbInput).into('Certificate').returning('*');
  if (!result || result.length === 0) {
    throw new HttpsError('internal', 'Failed to create certificate.');
  }
  return result[0] as CertificateDbModel;
};

export const updateCertificate = async ({input}: {input: CertificateUpdateResolverArgs;}): Promise<CertificateDbModel | null> => {
  const db = getDatabase();
  const {kode, ...updates} = input;
  
  // Data Connect runtime provides Timestamp objects for date fields in 'updates'.
  const dbUpdates = convertDatesToTimestamps(updates);

  const result = await db.update(dbUpdates).from('Certificate').where({kode}).returning('*');
  if (!result || result.length === 0) {
     throw new HttpsError('not-found', `Certificate with kode ${kode} not found for update.`);
  }
  return result[0] as CertificateDbModel;
};

export const deleteCertificateByKode = async ({kode}: {kode: string;}): Promise<string> => {
  const db = getDatabase();
  const result = await db.delete().from('Certificate').where({kode});
  if (result === 0) {
    throw new HttpsError('not-found', `Certificate with kode ${kode} not found for deletion.`);
  }
  return kode;
};
