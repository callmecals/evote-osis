import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Vote,
  BarChart3,
  Eye,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Settings,
  Database,
  LogOut,
  Menu,
  X,
  School,
  Sparkles,
} from 'lucide-react';
import {
  Candidate,
  ElectionSettings,
  SchoolSettings,
  Voter,
  AnonymousVote,
  AuditLog,
  ElectionStatus,
} from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { VoterManagement } from './VoterManagement';
import { CandidateManagement } from './CandidateManagement';
import { RealtimeCount } from './RealtimeCount';
import { MonitoringPartisipasi } from './MonitoringPartisipasi';
import { AuditTrail } from './AuditTrail';
import { LaporanView } from './LaporanView';
import { BeritaAcaraView } from './BeritaAcaraView';
import { SchoolSettingsView } from './SchoolSettingsView';
import { AppSettingsView } from './AppSettingsView';
import { BackupRestoreView } from './BackupRestoreView';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { Footer } from '../common/Footer';

interface AdminHomeProps {
  adminName: string;
  schoolSettings: SchoolSettings;
  electionSettings: ElectionSettings;
  candidates: Candidate[];
  voters: Voter[];
  votes: AnonymousVote[];
  auditLogs: AuditLog[];
  stats: {
    totalDpt: number;
    totalAktif: number;
    sudahMemilih: number;
    belumMemilih: number;
    persentasePartisipasi: number;
    totalSuaraMasuk: number;
    votesPerCandidate: Record<string, { count: number; percentage: number }>;
    classStats: Record<string, { total: number; sudah: number; belum: number; persentase: number }>;
  };
  onUpdateSchoolSettings: (settings: SchoolSettings) => void;
  onUpdateElectionSettings: (settings: ElectionSettings) => void;
  onChangeElectionStatus: (status: ElectionStatus) => void;
  onSaveCandidate: (cand: Candidate) => { success: boolean; message: string };
  onDeleteCandidate: (id: string) => { success: boolean; message: string };
  onSaveVoter: (voter: Voter) => { success: boolean; message: string };
  onDeleteVoter: (id: string) => { success: boolean; message: string };
  onResetVoterStatus: (id: string) => { success: boolean; message: string };
  onImportVoters: (list: Partial<Voter>[]) => any;
  onExportBackup: () => string;
  onRestoreBackup: (json: string) => { success: boolean; message: string };
  onResetVotesOnly: () => void;
  onResetEntireSystem: () => void;
  onSeedSampleData: () => void;
  onLogout: () => void;
  onRefreshData: () => void;
}

export type AdminTab =
  | 'DASHBOARD'
  | 'DPT'
  | 'PASLON'
  | 'REALTIME'
  | 'MONITORING'
  | 'AUDIT'
  | 'LAPORAN'
  | 'BERITA_ACARA'
  | 'PENGATURAN_SEKOLAH'
  | 'PENGATURAN_PEMILU'
  | 'BACKUP';

export const AdminHome: React.FC<AdminHomeProps> = ({
  adminName,
  schoolSettings,
  electionSettings,
  candidates,
  voters,
  votes,
  auditLogs,
  stats,
  onUpdateSchoolSettings,
  onUpdateElectionSettings,
  onChangeElectionStatus,
  onSaveCandidate,
  onDeleteCandidate,
  onSaveVoter,
  onDeleteVoter,
  onResetVoterStatus,
  onImportVoters,
  onExportBackup,
  onRestoreBackup,
  onResetVotesOnly,
  onResetEntireSystem,
  onSeedSampleData,
  onLogout,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'DPT', label: 'Data Pemilih', icon: Users, badge: voters.length },
    { id: 'PASLON', label: 'Data Paslon', icon: Vote, badge: candidates.length },
    { id: 'REALTIME', label: 'Real-Time Count', icon: BarChart3 },
    { id: 'MONITORING', label: 'Monitoring', icon: Eye },
    { id: 'AUDIT', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'LAPORAN', label: 'Laporan', icon: FileText },
    { id: 'BERITA_ACARA', label: 'Berita Acara', icon: FileSpreadsheet },
    { id: 'PENGATURAN_SEKOLAH', label: 'Identitas Sekolah', icon: School },
    { id: 'PENGATURAN_PEMILU', label: 'Pengaturan Pemilu', icon: Settings },
    { id: 'BACKUP', label: 'Backup & Restore', icon: Database },
  ];

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Mobile Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-base tracking-tight">Admin E-Voting</span>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton compact />
          <button
            onClick={onLogout}
            className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (Section 31 requirements) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Sidebar Brand Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <Vote className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="font-extrabold text-slate-900 dark:text-white tracking-tight block text-sm leading-none">
                    E-VOTING OSIS
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                    {schoolSettings.namaSekolah}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Operator Info Card */}
            <div className="px-4 py-3 mx-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Masuk Sebagai
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {adminName}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sesi Aktif</span>
              </div>
            </div>

            {/* Navigation Menus */}
            <nav className="p-3 space-y-1 flex-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id as AdminTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Logout Button in Sidebar */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'DASHBOARD' && (
            <AdminDashboard
              schoolSettings={schoolSettings}
              electionSettings={electionSettings}
              candidates={candidates}
              voters={voters}
              votes={votes}
              stats={stats}
              onNavigateTab={tab => handleSelectTab(tab as AdminTab)}
              onChangeElectionStatus={onChangeElectionStatus}
              onSeedSampleData={onSeedSampleData}
            />
          )}

          {activeTab === 'DPT' && (
            <VoterManagement
              voters={voters}
              onSaveVoter={onSaveVoter}
              onDeleteVoter={onDeleteVoter}
              onResetVoterStatus={onResetVoterStatus}
              onImportVoters={onImportVoters}
            />
          )}

          {activeTab === 'PASLON' && (
            <CandidateManagement
              candidates={candidates}
              onSaveCandidate={onSaveCandidate}
              onDeleteCandidate={onDeleteCandidate}
            />
          )}

          {activeTab === 'REALTIME' && (
            <RealtimeCount
              candidates={candidates}
              voters={voters}
              votes={votes}
              stats={stats}
              electionSettings={electionSettings}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'MONITORING' && (
            <MonitoringPartisipasi
              voters={voters}
              stats={stats}
            />
          )}

          {activeTab === 'AUDIT' && (
            <AuditTrail auditLogs={auditLogs} />
          )}

          {activeTab === 'LAPORAN' && (
            <LaporanView
              schoolSettings={schoolSettings}
              electionSettings={electionSettings}
              candidates={candidates}
              voters={voters}
              votes={votes}
              auditLogs={auditLogs}
              stats={stats}
            />
          )}

          {activeTab === 'BERITA_ACARA' && (
            <BeritaAcaraView
              schoolSettings={schoolSettings}
              electionSettings={electionSettings}
              candidates={candidates}
              voters={voters}
              votes={votes}
              stats={stats}
            />
          )}

          {activeTab === 'PENGATURAN_SEKOLAH' && (
            <SchoolSettingsView
              settings={schoolSettings}
              onSave={onUpdateSchoolSettings}
            />
          )}

          {activeTab === 'PENGATURAN_PEMILU' && (
            <AppSettingsView
              electionSettings={electionSettings}
              onSave={onUpdateElectionSettings}
            />
          )}

          {activeTab === 'BACKUP' && (
            <BackupRestoreView
              onExportBackup={onExportBackup}
              onRestoreBackup={onRestoreBackup}
              onResetVotesOnly={onResetVotesOnly}
              onResetEntireSystem={onResetEntireSystem}
              onSeedSampleData={onSeedSampleData}
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};
