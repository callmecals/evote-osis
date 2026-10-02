import React, { useState } from 'react';
import { Candidate, ElectionSettings, Voter } from '../../types';
import { Users, Info, CheckCircle2, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { CandidateProfileModal } from './CandidateProfileModal';
import { VoteConfirmModal } from './VoteConfirmModal';
import { EmptyState } from '../common/EmptyState';

interface DigitalBallotRoomProps {
  candidates: Candidate[];
  electionSettings: ElectionSettings;
  voter: Voter;
  onSubmitVote: (candidateId: string) => Promise<void>;
  isSubmitting: boolean;
}

export const DigitalBallotRoom: React.FC<DigitalBallotRoomProps> = ({
  candidates,
  electionSettings,
  voter,
  onSubmitVote,
  isSubmitting,
}) => {
  const [selectedForProfile, setSelectedForProfile] = useState<Candidate | null>(null);
  const [selectedForConfirm, setSelectedForConfirm] = useState<Candidate | null>(null);

  const activeCandidates = candidates.filter(c => c.statusAktif);
  const canVote = voter.statusMemilih === 'belum' && electionSettings.status === 'BERLANGSUNG';

  const handleSelectFromCard = (candidate: Candidate) => {
    if (!canVote) return;
    setSelectedForConfirm(candidate);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedForConfirm) return;
    await onSubmitVote(selectedForConfirm.id);
    setSelectedForConfirm(null);
  };

  if (activeCandidates.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          icon={Users}
          title="Belum Ada Pasangan Calon"
          description="Daftar pasangan calon belum ditambahkan atau belum diaktifkan oleh panitia pemilihan."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructional Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 sm:p-7 shadow-lg shadow-blue-600/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Surat Suara Digital Resmi</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Silakan Pilih Satu Pasangan Calon
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
              Ketua & Wakil OSIS Periode Selanjutnya. Gunakan hak suara Anda secara bijak, mandiri, dan bertanggung jawab.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/20 text-xs sm:text-right shrink-0">
            <span className="text-blue-200 block text-[11px]">Status Pemilih</span>
            <span className="font-bold text-white text-sm">
              {voter.nama} ({voter.kelas})
            </span>
            <div className="mt-1 flex items-center sm:justify-end gap-1 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>1 Hak Suara Tersedia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if already voted or election not open */}
      {!canVote && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            {voter.statusMemilih === 'sudah'
              ? 'Anda telah menggunakan hak suara Anda sebelumnya. Anda tidak dapat melakukan pemilihan ulang.'
              : 'Pemungutan suara saat ini tidak sedang berlangsung.'}
          </span>
        </div>
      )}

      {/* Candidates Grid (1 column on mobile, 2 or 3 columns on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {activeCandidates.map(candidate => (
          <div
            key={candidate.id}
            className="flex flex-col rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-xl group"
          >
            {/* Candidate Header / Number */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                NOMOR URUT
              </span>
              <span className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-0.5 rounded-xl border border-blue-200/60 dark:border-blue-900/60">
                {candidate.nomorUrut}
              </span>
            </div>

            {/* Candidate Image Container */}
            <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              {candidate.fotoUrl ? (
                <img
                  src={candidate.fotoUrl}
                  alt={`Paslon ${candidate.nomorUrut}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <Users className="w-16 h-16 mb-1 stroke-1" />
                  <span className="text-xs font-medium">Foto Paslon {candidate.nomorUrut}</span>
                </div>
              )}
            </div>

            {/* Candidate Names & Summary */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                      Calon Ketua OSIS
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      {candidate.namaKetua}
                    </h3>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                      Calon Wakil Ketua OSIS
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {candidate.namaWakil}
                    </h4>
                  </div>
                </div>

                {/* Visi Teaser */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                    "{candidate.visi}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForProfile(candidate)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Lihat Profil</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectFromCard(candidate)}
                  disabled={!canVote}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pilih Paslon</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      <CandidateProfileModal
        candidate={selectedForProfile}
        isOpen={!!selectedForProfile}
        onClose={() => setSelectedForProfile(null)}
        onSelectCandidate={c => {
          setSelectedForProfile(null);
          setSelectedForConfirm(c);
        }}
        canVote={canVote}
      />

      {/* Confirmation Modal */}
      <VoteConfirmModal
        candidate={selectedForConfirm}
        isOpen={!!selectedForConfirm}
        onCancel={() => setSelectedForConfirm(null)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
