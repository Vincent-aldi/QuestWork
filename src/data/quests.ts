import type { Player, Task } from '../types';

export const EXP_PER_LEVEL = 2000;

export const LEVEL_TITLES: Record<number, string> = {
  14: 'Task Master',
  15: 'Architect',
  16: 'Grandmaster',
};

// Data awal = 0. Nanti diisi dari backend.
export const initialPlayer: Player = {
  name: 'Petualang',
  role: '',
  initials: 'P',
  level: 0,
  exp: 0,
  points: 0,
  streak: 0,
  weekExp: 0,
  monthExp: 0,
};

/** Daftar tugas dari backend. Kosong dulu. */
export const initialTasks: Task[] = [
  {
    id: 'demo-1',
    variant: 'daily',
    category: 'harian',
    tag: 'Misi Harian',
    meta: 'Hari ini',
    code: 'JIR-001 • Daily Log',
    title: 'Submit Daily Standup Jira Log',
    points: 50,
    status: 'active',
    deadlineOrder: 1,
    detail: {
      description:
        'Tulis pekerjaan kemarin, rencana hari ini, dan kendala (jika ada) di thread standup Jira sebelum pukul 10.00.',
      priority: 'Prioritas Rutin',
      rewardName: 'Poin Harian',
      creator: { name: 'Admin QuestWork', role: 'Pemberi Tugas' },
      checklist: [
        'Isi pekerjaan yang selesai kemarin',
        'Isi rencana pekerjaan hari ini',
        'Tulis kendala, atau "tidak ada"',
      ],
    },
  },
  {
    id: 'mingguan-1',
    variant: 'weekly',
    category: 'mingguan',
    tag: 'Task Mingguan',
    meta: 'Hari ini 17:00',
    code: 'PR-204 • Design System',
    title: 'Task Mingguan: Design System\nFlow Checkout v2.4',
    points: 150,
    exp: 200,
    status: 'active',
    deadlineOrder: 0,
    detail: {
      description:
        'Lakukan pemeriksaan komprehensif pada checkout modal rev 2.4. Pastikan seluruh warna dan token elevasi sesuai Figma Tokens JSON versi terkini, serta mikro-teks instruksional mudah dibaca.',
      priority: 'Prioritas Tinggi',
      rewardName: 'Peti Hadiah Emas',
      creator: { name: 'Admin QuestWork', role: 'Pemberi Tugas' },
      checklist: [
        'Periksa konsistensi komponen button & token warna dark mode',
        'Validasi state error & micro-copy bahasa Indonesia',
        'Lampirkan tautan Figma review di catatan',
      ],
    },
  },
];

/** Contoh data untuk uji tampilan: ganti initialTasks di DashboardScreen dengan sampleTasks. */
export const sampleTasks: Task[] = [
  {
    id: 'pr-204',
    variant: 'weekly',
    category: 'mingguan',
    tag: 'Task Mingguan',
    meta: 'Hari ini 17:00',
    code: 'PR-204 • Design System',
    title: 'Task Mingguan: Design System\nFlow Checkout v2.4',
    points: 150,
    exp: 200,
    status: 'active',
    deadlineOrder: 1,
    detail: {
      description:
        'Lakukan pemeriksaan komprehensif pada checkout modal rev 2.4. Pastikan kepatuhan seluruh warna dan token elevasi terhadap Figma Tokens JSON versi terkini serta pastikan keterbacaan mikro-teks instruksional.',
      priority: 'Prioritas Tinggi',
      rewardName: 'Peti Hadiah Emas',
      creator: { name: 'Pak Arya Nugraha', role: 'Lead UI/UX Designer (Pemberi Tugas)' },
      checklist: [
        'Periksa konsistensi komponen button & token warna dark mode',
        'Validasi state error & micro-copy bahasa Indonesia',
        'Lampirkan tautan Figma review di catatan',
      ],
    },
  },
  {
    id: 'mth-11',
    variant: 'monthly',
    category: 'bulanan',
    tag: 'Task Bulanan',
    meta: '30 Nov 17:00',
    code: 'MTH-11 • Laporan Bulanan',
    title: 'Susun Laporan Kinerja Bulanan\nTim Product & Design',
    points: 300,
    exp: 400,
    progress: { done: 1, total: 4 },
    status: 'active',
    deadlineOrder: 1.5,
    detail: {
      description: 'Rangkum capaian, kendala, dan rencana bulan depan untuk tim Product & Design.',
      priority: 'Prioritas Bulanan',
      rewardName: 'Peti Hadiah Bulanan',
      creator: { name: 'Admin QuestWork', role: 'Pemberi Tugas' },
      checklist: ['Kumpulkan metrik capaian bulan ini', 'Tulis kendala & pembelajaran utama', 'Lampirkan tautan laporan di catatan'],
    },
  },
  {
    id: 'fig-88',
    variant: 'daily',
    category: 'harian',
    tag: 'Misi Harian',
    meta: 'Reset dalam 7 jam',
    code: 'FIG-88 • Team Review',
    title: 'Review & Beri Feedback 3 PR Figma\nRekan Tim',
    points: 50,
    progress: { done: 2, total: 3 },
    status: 'active',
    deadlineOrder: 2,
  },
  {
    id: 'ps-05',
    variant: 'personal',
    category: 'personal',
    tag: 'Task Personal',
    meta: 'Target Minggu Ini',
    code: 'PS-05 • Personal',
    title: 'Membaca Buku Pengembangan\nDiri 20 Menit Setiap Hari',
    points: 70,
    progress: { done: 1, total: 3 },
    status: 'active',
    deadlineOrder: 3,
  },
  {
    id: 'jir-112',
    variant: 'daily',
    category: 'harian',
    tag: 'Misi Harian',
    meta: '09:15 WIB',
    code: 'JIR-112 • Daily Log',
    title: 'Submit Daily Standup Jira Log',
    points: 30,
    status: 'claimed',
    claimedAt: '09:15 WIB',
    deadlineOrder: 4,
  },
  {
    id: 'kpi-04',
    variant: 'learning',
    category: 'personal',
    tag: 'Pengembangan Diri',
    meta: 'Target Kuartal 3',
    code: 'KPI-04 • Self Mastery',
    title: 'Menyelesaikan Modul Kursus UX\nResearch Micro-learning',
    points: 100,
    progress: { done: 3, total: 6 },
    status: 'active',
    deadlineOrder: 5,
  },
];
