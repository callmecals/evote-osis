import React, { useRef } from 'react';
import {
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  School,
  Lock,
  LogOut,
  Calendar,
  Hash,
} from 'lucide-react';
import { SchoolSettings, Voter } from '../../types';

interface VoteSuccessReceiptProps {
  voter: Voter;
  schoolSettings: SchoolSettings;
  transactionNumber: string;
  voteTimestamp: string;
  onLogout: () => void;
}

export const VoteSuccessReceipt: React.FC<VoteSuccessReceiptProps> = ({
  voter,
  schoolSettings,
  transactionNumber,
  voteTimestamp,
  onLogout,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(voteTimestamp).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(voteTimestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Success Notification Banner */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-3 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          VOTING BERHASIL!
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Suara Anda telah resmi dicatat ke dalam kotak suara digital secara rahasia.
        </p>
      </div>

      {/* Printable Receipt Card */}
      <div
        ref={receiptRef}
        className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden print:border-black print:shadow-none print:m-0"
      >
        {/* Subtle Watermark/Pattern */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-50 dark:bg-blue-950/20 rounded-full blur-2xl pointer-events-none" />

        {/* Receipt Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
            {schoolSettings.logoSekolah ? (
              <img
                src={schoolSettings.logoSekolah}
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            ) : (
              <School className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
              {schoolSettings.namaSekolah}
            </h2>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              BUKTI PEMUNGUTAN SUARA (E-RECEIPT)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {schoolSettings.namaKegiatan} · TP {schoolSettings.tahunPelajaran}
            </p>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="py-5 space-y-3.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Status Suara</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SUARA BERHASIL DITERIMA
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Nama Pemilih</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {voter.nama}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">NIS / Kelas</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {voter.nis} / {voter.kelas}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Waktu Pemilihan</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 text-right">
              {formattedDate} {formattedTime} WIB
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Nomor Transaksi Anonim</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {transactionNumber}
            </span>
          </div>
        </div>

        {/* Secret Ballot Compliance Notice */}
        <div className="mt-2 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
          <Lock className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Asas Kerahasiaan Terjamin:</strong> Demi mematuhi prinsip demokrasi Luber Jurdil, pilihan kandidat <strong>TIDAK DICANTUMKAN</strong> pada bukti ini. Identitas Anda dan pilihan paslon terpisah secara matematis di sistem.
          </p>
        </div>

        {/* Verification Footer Stamp */}
        <div className="mt-5 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Certified E-Voting System</span>
          </div>
          <span>&copy; 2026 callmecals2026</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-sm transition"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>Cetak / Unduh PDF Bukti</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold text-xs sm:text-sm shadow-md transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Selesai & Keluar</span>
        </button>
      </div>
    </div>
  );
};
