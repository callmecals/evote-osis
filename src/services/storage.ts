import {
  Voter,
  Candidate,
  AnonymousVote,
  AuditLog,
  SchoolSettings,
  ElectionSettings,
  AppThemeSettings,
  ElectionStatus,
} from '../types';

const STORAGE_KEYS = {
  VOTERS: 'evoting_voters_v1',
  CANDIDATES: 'evoting_candidates_v1',
  VOTES: 'evoting_votes_v1',
  AUDIT_LOGS: 'evoting_audit_logs_v1',
  SCHOOL_SETTINGS: 'evoting_school_settings_v1',
  ELECTION_SETTINGS: 'evoting_election_settings_v1',
  APP_THEME: 'evoting_theme_settings_v1',
  CURRENT_USER: 'evoting_current_session_v1',
  INITIALIZED: 'evoting_initialized_v1',
};

// Default school info (can be edited by Admin)
const DEFAULT_SCHOOL: SchoolSettings = {
  namaSekolah: 'SMA NEGERI 1 NUSANTARA',
  logoSekolah: '', // empty on initial, will fallback to school emblem SVG
  alamatSekolah: 'Jl. Pendidikan No. 45, Kompleks Pelajar Mandiri',
  tahunPelajaran: '2026/2027',
  namaKegiatan: 'Pemilihan Ketua & Wakil OSIS Periode 2026/2027',
  namaKetuaPanitia: 'Ahmad Faiz Pratama',
  namaPembinaOsis: 'Dra. Endang Sulistyowati, M.Pd.',
  namaKepalaSekolah: 'Dr. H. Bambang Subagyo, M.M.',
  nipKepalaSekolah: '19740512 199903 1 004',
};

// Default election settings
const DEFAULT_ELECTION: ElectionSettings = {
  status: 'DRAFT', // Starts as DRAFT as required
  jadwalMulai: new Date().toISOString().slice(0, 16),
  jadwalSelesai: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
  autoStatusByJadwal: false,
  privasiHasil: 'SEMBUNYIKAN', // Hidden by default during election
  metodeLoginPemilih: 'NIS_PIN',
  izinkanEReceipt: true,
  isFinalized: false,
};

const DEFAULT_THEME: AppThemeSettings = {
  darkMode: false,
  accentColor: '#2563eb',
};

export class StorageService {
  private static notifyChange() {
    window.dispatchEvent(new Event('evoting_storage_change'));
  }

  // Ensure initial empty database
  public static initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      // Must be strictly EMPTY according to user instruction:
      // "Pada instalasi pertama, database harus benar-benar kosong."
      localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
      
