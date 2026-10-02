import React, { useState } from 'react';
import {
  Candidate,
  ElectionSettings,
  SchoolSettings,
  Voter,
  AnonymousVote,
  ElectionStatus,
} from '../../types';
import {
  Users,
  Vote,
  BarChart3,
  TrendingUp,
  Play,
  Square,
  Lock,
  Calendar,
  AlertCircle,
  Plus,
  ArrowUpRight,
  School,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

interface AdminDashboardProps {
  schoolSettings: SchoolSettings;
  electionSettings: ElectionSettings;
  candidates: Candidate[];
  voters: Voter[];
  votes: AnonymousVote[];
  stats: {
    totalDpt: number;
    totalAktif: number;
    sudahMemilih: number;
    belumMemilih: number;
    persentasePartisipasi: number;
    totalSuaraMasuk: number;
    votesPerCandidate: Record<string, { count: number; percentage: number }>;
  };
  onNavigateTab: (tab: string) => void;
  onChangeElectionStatus: (status: ElectionStatus) => void;
  onSeedSampleData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  schoolSettings,
  electionSettings,
  candidates,
  voters,
  votes,
  stats,
  onNavigateTab,
  onChangeElectionStatus,
  onSeedSampleData,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    targetStatus: ElectionStatus;
    isDanger?: boolean;
    requireText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    targetStatus: 'DRAFT',
  });

  const { showToast } = useToast();

  const handleOpenElection = () => {
    if (candidates.filter(c => c.statusAktif).length === 0) {
      showToast('Tambahkan minimal 1 pasangan calon aktif sebelum membuka pemilu.', 'error');
      return;
    }
    if (voters.length === 0) {
      showToast('Tambahkan DPT (pemilih) sebelum membuka pemilu.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Buka Pemungutan Suara?',
      message: 'Pemilih akan dapat mulai masuk dan memberikan suaranya pada bilik suara digital.',
      targetStatus: 'BERLANGSUNG',
      isDanger: false,
    });
  };

  const handleCloseElection = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Tutup Pemungutan Suara?',
      message: 'Setelah ditutup, pemilih tidak akan dapat lagi mengirimkan suara ke bilik suara digital.',
      targetStatus: 'DITUTUP',
      isDanger: true,
      requireText: 'TUTUP',
    });
  };

  const handleFinalizeElection = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Finalisasi Hasil Pemilihan?',
      message: 'Hasil perolehan suara akan dikunci secara permanen dan Berita Acara resmi dapat dicetak.',
      targetStatus: 'SELESAI',
      isDanger: false,
      requireText: 'FINAL',
    });
  };

  const isDatabaseEmpty = voters.length === 0 && candidates.length === 0 && votes.length === 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                {schoolSettings.namaSekolah}
              </span>
              <span>·</span>
              <span className="text-xs text-slate-500">TP {schoolSettings.tahunPelajaran}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Dashboard Manajemen Pemilu OSIS
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau jalannya pemungutan suara secara real-time, transparan, dan terpercaya.
            </p>
          </div>

          {/* Election Status Controller */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              <span
                className={`font-bold flex items-center gap-1.5 ${
                  electionSettings.status === 'BERLANGSUNG'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : electionSettings.status === 'DITUTUP' || electionSettings.status === 'SELESAI'
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    electionSettings.status === 'BERLANGSUNG'
                      ? 'bg-emerald-500 animate-pulse'
                      : electionSettings.status === 'DITUTUP' || electionSettings.status === 'SELESAI'
                      ? 'bg-slate-400'
                      : 'bg-amber-500'
                  }`}
                />
                {electionSettings.status}
              </span>
            </div>

            {electionSettings.status !== 'BERLANGSUNG' && electionSettings.status !== 'SELESAI' && (
              <button
                onClick={handleOpenElection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Buka Pemilu</span>
              </button>
            )}

            {electionSettings.status === 'BERLANGSUNG' && (
              <button
                onClick={handleCloseElection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Tutup Pemilu</span>
              </button>
            )}

            {electionSettings.status === 'DITUTUP' && !electionSettings.isFinalized && (
              <button
                onClick={handleFinalizeElection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finalisasi Hasil</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* When initial database is completely empty: show clean informative Empty State */}
      {isDatabaseEmpty ? (
        <div className="py-6">
          <EmptyState
            icon={Vote}
            title="Belum Ada Data Pemilu"
            description="Database sistem saat ini dalam keadaan bersih dan kosong. Mulailah dengan menambahkan Pasangan Calon dan mengimpor Daftar Pemilih Tetap (DPT)."
            actionText="+ Tambah Paslon"
            onAction={() => onNavigateTab('PASLON')}
            secondaryActionText="+ Tambah DPT"
            onSecondaryAction={() => onNavigateTab('DPT')}
          />

          {/* Quick Demo Data loader helper */}
          <div className="mt-6 text-center">
            <span className="text-xs text-slate-400">Sedang menguji coba sistem? </span>
            <button
              onClick={() => {
                onSeedSampleData();
                showToast('Contoh data uji coba berhasil dimuat!', 'success');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Muat Contoh Data Uji Coba (3 Paslon & 10 DPT)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main Key Statistics Grid (Section 5 requirements) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: TOTAL DPT */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">TOTAL DPT</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.totalDpt.toLocaleString('id-ID')}
              </p>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{stats.totalAktif} Pemilih Aktif</span>
                <button
                  onClick={() => onNavigateTab('DPT')}
                  className="text-blue-600 hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  <span>Kelola DPT</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Card 2: SUDAH MEMILIH */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">SUDAH MEMILIH</span>
                <FileCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {stats.sudahMemilih.toLocaleString('id-ID')}
              </p>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{stats.totalSuaraMasuk} Suara Sah di Kotak</span>
              </div>
            </div>

            {/* Card 3: BELUM MEMILIH */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">BELUM MEMILIH</span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                {stats.belumMemilih.toLocaleString('id-ID')}
              </p>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Sisa Hak Suara Tersisa</span>
              </div>
            </div>

            {/* Card 4: PARTISIPASI */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">PARTISIPASI</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                {stats.persentasePartisipasi}%
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.persentasePartisipasi, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Two-Column Dashboard Grid: Real-Time Results Chart & Quick Paslon List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live Vote Breakdown */}
            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Rekapitulasi Suara Sementara</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dihitung otomatis dari rekaman kotak suara digital.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('REALTIME')}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Grafik Lengkap</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {candidates.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada data pasangan calon.
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.map(candidate => {
                    const cStat = stats.votesPerCandidate[candidate.id] || { count: 0, percentage: 0 };
                    return (
                      <div key={candidate.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                              #{candidate.nomorUrut}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {candidate.namaKetua} & {candidate.namaWakil}
                            </span>
                          </div>
                          <div className="font-mono text-slate-700 dark:text-slate-300">
                            <strong>{cStat.count}</strong> suara ({cStat.percentage}%)
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(cStat.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 1 Col: Quick Candidates Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Pasangan Calon
                  </h3>
                  <button
                    onClick={() => onNavigateTab('PASLON')}
                    className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition"
                    title="Tambah Paslon"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {candidates.map(candidate => (
                    <div
                      key={candidate.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                          {candidate.nomorUrut}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {candidate.namaKetua}
                          </p>
                          <p className="text-slate-400 truncate text-[11px]">
                            {candidate.namaWakil}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onNavigateTab('MONITORING')}
                  className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Buka Monitoring Kelas →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDanger={confirmDialog.isDanger}
        requireTextMatch={confirmDialog.requireText}
        onConfirm={() => {
          onChangeElectionStatus(confirmDialog.targetStatus);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          showToast(`Status pemilu berhasil diubah menjadi: ${confirmDialog.targetStatus}`);
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
