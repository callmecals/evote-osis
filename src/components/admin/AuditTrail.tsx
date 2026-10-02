import React, { useState, useMemo } from 'react';
import { AuditLog } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Activity,
  Laptop,
} from 'lucide-react';
import { useToast } from '../common/Toast';

interface AuditTrailProps {
  auditLogs: AuditLog[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const { showToast } = useToast();

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        log.jenisAktivitas.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.deskripsi.toLowerCase().includes(q);

      const matchRole = selectedRole === 'ALL' || log.userRole === selectedRole;

      return matchSearch && matchRole;
    });
  }, [auditLogs, searchQuery, selectedRole]);

  const handleExportAuditCsv = () => {
    if (auditLogs.length === 0) {
      showToast('Belum ada log audit untuk diekspor.', 'error');
      return;
    }

    const headers = ['Log_ID', 'Timestamp', 'Jenis_Aktivitas', 'Role', 'Aktor', 'Deskripsi', 'Perangkat'];
    const rows = auditLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.jenisAktivitas}"`,
      `"${l.userRole}"`,
      `"${l.actorName}"`,
      `"${l.deskripsi.replace(/"/g, '""')}"`,
      `"${l.deviceInfo || '-'}"`,
    ]);

    const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Trail_OSIS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Log audit berhasil diunduh sebagai file CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Audit Trail & Rekam Jejak Sistem</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Catatan kronologis immutable seluruh aksi penting untuk menjaga akuntabilitas dan audit independen.
          </p>
        </div>

        <button
          onClick={handleExportAuditCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Log Audit (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas, aktor, atau rincian deskripsi..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Semua Peran</option>
            <option value="ADMIN">Admin</option>
            <option value="PEMILIH">Pemilih</option>
            <option value="SISTEM">Sistem</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          Tidak ada rekam jejak aktivitas yang sesuai.
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Aktivitas</th>
                  <th className="py-3 px-4">Peran & Aktor</th>
                  <th className="py-3 px-4">Rincian Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                        {log.jenisAktivitas}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.userRole === 'ADMIN'
                              ? 'bg-purple-500'
                              : log.userRole === 'PEMILIH'
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.actorName}
                        </span>
                        <span className="text-[10px] text-slate-400">({log.userRole})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                      <p className="leading-relaxed">{log.deskripsi}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
