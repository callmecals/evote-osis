import React, { useState } from 'react';
import { SchoolSettings } from '../../types';
import { School, Upload, Trash2, Check, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../common/Toast';

interface SchoolSettingsViewProps {
  settings: SchoolSettings;
  onSave: (settings: SchoolSettings) => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const { showToast } = useToast();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File logo harus berupa gambar (PNG/JPG/SVG).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file maksimal 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setFormData(prev => ({ ...prev, logoSekolah: ev.target?.result as string }));
        showToast('Logo sekolah berhasil dimuat.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoSekolah: '' }));
    showToast('Logo sekolah dihapus.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaSekolah.trim()) {
      showToast('Nama sekolah wajib diisi.', 'error');
      return;
    }

    onSave(formData);
    showToast('Profil dan identitas sekolah berhasil disimpan!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <School className="w-6 h-6 text-blue-600" />
          <span>Pengaturan Identitas Sekolah</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Informasi ini digunakan otomatis pada halaman login, surat suara, laporan, E-Receipt, dan Berita Acara resmi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Logo Sekolah
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {formData.logoSekolah ? (
                <img
                  src={formData.logoSekolah}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  id="upload-school-logo"
                  className="hidden"
                />
                <label
                  htmlFor="upload-school-logo"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.logoSekolah ? 'Ganti Logo' : 'Unggah Logo Sekolah'}</span>
                </label>

                {formData.logoSekolah && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Logo</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Disarankan menggunakan format PNG transparan atau SVG dengan ukuran maksimal 2 MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic School Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Informasi Lembaga & Kegiatan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Sekolah *
              </label>
              <input
                type="text"
                value={formData.namaSekolah}
                onChange={e => setFormData({ ...formData, namaSekolah: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tahun Pelajaran *
              </label>
              <input
                type="text"
                value={formData.tahunPelajaran}
                onChange={e => setFormData({ ...formData, tahunPelajaran: e.target.value })}
                placeholder="2026/2027"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kegiatan Pemilihan *
              </label>
              <input
                type="text"
                value={formData.namaKegiatan}
                onChange={e => setFormData({ ...formData, namaKegiatan: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Lengkap Sekolah
              </label>
              <input
                type="text"
                value={formData.alamatSekolah}
                onChange={e => setFormData({ ...formData, alamatSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Officials / Signatories for Legal Minutes */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Pejabat & Penandatangan Berita Acara
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Ketua Panitia Pemilihan
              </label>
              <input
                type="text"
                value={formData.namaKetuaPanitia}
                onChange={e => setFormData({ ...formData, namaKetuaPanitia: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Pembina OSIS
              </label>
              <input
                type="text"
                value={formData.namaPembinaOsis}
                onChange={e => setFormData({ ...formData, namaPembinaOsis: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.namaKepalaSekolah}
                onChange={e => setFormData({ ...formData, namaKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.nipKepalaSekolah || ''}
                onChange={e => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                placeholder="19740512 199903 1 004"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition"
          >
            Simpan Pengaturan Sekolah
          </button>
        </div>
      </form>
    </div>
  );
};
