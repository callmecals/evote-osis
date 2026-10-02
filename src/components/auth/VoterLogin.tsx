import React, { useState } from 'react';
import {
  Vote,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  School,
  Shield,
  BarChart3,
  FileCheck2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Voter, SchoolSettings, ElectionSettings } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface VoterLoginProps {
  schoolSettings: SchoolSettings;
  electionSettings: ElectionSettings;
  voters: Voter[];
  onLoginSuccess: (voter: Voter) => void;
  onOpenAdminLogin: () => void;
  onOpenPublicResults: () => void;
}

export const VoterLogin: React.FC<VoterLoginProps> = ({
  schoolSettings,
  electionSettings,
  voters,
  onLoginSuccess,
  onOpenAdminLogin,
  onOpenPublicResults,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alreadyVotedVoter, setAlreadyVotedVoter] = useState<Voter | null>(null);

  const isNisMethod = electionSettings.metodeLoginPemilih === 'NIS_PIN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAlreadyVotedVoter(null);

    const idInput = identifier.trim().toLowerCase();
    const pinInput = pin.trim();

    if (!idInput || !pinInput) {
      setErrorMessage(
        isNisMethod
          ? 'Nomor Induk Siswa (NIS) dan PIN wajib diisi.'
          : 'ID Pemilih dan kata sandi wajib diisi.'
      );
      return;
    }

    // Find in DPT by NIS or Username
    const foundVoter = voters.find(
      v =>
        v.nis.trim().toLowerCase() === idInput ||
        v.username.trim().toLowerCase() === idInput
    );

    if (!foundVoter) {
      setErrorMessage('Identitas Anda tidak ditemukan dalam Daftar Pemilih Tetap (DPT). Hubungi panitia.');
      return;
    }

    if (!foundVoter.statusAktif) {
      setErrorMessage('Status kepesertaan pemilih Anda sedang dinonaktifkan oleh panitia.');
      return;
    }

    // Verify PIN / Password
    if (foundVoter.pin.trim() !== pinInput) {
      setErrorMessage('PIN atau kata sandi yang Anda masukkan salah.');
      return;
    }

    // Check if already voted
    if (foundVoter.statusMemilih === 'sudah') {
      setAlreadyVotedVoter(foundVoter);
      return;
    }

    // Check election status
    if (electionSettings.status !== 'BERLANGSUNG') {
      if (electionSettings.status === 'DRAFT' || electionSettings.status === 'AKAN_DIMULAI') {
        setErrorMessage('Pemilihan belum dibuka oleh panitia. Jadwal: ' + electionSettings.jadwalMulai.replace('T', ' '));
        return;
      }
      if (electionSettings.status === 'DITUTUP' || electionSettings.status === 'SELESAI') {
        setErrorMessage('Pemilihan telah resmi ditutup. Waktu pemungutan suara telah berakhir.');
        return;
      }
    }

    // Success
    onLoginSuccess(foundVoter);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-50/50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-6">
      {/* Top Bar on Mobile & Desktop */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Vote className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">
            E-VOTING OSIS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton compact />
          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Panitia</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full my-auto py-4">
        {alreadyVotedVoter ? (
          /* Already Voted Card */
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <FileCheck2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Hak Suara Telah Digunakan
            </h2>

            <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {alreadyVotedVoter.nama}
              </p>
              <p className="text-slate-500 mt-0.5">
                NIS: {alreadyVotedVoter.nis} · Kelas {alreadyVotedVoter.kelas}
              </p>
              {alreadyVotedVoter.waktuMemilih && (
                <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Waktu Voting: {new Date(alreadyVotedVoter.waktuMemilih).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Anda telah berpartisipasi dalam {schoolSettings.namaKegiatan}. Sistem mengunci hak suara untuk menjaga integritas dan asas satu orang satu suara.
            </p>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => onLoginSuccess(alreadyVotedVoter)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition"
              >
                Lihat Bukti Memilih (E-Receipt)
              </button>

              <button
                onClick={() => {
                  setAlreadyVotedVoter(null);
                  setIdentifier('');
                  setPin('');
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Kembali ke Form Masuk
              </button>
            </div>
          </div>
        ) : (
          /* Login Card */
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
            {/* Identity & School Title */}
            <div className="text-center mb-6">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 items-center justify-center mb-3 border border-blue-100 dark:border-blue-900/50">
                {schoolSettings.logoSekolah ? (
                  <img
                    src={schoolSettings.logoSekolah}
                    alt="Logo Sekolah"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <School className="w-8 h-8" />
                )}
              </div>
              <h2 className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                {schoolSettings.namaSekolah}
              </h2>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Pemilihan Ketua & Wakil OSIS
              </h1>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tahun Pelajaran {schoolSettings.tahunPelajaran}</span>
              </div>
            </div>

            {/* Status Badge Indicator */}
            <div className="mb-5 flex items-center justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  electionSettings.status === 'BERLANGSUNG'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : electionSettings.status === 'DITUTUP' || electionSettings.status === 'SELESAI'
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
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
                <span>
                  {electionSettings.status === 'BERLANGSUNG'
                    ? 'Pemilihan Sedang Berlangsung'
                    : electionSettings.status === 'DITUTUP'
                    ? 'Pemilihan Telah Ditutup'
                    : electionSettings.status === 'SELESAI'
                    ? 'Hasil Telah Difinalisasi'
                    : 'Pemilihan Belum Dimulai'}
                </span>
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isNisMethod ? 'Nomor Induk Siswa (NIS / NISN)' : 'ID Pemilih / Username'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={isNisMethod ? 'Contoh: 1001' : 'Contoh: VTR-001'}
                    required
                    inputMode={isNisMethod ? 'numeric' : 'text'}
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  PIN Pemilih / Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Masukkan PIN rahasia Anda"
                    required
                    inputMode="numeric"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <span>Masuk & Berikan Suara</span>
              </button>
            </form>

            {/* Public Results Link if permitted */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={onOpenPublicResults}
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Lihat Perolehan Suara Publik</span>
              </button>

              <span className="text-slate-400">Total DPT: {voters.length}</span>
            </div>

            {/* Empty state alert if no DPT yet */}
            {voters.length === 0 && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Database Baru Masih Bersih (Kosong)</strong>
                  Belum ada data DPT atau paslon yang diinput. Panitia dapat masuk melalui tombol <strong>"Panitia"</strong> di kanan atas untuk mengisi DPT, Paslon, dan membuka pemilu.
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
        <p>&copy; 2026 callmecals2026</p>
      </footer>
    </div>
  );
};