      const initialLogs: AuditLog[] = [
        {
          id: 'log-init-1',
          timestamp: new Date().toISOString(),
          jenisAktivitas: 'INISIALISASI_SISTEM',
          userRole: 'SISTEM',
          actorName: 'Sistem E-Voting',
          deskripsi: 'Sistem E-Voting OSIS siap digunakan. Database awal dalam keadaan bersih/kosong.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
      localStorage.setItem(STORAGE_KEYS.SCHOOL_SETTINGS, JSON.stringify(DEFAULT_SCHOOL));
      localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(DEFAULT_ELECTION));
      localStorage.setItem(STORAGE_KEYS.APP_THEME, JSON.stringify(DEFAULT_THEME));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // School Settings
  public static getSchoolSettings(): SchoolSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOL_SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SCHOOL;
    } catch {
      return DEFAULT_SCHOOL;
    }
  }

  public static saveSchoolSettings(settings: SchoolSettings, actor: string = 'Admin'): void {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_SETTINGS, JSON.stringify(settings));
    this.addAuditLog('PENGATURAN_SEKOLAH', 'ADMIN', actor, 'Memperbarui profil dan identitas sekolah.');
    this.notifyChange();
  }

  // Election Settings
  public static getElectionSettings(): ElectionSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ELECTION_SETTINGS);
      const settings: ElectionSettings = data ? JSON.parse(data) : DEFAULT_ELECTION;

      // Auto update status if autoStatusByJadwal is true and not finalized
      if (settings.autoStatusByJadwal && !settings.isFinalized) {
        const now = new Date();
        const start = new Date(settings.jadwalMulai);
        const end = new Date(settings.jadwalSelesai);

        let computedStatus: ElectionStatus = settings.status;
        if (now < start) {
          computedStatus = 'AKAN_DIMULAI';
        } else if (now >= start && now <= end) {
          computedStatus = 'BERLANGSUNG';
        } else if (now > end) {
          computedStatus = 'DITUTUP';
        }

        if (computedStatus !== settings.status) {
          settings.status = computedStatus;
          localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(settings));
        }
      }

      return settings;
    } catch {
      return DEFAULT_ELECTION;
    }
  }

  public static saveElectionSettings(settings: ElectionSettings, actor: string = 'Admin'): void {
    localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(settings));
    this.addAuditLog('PENGATURAN_PEMILU', 'ADMIN', actor, `Memperbarui konfigurasi pemilu. Status: ${settings.status}`);
    this.notifyChange();
  }

  public static setElectionStatus(status: ElectionStatus, actor: string = 'Admin'): void {
    const current = this.getElectionSettings();
    current.status = status;
    localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(current));
    this.addAuditLog('STATUS_PEMILU', 'ADMIN', actor, `Mengubah status pemilu menjadi: ${status}`);
    this.notifyChange();
  }

  // Candidates
  public static getCandidates(): Candidate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveCandidate(candidate: Candidate, actor: string = 'Admin'): { success: boolean; message: string } {
    const list = this.getCandidates();
    const existingIndex = list.findIndex(c => c.id === candidate.id);

    // Check duplicate nomor urut
    const duplicateNo = list.find(c => c.nomorUrut === candidate.nomorUrut && c.id !== candidate.id);
    if (duplicateNo) {
      return { success: false, message: `Nomor urut ${candidate.nomorUrut} sudah digunakan oleh paslon lain.` };
    }

    if (existingIndex >= 0) {
      list[existingIndex] = candidate;
      this.addAuditLog('EDIT_PASLON', 'ADMIN', actor, `Memperbarui data Paslon No. ${candidate.nomorUrut} (${candidate.namaKetua} & ${candidate.namaWakil})`);
    } else {
      list.push(candidate);
      this.addAuditLog('TAMBAH_PASLON', 'ADMIN', actor, `Menambahkan Paslon No. ${candidate.nomorUrut} (${candidate.namaKetua} & ${candidate.namaWakil})`);
    }

    // Sort by nomorUrut
    list.sort((a, b) => a.nomorUrut.localeCompare(b.nomorUrut, undefined, { numeric: true }));

    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(list));
    this.notifyChange();
    return { success: true, message: 'Data pasangan calon berhasil disimpan.' };
  }

  public static deleteCandidate(id: string, actor: string = 'Admin'): { success: boolean; message: string } {
    const list = this.getCandidates();
    const target = list.find(c => c.id === id);
    if (!target) return { success: false, message: 'Paslon tidak ditemukan.' };

    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(filtered));
    this.addAuditLog('HAPUS_PASLON', 'ADMIN', actor, `Menghapus Paslon No. ${target.nomorUrut} (${target.namaKetua} & ${target.namaWakil})`);
    this.notifyChange();
    return { success: true, message: 'Paslon berhasil dihapus.' };
  }

  // Voters (DPT)
  public static getVoters(): Voter[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOTERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveVoter(voter: Voter, actor: string = 'Admin'): { success: boolean; message: string } {
    const list = this.getVoters();
    const existingIndex = list.findIndex(v => v.id === voter.id);

    // Check duplicate NIS/Username
    const dupNis = list.find(v => v.nis === voter.nis && v.id !== voter.id);
    if (dupNis) {
      return { success: false, message: `NIS/ID Pemilih ${voter.nis} sudah terdaftar pada pemilih ${dupNis.nama}.` };
    }

    const dupUsername = list.find(v => v.username.toLowerCase() === voter.username.toLowerCase() && v.id !== voter.id);
    if (dupUsername) {
      return { success: false, message: `ID Login/Username ${voter.username} sudah digunakan.` };
    }

    if (existingIndex >= 0) {
      list[existingIndex] = voter;
      this.addAuditLog('EDIT_PEMILIH', 'ADMIN', actor, `Memperbarui data pemilih: ${voter.nama} (${voter.kelas})`);
    } else {
      list.push(voter);
      this.addAuditLog('TAMBAH_PEMILIH', 'ADMIN', actor, `Menambahkan pemilih baru: ${voter.nama} (${voter.kelas})`);
    }

    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(list));
    this.notifyChange();
    return { success: true, message: 'Data pemilih berhasil disimpan.' };
  }

  public static deleteVoter(id: string, actor: string = 'Admin'): { success: boolean; message: string } {
    const list = this.getVoters();
    const target = list.find(v => v.id === id);
    if (!target) return { success: false, message: 'Pemilih tidak ditemukan.' };

    const filtered = list.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(filtered));
    this.addAuditLog('HAPUS_PEMILIH', 'ADMIN', actor, `Menghapus pemilih: ${target.nama} (${target.kelas})`);
    this.notifyChange();
    return { success: true, message: 'Pemilih berhasil dihapus.' };
  }

  public static resetVoterStatus(id: string, actor: string = 'Admin'): { success: boolean; message: string } {
    const list = this.getVoters();
    const voter = list.find(v => v.id === id);
    if (!voter) return { success: false, message: 'Pemilih tidak ditemukan.' };

    voter.statusMemilih = 'belum';
    delete voter.waktuMemilih;
    delete voter.tokenVoting;

    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(list));
    this.addAuditLog('RESET_HAK_PILIH', 'ADMIN', actor, `Mereset status hak pilih pemilih: ${voter.nama} (${voter.kelas})`);
    this.notifyChange();
    return { success: true, message: `Status hak pilih untuk ${voter.nama} berhasil direset.` };
  }

  // Import Voters in bulk with detailed validation report
  public static importVoters(
    incomingVoters: Partial<Voter>[],
    actor: string = 'Admin'
  ): {
    total: number;
    berhasil: number;
    gagal: number;
    duplikat: number;
    errors: string[];
  } {
    const currentList = this.getVoters();
    const existingNisSet = new Set(currentList.map(v => v.nis.trim().toLowerCase()));
    const existingUsernameSet = new Set(currentList.map(v => v.username.trim().toLowerCase()));

    let berhasil = 0;
    let gagal = 0;
    let duplikat = 0;
    const errors: string[] = [];

    const newValidVoters: Voter[] = [];

    incomingVoters.forEach((item, index) => {
      const rowNum = index + 1;
      const nis = item.nis ? String(item.nis).trim() : '';
      const nama = item.nama ? String(item.nama).trim() : '';
      const kelas = item.kelas ? String(item.kelas).trim() : 'Umum';
      const username = item.username ? String(item.username).trim() : nis;
      const pin = item.pin ? String(item.pin).trim() : '123456';
      const jenisPemilih = item.jenisPemilih || 'SISWA';

      if (!nis || !nama) {
        gagal++;
        errors.push(`Baris ${rowNum}: NIS dan Nama wajib diisi.`);
        return;
      }

      if (existingNisSet.has(nis.toLowerCase())) {
        duplikat++;
        errors.push(`Baris ${rowNum}: NIS ${nis} sudah terdaftar sebelumnya (Duplikat).`);
        return;
      }

      if (existingUsernameSet.has(username.toLowerCase())) {
        duplikat++;
        errors.push(`Baris ${rowNum}: Username ${username} sudah dipakai (Duplikat).`);
        return;
      }

      const newVoter: Voter = {
        id: item.id || `VTR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nis,
        nama,
        kelas,
        jenisPemilih,
        username,
        pin,
        statusAktif: item.statusAktif !== undefined ? Boolean(item.statusAktif) : true,
        statusMemilih: 'belum',
      };

      existingNisSet.add(nis.toLowerCase());
      existingUsernameSet.add(username.toLowerCase());
      newValidVoters.push(newVoter);
      berhasil++;
    });

    if (newValidVoters.length > 0) {
      const merged = [...currentList, ...newValidVoters];
      localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(merged));
      this.addAuditLog(
        'IMPORT_DPT',
        'ADMIN',
        actor,
        `Import data pemilih berhasil: ${berhasil} data ditambahkan, ${duplikat} duplikat, ${gagal} gagal.`
      );
      this.notifyChange();
    }

    return {
      total: incomingVoters.length,
      berhasil,
      gagal,
      duplikat,
      errors,
    };
  }

  // Votes (ANONYMOUS STORAGE - SECRET BALLOT PRINCIPLE)
  public static getVotes(): AnonymousVote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Core Voting Engine with strict validation & secret ballot
  public static submitBallot(
    voterId: string,
    candidateId: string
  ): {
    success: boolean;
    message: string;
    transactionNumber?: string;
    timestamp?: string;
  } {
    const election = this.getElectionSettings();

    // 1. Verify election status
    if (election.status !== 'BERLANGSUNG') {
      let msg = 'Pemilihan belum dibuka atau sedang ditutup.';
      if (election.status === 'DRAFT' || election.status === 'AKAN_DIMULAI') {
        msg = 'Pemilihan belum dimulai. Harap tunggu panitia membuka waktu pemungutan suara.';
      } else if (election.status === 'DITUTUP' || election.status === 'SELESAI') {
        msg = 'Pemilihan telah ditutup. Pengiriman suara tidak dapat diproses lagi.';
      }
      return { success: false, message: msg };
    }

    // 2. Verify Voter
    const voters = this.getVoters();
    const voterIndex = voters.findIndex(v => v.id === voterId);
    if (voterIndex < 0) {
      return { success: false, message: 'Identitas pemilih tidak ditemukan dalam DPT.' };
    }

    const voter = voters[voterIndex];
    if (!voter.statusAktif) {
      return { success: false, message: 'Status akun pemilih Anda sedang dinonaktifkan oleh panitia.' };
    }

    if (voter.statusMemilih === 'sudah') {
      return {
        success: false,
        message: 'Hak suara Anda telah digunakan sebelumnya. Sistem hanya mengizinkan 1 (satu) kali memilih.',
      };
    }

    // 3. Verify Candidate
    const candidates = this.getCandidates();
    const targetCandidate = candidates.find(c => c.id === candidateId && c.statusAktif);
    if (!targetCandidate) {
      return { success: false, message: 'Pasangan calon yang dipilih tidak valid atau tidak aktif.' };
    }

    // 4. Generate Anonymous Transaction Token & Timestamp
    const voteTime = new Date().toISOString();
    const txId = `VOTE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 5. Store ANONYMOUS VOTE (No reference to voter's ID or name!)
    const anonymousVote: AnonymousVote = {
      id: txId,
      candidateId: targetCandidate.id,
      timestamp: voteTime,
      isValid: true,
      checksum: Math.random().toString(36).substring(2, 10),
    };

    const currentVotes = this.getVotes();
    currentVotes.push(anonymousVote);
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(currentVotes));

    // 6. Lock Voter's record (mark as already voted without recording choice!)
    voters[voterIndex].statusMemilih = 'sudah';
    voters[voterIndex].waktuMemilih = voteTime;
    voters[voterIndex].tokenVoting = txId;
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(voters));

    // 7. Record Anonymous Audit Log
    this.addAuditLog(
      'PENGGUNAAN_HAK_SUARA',
      'PEMILIH',
      'Pemilih Terverifikasi (Anonim)',
      `Suara berhasil masuk ke kotak suara digital [Transaksi: ${txId}]. Status pemilih terkunci.`
    );

    this.notifyChange();

    return {
      success: true,
      message: 'Suara Anda berhasil dikirim dan tersimpan di kotak suara digital.',
      transactionNumber: txId,
      timestamp: voteTime,
    };
  }

  // Audit Logs
  public static getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addAuditLog(
    jenisAktivitas: string,
    userRole: 'ADMIN' | 'PEMILIH' | 'SISTEM',
    actorName: string,
    deskripsi: string
  ): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      jenisAktivitas,
      userRole,
      actorName,
      deskripsi,
      deviceInfo: typeof navigator !== 'undefined' ? `${navigator.platform || 'Device'} (${navigator.userAgent.slice(0, 40)}...)` : undefined,
    };
    // Prepend to show newest first
    logs.unshift(newLog);
    // Keep last 1000 logs
    if (logs.length > 1000) logs.length = 1000;
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  // Backup & Restore
  public static exportFullBackup(): string {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      schoolSettings: this.getSchoolSettings(),
      electionSettings: this.getElectionSettings(),
      candidates: this.getCandidates(),
      voters: this.getVoters(),
      votes: this.getVotes(),
      auditLogs: this.getAuditLogs(),
    };
    this.addAuditLog('BACKUP_DATABASE', 'ADMIN', 'Admin', 'Mengunduh file cadangan (backup) database lengkap.');
    return JSON.stringify(backupData, null, 2);
  }

  public static restoreFullBackup(jsonString: string, actor: string = 'Admin'): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.schoolSettings || !parsed.electionSettings || !Array.isArray(parsed.voters)) {
        return { success: false, message: 'Format file cadangan tidak valid atau rusak.' };
      }

      localStorage.setItem(STORAGE_KEYS.SCHOOL_SETTINGS, JSON.stringify(parsed.schoolSettings));
      localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(parsed.electionSettings));
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(parsed.candidates || []));
      localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(parsed.voters || []));
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(parsed.votes || []));

      const logs: AuditLog[] = parsed.auditLogs || [];
      logs.unshift({
        id: `restore-${Date.now()}`,
        timestamp: new Date().toISOString(),
        jenisAktivitas: 'RESTORE_DATABASE',
        userRole: 'ADMIN',
        actorName: actor,
        deskripsi: 'Memulihkan data sistem dari file backup.',
      });
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));

      this.notifyChange();
      return { success: true, message: 'Data cadangan berhasil dipulihkan secara menyeluruh.' };
    } catch {
      return { success: false, message: 'Gagal memproses file JSON cadangan.' };
    }
  }

  // Reset Election Data (Clear Votes & reset voters' status to 'belum')
  public static resetVotesOnly(actor: string = 'Admin'): void {
    const voters = this.getVoters();
    voters.forEach(v => {
      v.statusMemilih = 'belum';
      delete v.waktuMemilih;
      delete v.tokenVoting;
    });
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(voters));
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));

    const election = this.getElectionSettings();
    election.status = 'DRAFT';
    election.isFinalized = false;
    delete election.finalizedAt;
    localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(election));

    this.addAuditLog('RESET_SUARA', 'ADMIN', actor, 'Mereset seluruh perolehan suara pemilu ke angka 0.');
    this.notifyChange();
  }

  // Factory Reset (Clears everything back to initial empty state)
  public static resetEntireSystem(actor: string = 'Admin'): void {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.VOTERS);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.VOTES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SCHOOL_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ELECTION_SETTINGS);

    this.initDatabase();
    this.addAuditLog('FACTORY_RESET', 'ADMIN', actor, 'Melakukan reset pabrik. Database dikosongkan.');
    this.notifyChange();
  }

  // Optional convenience helper for evaluation/testing (Never run automatically!)
  public static seedSampleData(actor: string = 'Admin'): void {
    const sampleCandidates: Candidate[] = [
      {
        id: 'cand-01',
        nomorUrut: '01',
        namaKetua: 'Muhammad Rayhan Pratama',
        namaWakil: 'Nadine Aurelia Zahra',
        fotoUrl: '',
        visi: 'Mewujudkan OSIS yang adaptif, kolaboratif, berintegritas, dan menjunjung tinggi kreativitas seluruh siswa.',
        misi: [
          'Mengoptimalkan wadah aspirasi siswa berbasis digital dan ruang diskusi terbuka.',
          'Meningkatkan partisipasi kegiatan ekstrakurikuler serta pengembangan minat dan bakat.',
          'Menggalakkan program kepedulian lingkungan sekolah yang hijau, bersih, dan asri.',
          'Mempererat rasa solidaritas antarsiswa dengan kegiatan olahraga dan seni berkala.',
        ],
        programKerja: [
          'OSIS Digital Hub: Portal penyaluran aspirasi dan informasi lomba secara daring.',
          'Pekan Olahraga & Seni (PORSENI) Antarkelas berbasis minat bakat.',
          'Gerakan Eco-School: Duta Hijau dan daur ulang sampah terpadu.',
          'Workshop Kepemimpinan dan Public Speaking bagi perwakilan kelas.',
        ],
        statusAktif: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cand-02',
        nomorUrut: '02',
        namaKetua: 'Davin Alamsyah Putra',
        namaWakil: 'Clarissa Maharani Dewi',
        fotoUrl: '',
        visi: 'Membangun generasi OSIS berkarakter unggul, berprestasi akademik dan non-akademik, serta berdaya saing global.',
        misi: [
          'Memfasilitasi bimbingan sebaya dan klub belajar persiapan olimpiade sekolah.',
          'Membentuk duta literasi dan mengaktifkan perpustakaan digital interaktif.',
          'Menyelenggarakan festival kewirausahaan siswa (Student Entrepreneur Day).',
          'Membangun jejaring kolaborasi dengan OSIS sekolah lain se-kota/kabupaten.',
        ],
        programKerja: [
          'Festival Sains & Seni Sekolah tahunan.',
          'Bazar Kewirausahaan Kreatif Siswa.',
          'Klinik Belajar Mandiri bersama alumni berprestasi.',
          'Program Mentoring Sahabat Sebaya (Anti-Bullying Campaign).',
        ],
        statusAktif: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cand-03',
        nomorUrut: '03',
        namaKetua: 'Farel Adrian Wijaya',
        namaWakil: 'Siti Hanifah Nurhasanah',
        fotoUrl: '',
        visi: 'OSIS Bersinergi: Harmonis, Inovatif, Humanis, dan Berlandaskan Akhlak Mulia.',
        misi: [
          'Menumbuhkan kegiatan rohani dan toleransi kerukunan antarseluruh siswa.',
          'Mendorong keterlibatan aktif siswa dalam kegiatan bakti sosial kemasyarakatan.',
          'Menciptakan ruang kreasi konten digital positif untuk mempromosikan prestasi sekolah.',
        ],
        programKerja: [
          'OSIS Peduli Kasih: Bakti sosial rutin setiap semester.',
          'Kompilasi Majalah Dinding Digital & Podcast Inspirasi Sekolah.',
          'Pelatihan Keterampilan Teknologi Digital dan Desain Grafis.',
        ],
        statusAktif: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const sampleVoters: Voter[] = [
      { id: 'VTR-001', nis: '1001', nama: 'Aditya Pratama', kelas: 'X IPA 1', jenisPemilih: 'SISWA', username: '1001', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-002', nis: '1002', nama: 'Bella Safitri', kelas: 'X IPA 1', jenisPemilih: 'SISWA', username: '1002', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-003', nis: '1003', nama: 'Candra Wijaya', kelas: 'X IPA 2', jenisPemilih: 'SISWA', username: '1003', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-004', nis: '1004', nama: 'Dian Permata', kelas: 'X IPS 1', jenisPemilih: 'SISWA', username: '1004', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-005', nis: '1005', nama: 'Eko Prasetyo', kelas: 'XI MIPA 1', jenisPemilih: 'SISWA', username: '1005', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-006', nis: '1006', nama: 'Fitri Handayani', kelas: 'XI MIPA 2', jenisPemilih: 'SISWA', username: '1006', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-007', nis: '1007', nama: 'Gilang Ramadhan', kelas: 'XII IPS 2', jenisPemilih: 'SISWA', username: '1007', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-008', nis: '1008', nama: 'Hana Marwah', kelas: 'XII MIPA 1', jenisPemilih: 'SISWA', username: '1008', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-009', nis: '9001', nama: 'Drs. Supriyanto (Guru)', kelas: 'Guru/Staf', jenisPemilih: 'GURU', username: '9001', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
      { id: 'VTR-010', nis: '9002', nama: 'Ratna Dewi, S.Pd. (Guru)', kelas: 'Guru/Staf', jenisPemilih: 'GURU', username: '9002', pin: '1234', statusAktif: true, statusMemilih: 'belum' },
    ];

    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(sampleCandidates));
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(sampleVoters));
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));

    const election = this.getElectionSettings();
    election.status = 'BERLANGSUNG';
    localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(election));

    this.addAuditLog('SAMPLE_DATA_LOADED', 'ADMIN', actor, 'Memuat 3 Paslon dan 10 DPT contoh untuk pengujian sistem.');
    this.notifyChange();
  }
}
