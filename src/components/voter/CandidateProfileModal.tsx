import React from 'react';
import { X, ArrowLeft, Check, Users, Sparkles, Target, FileText } from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateProfileModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (candidate: Candidate) => void;
  canVote: boolean;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onSelectCandidate,
  canVote,
}) => {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Profil Lengkap Paslon {candidate.nomorUrut}
          </span>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Header Card with Photo and Order Number */}
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 sm:p-6 overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Box */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40 shadow-inner shrink-0 flex items-center justify-center">
                {candidate.fotoUrl ? (
                  <img
                    src={candidate.fotoUrl}
                    alt={`Paslon ${candidate.nomorUrut}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/80">
                    <Users className="w-12 h-12" />
                    <span className="text-[10px] mt-1 font-semibold">Foto Paslon</span>
                  </div>
                )}
                {/* Number badge on photo */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 text-white font-mono font-bold text-xs tracking-wider">
                  #{candidate.nomorUrut}
                </div>
              </div>

              {/* Names & Titles */}
              <div className="text-center sm:text-left flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-2">
                  Pasangan Calon Nomor {candidate.nomorUrut}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {candidate.namaKetua}
                </h2>
                <p className="text-sm font-medium text-blue-100">
                  Calon Ketua OSIS
                </p>

                <div className="my-2 border-t border-white/20 w-16 mx-auto sm:mx-0" />

                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white/95">
                  {candidate.namaWakil}
                </h3>
                <p className="text-sm font-medium text-blue-100">
                  Calon Wakil Ketua OSIS
                </p>
              </div>
            </div>
          </div>

          {/* Visi */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Visi Pasangan Calon</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
              "{candidate.visi}"
            </div>
          </div>

          {/* Misi */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Misi Pasangan Calon</span>
            </div>
            <div className="space-y-2">
              {candidate.misi.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Program Kerja */}
          {candidate.programKerja && candidate.programKerja.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Program Kerja Unggulan</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {candidate.programKerja.map((prog, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Program #{idx + 1}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{prog}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
          >
            ← Kembali
          </button>

          {canVote ? (
            <button
              onClick={() => {
                onClose();
                onSelectCandidate(candidate);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <span>PILIH PASLON INI ({candidate.nomorUrut})</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400 italic">
              Hak suara telah digunakan
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
