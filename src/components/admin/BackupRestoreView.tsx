import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Database,
  CheckCircle2,
  Sparkles,
  FileJson,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

interface BackupRestoreViewProps {
  onExportBackup: () => string;
  onRestoreBackup: (json: string) => { success: boolean; message: string };
  onResetVotesOnly: () => void;
  onResetEntireSystem: () => void;
  onSeedSampleData: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  onExportBackup,
  onRestoreBackup,
  onResetVotesOnly,
  onResetEntireSystem,
  onSeedSampleData,
}) => {
  const [resetVotesDialog, setResetVotesDialog] = useState(false);
  const [factoryResetDialog, setFactoryResetDialog] = useState(false);
  const [restoreConfirmData, setRestoreConfirmData] = useState<string | null>(null);

  const { showToast } = useToast();

  const handleDownloadBackup = () => {
    const jsonStr = onExportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_evoting_osis_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File backup database berhasil diunduh.');
  };

  const handleFileRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (content) {
        setRestoreConfirmData(content);
      }
    };
    reader.readAsText(file);
  };

  const confirmRestoreAction = () => {
    if (!restoreConfirmData) return;
    const res = onRestoreBackup(restoreConfirmData);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    setRestoreConfirmData(null);
  };

  const confirmResetVotesAction = () => {
    onResetVotesOnly();
    showToast('Seluruh perolehan suara pemilu berhasil direset ke 0.');
    setResetVotesDialog(false);
  };

  const confirmFactoryResetAction = () => {
    onResetEntireSystem();
    showToast('Sistem dan database berhasil dikosongkan (Reset Pabrik).');
    setFactoryResetDialog(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Database className="w-6 h-6 text-blue-600" />
          <span>Cadangan, Pemulihan, & Reset Database</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Amankan basis data pemilu melalui berkas JSON atau pulihkan data dari cadangan sebelumnya.
        </p>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Backup Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Unduh Cadangan (Export Backup)
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Simpan seluruh data pemilih (DPT), pasangan calon, rekaman suara, pengaturan sekolah, dan audit trail ke dalam satu berkas format JSON.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Database JSON</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Pulihkan Data (Restore Backup)
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Pulihkan sistem menggunakan berkas JSON cadangan yang telah dibuat sebelumnya. Data yang ada saat ini akan digantikan.
            </p>
          </div>

          <div>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileRestoreUpload}
              id="restore-file-input"
              className="hidden"
            />
            <label
              htmlFor="restore-file-input"
              className="cursor-pointer w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih File Backup JSON</span>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone: Resets */}
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-4">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="font-extrabold text-base">Area Tindakan Khusus & Reset</h3>
        </div>
        <p className="text-xs text-rose-600/90 dark:text-rose-300/80 leading-relaxed">
          Tindakan di bawah ini bersifat permanen. Harap pastikan Anda telah mengunduh salinan cadangan sebelum melakukan reset.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Reset Votes Only */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Reset Perolehan Suara Saja
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Mengosongkan kotak suara dan mengembalikan status seluruh pemilih menjadi "Belum Memilih". DPT dan data paslon tetap tersimpan.
              </p>
            </div>
            <button
              onClick={() => setResetVotesDialog(true)}
              className="mt-4 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
            >
              Reset Suara ke 0
            </button>
          </div>

          {/* Factory Reset */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400">
                Kosongkan Database (Reset Pabrik)
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Menghapus seluruh DPT, seluruh Paslon, dan seluruh rekaman suara kembali ke kondisi bersih awal.
              </p>
            </div>
            <button
              onClick={() => setFactoryResetDialog(true)}
              className="mt-4 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
            >
              Reset Seluruh Database
            </button>
          </div>
        </div>
      </div>

      {/* Demo helper */}
      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-blue-900 dark:text-blue-300 block">
            Perlu Contoh Data untuk Evaluasi / Simulasi?
          </span>
          <span className="text-blue-700 dark:text-blue-400">
            Muat 3 Paslon dan 10 data DPT contoh untuk mencoba alur pemilihan tanpa mengetik manual.
          </span>
        </div>
        <button
          onClick={() => {
            onSeedSampleData();
            showToast('Contoh data uji coba berhasil dimuat!', 'success');
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 shadow-sm"
        >
          Muat Data Uji Coba
        </button>
      </div>

      {/* Restore Warning Dialog */}
      <ConfirmDialog
        isOpen={!!restoreConfirmData}
        title="Konfirmasi Pemulihan Cadangan"
        message="Restore akan mengganti seluruh data yang ada saat ini dengan data dari file backup. Pastikan Anda telah memiliki cadangan terbaru sebelum melanjutkan."
        isDanger={true}
        confirmText="Ya, Pulihkan Sekarang"
        onConfirm={confirmRestoreAction}
        onCancel={() => setRestoreConfirmData(null)}
      />

      {/* Reset Votes Dialog */}
      <ConfirmDialog
        isOpen={resetVotesDialog}
        title="Reset Seluruh Suara Pemilu?"
        message="Semua suara yang telah masuk ke kotak suara akan dihapus, dan status seluruh DPT akan diubah menjadi 'Belum Memilih'."
        isDanger={true}
        confirmText="Reset Suara"
        onConfirm={confirmResetVotesAction}
        onCancel={() => setResetVotesDialog(false)}
      />

      {/* Factory Reset Dialog */}
      <ConfirmDialog
        isOpen={factoryResetDialog}
        title="KOSONGKAN SELURUH BASIS DATA?"
        message="Tindakan ini akan menghapus SELURUH data pemilih (DPT), seluruh pasangan calon, dan seluruh suara secara permanen."
        isDanger={true}
        requireTextMatch="RESET"
        confirmText="HAPUS SEMUA DATA"
        onConfirm={confirmFactoryResetAction}
        onCancel={() => setFactoryResetDialog(false)}
      />
    </div>
  );
};
