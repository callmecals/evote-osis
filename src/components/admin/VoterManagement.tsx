import React, { useState, useMemo } from 'react';
import { Voter, VoterType } from '../../types';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Upload,
  Download,
  CheckCircle2,
  X,
  FileSpreadsheet,
  AlertCircle,
  FileDown,
  UserCheck,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

interface VoterManagementProps {
  voters: Voter[];
  onSaveVoter: (voter: Voter) => { success: boolean; message: string };
  onDeleteVoter: (id: string) => { success: boolean; message: string };
  onResetVoterStatus: (id: string) => { success: boolean; message: string };
  onImportVoters: (list: Partial<Voter>[]) => {
    total: number;
    berhasil: number;
    gagal: number;
    duplikat: number;
    errors: string[];
  };
}

export const VoterManagement: React.FC<VoterManagementProps> = ({
  voters,
  onSaveVoter,
  onDeleteVoter,
  onResetVoterStatus,
  onImportVoters,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteVoterId, setDeleteVoterId] = useState<string | null>(null);
  const [resetVoterId, setResetVoterId] = useState<string | null>(null);

  // Form Fields
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [jenisPemilih, setJenisPemilih] = useState<VoterType>('SISWA');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);

  // Import State & Report
  const [importReport, setImportReport] = useState<{
    total: number;
    berhasil: number;
    gagal: number;
    duplikat: number;
    errors: string[];
  } | null>(null);

  const { showToast } = useToast();

  // Extract unique classes for filter
  const classList = useMemo(() => {
    const set = new Set<string>();
    voters.forEach(v => {
      if (v.kelas) set.add(v.kelas.trim());
    });
    return Array.from(set).sort();
  }, [voters]);

  // Filtered voters
  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        v.nama.toLowerCase().includes(q) ||
        v.nis.toLowerCase().includes(q) ||
        v.username.toLowerCase().includes(q) ||
        v.kelas.toLowerCase().includes(q);

      const matchClass = selectedClass === 'ALL' || v.kelas.trim() === selectedClass;

      let matchStatus = true;
      if (selectedStatus === 'SUDAH') matchStatus = v.statusMemilih === 'sudah';
      else if (selectedStatus === 'BELUM') matchStatus = v.statusMemilih === 'belum' && v.statusAktif;
      else if (selectedStatus === 'NONAKTIF') matchStatus = !v.statusAktif;

      return matchSearch && matchClass && matchStatus;
    });
  }, [voters, searchQuery, selectedClass, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingVoter(null);
    setNis('');
    setNama('');
    setKelas('X IPA 1');
    setJenisPemilih('SISWA');
    setUsername('');
    setPin('123456');
    setStatusAktif(true);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (v: Voter) => {
    setEditingVoter(v);
    setNis(v.nis);
    setNama(v.nama);
    setKelas(v.kelas);
    setJenisPemilih(v.jenisPemilih);
    setUsername(v.username);
    setPin(v.pin);
    setStatusAktif(v.statusAktif);
    setIsAddEditOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nis.trim() || !nama.trim()) {
      showToast('NIS dan Nama Lengkap wajib diisi.', 'error');
      return;
    }

    const voterData: Voter = {
      id: editingVoter ? editingVoter.id : `VTR-${Date.now()}`,
      nis: nis.trim(),
      nama: nama.trim(),
      kelas: kelas.trim() || 'Umum',
      jenisPemilih,
      username: username.trim() || nis.trim(),
      pin: pin.trim() || '123456',
      statusAktif,
      statusMemilih: editingVoter ? editingVoter.statusMemilih : 'belum',
      waktuMemilih: editingVoter ? editingVoter.waktuMemilih : undefined,
      tokenVoting: editingVoter ? editingVoter.tokenVoting : undefined,
    };

    const res = onSaveVoter(voterData);
    if (res.success) {
      showToast(res.message, 'success');
      setIsAddEditOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteVoterId) return;
    const res = onDeleteVoter(deleteVoterId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    setDeleteVoterId(null);
  };

  const handleConfirmReset = () => {
    if (!resetVoterId) return;
    const res = onResetVoterStatus(resetVoterId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    setResetVoterId(null);
  };

  // CSV Import Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        showToast('File CSV kosong atau tidak memiliki data.', 'error');
        return;
      }

      // Check header or parse lines
      const parsedRows: Partial<Voter>[] = [];
      const delimiter = lines[0].includes(';') ? ';' : ',';

      // Skip header line if present
      const startIndex = lines[0].toLowerCase().includes('nis') || lines[0].toLowerCase().includes('nama') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2) {
          // Format expected: ID | NIS | Nama | Kelas | Username | PIN | Status
          // Or at least NIS and Nama
          let nisVal = cols[0];
          let namaVal = cols[1];
          let kelasVal = cols[2] || 'Umum';
          let userVal = cols[3] || nisVal;
          let pinVal = cols[4] || '123456';

          // If first col is ID (e.g. VTR-001, NIS, Nama...)
          if (cols.length >= 3 && cols[0].toUpperCase().startsWith('VTR') || cols[0].toUpperCase().startsWith('DPT')) {
            nisVal = cols[1];
            namaVal = cols[2];
            kelasVal = cols[3] || 'Umum';
            userVal = cols[4] || nisVal;
            pinVal = cols[5] || '123456';
          }

          if (nisVal && namaVal) {
            parsedRows.push({
              nis: nisVal,
              nama: namaVal,
              kelas: kelasVal,
              username: userVal,
              pin: pinVal,
              jenisPemilih: 'SISWA',
              statusAktif: true,
            });
          }
        }
      }

      const report = onImportVoters(parsedRows);
      setImportReport(report);
      if (report.berhasil > 0) {
        showToast(`Berhasil mengimpor ${report.berhasil} data pemilih!`, 'success');
      }
    };
    reader.readAsText(file);
  };

  // CSV Template Downloader
  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        'ID_Pemilih,NIS,Nama,Kelas,Username,PIN,Status\n' +
          'DPT-001,1001,Ahmad Pratama,X IPA 1,1001,123456,Aktif\n' +
          'DPT-002,1002,Bella Putri,X IPA 1,1002,123456,Aktif\n' +
          'DPT-003,1003,Cahya Ramadhan,X IPA 2,1003,123456,Aktif\n' +
          'DPT-004,9001,Dra. Siti Rahmah (Guru),Guru/Staf,9001,123456,Aktif'
      );
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'template_import_dpt_osis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export DPT to CSV
  const handleExportCsv = () => {
    if (voters.length === 0) {
      showToast('Belum ada data DPT untuk diekspor.', 'error');
      return;
    }

    const headers = ['ID_Pemilih', 'NIS', 'Nama', 'Kelas', 'Jenis_Pemilih', 'Username', 'PIN', 'Status_Aktif', 'Status_Memilih', 'Waktu_Memilih'];
    const rows = voters.map(v => [
      `"${v.id}"`,
      `"${v.nis}"`,
      `"${v.nama}"`,
      `"${v.kelas}"`,
      `"${v.jenisPemilih}"`,
      `"${v.username}"`,
      `"${v.pin}"`,
      `"${v.statusAktif ? 'Aktif' : 'Nonaktif'}"`,
      `"${v.statusMemilih === 'sudah' ? 'Sudah Memilih' : 'Belum Memilih'}"`,
      `"${v.waktuMemilih || '-'}"`,
    ]);

    const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DPT_Pemilu_OSIS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data pemilih berhasil diunduh sebagai file CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Data Pemilih Tetap (DPT)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Total {voters.length} pemilih terdaftar · {voters.filter(v => v.statusMemilih === 'sudah').length} telah memilih.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setImportReport(null);
              setIsImportOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pemilih</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, NIS, atau kelas..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filter Kelas */}
        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Semua Kelas ({classList.length})</option>
            {classList.map(cls => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="BELUM">Belum Memilih</option>
            <option value="SUDAH">Sudah Memilih</option>
            <option value="NONAKTIF">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table Data or Empty State */}
      {voters.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum Ada Data Pemilih"
          description="Masukkan data pemilih secara manual atau gunakan tombol 'Import CSV' untuk memasukkan ratusan siswa sekaligus."
          actionText="+ Tambah Pemilih"
          onAction={handleOpenAdd}
          secondaryActionText="Import CSV Pemilih"
          onSecondaryAction={() => setIsImportOpen(true)}
        />
      ) : filteredVoters.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          Tidak ditemukan data pemilih yang sesuai dengan pencarian atau filter.
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Username / PIN</th>
                  <th className="py-3 px-4">Status Hak Suara</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVoters.map(voter => (
                  <tr key={voter.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {voter.nis}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {voter.nama}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {voter.kelas}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {voter.jenisPemilih}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {voter.username} / <span className="font-semibold text-slate-700 dark:text-slate-300">{voter.pin}</span>
                    </td>
                    <td className="py-3 px-4">
                      {voter.statusMemilih === 'sudah' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sudah Memilih</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold text-[11px]">
                          <span>Belum Memilih</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {voter.statusMemilih === 'sudah' && (
                          <button
                            onClick={() => setResetVoterId(voter.id)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                            title="Reset Hak Suara (Jadikan Belum Memilih)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(voter)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Pemilih"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteVoterId(voter.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Hapus Pemilih"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Voter Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editingVoter ? 'Edit Data Pemilih' : 'Tambah Pemilih Baru'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIS / NISN *
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={e => setNis(e.target.value)}
                    placeholder="Contoh: 1001"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas / Rombel *
                  </label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={e => setKelas(e.target.value)}
                    placeholder="Contoh: X IPA 1"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pemilih *
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Nama lengkap siswa atau guru"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username / ID Login
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Default sama dengan NIS"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIN / Kata Sandi *
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Default: 123456"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Pemilih
                  </label>
                  <select
                    value={jenisPemilih}
                    onChange={e => setJenisPemilih(e.target.value as VoterType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                  >
                    <option value="SISWA">Siswa</option>
                    <option value="GURU">Guru</option>
                    <option value="TENAGA_PENDIDIK">Tenaga Kependidikan</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={statusAktif}
                      onChange={e => setStatusAktif(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Akun Aktif</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition"
                >
                  Simpan Pemilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>Import Data Pemilih (DPT)</span>
              </h3>
              <button
                onClick={() => setIsImportOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Anda dapat mengimpor data siswa/pemilih menggunakan file CSV atau Excel yang disimpan dalam format CSV.
              </p>

              {/* Template Download Button */}
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-900 dark:text-blue-300 block">
                    Belum punya format file?
                  </span>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400">
                    Unduh template CSV contoh yang sudah siap diisi.
                  </span>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition flex items-center gap-1 shrink-0"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Upload Input */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold inline-block shadow-sm">
                    Pilih File CSV
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-2">
                  Format kolom: NIS, Nama, Kelas, Username, PIN
                </p>
              </div>

              {/* Import Report if executed */}
              {importReport && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Laporan Hasil Import:</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      <span className="text-base font-bold block">{importReport.berhasil}</span>
                      <span className="text-[10px]">Berhasil</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      <span className="text-base font-bold block">{importReport.duplikat}</span>
                      <span className="text-[10px]">Duplikat</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                      <span className="text-base font-bold block">{importReport.gagal}</span>
                      <span className="text-[10px]">Gagal</span>
                    </div>
                  </div>

                  {importReport.errors.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto space-y-1 text-[11px] text-rose-600 dark:text-rose-400">
                      {importReport.errors.slice(0, 5).map((err, i) => (
                        <p key={i}>• {err}</p>
                      ))}
                      {importReport.errors.length > 5 && (
                        <p className="text-slate-400 italic">...dan {importReport.errors.length - 5} catatan lainnya.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteVoterId}
        title="Hapus Data Pemilih?"
        message="Pemilih ini akan dihapus dari Daftar Pemilih Tetap (DPT). Data yang dihapus tidak dapat dipulihkan."
        isDanger={true}
        confirmText="Hapus Pemilih"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteVoterId(null)}
      />

      {/* Reset Voting Right Confirmation */}
      <ConfirmDialog
        isOpen={!!resetVoterId}
        title="Reset Hak Suara Pemilih?"
        message="Status pemilih ini akan dikembalikan menjadi 'Belum Memilih'. Gunakan hanya jika terjadi kendala teknis atau atas izin panitia pemilihan."
        isDanger={false}
        confirmText="Reset Hak Suara"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetVoterId(null)}
      />
    </div>
  );
};
