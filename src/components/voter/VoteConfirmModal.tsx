import React from 'react';
import { Candidate } from '../../types';
import { AlertCircle, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

interface VoteConfirmModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const VoteConfirmModal: React.FC<VoteConfirmModalProps> = ({
  candidate,
  isOpen,
  onCancel,
  onConfirm,
  isSubmitting,
}) => {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
          KONFIRMASI PILIHAN
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Apakah Anda yakin dengan pilihan ini?
        </p>

        {/* Selected Candidate Preview Card */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 border-2 border-blue-600 dark:border-blue-500 shadow-sm text-left">
          <div className="flex items-center gap-4">
            {/* Candidate Photo / Box */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-300 dark:border-slate-600 flex items-center justify-center">
              {candidate.fotoUrl ? (
                <img
                  src={candidate.fotoUrl}
                  alt={`Paslon ${candidate.nomorUrut}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-8 h-8 text-slate-400" />
              )}
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                #{candidate.nomorUrut}
              </div>
            </div>

            {/* Candidate Details */}
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                Pasangan Calon No. {candidate.nomorUrut}
              </span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                {candidate.namaKetua}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calon Ketua OSIS
              </p>

              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {candidate.namaWakil}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calon Wakil Ketua OSIS
              </p>
            </div>
          </div>
        </div>

        {/* Warning Note */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 text-left flex items-start gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Peringatan: Setelah suara dikirim, hak suara Anda akan langsung <strong>terkunci</strong> dan tidak dapat diubah lagi.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            UBAH PILIHAN
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Mengirim Suara...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>YA, KIRIM SUARA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
