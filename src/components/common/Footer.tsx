import React, { useState } from 'react';
import { Info, Shield } from 'lucide-react';
import { AboutModal } from './AboutModal';

export const Footer: React.FC<{ minimal?: boolean }> = ({ minimal = false }) => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">E-VOTING OSIS</span>
            <span>·</span>
            <span>Sistem Pemilihan Digital</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAbout(true)}
              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Tentang Aplikasi</span>
            </button>
            <span>·</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              &copy; 2026 callmecals2026
            </span>
          </div>
        </div>
      </footer>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
};
