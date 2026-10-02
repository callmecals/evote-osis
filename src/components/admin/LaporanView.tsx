import React, { useState } from 'react';
import {
  Candidate,
  ElectionSettings,
  SchoolSettings,
  Voter,
  AnonymousVote,
  AuditLog,
} from '../../types';
import {
  FileText,
  Printer,
  Download,
  School,
  CheckCircle2,
  BarChart2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../common/Toast';

interface LaporanViewProps {
  schoolSettings: SchoolSettings;
  electionSettings: ElectionSettings;
  candidates: Candidate[];
  voters: Voter[];
  votes: AnonymousVote[];
  auditLogs: AuditLog[];
  stats: {
    totalDpt: number;
    sudahMemilih: number;
    belumMemilih: number;
    persentasePartisipasi: number;
    totalSuaraMasuk: number;
    votesPerCandidate: Record<string, { count: number; percentage: number }>;
    classStats: Record<string, { total: number; sudah: number; belum: number; persentase: number }>;
  };
}

type ReportType = 'HASIL' | 'PARTISIPASI' | 'AUDIT';

export const LaporanView: React.FC<LaporanViewProps> = ({
  schoolSettings,
  electionSettings,
  candidates,
  voters,
  votes,
  auditLogs,
  stats,
}) => {
  const [reportType, setReportType] = useState<ReportType>('HASIL');
  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    let filename = '';
    let csvData = '';

    if (reportType === 'HASIL') {
      filename = `Laporan_Hasil_Pemilu_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['Nomor_Urut', 'Nama_Ketua', 'Nama_Wakil', 'Perolehan_Suara', 'Persentase'];
      const rows = candidates.map(c => {
        const cStat = stats.votesPerCandidate[c.id] || { count: 0, percentage: 0 };
        return [
          `"${c.nomorUrut}"`,
          `"${c.namaKetua}"`,
          `"${c.namaWakil}"`,
          `"${cStat.count}"`,
          `"${cStat.percentage}%"`,
        ];
      });
      csvData = [
        `"LAPORAN HASIL PEROLEHAN SUARA PEMILIHAN OSIS"`,
        `"Sekolah: ${schoolSettings.namaSekolah}"`,
        `"Tahun Pelajaran: ${schoolSettings.tahunPelajaran}"`,
        `"Total DPT: ${stats.totalDpt}, Suara Masuk: ${stats.totalSuaraMasuk}, Partisipasi: ${stats.persentasePartisipasi}%"`,
        '',
        headers.join(','),
        ...rows.map(r => r.join(',')),
      ].join('\n');
    } else if (reportType === 'PARTISIPASI') {
      filename = `Laporan_Partisipasi_Kelas_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['Kelas', 'Total_Siswa', 'Sudah_Memilih', 'Belum_Memilih', 'Persentase_Partisipasi'];
      const rows = Object.keys(stats.classStats).map(cls => {
        const item = stats.classStats[cls];
        return [
          `"${cls}"`,
          `"${item.total}"`,
          `"${item.sudah}"`,
          `"${item.belum}"`,
          `"${item.persentase}%"`,
        ];
      });
      csvData = [
        `"LAPORAN PARTISIPASI PEMILIH PER KELAS"`,
        `"Sekolah: ${schoolSettings.namaSekolah}"`,
        '',
        headers.join(','),
        ...rows.map(r => r.join(',')),
      ].join('\n');
    } else {
      filename = `Laporan_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['Timestamp', 'Aktivitas', 'Peran', 'Aktor', 'Deskripsi'];
      const rows = auditLogs.map(l => [
        `"${l.timestamp}"`,
        `"${l.jenisAktivitas}"`,
        `"${l.userRole}"`,
        `"${l.actorName}"`,
        `"${l.deskripsi.replace(/"/g, '""')}"`,
      ]);
      csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File laporan berhasil diunduh (format Excel/CSV).');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Laporan Resmi Pemilihan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Cetak atau unduh rekapitulasi data hasil, partisipasi, dan audit aktivitas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT EXCEL</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>EXPORT PDF / CETAK</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800 flex items-center gap-1 max-w-md print:hidden">
        <button
          onClick={() => setReportType('HASIL')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            reportType === 'HASIL'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          A. Laporan Hasil Pemilu
        </button>

        <button
          onClick={() => setReportType('PARTISIPASI')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            reportType === 'PARTISIPASI'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          B. Laporan Partisipasi
        </button>

        <button
          onClick={() => setReportType('AUDIT')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            reportType === 'AUDIT'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          C. Laporan Audit
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm print:border-none print:p-0">
        {/* Document Header (KOP Surat) */}
        <div className="flex items-center gap-4 pb-6 border-b-2 border-slate-900 dark:border-white">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            {schoolSettings.logoSekolah ? (
              <img
                src={schoolSettings.logoSekolah}
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            ) : (
              <School className="w-8 h-8 text-slate-600 dark:text-slate-300" />
            )}
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
              PEMERINTAH DAERAH · DINAS PENDIDIKAN
            </h2>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {schoolSettings.namaSekolah}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {schoolSettings.alamatSekolah}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Tahun Pelajaran {schoolSettings.tahunPelajaran}
            </p>
          </div>
        </div>

        {/* Document Sub-Header */}
        <div className="text-center my-6">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider underline">
            {reportType === 'HASIL'
              ? 'LAPORAN REKAPITULASI HASIL PEMILIHAN KETUA & WAKIL OSIS'
              : reportType === 'PARTISIPASI'
              ? 'LAPORAN TINGKAT PARTISIPASI PEMILIH PER KELAS'
              : 'LAPORAN AUDIT AKTIVITAS SISTEM'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dicetak pada: {new Date().toLocaleString('id-ID')} WIB
          </p>
        </div>

        {/* REPORT CONTENT: HASIL */}
        {reportType === 'HASIL' && (
          <div className="space-y-6">
            {/* Summary Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500 block">Total DPT:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                  {stats.totalDpt} Jiwa
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Suara Masuk:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                  {stats.totalSuaraMasuk} Suara
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Belum Memilih:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-sm">
                  {stats.belumMemilih} Siswa
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Partisipasi:</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">
                  {stats.persentasePartisipasi}%
                </span>
              </div>
            </div>

            {/* Candidate Table */}
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 border-r">No. Urut</th>
                  <th className="py-2.5 px-4 border-r">Nama Calon Ketua</th>
                  <th className="py-2.5 px-4 border-r">Nama Calon Wakil</th>
                  <th className="py-2.5 px-4 border-r text-right">Jumlah Suara</th>
                  <th className="py-2.5 px-4 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {candidates.map(cand => {
                  const cStat = stats.votesPerCandidate[cand.id] || { count: 0, percentage: 0 };
                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 border-r font-mono font-bold text-center">
                        {cand.nomorUrut}
                      </td>
                      <td className="py-2.5 px-4 border-r font-semibold text-slate-900 dark:text-white">
                        {cand.namaKetua}
                      </td>
                      <td className="py-2.5 px-4 border-r text-slate-800 dark:text-slate-200">
                        {cand.namaWakil}
                      </td>
                      <td className="py-2.5 px-4 border-r text-right font-mono font-bold">
                        {cStat.count}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-600">
                        {cStat.percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT CONTENT: PARTISIPASI */}
        {reportType === 'PARTISIPASI' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 border-r">No</th>
                  <th className="py-2.5 px-4 border-r">Kelas</th>
                  <th className="py-2.5 px-4 border-r text-center">Total DPT</th>
                  <th className="py-2.5 px-4 border-r text-center">Sudah Memilih</th>
                  <th className="py-2.5 px-4 border-r text-center">Belum Memilih</th>
                  <th className="py-2.5 px-4 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {Object.keys(stats.classStats).map((cls, idx) => {
                  const item = stats.classStats[cls];
                  return (
                    <tr key={cls}>
                      <td className="py-2 px-3 border-r text-center font-mono">{idx + 1}</td>
                      <td className="py-2 px-4 border-r font-semibold">{cls}</td>
                      <td className="py-2 px-4 border-r text-center font-mono">{item.total}</td>
                      <td className="py-2 px-4 border-r text-center font-mono text-emerald-600 font-bold">
                        {item.sudah}
                      </td>
                      <td className="py-2 px-4 border-r text-center font-mono text-amber-600">
                        {item.belum}
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-blue-600">
                        {item.persentase}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT CONTENT: AUDIT */}
        {reportType === 'AUDIT' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2 px-3 border-r">Waktu</th>
                  <th className="py-2 px-3 border-r">Aktivitas</th>
                  <th className="py-2 px-3 border-r">Aktor / Role</th>
                  <th className="py-2 px-4">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                {auditLogs.slice(0, 50).map(l => (
                  <tr key={l.id}>
                    <td className="py-2 px-3 border-r font-mono whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 border-r font-mono font-bold whitespace-nowrap">
                      {l.jenisAktivitas}
                    </td>
                    <td className="py-2 px-3 border-r whitespace-nowrap">
                      {l.actorName} ({l.userRole})
                    </td>
                    <td className="py-2 px-4">{l.deskripsi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <p className="text-slate-500">Ketua Panitia Pemilihan,</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900 dark:text-white">
              {schoolSettings.namaKetuaPanitia || 'Ahmad Faiz Pratama'}
            </p>
            <p className="text-slate-400 text-[11px]">NIS. Panitia OSIS</p>
          </div>

          <div>
            <p className="text-slate-500">Pembina OSIS,</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900 dark:text-white">
              {schoolSettings.namaPembinaOsis || 'Dra. Endang Sulistyowati, M.Pd.'}
            </p>
            <p className="text-slate-400 text-[11px]">NIP. 19780815 200501 2 006</p>
          </div>

          <div>
            <p className="text-slate-500">Kepala Sekolah,</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900 dark:text-white">
              {schoolSettings.namaKepalaSekolah || 'Dr. H. Bambang Subagyo, M.M.'}
            </p>
            <p className="text-slate-400 text-[11px]">
              NIP. {schoolSettings.nipKepalaSekolah || '19740512 199903 1 004'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
