import React from 'react';
import { X, CheckCircle2, ShieldCheck, Smartphone, Lock, Award } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">E-VOTING OSIS</h2>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Sistem Pemilihan Ketua & Wakil OSIS</p>
          </div>
        </div>

        <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Deskripsi</p>
            <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
              Sistem pemilihan Ketua dan Wakil OSIS berbasis digital.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block">Versi Aplikasi</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">1.0.0 (Release)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block">Arsitektur</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">PWA Mobile-First</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Prinsip Integritas & Kerahasiaan:
            </h4>
            <div className="flex items-start gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Asas Luber Jurdil:</strong> Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil.</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Secret Ballot:</strong> Data pemilih dan rekaman suara dipisahkan secara anonim. Identitas pilihan Anda tidak dapat dilacak siapa pun.</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <Smartphone className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span><strong>Akses Universal:</strong> Responsif pada layar HP smartphone, tablet, laptop, dan komputer lab sekolah.</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              E-VOTING OSIS
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistem Pemilihan Ketua & Wakil OSIS
            </p>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
              &copy; 2026 callmecals2026
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-medium text-sm transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
