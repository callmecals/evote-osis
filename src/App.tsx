import React, { useState, useEffect } from 'react';
import { useElectionStore } from './hooks/useElectionStore';
import { Voter, Candidate } from './types';
import { VoterLogin } from './components/auth/VoterLogin';
import { AdminLogin } from './components/auth/AdminLogin';
import { VoterHome } from './components/voter/VoterHome';
import { AdminHome } from './components/admin/AdminHome';
import { PublicResultsView } from './components/voter/PublicResultsView';
import { ToastProvider, useToast } from './components/common/Toast';
import { OfflineIndicator } from './components/common/OfflineIndicator';

type ViewMode = 'VOTER_LOGIN' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'VOTER_APP' | 'PUBLIC_RESULTS';

function MainApp() {
  const store = useElectionStore();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const savedAdmin = sessionStorage.getItem('evoting_admin_session');
      if (savedAdmin) return 'ADMIN_DASHBOARD';

      const savedVoterId = sessionStorage.getItem('evoting_voter_session_id');
      if (savedVoterId) return 'VOTER_APP';
    } catch {
      // ignore
    }
    return 'VOTER_LOGIN';
  });

  const [adminName, setAdminName] = useState<string>(() => {
    try {
      return sessionStorage.getItem('evoting_admin_session') || 'Administrator';
    } catch {
      return 'Administrator';
    }
  });

  const [currentVoter, setCurrentVoter] = useState<Voter | null>(() => {
    try {
      const savedVoterId = sessionStorage.getItem('evoting_voter_session_id');
      if (savedVoterId) {
        return store.voters.find(v => v.id === savedVoterId) || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Keep currentVoter in sync with store changes
  useEffect(() => {
    if (currentVoter) {
      const updated = store.voters.find(v => v.id === currentVoter.id);
      if (updated && (updated.statusMemilih !== currentVoter.statusMemilih || updated.statusAktif !== currentVoter.statusAktif)) {
        setCurrentVoter(updated);
      }
    }
  }, [store.voters, currentVoter]);

  // Admin Login Handler
  const handleAdminLoginSuccess = (name: string) => {
    setAdminName(name);
    sessionStorage.setItem('evoting_admin_session', name);
    sessionStorage.removeItem('evoting_voter_session_id');
    setCurrentVoter(null);
    setViewMode('ADMIN_DASHBOARD');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('evoting_admin_session');
    setViewMode('VOTER_LOGIN');
  };

  // Voter Login Handler
  const handleVoterLoginSuccess = (voter: Voter) => {
    setCurrentVoter(voter);
    sessionStorage.setItem('evoting_voter_session_id', voter.id);
    sessionStorage.removeItem('evoting_admin_session');
    setViewMode('VOTER_APP');
  };

  const handleVoterLogout = () => {
    sessionStorage.removeItem('evoting_voter_session_id');
    setCurrentVoter(null);
    setViewMode('VOTER_LOGIN');
  };

  // Submit Vote Action
  const handleSubmitBallot = async (candidateId: string) => {
    if (!currentVoter) return { success: false, message: 'Sesi pemilih tidak valid.' };
    const res = store.submitBallot(currentVoter.id, candidateId);
    if (res.success) {
      // Refresh current voter state
      const updated = store.voters.find(v => v.id === currentVoter.id);
      if (updated) {
        setCurrentVoter(updated);
      }
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      <OfflineIndicator />

      {/* VIEW: Voter Login (Default Landing) */}
      {viewMode === 'VOTER_LOGIN' && (
        <VoterLogin
          schoolSettings={store.schoolSettings}
          electionSettings={store.electionSettings}
          voters={store.voters}
          onLoginSuccess={handleVoterLoginSuccess}
          onOpenAdminLogin={() => setViewMode('ADMIN_LOGIN')}
          onOpenPublicResults={() => setViewMode('PUBLIC_RESULTS')}
        />
      )}

      {/* VIEW: Admin Login */}
      {viewMode === 'ADMIN_LOGIN' && (
        <AdminLogin
          schoolSettings={store.schoolSettings}
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToVoterLogin={() => setViewMode('VOTER_LOGIN')}
        />
      )}

      {/* VIEW: Voter App Room */}
      {viewMode === 'VOTER_APP' && currentVoter && (
        <VoterHome
          voter={currentVoter}
          schoolSettings={store.schoolSettings}
          electionSettings={store.electionSettings}
          candidates={store.candidates}
          onSubmitBallot={handleSubmitBallot}
          onLogout={handleVoterLogout}
        />
      )}

      {/* VIEW: Admin Full Dashboard */}
      {viewMode === 'ADMIN_DASHBOARD' && (
        <AdminHome
          adminName={adminName}
          schoolSettings={store.schoolSettings}
          electionSettings={store.electionSettings}
          candidates={store.candidates}
          voters={store.voters}
          votes={store.votes}
          auditLogs={store.auditLogs}
          stats={store.stats}
          onUpdateSchoolSettings={store.updateSchoolSettings}
          onUpdateElectionSettings={store.updateElectionSettings}
          onChangeElectionStatus={store.changeElectionStatus}
          onSaveCandidate={store.saveCandidate}
          onDeleteCandidate={store.deleteCandidate}
          onSaveVoter={store.saveVoter}
          onDeleteVoter={store.deleteVoter}
          onResetVoterStatus={store.resetVoterStatus}
          onImportVoters={store.importVoters}
          onExportBackup={store.exportBackup}
          onRestoreBackup={store.restoreBackup}
          onResetVotesOnly={store.resetVotesOnly}
          onResetEntireSystem={store.resetEntireSystem}
          onSeedSampleData={store.seedSampleData}
          onLogout={handleAdminLogout}
          onRefreshData={store.refreshData}
        />
      )}

      {/* VIEW: Public Results */}
      {viewMode === 'PUBLIC_RESULTS' && (
        <PublicResultsView
          schoolSettings={store.schoolSettings}
          electionSettings={store.electionSettings}
          candidates={store.candidates}
          stats={store.stats}
          onBack={() => setViewMode('VOTER_LOGIN')}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
