import React, { useState, useMemo } from 'react';
import { Voter } from '../../types';
import {
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowUpDown,
  ShieldAlert,
} from 'lucide-react';

interface MonitoringPartisipasiProps {
  voters: Voter[];
  stats: {
    totalDpt: number;
    sudahMemilih: number;
    belumMemilih: number;
    persentasePartisipasi: number;
    classStats: Record<string, { total: number; sudah: number; belum: number; persentase: number }>;
  };
}

export const MonitoringPartisipasi: React.FC<MonitoringPartisipasiProps> = ({
  voters,
  stats,
}) => {
  const [searchClass, setSearchClass] = useState('');
  const [sortBy, setSortBy] = useState<'NAME' | 'PARTICIPATION_DESC' | 'PARTICIPATION_ASC'>('NAME');

  // Sorted and filtered classes
  const classesList = useMemo(() => {
    let list = Object.keys(stats.classStats).map(cls => ({
      className: cls,
      ...stats.classStats[cls],
    }));

    if (searchClass.trim()) {
      list = list.filter(item =>
        item.className.toLowerCase().includes(searchClass.toLowerCase().trim())
      );
    }

    if (sortBy === 'NAME') {
      list.sort((a, b) => a.className.localeCompare(b.className, undefined, { numeric: true }));
    } else if (sortBy === 'PARTICIPATION_DESC') {
      list.sort((a, b) => b.persentase - a.persentase);
    } else if (sortBy === 'PARTICIPATION_ASC') {
      list.sort((a, b) => a.persentase - b.persentase);
    }

    return list;
  }, [stats.classStats, searchClass, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Eye className="w-6 h-6 text-blue-600" />
          <span>Monitoring Partisipasi Pemilih</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Pantau progres partisipasi siswa per kelas secara transparan dan menjaga kerahasiaan pilihan.
        </p>
      </div>

      {/* Secret Ballot Compliance Notice */}
      <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong>Standar Kerahasiaan Suara:</strong> Halaman monitoring hanya menampilkan status penggunaan hak suara (sudah/belum) secara agregat per kelas. Sistem tidak pernah menampilkan kandidat pilihan siswa.
        </p>
      </div>

      {/* Overall Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Total DPT</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
            {stats.totalDpt.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Pemilih Terdaftar</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Sudah Memilih</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {stats.sudahMemilih.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Hak Suara Terpakai</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Belum Memilih</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {stats.belumMemilih.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Menunggu Memilih</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Partisipasi Total</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
            {stats.persentasePartisipasi}%
          </span>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(stats.persentasePartisipasi, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Classes */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchClass}
            onChange={e => setSearchClass(e.target.value)}
            placeholder="Cari kelas (contoh: VII A, X IPA 1)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="NAME">Urut Nama Kelas</option>
            <option value="PARTICIPATION_DESC">Partisipasi Tertinggi</option>
            <option value="PARTICIPATION_ASC">Partisipasi Terendah</option>
          </select>
        </div>
      </div>

      {/* Class Participation Grid */}
      {classesList.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          Belum ada data kelas yang dapat dimonitor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesList.map(item => {
            const isCompleted = item.total > 0 && item.sudah === item.total;
            return (
              <div
                key={item.className}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Kelas {item.className}
                  </h3>
                  <span
                    className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {item.persentase}%
                  </span>
                </div>

                {/* Example format: VII A — 32/35 — 91,4% */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                  <span>Partisipasi Pemilih:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {item.sudah} / {item.total} siswa
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(item.persentase, 100)}%` }}
                  />
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-400">
                  <span>Belum Memilih: {item.belum}</span>
                  {isCompleted && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      100% Selesai
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
