'use server';

import prisma from '../prisma';

// --- DASHBOARD ACTIONS ---
export async function getDashboardData() {
  const [certificatesCount, usersCount, logsCount, recentCertificates, certificateTypeCounts, userRoleCounts] = await Promise.all([
    prisma.certificate.count(),
    prisma.user.count(),
    prisma.activityLog.count(),
    prisma.certificate.findMany({
      take: 5,
      orderBy: { tgl_terbit: 'desc' },
    }),
    prisma.certificate.groupBy({
      by: ['surat_hak'],
      _count: { surat_hak: true },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })
  ]);

  return {
    certificatesCount,
    usersCount,
    logsCount,
    recentCertificates,
    certificateTypeCounts,
    userRoleCounts,
  };
}
