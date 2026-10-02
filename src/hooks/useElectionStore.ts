import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Voter,
  Candidate,
  AnonymousVote,
  AuditLog,
  SchoolSettings,
  ElectionSettings,
  ElectionStatus,
} from '../types';
import { StorageService } from '../services/storage';

export function useElectionStore() {
  const [schoolSettings, setSchoolSettingsState] = useState<SchoolSettings>(() => {
    StorageService.initDatabase();
    return StorageService.getSchoolSettings();
  });

  const [electionSettings, setElectionSettingsState] = useState<ElectionSettings>(() =>
    StorageService.getElectionSettings()
  );

  const [candidates, setCandidates] = useState<Candidate[]>(() => StorageService.getCandidates());
  const [voters, setVoters] = useState<Voter[]>(() => StorageService.getVoters());
  const [votes, setVotes] = useState<AnonymousVote[]>(() => StorageService.getVotes());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  const refreshData = useCallback(() => {
    setSchoolSettingsState(StorageService.getSchoolSettings());
    setElectionSettingsState(StorageService.getElectionSettings());
    setCandidates(StorageService.getCandidates());
    setVoters(StorageService.getVoters());
    setVotes(StorageService.getVotes());
    setAuditLogs(StorageService.getAuditLogs());
  }, []);

  useEffect(() => {
    StorageService.initDatabase();
    refreshData();

    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('evoting_storage_change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    // Periodic check for auto-scheduled status
    const interval = setInterval(() => {
      const current = StorageService.getElectionSettings();
      if (current.autoStatusByJadwal) {
        refreshData();
      }
    }, 15000);

    return () => {
      window.removeEventListener('evoting_storage_change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [refreshData]);

  // Aggregated Statistics
  const stats = useMemo(() => {
    const totalDpt = voters.length;
    const totalAktif = voters.filter(v => v.statusAktif).length;
    const sudahMemilih = voters.filter(v => v.statusMemilih === 'sudah').length;
    const belumMemilih = totalDpt - sudahMemilih;
    const persentasePartisipasi = totalDpt > 0 ? (sudahMemilih / totalDpt) * 100 : 0;
    const totalSuaraMasuk = votes.filter(v => v.isValid).length;

    // Per Candidate Counts
    const votesPerCandidate: Record<string, { count: number; percentage: number }> = {};
    candidates.forEach(cand => {
      const count = votes.filter(v => v.candidateId === cand.id && v.isValid).length;
      const percentage = totalSuaraMasuk > 0 ? (count / totalSuaraMasuk) * 100 : 0;
      votesPerCandidate[cand.id] = {
        count,
        percentage: Number(percentage.toFixed(2)),
      };
    });

    // Per Class Breakdown
    const classStats: Record<string, { total: number; sudah: number; belum: number; persentase: number }> = {};
    voters.forEach(v => {
      const cls = v.kelas?.trim() || 'Lainnya';
      if (!classStats[cls]) {
        classStats[cls] = { total: 0, sudah: 0, belum: 0, persentase: 0 };
      }
      classStats[cls].total += 1;
      if (v.statusMemilih === 'sudah') {
        classStats[cls].sudah += 1;
      } else {
        classStats[cls].belum += 1;
      }
    });

    Object.keys(classStats).forEach(cls => {
      const item = classStats[cls];
      item.persentase = item.total > 0 ? Number(((item.sudah / item.total) * 100).toFixed(1)) : 0;
    });

    return {
      totalDpt,
      totalAktif,
      sudahMemilih,
      belumMemilih,
      persentasePartisipasi: Number(persentasePartisipasi.toFixed(2)),
      totalSuaraMasuk,
      votesPerCandidate,
      classStats,
    };
  }, [voters, votes, candidates]);

  // Actions
  const updateSchoolSettings = useCallback((settings: SchoolSettings, actor = 'Admin') => {
    StorageService.saveSchoolSettings(settings, actor);
    refreshData();
  }, [refreshData]);

  const updateElectionSettings = useCallback((settings: ElectionSettings, actor = 'Admin') => {
    StorageService.saveElectionSettings(settings, actor);
    refreshData();
  }, [refreshData]);

  const changeElectionStatus = useCallback((status: ElectionStatus, actor = 'Admin') => {
    StorageService.setElectionStatus(status, actor);
    refreshData();
  }, [refreshData]);

  const saveCandidate = useCallback((candidate: Candidate, actor = 'Admin') => {
    const res = StorageService.saveCandidate(candidate, actor);
    refreshData();
    return res;
  }, [refreshData]);

  const deleteCandidate = useCallback((id: string, actor = 'Admin') => {
    const res = StorageService.deleteCandidate(id, actor);
    refreshData();
    return res;
  }, [refreshData]);

  const saveVoter = useCallback((voter: Voter, actor = 'Admin') => {
    const res = StorageService.saveVoter(voter, actor);
    refreshData();
    return res;
  }, [refreshData]);

  const deleteVoter = useCallback((id: string, actor = 'Admin') => {
    const res = StorageService.deleteVoter(id, actor);
    refreshData();
    return res;
  }, [refreshData]);

  const resetVoterStatus = useCallback((id: string, actor = 'Admin') => {
    const res = StorageService.resetVoterStatus(id, actor);
    refreshData();
    return res;
  }, [refreshData]);

  const importVoters = useCallback((list: Partial<Voter>[], actor = 'Admin') => {
    const res = StorageService.importVoters(list, actor);
    refreshData();
    return res;
  }, [refreshData]);

  const submitBallot = useCallback((voterId: string, candidateId: string) => {
    const res = StorageService.submitBallot(voterId, candidateId);
    refreshData();
    return res;
  }, [refreshData]);

  const exportBackup = useCallback(() => {
    return StorageService.exportFullBackup();
  }, []);

  const restoreBackup = useCallback((jsonString: string, actor = 'Admin') => {
    const res = StorageService.restoreFullBackup(jsonString, actor);
    refreshData();
    return res;
  }, [refreshData]);

  const resetVotesOnly = useCallback((actor = 'Admin') => {
    StorageService.resetVotesOnly(actor);
    refreshData();
  }, [refreshData]);

  const resetEntireSystem = useCallback((actor = 'Admin') => {
    StorageService.resetEntireSystem(actor);
    refreshData();
  }, [refreshData]);

  const seedSampleData = useCallback((actor = 'Admin') => {
    StorageService.seedSampleData(actor);
    refreshData();
  }, [refreshData]);

  return {
    schoolSettings,
    electionSettings,
    candidates,
    voters,
    votes,
    auditLogs,
    stats,
    updateSchoolSettings,
    updateElectionSettings,
    changeElectionStatus,
    saveCandidate,
    deleteCandidate,
    saveVoter,
    deleteVoter,
    resetVoterStatus,
    importVoters,
    submitBallot,
    exportBackup,
    restoreBackup,
    resetVotesOnly,
    resetEntireSystem,
    seedSampleData,
    refreshData,
  };
}
