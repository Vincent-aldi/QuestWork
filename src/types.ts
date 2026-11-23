export type Category = 'mingguan' | 'bulanan' | 'harian' | 'personal';
export type TaskVariant = 'weekly' | 'monthly' | 'daily' | 'personal' | 'learning';
export type SortKey = 'deadline' | 'poin';
export type Period = 'week' | 'month' | 'all';

export interface TaskDetail {
  description?: string; // deskripsi & panduan kerja
  priority?: string; // mis. "Prioritas Tinggi"
  rewardName?: string; // mis. "Peti Hadiah Emas"
  creator?: { name: string; role: string }; // pemberi tugas
  checklist?: string[]; // kriteria verifikasi
  items?: { id: string; text: string; done: boolean }[]; // checklist lengkap dari backend (id + status centang)
}

export interface Task {
  id: string;
  variant: TaskVariant;
  category: Category;
  tag: string;
  meta: string; // teks kanan atas kartu (deadline / reset / target)
  code: string;
  title: string;
  points: number;
  exp?: number; // default = points
  progress?: { done: number; total: number };
  status: 'active' | 'claimed';
  claimedAt?: string;
  deadlineOrder: number;
  detail?: TaskDetail; // dipakai layar Detail Tugas
  note?: string; // catatan / tautan bukti dari pengguna saat menyerahkan
  pendingReview?: boolean; // sudah diserahkan, menunggu review atasan (poin belum cair)
  requiresReview?: boolean; // tugas ini butuh persetujuan atasan
  revisionNote?: string; // catatan atasan bila tugas dikembalikan untuk direvisi
  rawStatus?: string; // status asli di backend: pending, in_progress, submitted, approved, revised, ...
}

export interface Player {
  name: string;
  role: string;
  initials: string;
  photoUri?: string; // foto profil (URI lokal; nanti diganti URL dari backend)
  level: number;
  exp: number;
  points: number;
  streak: number;
  weekExp: number; // EXP yang dikumpulkan minggu ini
  monthExp: number; // EXP yang dikumpulkan bulan ini
}

export interface LeaderEntry {
  id: string;
  name: string;
  initials: string;
  photoUri?: string;
  level: number;
  totalExp: number; // all-time
  weekExp?: number; // minggu ini (default 0)
  monthExp?: number; // bulan ini (default 0)
  role?: string; // jabatan, tampil di podium
  trend?: 'up' | 'down'; // naik/turun dibanding periode sebelumnya
  badge?: string; // label kecil di samping nama, mis. "Win Streak", "Bug Hunter"
  questsDone?: number; // jumlah quest selesai, tampil di baris Penantang Tangguh
  isMe?: boolean;
}

export interface Reward {
  id: string;
  title: string;
  desc: string;
  cost: number;
  icon: string; // nama ikon MaterialCommunityIcons
  tone: 'primary' | 'gold' | 'green';
}

export type ChampionKind = 'week' | 'month' | 'season';

/** Satu catatan juara di Hall of Champion (urut dari yang terbaru). */
export interface Champion {
  id: string;
  kind: ChampionKind;
  periodLabel: string; // mis. "Minggu 46 • 2026", "Oktober 2026", "Musim 3"
  name: string;
  initials: string;
  level: number;
  exp: number; // EXP yang membawanya juara pada periode itu
  runnersUp?: string[]; // nama juara 2 & 3
  isMe?: boolean;
}

export type Tone = 'primary' | 'gold' | 'green';

/** Lencana kehormatan di halaman Profil. */
export interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string; // nama ikon MaterialCommunityIcons
  tone: Tone;
  label: string; // label tier, mis. "EMAS"
  unlocked: boolean;
  pointsTarget?: number; // jika diisi: progres dihitung dari poin pemain
}

/** Data profil tambahan yang nanti datang dari backend. */
export interface ProfileExtras {
  guild: string; // mis. "Product & Design Guild" ('' = disembunyikan)
  season: number; // musim aktif
  league: string; // mis. "Liga Master Divisi"
  seasonRank: number | null; // peringkat musim ini
  bestRank: number | null; // peringkat tertinggi sepanjang masa
  bestRankSeason: number | null; // musim saat peringkat tertinggi diraih
  onTimeRate: number | null; // % tugas selesai tepat waktu
  onTimeTier: string; // mis. "Top 1%" ('' = disembunyikan)
  badges: Badge[];
}
