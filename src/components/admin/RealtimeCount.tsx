import React from 'react';
import { Candidate, ElectionSettings, Voter, AnonymousVote } from '../../types';
import {
  BarChart3,
  Award,
  Vote,
  TrendingUp,
  Users,
  CheckCircle2,
  PieChart as PieIcon,
  RefreshCw,
} from 'lucide-react';

interface RealtimeCountProps {
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
  electionSettings: ElectionSettings;
  onRefresh: () => void;
}

export const RealtimeCount: React.FC<RealtimeCountProps> = ({
  candidates,
  voters,
  votes,
  stats,
  electionSettings,
  onRefresh,
}) => {
  // Sort candidates by vote count descending
  const sorted = [...candidates].sort((a, b) => {
    const vA = stats.votesPerCandidate[a.id]?.count || 0;
    const vB = stats.votesPerCandidate[b.id]?.count || 0;
    return vB - vA;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Penghitungan Suara Real-Time</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Perolehan suara dihitung langsung dari basis data kotak suara digital tanpa rekayasa.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Primary Participation Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            TOTAL PEMILIH (DPT)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
            {stats.totalDpt.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Hak Suara Terdaftar</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            SUARA MASUK (SAH)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
            {stats.totalSuaraMasuk.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Tercatat di Kotak Suara</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            BELUM MEMILIH
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 font-mono tabular-nums">
            {stats.belumMemilih.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Belum Menggunakan Hak</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            TINGKAT PARTISIPASI
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {stats.persentasePartisipasi}%
          </span>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.persentasePartisipasi, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Breakdown per Candidate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Candidate Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Perolehan Suara Pasangan Calon
          </h3>

          {candidates.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Belum ada pasangan calon yang terdaftar.
            </div>
          ) : (
            sorted.map((cand, idx) => {
              const cStat = stats.votesPerCandidate[cand.id] || { count: 0, percentage: 0 };
              const isLeading = idx === 0 && cStat.count > 0;

              return (
                <div
                  key={cand.id}
                  className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all ${
                    isLeading
                      ? 'border-blue-500 dark:border-blue-500 shadow-md shadow-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Big Order Number */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-mono font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
                        {cand.nomorUrut}
                      </div>

                      {/* Candidate Names */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {cand.namaKetua}
                          </h4>
                          {isLeading && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>Unggul Sementara</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          Wakil: {cand.namaWakil}
                        </p>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Paslon Nomor Urut {cand.nomorUrut}
                        </span>
                      </div>
                    </div>

                    {/* Numbers */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                        {cStat.count.toLocaleString('id-ID')}
                        <span className="text-xs font-semibold text-slate-500 ml-1">suara</span>
                      </div>
                      <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                        {cStat.percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
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
            })
          )}
        </div>

        {/* Right 1 Col: Proportional Pie / Visual representation */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <PieIcon className="w-5 h-5 text-blue-600" />
              <span>Distribusi Proporsi Suara</span>
            </h3>

            {stats.totalSuaraMasuk === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Belum ada suara yang masuk ke kotak suara digital.
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG Visual Donut / Stack Bar */}
                <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                  {candidates.map((cand, i) => {
                    const cStat = stats.votesPerCandidate[cand.id] || { count: 0, percentage: 0 };
                    const colors = [
                      'bg-blue-600',
                      'bg-amber-500',
                      'bg-purple-600',
                      'bg-emerald-500',
                      'bg-rose-500',
                    ];
                    return (
                      <div
                        key={cand.id}
                        className={`${colors[i % colors.length]} h-full transition-all`}
                        style={{ width: `${cStat.percentage}%` }}
                        title={`Paslon ${cand.nomorUrut}: ${cStat.percentage}%`}
                      />
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-2 pt-2 text-xs">
                  {candidates.map((cand, i) => {
                    const cStat = stats.votesPerCandidate[cand.id] || { count: 0, percentage: 0 };
                    const dotColors = [
                      'bg-blue-600',
                      'bg-amber-500',
                      'bg-purple-600',
                      'bg-emerald-500',
                      'bg-rose-500',
                    ];
                    return (
                      <div key={cand.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-3 h-3 rounded-full ${dotColors[i % dotColors.length]} shrink-0`} />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            Paslon #{cand.nomorUrut}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                          {cStat.count} ({cStat.percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <p>
              Prinsip Privasi: Pengaturan publikasi saat ini: <strong>{electionSettings.privasiHasil}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
