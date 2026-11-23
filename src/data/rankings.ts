import type { LeaderEntry } from '../types';

/** Data awal = kosong. Nanti diisi dari backend. */
export const initialLeaderboard: LeaderEntry[] = [];

/** Contoh data untuk uji tampilan: semua nama "Unknown" dan semua poin/EXP = 0. */
export const sampleLeaderboard: LeaderEntry[] = Array.from({ length: 7 }, (_, i) => ({
  id: `u${i + 1}`,
  name: 'Unknown',
  initials: '?',
  level: 0,
  totalExp: 0,
  weekExp: 0,
  monthExp: 0,
  questsDone: 0,
}));
