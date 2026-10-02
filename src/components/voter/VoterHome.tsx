import React, { useState } from 'react';
import {
  Voter,
  Candidate,
  ElectionSettings,
  SchoolSettings,
} from '../../types';
import {
  Home,
  Users,
  Vote,
  FileCheck,
  Receipt,
  LogOut,
  Lock,
  CheckCircle2,
  AlertCircle,
  School,
  ArrowRight,
} from 'lucide-react';
import { DigitalBallotRoom } from './DigitalBallotRoom';
import { VoteSuccessReceipt } from './VoteSuccessReceipt';
import { CandidateProfileModal } from './CandidateProfileModal';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { Footer } from '../common/Footer';
import { useToast } from '../common/Toast';

interface VoterHomeProps {
  voter: Voter;
  schoolSettings: SchoolSettings;
  electionSettings: ElectionSettings;
  candidates: Candidate[];
  onSubmitBallot: (candidateId: string) => Promise<{
    success: boolean;
    message: string;
    transactionNumber?: string;
    timestamp?: string;
  }>;
  onLogout: () => void;
}

type VoterTab = 'BERANDA' | 'PASLON' | 'SURAT_SUARA' | 'STATUS' | 'BUKTI';

export const VoterHome: React.FC<VoterHomeProps> = ({
  voter,
  schoolSettings,
  electionSettings,
  candidates,
  onSubmitBallot,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<VoterTab>(() =>
    voter.statusMemilih === 'sudah' ? 'STATUS' : 'BERANDA'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justVotedReceipt, setJustVotedReceipt] = useState<{
    txId: string;
    timestamp: string;
  } | null>(null);

  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState<Candidate | null>(null);
  const { showToast } = useToast();

  const hasVoted = voter.statusMemilih === 'sudah' || !!justVotedReceipt;

  const handleVoteSubmit = async (candidateId: string) => {
    setIsSubmitting(true);
    try {
      const res = await onSubmitBallot(candidateId);
      setIsSubmitting(false);
      if (res.success && res.transactionNumber && res.timestamp) {
        showToast('Suara Anda berhasil dikirim!', 'success');
        setJustVotedReceipt({
          txId: res.transactionNumber,
          timestamp: res.timestamp,
        });
        setActiveTab('BUKTI');
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      setIsSubmitting(false);
      showToast('Gagal memproses suara. Coba lagi.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20 md:pb-0">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight block leading-none">
                E-VOTING OSIS
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {schoolSettings.namaSekolah}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton compact />
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Keluar dari akun voting"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('BERANDA')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'BERANDA'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => setActiveTab('PASLON')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'PASLON'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Profil Paslon</span>
          </button>

          <button
            onClick={() => !hasVoted && setActiveTab('SURAT_SUARA')}
            disabled={hasVoted}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'SURAT_SUARA'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : hasVoted
                ? 'border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span>Surat Suara</span>
            {hasVoted && <Lock className="w-3 h-3 text-slate-400 ml-1" />}
          </button>

          <button
            onClick={() => setActiveTab('STATUS')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'STATUS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Status Voting</span>
          </button>

          {hasVoted && (
            <button
              onClick={() => setActiveTab('BUKTI')}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'BUKTI'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Bukti Memilih</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">
        {/* TAB: BERANDA */}
        {activeTab === 'BERANDA' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Greeting & Voter Badge */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block mb-1">
                    Selamat Datang di Bilik Suara
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Halo, {voter.nama}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    NIS: <strong className="text-slate-700 dark:text-slate-200">{voter.nis}</strong> · Kelas: <strong className="text-slate-700 dark:text-slate-200">{voter.kelas}</strong>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Status Hak Suara
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center gap-1.5 mt-0.5 ${
                        hasVoted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          hasVoted ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'
                        }`}
                      />
                      {hasVoted ? 'Sudah Memilih' : 'Belum Memilih'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Call to action card */}
              {!hasVoted ? (
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md shadow-blue-500/20">
                  <div>
                    <h3 className="font-extrabold text-base">
                      Siap Menggunakan Hak Suara Anda?
                    </h3>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Lihat profil para calon, pelajari visi misi mereka, dan coblos pilihan Anda di bilik suara digital.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('SURAT_SUARA')}
                    className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-50 active:scale-95 transition shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <span>Buka Surat Suara</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Anda telah memberikan suara. Terima kasih atas partisipasi aktif Anda!</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('BUKTI')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shrink-0"
                  >
                    Lihat Bukti
                  </button>
                </div>
              )}
            </div>

            {/* Quick Paslon Overview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Daftar Pasangan Calon ({candidates.filter(c => c.statusAktif).length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('PASLON')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Lihat Semua Visi Misi →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {candidates
                  .filter(c => c.statusAktif)
                  .map(candidate => (
                    <div
                      key={candidate.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-mono font-black text-lg flex items-center justify-center border border-blue-200 dark:border-blue-900 shrink-0">
                          {candidate.nomorUrut}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {candidate.namaKetua}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            & {candidate.namaWakil}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                        "{candidate.visi}"
                      </p>

                      <button
                        onClick={() => setSelectedCandidateProfile(candidate)}
                        className="mt-3 w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        Buka Visi Misi Lengkap
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROFIL PASLON */}
        {activeTab === 'PASLON' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Profil & Program Kerja Paslon
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pelajari visi, misi, dan program kerja unggulan calon pemimpin OSIS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates
                .filter(c => c.statusAktif)
                .map(candidate => (
                  <div
                    key={candidate.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400">
                          PASLON #{candidate.nomorUrut}
                        </span>
                        <button
                          onClick={() => setSelectedCandidateProfile(candidate)}
                          className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                          Lihat Detail Modal
                        </button>
                      </div>

                      {/* Photo + Names */}
                      <div className="mt-4 flex items-center gap-4">
                        <div className="w-18 h-18 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                          {candidate.fotoUrl ? (
                            <img
                              src={candidate.fotoUrl}
                              alt={`Paslon ${candidate.nomorUrut}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                            {candidate.namaKetua}
                          </h3>
                          <p className="text-xs text-slate-500">Calon Ketua OSIS</p>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">
                            {candidate.namaWakil}
                          </h4>
                          <p className="text-xs text-slate-500">Calon Wakil Ketua OSIS</p>
                        </div>
                      </div>

                      {/* Visi */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                        <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px] block mb-0.5">
                          Visi:
                        </span>
                        <p className="italic text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          "{candidate.visi}"
                        </p>
                      </div>

                      {/* Misi Teasers */}
                      <div className="mt-3 space-y-1.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                          Misi Utama:
                        </span>
                        {candidate.misi.slice(0, 3).map((m, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {!hasVoted && (
                      <button
                        onClick={() => {
                          setActiveTab('SURAT_SUARA');
                        }}
                        className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                      >
                        Pilih di Surat Suara
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB: SURAT SUARA DIGITAL */}
        {activeTab === 'SURAT_SUARA' && (
          <div className="animate-in fade-in duration-150">
            <DigitalBallotRoom
              candidates={candidates}
              electionSettings={electionSettings}
              voter={voter}
              onSubmitVote={handleVoteSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* TAB: STATUS VOTING */}
        {activeTab === 'STATUS' && (
          <div className="max-w-md mx-auto py-8 animate-in fade-in duration-150">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center shadow-lg">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  hasVoted
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
                }`}
              >
                {hasVoted ? <CheckCircle2 className="w-9 h-9" /> : <Vote className="w-9 h-9" />}
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {hasVoted ? 'Hak Suara Telah Digunakan' : 'Hak Suara Belum Digunakan'}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {hasVoted
                  ? 'Terima kasih telah berpartisipasi dalam Pemilihan Ketua & Wakil OSIS. Suara Anda sudah tersimpan dengan aman dan anonim.'
                  : 'Anda masih memiliki 1 (satu) hak suara yang sah untuk menentukan masa depan OSIS sekolah.'}
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-left border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Pemilih</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{voter.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NIS</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{voter.nis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kelas</span>
                  <span className="text-slate-700 dark:text-slate-300">{voter.kelas}</span>
                </div>
                {voter.waktuMemilih && (
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Waktu Memilih</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {new Date(voter.waktuMemilih).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {hasVoted ? (
                  <button
                    onClick={() => setActiveTab('BUKTI')}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                  >
                    Buka E-Receipt Bukti Memilih
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('SURAT_SUARA')}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                  >
                    Buka Surat Suara Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: BUKTI MEMILIH (E-RECEIPT) */}
        {activeTab === 'BUKTI' && (
          <div className="animate-in fade-in duration-150">
            <VoteSuccessReceipt
              voter={voter}
              schoolSettings={schoolSettings}
              transactionNumber={
                justVotedReceipt?.txId || voter.tokenVoting || `TX-${Date.now().toString(36).toUpperCase()}`
              }
              voteTimestamp={
                justVotedReceipt?.timestamp || voter.waktuMemilih || new Date().toISOString()
              }
              onLogout={onLogout}
            />
          </div>
        )}
      </main>

      {/* Profile Modal */}
      <CandidateProfileModal
        candidate={selectedCandidateProfile}
        isOpen={!!selectedCandidateProfile}
        onClose={() => setSelectedCandidateProfile(null)}
        onSelectCandidate={() => {
          setSelectedCandidateProfile(null);
          setActiveTab('SURAT_SUARA');
        }}
        canVote={!hasVoted}
      />

      {/* Mobile Bottom Navigation Bar (Pattern 1 from mobile touch guidelines) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center h-16 px-1">
        <button
          onClick={() => setActiveTab('BERANDA')}
          className={`flex flex-col items-center justify-center h-full ${
            activeTab === 'BERANDA'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Beranda</span>
        </button>

        <button
          onClick={() => setActiveTab('PASLON')}
          className={`flex flex-col items-center justify-center h-full ${
            activeTab === 'PASLON'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1">Paslon</span>
        </button>

        <button
          onClick={() => !hasVoted && setActiveTab('SURAT_SUARA')}
          disabled={hasVoted}
          className={`flex flex-col items-center justify-center h-full ${
            activeTab === 'SURAT_SUARA'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : hasVoted
              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {hasVoted ? <Lock className="w-5 h-5" /> : <Vote className="w-5 h-5" />}
          <span className="text-[10px] mt-1">{hasVoted ? 'Terkunci' : 'Coblos'}</span>
        </button>

        <button
          onClick={() => (hasVoted ? setActiveTab('BUKTI') : setActiveTab('STATUS'))}
          className={`flex flex-col items-center justify-center h-full ${
            activeTab === 'STATUS' || activeTab === 'BUKTI'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {hasVoted ? <Receipt className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
          <span className="text-[10px] mt-1">{hasVoted ? 'Bukti' : 'Status'}</span>
        </button>
      </nav>

      {/* Footer */}
      <Footer />
    </div>
  );
};
