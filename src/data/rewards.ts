import type { Reward } from '../types';

/** Data awal = kosong. Nanti diisi dari backend. */
export const initialRewards: Reward[] = [];

/** Contoh data untuk uji tampilan: ganti initialRewards di DashboardScreen dengan sampleRewards. */
export const sampleRewards: Reward[] = [
  { id: 'rw-coffee', title: 'Voucher Kopi', desc: 'Satu gelas kopi di kantin kantor.', cost: 300, icon: 'coffee', tone: 'gold' },
  { id: 'rw-wfh', title: 'Jatah WFH 1 Hari', desc: 'Bekerja dari mana saja, sekali pakai.', cost: 1200, icon: 'home-city', tone: 'primary' },
  { id: 'rw-book', title: 'Voucher Buku', desc: 'Belanja buku pengembangan diri Rp100.000.', cost: 800, icon: 'book-open-page-variant', tone: 'green' },
  { id: 'rw-course', title: 'Kelas Online', desc: 'Akses satu kursus pilihan selama 30 hari.', cost: 2000, icon: 'school', tone: 'primary' },
  { id: 'rw-merch', title: 'Merchandise QuestWork', desc: 'Kaos eksklusif edisi petualang.', cost: 1500, icon: 'tshirt-crew', tone: 'gold' },
];
