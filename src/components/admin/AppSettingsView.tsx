import React, { useState } from 'react';
import { ElectionSettings, ResultPrivacy, ElectionStatus } from '../../types';
import {
  Settings,
  Calendar,
  Eye,
  KeyRound,
  Receipt,
  ShieldCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AppSettingsViewProps {
  electionSettings: ElectionSettings;
  onSave: (settings: ElectionSettings) => void;
}

export const AppSettingsView: React.FC<AppSettingsViewProps> = ({
  electionSettings,
  onSave,
}) => {
  const [formData, setFormData] = useState<ElectionSettings>({ ...electionSettings });
  const [statusConfirm, setStatusConfirm] = useState<{
    isOpen: boolean;
    targetStatus: ElectionStatus;
  }>({
    isOpen: false,
    targetStatus: 'DRAFT',
  });

  const { showToast } = useToast();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    showToast('Pengaturan pemilu & privasi berhasil disimpan!');
  };

  const handleStatusChangeClick = (status: ElectionStatus) => {
    if (status === formData.status) return;
    setStatusConfirm({
      isOpen: true,
      targetStatus: status,
    });
  };

  const confirmStatusChange = () => {
    const updated = { ...formData, status: statusConfirm.targetStatus };
    setFormData(updated);
    onSave(updated);
    showToast(`Status pemilu diubah menjadi: ${statusConfirm.targetStatus}`);
    setStatusConfirm({ isOpen: false, targetStatus: 'DRAFT' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Pengaturan Pemilihan & Privasi</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Atur status manual pemungutan suara, jadwal otomatis, metode login, serta privasi publikasi hasil.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Status Pemilu Manual Control */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Status Pelaksanaan Pemilu
              </h3>
              <p className="text-xs text-slate-500">
                Pilih status untuk membuka atau menghentikan aktivitas pemungutan suara secara langsung.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                formData.status === 'BERLANGSUNG'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : formData.status === 'DITUTUP' || formData.status === 'SELESAI'
                  ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {formData.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            {(['DRAFT', 'AKAN_DIMULAI', 'BERLANGSUNG', 'DITUTUP', 'SELESAI'] as ElectionStatus[]).map(
              st => {
                const isActive = formData.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChangeClick(st)}
                    className={`py-2.5 px-2 rounded-xl font-bold transition text-center border ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'DRAFT' && 'Draft (Awal)'}
                    {st === 'AKAN_DIMULAI' && 'Akan Dimulai'}
                    {st === 'BERLANGSUNG' && 'Buka Voting'}
                    {st === 'DITUTUP' && 'Tutup Voting'}
                    {st === 'SELESAI' && 'Difinalisasi'}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Jadwal Pemilu */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Jadwal Waktu Pemilihan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Mulai Pemilihan *
              </label>
              <input
                type="datetime-local"
                value={formData.jadwalMulai}
                onChange={e => setFormData({ ...formData, jadwalMulai: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Selesai Pemilihan *
              </label>
              <input
                type="datetime-local"
                value={formData.jadwalSelesai}
                onChange={e => setFormData({ ...formData, jadwalSelesai: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 pt-1">
            <input
              type="checkbox"
              checked={formData.autoStatusByJadwal}
              onChange={e => setFormData({ ...formData, autoStatusByJadwal: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>
              Otomatis ubah status pemilu berdasarkan jadwal waktu di atas.
            </span>
          </label>
        </div>

        {/* Privasi Publikasi Hasil (Section 13) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Pengaturan Privasi Publikasi Hasil
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Tentukan kapan perolehan suara dapat diakses oleh publik/pemilih di halaman publik.
          </p>

          <div className="space-y-2.5 text-xs">
            {[
              {
                value: 'SEMBUNYIKAN',
                label: 'Sembunyikan Hasil',
                desc: 'Selama pemilu berlangsung, pemilih dan publik tidak dapat melihat perolehan suara sama sekali.',
              },
              {
                value: 'REALTIME',
                label: 'Tampilkan Hasil Real-Time',
                desc: 'Perolehan suara dapat langsung dipantau secara langsung di halaman hasil publik.',
              },
              {
                value: 'SETELAH_DITUTUP',
                label: 'Tampilkan Setelah Pemilu Ditutup',
                desc: 'Hasil hanya dapat dilihat setelah panitia resmi menutup pemungutan suara.',
              },
            ].map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  formData.privasiHasil === opt.value
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="privasiHasil"
                  value={opt.value}
                  checked={formData.privasiHasil === opt.value}
                  onChange={() => setFormData({ ...formData, privasiHasil: opt.value as ResultPrivacy })}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {opt.label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">
                    {opt.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Metode Login Pemilih & Bukti Memilih */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <h4 className="font-extrabold text-slate-900 dark:text-white">
                  Metode Login Pemilih
                </h4>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="metodeLogin"
                    checked={formData.metodeLoginPemilih === 'NIS_PIN'}
                    onChange={() => setFormData({ ...formData, metodeLoginPemilih: 'NIS_PIN' })}
                    className="text-blue-600"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Nomor Induk Siswa (NIS) & PIN
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="metodeLogin"
                    checked={formData.metodeLoginPemilih === 'USERNAME_PASSWORD'}
                    onChange={() => setFormData({ ...formData, metodeLoginPemilih: 'USERNAME_PASSWORD' })}
                    className="text-blue-600"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Username Khusus & Kata Sandi
                  </span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h4 className="font-extrabold text-slate-900 dark:text-white">
                  Fitur Bukti Memilih (E-Receipt)
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={formData.izinkanEReceipt}
                  onChange={e => setFormData({ ...formData, izinkanEReceipt: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Tampilkan dan izinkan siswa mengunduh E-Receipt setelah voting
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition"
          >
            Simpan Konfigurasi Pemilu
          </button>
        </div>
      </form>

      {/* Confirmation Dialog for Status Change */}
      <ConfirmDialog
        isOpen={statusConfirm.isOpen}
        title="Ubah Status Pelaksanaan Pemilu?"
        message={`Apakah Anda yakin ingin mengubah status pemilu menjadi: ${statusConfirm.targetStatus}?`}
        isDanger={statusConfirm.targetStatus === 'DITUTUP' || statusConfirm.targetStatus === 'SELESAI'}
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusConfirm({ isOpen: false, targetStatus: 'DRAFT' })}
      />
    </div>
  );
};
