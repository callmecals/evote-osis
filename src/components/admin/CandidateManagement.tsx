import React, { useState } from 'react';
import { Candidate } from '../../types';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Upload,
  Check,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CandidateProfileModal } from '../voter/CandidateProfileModal';
import { useToast } from '../common/Toast';

interface CandidateManagementProps {
  candidates: Candidate[];
  onSaveCandidate: (candidate: Candidate) => { success: boolean; message: string };
  onDeleteCandidate: (id: string) => { success: boolean; message: string };
}

export const CandidateManagement: React.FC<CandidateManagementProps> = ({
  candidates,
  onSaveCandidate,
  onDeleteCandidate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Form Fields
  const [nomorUrut, setNomorUrut] = useState('');
  const [namaKetua, setNamaKetua] = useState('');
  const [namaWakil, setNamaWakil] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [visi, setVisi] = useState('');
  const [misiText, setMisiText] = useState('');
  const [programKerjaText, setProgramKerjaText] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);

  const { showToast } = useToast();

  const handleOpenAdd = () => {
    // Suggest next number
    const nextNo = String(candidates.length + 1).padStart(2, '0');
    setEditingCandidate(null);
    setNomorUrut(nextNo);
    setNamaKetua('');
    setNamaWakil('');
    setFotoUrl('');
    setVisi('');
    setMisiText('');
    setProgramKerjaText('');
    setStatusAktif(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setEditingCandidate(cand);
    setNomorUrut(cand.nomorUrut);
    setNamaKetua(cand.namaKetua);
    setNamaWakil(cand.namaWakil);
    setFotoUrl(cand.fotoUrl || '');
    setVisi(cand.visi);
    setMisiText(cand.misi.join('\n'));
    setProgramKerjaText(cand.programKerja ? cand.programKerja.join('\n') : '');
    setStatusAktif(cand.statusAktif);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa format gambar (JPG/PNG/WebP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file maksimal 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setFotoUrl(ev.target.result as string);
        showToast('Foto berhasil dimuat.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomorUrut.trim() || !namaKetua.trim() || !namaWakil.trim() || !visi.trim()) {
      showToast('Nomor Urut, Nama Ketua, Nama Wakil, dan Visi wajib diisi.', 'error');
      return;
    }

    // Split multiline missions & programs
    const misiArray = misiText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const programArray = programKerjaText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const candToSave: Candidate = {
      id: editingCandidate ? editingCandidate.id : `cand-${Date.now()}`,
      nomorUrut: nomorUrut.trim(),
      namaKetua: namaKetua.trim(),
      namaWakil: namaWakil.trim(),
      fotoUrl,
      visi: visi.trim(),
      misi: misiArray.length > 0 ? misiArray : ['Meningkatkan keterlibatan aktif siswa dalam kegiatan sekolah.'],
      programKerja: programArray,
      statusAktif,
      createdAt: editingCandidate ? editingCandidate.createdAt : new Date().toISOString(),
    };

    const res = onSaveCandidate(candToSave);
    if (res.success) {
      showToast(res.message, 'success');
      setIsModalOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidateId) return;
    const res = onDeleteCandidate(deleteCandidateId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    setDeleteCandidateId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Data Pasangan Calon (Paslon)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola nomor urut, foto, nama kandidat ketua dan wakil, visi, misi, serta program kerja.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paslon</span>
        </button>
      </div>

      {/* Candidate List / Grid */}
      {candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum Ada Pasangan Calon"
          description="Tentukan dan tambahkan pasangan calon ketua & wakil OSIS terlebih dahulu."
          actionText="+ Tambah Paslon"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(candidate => (
            <div
              key={candidate.id}
              className={`rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${
                candidate.statusAktif
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                {/* Number and Status Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-black text-xl text-blue-600 dark:text-blue-400">
                    PASLON #{candidate.nomorUrut}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      candidate.statusAktif
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {candidate.statusAktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Candidate Image */}
                <div className="relative aspect-16/10 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                  {candidate.fotoUrl ? (
                    <img
                      src={candidate.fotoUrl}
                      alt={`Paslon ${candidate.nomorUrut}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Users className="w-12 h-12 mb-1" />
                      <span className="text-[11px]">Belum Ada Foto</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Ketua & Wakil
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                      {candidate.namaKetua}
                    </h3>
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      & {candidate.namaWakil}
                    </h4>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">
                      Visi Singkat:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                      "{candidate.visi}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewCandidate(candidate)}
                  className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 transition"
                  title="Lihat Pratinjau Profil"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(candidate)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteCandidateId(candidate.id)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Hapus Paslon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editingCandidate ? 'Edit Data Pasangan Calon' : 'Tambah Pasangan Calon Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Urut *
                  </label>
                  <input
                    type="text"
                    value={nomorUrut}
                    onChange={e => setNomorUrut(e.target.value)}
                    placeholder="Contoh: 01"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={statusAktif}
                      onChange={e => setStatusAktif(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Status Paslon Aktif</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Pasangan Calon (Opsional, Max 2MB)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="candidate-photo-file"
                      className="hidden"
                    />
                    <label
                      htmlFor="candidate-photo-file"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{fotoUrl ? 'Ganti Foto' : 'Unggah Foto Paslon'}</span>
                    </label>
                    {fotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFotoUrl('')}
                        className="ml-2 text-xs text-rose-600 hover:underline"
                      >
                        Hapus Foto
                      </button>
                    )}
                    <span className="block text-[11px] text-slate-400 mt-1">
                      Format: JPG, PNG, atau WebP.
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Calon Ketua *
                  </label>
                  <input
                    type="text"
                    value={namaKetua}
                    onChange={e => setNamaKetua(e.target.value)}
                    placeholder="Nama calon ketua"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Calon Wakil *
                  </label>
                  <input
                    type="text"
                    value={namaWakil}
                    onChange={e => setNamaWakil(e.target.value)}
                    placeholder="Nama calon wakil"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Visi Pasangan Calon *
                </label>
                <textarea
                  value={visi}
                  onChange={e => setVisi(e.target.value)}
                  placeholder="Tuliskan visi paslon..."
                  rows={2}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Misi Pasangan Calon (Satu poin per baris)
                </label>
                <textarea
                  value={misiText}
                  onChange={e => setMisiText(e.target.value)}
                  placeholder="Misi 1&#10;Misi 2&#10;Misi 3"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs leading-relaxed"
                />
                <span className="text-[11px] text-slate-400">
                  Tekan Enter untuk memisahkan setiap poin misi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Program Kerja Unggulan (Satu program per baris)
                </label>
                <textarea
                  value={programKerjaText}
                  onChange={e => setProgramKerjaText(e.target.value)}
                  placeholder="Program 1: OSIS Peduli&#10;Program 2: Festival Bakat Siswa"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition"
                >
                  Simpan Paslon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Profile Modal Preview */}
      <CandidateProfileModal
        candidate={previewCandidate}
        isOpen={!!previewCandidate}
        onClose={() => setPreviewCandidate(null)}
        onSelectCandidate={() => setPreviewCandidate(null)}
        canVote={false}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCandidateId}
        title="Hapus Pasangan Calon?"
        message="Data pasangan calon ini akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan."
        isDanger={true}
        confirmText="Hapus Paslon"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidateId(null)}
      />
    </div>
  );
};
