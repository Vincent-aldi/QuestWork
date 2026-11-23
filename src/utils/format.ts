const group = (n: number, sep: string) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);

/** 1850 -> "1.850" (format Indonesia) */
export const fmtId = (n: number) => group(n, '.');
/** 2450 -> "2,450" (seperti di header desain) */
export const fmtEn = (n: number) => group(n, ',');
export const pad2 = (n: number) => String(n).padStart(2, '0');

/** "Citra Pratama" -> "CP", "Andi" -> "A", "" -> "P" (maks. 2 huruf) */
export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  const letters = parts.length === 1 ? parts[0].slice(0, 1) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
};

/** "Citra Lestari" -> "Citra L." */
export const shortName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length < 2 ? parts[0] ?? '' : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

/** Sisa waktu sampai akhir periode: "2h 14j" (hari/jam) atau "5j 30m" (jam/menit). null untuk all-time. */
export const timeLeftLabel = (period: 'week' | 'month' | 'all', now = new Date()): string | null => {
  if (period === 'all') return null;
  const end =
    period === 'week'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((8 - (now.getDay() || 7)) % 7 || 7))
      : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const mins = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  return d > 0 ? `${d}h ${h}j` : `${h}j ${mins % 60}m`;
};
