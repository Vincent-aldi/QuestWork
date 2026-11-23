// Data awal = 0 / kosong. Nanti diisi dari backend.
export interface LoginStats {
  xpBoost: number; // pengali XP. 0 = belum ada booster (badge disembunyikan)
  userCount: number; // "Jumlah pengguna"
  avatars: { initials: string }[]; // avatar pengguna yang ditampilkan (boleh kosong)
}

export const loginStats: LoginStats = {
  xpBoost: 0,
  userCount: 0,
  avatars: [],
};
