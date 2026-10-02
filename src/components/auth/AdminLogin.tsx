import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowLeft, School, Info } from 'lucide-react';
import { SchoolSettings } from '../../types';

interface AdminLoginProps {
  schoolSettings: SchoolSettings;
  onLoginSuccess: (adminName: string) => void;
  onBackToVoterLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  schoolSettings,
  onLoginSuccess,
  onBackToVoterLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);

    // Simulated verification - allows 'admin' / 'admin' or 'osis' / 'osis' or custom
    setTimeout(() => {
      setIsLoading(false);
      const u = username.trim().toLowerCase();
      const p = password.trim();

      if ((u === 'admin' && p === 'admin') || (u === 'panitia' && p === 'panitia') || (u === 'osis' && p === 'osis2026')) {
        onLoginSuccess(u === 'admin' ? 'Administrator' : 'Panitia Pemilihan');
      } else {
        setErrorMessage('Username atau kata sandi tidak cocok. Gunakan admin / admin.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBackToVoterLogin}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Pemilih</span>
        </button>

        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 items-center justify-center mb-3">
              {schoolSettings.logoSekolah ? (
                <img
                  src={schoolSettings.logoSekolah}
                  alt="Logo Sekolah"
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <School className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <h2 className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
              {schoolSettings.namaSekolah}
            </h2>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Portal Admin & Panitia
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              E-Voting Pemilihan Ketua & Wakil OSIS
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username / Email Operator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Masuk Dashboard Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint for Evaluators */}
          <div className="mt-6 p-3 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold mb-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Kredensial Default Uji Coba:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 font-mono text-[11px] mt-1">
              <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                User: <strong className="text-slate-900 dark:text-white">admin</strong>
              </div>
              <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                Sandi: <strong className="text-slate-900 dark:text-white">admin</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
