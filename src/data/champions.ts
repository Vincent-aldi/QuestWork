import type { Champion } from '../types';

/** Data awal = kosong. Nanti diisi dari backend (urut dari yang terbaru). */
export const initialChampions: Champion[] = [];

/** Contoh data untuk uji tampilan (semua nama "Unknown", EXP 0): ganti initialChampions di DashboardScreen dengan sampleChampions. */
export const sampleChampions: Champion[] = [
  { id: 's3', kind: 'season', periodLabel: 'Musim 3 • Q3 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 's2', kind: 'season', periodLabel: 'Musim 2 • Q2 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 's1', kind: 'season', periodLabel: 'Musim 1 • Q1 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 'm10', kind: 'month', periodLabel: 'Oktober 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 'm9', kind: 'month', periodLabel: 'September 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 'm8', kind: 'month', periodLabel: 'Agustus 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 'w45', kind: 'week', periodLabel: 'Minggu 45 • 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 'w44', kind: 'week', periodLabel: 'Minggu 44 • 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 'w43', kind: 'week', periodLabel: 'Minggu 43 • 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
  { id: 'w42', kind: 'week', periodLabel: 'Minggu 42 • 2026', name: 'Unknown', initials: '?', level: 0, exp: 0, runnersUp: ['Unknown', 'Unknown'] },
];
