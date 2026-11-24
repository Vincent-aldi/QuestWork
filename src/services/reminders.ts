// Pengingat deadline tugas (notifikasi LOKAL, dijadwalkan otomatis oleh aplikasi di HP).
//
// Cara kerja:
//  - Setelah login, aplikasi meminta izin notifikasi satu kali (requestReminderPermission).
//  - Tiap kali daftar tugas berhasil dimuat, pengingat lama dihapus lalu dijadwalkan ulang
//    berdasarkan end_date tugas yang belum selesai (syncDeadlineReminders).
//  - Pengingat dikirim 1 hari dan 1 jam sebelum deadline (tugas harian: 1 jam saja).
//  - Mau dimatikan? Lewat pengaturan notifikasi di HP, seperti aplikasi pada umumnya.
//
// Batasan: ini bukan push dari server. Notifikasi "tugas baru / di-approve / revisi" saat aplikasi
// tertutup butuh backend (FCM / Expo Push) dan tidak ditangani di sini.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Task } from '../types';

const CHANNEL_ID = 'deadline';
const ID_PREFIX = 'deadline:';
const MAX_SCHEDULED = 60; // iOS membatasi 64 notifikasi terjadwal per aplikasi

const HOUR = 60 * 60 * 1000;
const LEADS = [
  { key: '1d', ms: 24 * HOUR, skipDaily: true },
  { key: '1h', ms: HOUR, skipDaily: false },
] as const;

const SUPPORTED = Platform.OS === 'android' || Platform.OS === 'ios';

/** Panggil sekali saat aplikasi mulai (di luar komponen). */
export function initNotifications(): void {
  if (!SUPPORTED) return;
  // Saat aplikasi sedang dibuka, notifikasi tetap tampil sebagai banner.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Pengingat Deadline',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {});
  }
}

// Semua operasi dijalankan berurutan supaya jadwal tidak dobel saat sync terpanggil beruntun.
let chain: Promise<unknown> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn);
  chain = run.catch(() => {});
  return run;
}

const hasPermission = async (): Promise<boolean> =>
  (await Notifications.getPermissionsAsync()).status === 'granted';

async function cancelOurs(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export type ReminderPermission = 'granted' | 'denied' | 'undetermined';

/** Status izin notifikasi aplikasi di HP. */
export async function getReminderPermission(): Promise<ReminderPermission> {
  if (!SUPPORTED) return 'denied';
  try {
    const p = await Notifications.getPermissionsAsync();
    if (p.status === 'granted') return 'granted';
    return p.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'denied';
  }
}

/**
 * Minta izin notifikasi bila belum pernah diminta (dialog sistem muncul sekali).
 * Bila sudah ditolak permanen, tidak ada dialog; pengguna harus ke pengaturan HP.
 */
export async function requestReminderPermission(): Promise<ReminderPermission> {
  if (!SUPPORTED) return 'denied';
  try {
    const current = await getReminderPermission();
    if (current === 'undetermined') await Notifications.requestPermissionsAsync();
  } catch {
    // diabaikan: status dibaca ulang di bawah
  }
  return getReminderPermission();
}

const p2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;

/** Tugas yang masih perlu diingatkan: belum selesai/diserahkan, punya deadline. */
const needsReminder = (t: Task): boolean =>
  t.status === 'active' &&
  !t.pendingReview &&
  t.deadlineOrder > 0 &&
  !['approved', 'submitted', 'cancelled', 'overdue'].includes(t.rawStatus ?? '');

/**
 * Hapus pengingat lama lalu jadwalkan ulang dari daftar tugas terbaru.
 * Tidak menjadwalkan apa pun bila izin notifikasi belum diberikan.
 * Mengembalikan jumlah notifikasi yang dijadwalkan.
 */
export function syncDeadlineReminders(tasks: Task[]): Promise<number> {
  if (!SUPPORTED) return Promise.resolve(0);
  return enqueue(async () => {
    await cancelOurs();
    if (!(await hasPermission())) return 0;

    const now = Date.now();
    const plan: { id: string; at: number; task: Task; lead: (typeof LEADS)[number] }[] = [];
    for (const task of tasks.filter(needsReminder)) {
      for (const lead of LEADS) {
        if (lead.skipDaily && task.variant === 'daily') continue;
        const at = task.deadlineOrder - lead.ms;
        if (at <= now + 5000) continue; // sudah lewat
        plan.push({ id: `${ID_PREFIX}${task.id}:${lead.key}`, at, task, lead });
      }
    }
    plan.sort((a, b) => a.at - b.at);

    let count = 0;
    for (const { id, at, task, lead } of plan.slice(0, MAX_SCHEDULED)) {
      const due = hhmm(new Date(task.deadlineOrder));
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: lead.key === '1d' ? 'Deadline besok ⏰' : '1 jam lagi, Petualang! ⏳',
            body:
              lead.key === '1d'
                ? `"${task.title}" berakhir besok pukul ${due}. Yuk selesaikan misinya!`
                : `"${task.title}" segera berakhir pukul ${due}. Serahkan sekarang!`,
            data: { taskId: task.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(at),
            ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
          },
        });
        count++;
      } catch {
        // satu notifikasi gagal dijadwalkan tidak boleh menggagalkan yang lain
      }
    }
    return count;
  });
}

/** Hapus semua pengingat (dipanggil saat logout supaya tugas user lama tidak muncul di akun lain). */
export function cancelReminders(): Promise<void> {
  if (!SUPPORTED) return Promise.resolve();
  return enqueue(cancelOurs).catch(() => {});
}
