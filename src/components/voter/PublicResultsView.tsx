import React from 'react';
import {
  Candidate,
  ElectionSettings,
  SchoolSettings,
} from '../../types';
import {
  BarChart3,
  Lock,
  ArrowLeft,
  School,
  CheckCircle2,
  Users,
  Award,
  Vote,
  TrendingUp,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface PublicResultsViewProps {
  schoolSettings: SchoolSettings;
  electionSettings: ElectionSettings;
  candidates: Candidate[];
  stats: {
    totalDpt: number;
    sudahMemilih: number;
    belumMemilih: number;
    persentasePartisipasi: number;
    totalSuaraMasuk: number;
    votesPerCandidate: Record<string, { count: number; percentage: number }>;
  };
  onBack: () => void;
}

export const PublicResultsView: React.FC<PublicResultsViewProps> = ({
  schoolSettings,
  electionSettings,
  candidates,
  stats,
  onBack,
}) => {
  const { privasiHasil, status } = electionSettings;

  // Check if results are allowed to be viewed
  let canViewResults = false;
  let blockedReason = '';

  if (status === 'SELESAI' || status === 'DITUTUP') {
    canViewResults = true;
  } else if (privasiHasil === 'REALTIME') {
    canViewResults = true;
  } else if (privasiHasil === 'SETELAH_DITUTUP') {
    canViewResults = false;
    blockedReason = 'Hasil perolehan suara akan dipublikasikan setelah pemungutan suara resmi ditutup oleh panitia.';
  } else {
    // SEMBUNYIKAN
    canViewResults = false;
    blockedReason = 'Hasil suara sementara disembunyikan oleh panitia selama pemilu berlangsung untuk menjaga ketenangan pemilihan.';
  }

  // Sorted candidates by vote count descending
  const sortedCandidates = [...candidates].sort((a, b) => {
    const votesA = stats.votesPerCandidate[a.id]?.count || 0;
    const votesB = stats.votesPerCandidate[b.id]?.count || 0;
    return votesB - votesA;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Masuk</span>
          </button>

          <div className="flex items-center gap-2">
            <PWAInstallButton compact />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 flex-1">
        {/* Header Title Card */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 items-center justify-center mb-3">
            {schoolSettings.logoSekolah ? (
              <img
                src={schoolSettings.logoSekolah}
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            ) : (
              <School className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
            {schoolSettings.namaSekolah}
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Hasil Pemilihan Ketua & Wakil OSIS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {schoolSettings.namaKegiatan} · TP {schoolSettings.tahunPelajaran}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Status: {status}</span>
            </span>
          </div>
        </div>

        {/* Blocked by Privacy */}
        {!canViewResults ? (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Hasil Belum Dipublikasikan
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {blockedReason}
            </p>
          </div>
        ) : (
          /* Actual Live Results */
          <div className="space-y-6">
            {/* Quick Stat Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total DPT</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                  {stats.totalDpt.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Pemilih Terdaftar</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Suara Masuk</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                  {stats.totalSuaraMasuk.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Suara Sah Tercatat</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Belum Memilih</span>
                <span className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                  {stats.belumMemilih.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Siswa/Guru</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Partisipasi</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {stats.persentasePartisipasi}%
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.persentasePartisipasi, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Candidate Results Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Perolehan Suara Pasangan Calon</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {stats.totalSuaraMasuk} Suara Terkumpul
                </span>
              </div>

              {candidates.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  Belum ada data kandidat.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {sortedCandidates.map((candidate, idx) => {
                    const cStat = stats.votesPerCandidate[candidate.id] || { count: 0, percentage: 0 };
                    const isLeading = idx === 0 && cStat.count > 0;

                    return (
                      <div
                        key={candidate.id}
                        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                          isLeading
                            ? 'border-blue-500 dark:border-blue-500 shadow-md shadow-blue-500/10'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            {/* Order Number Badge */}
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-black text-xl flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
                              {candidate.nomorUrut}
                            </div>

                            {/* Candidate Details */}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                                  {candidate.namaKetua} & {candidate.namaWakil}
                                </h4>
                                {isLeading && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                                    <Award className="w-3 h-3 text-amber-600" />
                                    <span>Unggul</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Paslon Nomor Urut {candidate.nomorUrut}
                              </p>
                            </div>
                          </div>

                          {/* Vote & Percentage Numbers */}
                          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                              {cStat.count.toLocaleString('id-ID')}
                              <span className="text-xs font-normal text-slate-500 ml-1">suara</span>
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                              {cStat.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="mt-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isLeading
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                : 'bg-slate-400 dark:bg-slate-600'
                            }`}
                            style={{ width: `${Math.min(cStat.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500">
        &copy; 2026 callmecals2026
      </footer>
    </div>
  );
};
