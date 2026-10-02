import React from 'react';
import {
  Candidate,
  ElectionSettings,
  SchoolSettings,
  Voter,
  AnonymousVote,
} from '../../types';
import { FileSpreadsheet, Printer, School, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BeritaAcaraViewProps {
  schoolSettings: SchoolSettings;
  electionSettings: ElectionSettings;
  candidates: Candidate[];
  voters: Voter[];
  votes: AnonymousVote[];
  stats: {
    totalDpt: number;
    sudahMemilih: number;
    belumMemilih: number;
    persentasePartisipasi: number;
    totalSuaraMasuk: number;
    votesPerCandidate: Record<string, { count: number; percentage: number }>;
  };
}

export const BeritaAcaraView: React.FC<BeritaAcaraViewProps> = ({
  schoolSettings,
  electionSettings,
  candidates,
  voters,
  votes,
  stats,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const today = new Date();
  const hariIndonesia = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ][today.getDay()];

  const tanggalLengkap = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Leading candidate
  const sortedCandidates = [...candidates].sort((a, b) => {
    const vA = stats.votesPerCandidate[a.id]?.count || 0;
    const vB = stats.votesPerCandidate[b.id]?.count || 0;
    return vB - vA;
  });

  const winner = sortedCandidates[0];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Berita Acara Hasil Pemilihan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dokumen legalitas resmi penetapan perolehan suara pemilihan ketua dan wakil OSIS.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>GENERATE PDF / CETAK DOKUMEN</span>
        </button>
      </div>

      {/* Official Legal Document Format */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm print:border-none print:p-0 print:m-0 text-slate-900 dark:text-slate-100 font-sans">
        {/* KOP SURAT */}
        <div className="flex items-center gap-5 pb-5 border-b-4 border-double border-slate-900 dark:border-white">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
            {schoolSettings.logoSekolah ? (
              <img
                src={schoolSettings.logoSekolah}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <School className="w-10 h-10 text-slate-700 dark:text-slate-300" />
            )}
          </div>

          <div className="flex-1 text-center">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-600 dark:text-slate-300">
              PANITIA PEMILIHAN KETUA & WAKIL KETUA OSIS
            </h3>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {schoolSettings.namaSekolah}
            </h1>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {schoolSettings.alamatSekolah}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Tahun Pelajaran {schoolSettings.tahunPelajaran}
            </p>
          </div>
        </div>

        {/* JUDUL BERITA ACARA */}
        <div className="text-center my-8">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider underline">
            BERITA ACARA
          </h2>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide mt-1">
            RAPAT PLENO PENETAPAN HASIL PERHITUNGAN SUARA PEMILIHAN KETUA DAN WAKIL KETUA OSIS
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Nomor: 04/PAN-OSIS/{schoolSettings.tahunPelajaran.replace('/', '-')}/{today.getFullYear()}
          </p>
        </div>

        {/* NARASI PEMBUKA */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify">
          <p>
            Pada hari ini <strong>{hariIndonesia}</strong> tanggal <strong>{tanggalLengkap}</strong>, bertempat di lingkungan <strong>{schoolSettings.namaSekolah}</strong>, Panitia Pemilihan telah menyelenggarakan kegiatan <strong>{schoolSettings.namaKegiatan}</strong> secara digital melalui platform E-Voting OSIS dengan menjunjung tinggi prinsip Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (LUBER JURDIL).
          </p>

          <p>
            Berdasarkan hasil pemungutan dan penghitungan suara secara elektronik yang tercatat pada basis data terenkripsi sistem, diperoleh rekapitulasi data sebagai berikut:
          </p>
        </div>

        {/* TABEL DATA REKAPITULASI DPT & PARTISIPASI */}
        <div className="my-6">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 mb-2">
            I. DATA PEMILIH DAN PENGGUNA HAK PILIH
          </h4>
          <table className="w-full text-left text-xs border border-slate-300 dark:border-slate-700">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="py-2 px-3 w-12 font-mono font-bold text-center border-r">1</td>
                <td className="py-2 px-4 border-r">Jumlah Pemilih Terdaftar dalam DPT</td>
                <td className="py-2 px-4 font-mono font-bold text-right">{stats.totalDpt} orang</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-center border-r">2</td>
                <td className="py-2 px-4 border-r">Jumlah Pemilih yang Menggunakan Hak Pilih</td>
                <td className="py-2 px-4 font-mono font-bold text-right text-emerald-600">
                  {stats.sudahMemilih} orang
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-center border-r">3</td>
                <td className="py-2 px-4 border-r">Jumlah Pemilih yang Tidak Menggunakan Hak Pilih</td>
                <td className="py-2 px-4 font-mono font-bold text-right text-amber-600">
                  {stats.belumMemilih} orang
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-center border-r">4</td>
                <td className="py-2 px-4 border-r font-bold">Persentase Partisipasi Pemilih</td>
                <td className="py-2 px-4 font-mono font-black text-right text-blue-600">
                  {stats.persentasePartisipasi}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TABEL PEROLEHAN SUARA PASLON */}
        <div className="my-6">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 mb-2">
            II. PEROLEHAN SUARA PASANGAN CALON
          </h4>
          <table className="w-full text-left text-xs border border-slate-300 dark:border-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 border-r text-center">No. Urut</th>
                <th className="py-2.5 px-4 border-r">Pasangan Calon (Ketua & Wakil)</th>
                <th className="py-2.5 px-4 border-r text-right">Perolehan Suara</th>
                <th className="py-2.5 px-4 text-right">Persentase (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {candidates.map(cand => {
                const cStat = stats.votesPerCandidate[cand.id] || { count: 0, percentage: 0 };
                return (
                  <tr key={cand.id}>
                    <td className="py-2.5 px-3 border-r font-mono font-bold text-center">
                      {cand.nomorUrut}
                    </td>
                    <td className="py-2.5 px-4 border-r font-semibold">
                      {cand.namaKetua} & {cand.namaWakil}
                    </td>
                    <td className="py-2.5 px-4 border-r font-mono font-bold text-right">
                      {cStat.count} suara
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-right text-blue-600">
                      {cStat.percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* KESIMPULAN PENETAPAN */}
        {winner && stats.totalSuaraMasuk > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm my-6">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Berdasarkan hasil perolehan suara di atas, Panitia Pemilihan menetapkan bahwa:
            </p>
            <p className="mt-1.5 font-bold text-blue-700 dark:text-blue-300">
              Pasangan Calon Nomor Urut {winner.nomorUrut}: {winner.namaKetua} (Ketua) dan {winner.namaWakil} (Wakil) dinyatakan terpilih sebagai Ketua dan Wakil Ketua OSIS Periode Selanjutnya dengan perolehan {stats.votesPerCandidate[winner.id]?.count} suara ({stats.votesPerCandidate[winner.id]?.percentage}%).
            </p>
          </div>
        )}

        <p className="text-xs sm:text-sm text-justify leading-relaxed">
          Demikian Berita Acara ini dibuat dengan sebenarnya dan ditandatangani oleh Panitia Pemilihan serta disahkan oleh Pihak Sekolah untuk dipergunakan sebagaimana mestinya.
        </p>

        {/* 3 KOLOM TANDA TANGAN */}
        <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <p className="text-slate-500">Ketua Panitia Pemilihan,</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900 dark:text-white">
              {schoolSettings.namaKetuaPanitia || 'Ahmad Faiz Pratama'}
            </p>
            <p className="text-slate-400 text-[11px]">NIS. Panitia Pemilu OSIS</p>
          </div>

          <div>
            <p className="text-slate-500">Pembina OSIS,</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900 dark:text-white">
              {schoolSettings.namaPembinaOsis || 'Dra. Endang Sulistyowati, M.Pd.'}
            </p>
            <p className="text-slate-400 text-[11px]">NIP. 19780815 200501 2 006</p>
          </div>

          <div>
            <p className="text-slate-500">Mengetahui,<br />Kepala Sekolah,</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900 dark:text-white">
              {schoolSettings.namaKepalaSekolah || 'Dr. H. Bambang Subagyo, M.M.'}
            </p>
            <p className="text-slate-400 text-[11px]">
              NIP. {schoolSettings.nipKepalaSekolah || '19740512 199903 1 004'}
            </p>
          </div>
        </div>

        {/* System Verification Watermark Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Digital Election Certificate · E-VOTING OSIS</span>
          <span>&copy; 2026 callmecals2026</span>
        </div>
      </div>
    </div>
  );
};
