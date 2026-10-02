export type UserRole = 'ADMIN' | 'VOTER' | 'PUBLIC';

export type ElectionStatus = 'DRAFT' | 'AKAN_DIMULAI' | 'BERLANGSUNG' | 'DITUTUP' | 'SELESAI';

export type ResultPrivacy = 'SEMBUNYIKAN' | 'REALTIME' | 'SETELAH_DITUTUP';

export type VoterType = 'SISWA' | 'GURU' | 'TENAGA_PENDIDIK';

export interface Voter {
  id: string; // Unique voter ID e.g. DPT-001 or UUID
  nis: string; // NIS or NISN or NIP
  nama: string;
  kelas: string; // e.g. "X IPA 1", "VII A", "Guru/Staf"
  jenisPemilih: VoterType;
  username: string; // ID login
  pin: string; // Password or PIN
  statusAktif: boolean; // active/inactive
  statusMemilih: 'belum' | 'sudah';
  waktuMemilih?: string; // ISO string when voted
  tokenVoting?: string; // anonymous hash used during vote
}

export interface Candidate {
  id: string;
  nomorUrut: string; // e.g. "01", "02"
  namaKetua: string;
  namaWakil: string;
  fotoUrl: string; // Base64 or image URL
  visi: string;
  misi: string[]; // List of missions
  programKerja: string[]; // List of work programs
  statusAktif: boolean;
  createdAt: string;
}

export interface AnonymousVote {
  id: string; // anonymous UUID
  candidateId: string; // ID of candidate voted for
  timestamp: string;
  isValid: boolean;
  checksum?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  jenisAktivitas: string;
  userRole: 'ADMIN' | 'PEMILIH' | 'SISTEM';
  actorName: string;
  deskripsi: string;
  deviceInfo?: string;
}

export interface SchoolSettings {
  namaSekolah: string;
  logoSekolah: string; // Base64 or SVG
  alamatSekolah: string;
  tahunPelajaran: string;
  namaKegiatan: string;
  namaKetuaPanitia: string;
  namaPembinaOsis: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah?: string;
}

export interface ElectionSettings {
  status: ElectionStatus;
  jadwalMulai: string; // YYYY-MM-DDTHH:mm
  jadwalSelesai: string; // YYYY-MM-DDTHH:mm
  autoStatusByJadwal: boolean;
  privasiHasil: ResultPrivacy;
  metodeLoginPemilih: 'NIS_PIN' | 'USERNAME_PASSWORD';
  izinkanEReceipt: boolean;
  isFinalized: boolean;
  finalizedAt?: string;
}

export interface AppThemeSettings {
  darkMode: boolean;
  accentColor: string;
}

export interface EReceiptData {
  nomorTransaksi: string;
  timestamp: string;
  namaSekolah: string;
  tahunPelajaran: string;
  namaKegiatan: string;
  status: string;
}
