import type { ProfileExtras } from '../types';

/** Data awal = kosong / 0. Nanti diisi dari backend. */
export const initialProfileExtras: ProfileExtras = {
  guild: '',
  season: 1,
  league: 'Belum ada liga',
  seasonRank: null,
  bestRank: null,
  bestRankSeason: null,
  onTimeRate: null,
  onTimeTier: '',
  badges: [
    {
      id: 'b-sprint',
      title: 'Sprint Master',
      desc: 'Selesaikan 10 bounty sebelum deadline',
      icon: 'flash',
      tone: 'gold',
      label: 'EMAS TERBUKA',
      unlocked: false,
    },
    {
      id: 'b-bug',
      title: 'Bug Hunter Hero',
      desc: 'Review 50 PR tanpa revisi mayor',
      icon: 'bug-outline',
      tone: 'primary',
      label: 'MISTIK UNGU',
      unlocked: false,
    },
    {
      id: 'b-owl',
      title: 'Night Owl Achiever',
      desc: 'Submit tugas prioritas tepat casaran',
      icon: 'weather-night',
      tone: 'green',
      label: 'NEON TOSKA',
      unlocked: false,
    },
    {
      id: 'b-legend',
      title: 'Grand Guild Legend',
      desc: 'Raih 5.000 total poin kantor',
      icon: 'trophy-outline',
      tone: 'gold',
      label: 'LEGENDA',
      unlocked: false,
      pointsTarget: 5000,
    },
  ],
};
