// Daftar notifikasi dalam aplikasi ("kotak masuk"), dibangun dari data tugas yang sudah dimuat.
// Fungsinya sebagai tempat mengecek ulang bila pop-up notifikasi di HP tidak sengaja terhapus.
// Tidak ada riwayat dari server: isinya selalu mengikuti kondisi tugas saat ini.
import type { Task } from '../types';

export type FeedTone = 'danger' | 'gold' | 'primary' | 'green';

export interface FeedItem {
  id: string;
  taskId: string;
  icon: 'alert-circle-outline' | 'pencil-outline' | 'clock-alert-outline' | 'calendar-clock-outline' | 'timer-sand' | 'check-circle-outline';
  tone: FeedTone;
  title: string;
  body: string;
  time: string; // teks waktu relatif, mis. "2 jam lagi"
  tappable: boolean; // bisa dibuka ke detail tugas
}

export interface Feed {
  action: FeedItem[]; // perlu tindakan: revisi & lewat tenggat
  upcoming: FeedItem[]; // deadline mendatang
  updates: FeedItem[]; // menunggu review & disetujui
  attentionCount: number; // dipakai untuk lencana di menu Profil
}

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const p2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (ms: number) => {
  const d = new Date(ms);
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

function untilLabel(end: number, now: number): string {
  const mins = Math.floor((end - now) / MIN);
  if (mins < 60) return `${Math.max(1, mins)} menit lagi`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lagi`;
  const days = Math.floor(hours / 24);
  return days === 1 ? `Besok ${hhmm(end)}` : `${days} hari lagi`;
}

function agoLabel(end: number, now: number): string {
  const mins = Math.floor((now - end) / MIN);
  if (mins < 60) return `${Math.max(1, mins)} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export function buildFeed(tasks: Task[], now: number = Date.now()): Feed {
  const action: FeedItem[] = [];
  const upcoming: { at: number; item: FeedItem }[] = [];
  const updates: FeedItem[] = [];

  for (const t of tasks) {
    const open = t.status === 'active' && !t.pendingReview;

    if (open && t.rawStatus === 'revised') {
      action.push({
        id: `rev:${t.id}`,
        taskId: t.id,
        icon: 'pencil-outline',
        tone: 'gold',
        title: 'Tugas perlu direvisi',
        body: t.revisionNote ? `${t.title} — ${t.revisionNote}` : t.title,
        time: t.deadlineOrder > now ? untilLabel(t.deadlineOrder, now) : '',
        tappable: true,
      });
    } else if (open && t.deadlineOrder > 0 && (t.deadlineOrder < now || t.rawStatus === 'overdue')) {
      action.push({
        id: `late:${t.id}`,
        taskId: t.id,
        icon: 'alert-circle-outline',
        tone: 'danger',
        title: 'Lewat tenggat',
        body: t.title,
        time: t.deadlineOrder > 0 ? agoLabel(t.deadlineOrder, now) : '',
        tappable: true,
      });
    } else if (open && t.deadlineOrder > now && t.rawStatus !== 'cancelled') {
      const urgent = t.deadlineOrder - now <= DAY;
      upcoming.push({
        at: t.deadlineOrder,
        item: {
          id: `due:${t.id}`,
          taskId: t.id,
          icon: urgent ? 'clock-alert-outline' : 'calendar-clock-outline',
          tone: urgent ? 'gold' : 'primary',
          title: urgent ? 'Segera berakhir' : 'Deadline mendatang',
          body: t.title,
          time: untilLabel(t.deadlineOrder, now),
          tappable: true,
        },
      });
    } else if (t.pendingReview) {
      updates.push({
        id: `rev-wait:${t.id}`,
        taskId: t.id,
        icon: 'timer-sand',
        tone: 'primary',
        title: 'Menunggu review atasan',
        body: t.title,
        time: '',
        tappable: false,
      });
    } else if (t.status === 'claimed') {
      updates.push({
        id: `ok:${t.id}`,
        taskId: t.id,
        icon: 'check-circle-outline',
        tone: 'green',
        title: 'Misi disetujui',
        body: t.title,
        time: t.claimedAt ?? '',
        tappable: false,
      });
    }
  }

  upcoming.sort((a, b) => a.at - b.at);
  const upcomingItems = upcoming.slice(0, 15).map((u) => u.item);
  const urgentCount = upcoming.filter((u) => u.at - now <= DAY).length;

  return {
    action,
    upcoming: upcomingItems,
    updates: updates.slice(0, 5),
    attentionCount: action.length + urgentCount,
  };
}
