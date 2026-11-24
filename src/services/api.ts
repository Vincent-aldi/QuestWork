// Klien HTTP untuk backend HRIS (dipakai QuestWork).
// Satu pintu untuk semua request: menambah token, batas waktu, dan mengubah semua
// kegagalan menjadi ApiError.
//
// Endpoint yang dipakai:
//   POST /login            {email, password, device_type:'mobile'}
//   Semua request membawa header X-Client-Type: mobile, X-Platform, X-App-Version, User-Agent.
//   GET  /get-my-tasks                          (tugas milik saya)  atau
//   GET  /get-team-tasks?scope=all|owner        (tugas tim, lihat TASK_SOURCE di config.ts)
//   GET  /get-task-performance-report           (leaderboard, lihat LEADERBOARD_API_URL)
//   POST /toggle-task-item {id_task_item}       (centang satu langkah checklist)
//   POST /start-task       {id_task}
//   POST /submit-task      {id_task, submission_notes, attachment_url}
//   POST /logout           {fcm_token}
import { Platform } from 'react-native';
import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  APP_NAME,
  APP_VERSION,
  CLIENT_TYPE,
  LEADERBOARD_API_URL,
  TASKS_API_URL,
} from '../config';
import { EXP_PER_LEVEL } from '../data/quests';
import type { LeaderEntry, Player, Task } from '../types';

// ---------- Error ----------

export class ApiError extends Error {
  status: number; // 0 = tidak sampai ke server (jaringan/timeout)

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ---------- Token (di memori; hilang saat aplikasi ditutup) ----------
// Agar tetap login setelah aplikasi ditutup: simpan token dengan expo-secure-store
// (npx expo install expo-secure-store), lalu panggil setAuthToken() saat aplikasi dibuka.

let authToken: string | null = null;
export const setAuthToken = (t: string | null) => {
  authToken = t;
};
export const getAuthToken = () => authToken;
export const clearAuthToken = () => {
  authToken = null;
};

// id_employee user yang login, dipakai menandai baris "saya" di leaderboard.
let myEmployeeId: string | null = null;
export const setMyEmployeeId = (id: string | null) => {
  myEmployeeId = id;
};

// Token notifikasi push (FCM). Isi dengan setFcmToken() saat push notification sudah dipasang.
// Dikirim ke server saat logout.
let fcmToken: string | null = null;
export const setFcmToken = (t: string | null) => {
  fcmToken = t;
};

// Dipanggil sekali bila server menjawab 401 saat sudah login (token habis / tidak valid).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

// ---------- Bentuk data dari backend HRIS ----------

export interface LoginData {
  id_user: string;
  email: string;
  id_company: string | null;
  system_role: string;
  role_name: string | null;
  employee_name: string | null;
  id_employee: string | null;
  must_change_password: boolean;
  access_token: string;
  expired_date: string;
}

export interface HrisTaskItem {
  id_task_item: string;
  item_text: string;
  is_completed: number | string | boolean; // 0/1 (bisa string tergantung konfigurasi PDO)
}

export interface HrisTask {
  id_task: string;
  title: string;
  description: string | null;
  task_type: 'daily' | 'weekly' | 'monthly' | string;
  start_date: string; // "YYYY-MM-DD HH:MM:SS" (waktu server, WIB)
  end_date: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revised' | 'overdue' | 'cancelled' | string;
  submission_notes?: string | null;
  attachment_url?: string | null;
  revision_notes?: string | null;
  approved_at?: string | null;
  assigner_name?: string | null;
  items?: HrisTaskItem[];
}

// ---------- Pengubah bentuk: backend -> tipe frontend (src/types.ts) ----------

/** Profil awal dari respons login. HRIS belum menyimpan level/EXP/poin, jadi dimulai dari 0. */
export function playerFromLogin(d: LoginData): Player {
  const name = (d.employee_name ?? '').trim() || d.email.split('@')[0] || 'Petualang';
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = parts.length <= 1 ? (parts[0] ?? 'P').slice(0, 1) : parts[0][0] + parts[parts.length - 1][0];
  return {
    name,
    role: d.role_name ?? '',
    initials: letters.toUpperCase(),
    level: 0,
    exp: 0,
    points: 0,
    streak: 0,
    weekExp: 0,
    monthExp: 0,
  };
}

/** "2026-11-20 17:00:00" -> Date (zona waktu perangkat; server & perangkat diasumsikan sama-sama WIB). */
const parseDbDate = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(s);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] ? +m[6] : 0);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const p2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Teks kanan-atas kartu tugas. Dibuat publik agar mudah diuji. */
export function metaLabel(t: HrisTask, now: Date = new Date()): string {
  if (t.status === 'approved') {
    const at = parseDbDate(t.approved_at);
    return at ? `${hhmm(at)} WIB` : 'Selesai';
  }
  if (t.status === 'submitted') return 'Menunggu review';

  const end = parseDbDate(t.end_date);
  if (!end) return '';
  if (end.getTime() < now.getTime()) return 'Lewat tenggat';

  if (t.task_type === 'daily') {
    const mins = Math.floor((end.getTime() - now.getTime()) / 60000);
    return mins >= 60 ? `Reset dalam ${Math.ceil(mins / 60)} jam` : `Reset dalam ${Math.max(1, mins)} menit`;
  }
  const days = Math.round((dayStart(end) - dayStart(now)) / 86400000);
  if (days === 0) return `Hari ini ${hhmm(end)}`;
  if (days === 1) return `Besok ${hhmm(end)}`;
  return `${end.getDate()} ${MONTHS[end.getMonth()]} ${hhmm(end)}`;
}

export function toTask(t: HrisTask, now: Date = new Date()): Task {
  const claimed = t.status === 'approved';
  const submitted = t.status === 'submitted';
  const daily = t.task_type === 'daily';
  const monthly = t.task_type === 'monthly';
  const items = (t.items ?? []).map((i) => ({
    id: i.id_task_item,
    text: i.item_text,
    done: Number(i.is_completed) === 1,
  }));
  const doneCount = items.filter((i) => i.done).length;
  const end = parseDbDate(t.end_date);
  const approvedAt = parseDbDate(t.approved_at);

  return {
    id: t.id_task,
    variant: daily ? 'daily' : monthly ? 'monthly' : 'weekly',
    category: daily ? 'harian' : monthly ? 'bulanan' : 'mingguan',
    tag: daily ? 'Misi Harian' : monthly ? 'Task Bulanan' : 'Task Mingguan',
    meta: metaLabel(t, now),
    code: `TSK-${t.id_task.replace(/-/g, '').slice(0, 4).toUpperCase()}`,
    title: t.title,
    // HRIS belum punya poin/EXP per tugas.
    points: 0,
    exp: 0,
    // tugas yang sudah diserahkan/disetujui dianggap penuh (item tidak wajib dicentang di server)
    progress: items.length > 0 ? { done: claimed || submitted ? items.length : doneCount, total: items.length } : undefined,
    // "menunggu review" tetap 'active' di UI, tapi ditandai pendingReview
    status: claimed ? 'claimed' : 'active',
    pendingReview: submitted,
    rawStatus: t.status,
    claimedAt: claimed ? (approvedAt ? `${hhmm(approvedAt)} WIB` : undefined) : undefined,
    deadlineOrder: end ? end.getTime() : 0,
    note: t.submission_notes || undefined,
    attachmentUrl: t.attachment_url || undefined,
    revisionNote: t.status === 'revised' ? t.revision_notes || undefined : undefined,
    detail: {
      description: t.description || undefined,
      creator: t.assigner_name ? { name: t.assigner_name, role: 'Pemberi Tugas' } : undefined,
      checklist: items.map((i) => i.text),
      items,
    },
  };
}


// ---------- Leaderboard: laporan performa task -> LeaderEntry ----------
// Bentuk respons endpoint ini fleksibel: bisa array langsung, atau objek yang membungkus array
// (data / employees / report / leaderboard / rows / ranking). Nama field dicari dari beberapa kandidat.

const pickNum = (o: any, keys: string[]): number | undefined => {
  for (const k of keys) {
    const v = o?.[k];
    if (v === null || v === undefined || v === '') continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
};
const pickStr = (o: any, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = o?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
};

const findRows = (d: any): any[] => {
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object') {
    for (const k of ['data', 'employees', 'report', 'leaderboard', 'ranking', 'rows', 'items', 'performance']) {
      const r = findRows(d[k]);
      if (r.length) return r;
    }
  }
  return [];
};

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  const l = parts.length <= 1 ? (parts[0] ?? '?').slice(0, 1) : parts[0][0] + parts[parts.length - 1][0];
  return l.toUpperCase();
};

export function toLeaderEntries(raw: unknown): LeaderEntry[] {
  return findRows(raw).map((r, i) => {
    const name = pickStr(r, ['employee_name', 'name', 'full_name', 'nama']) ?? 'Karyawan';
    const id = String(r.id_employee ?? r.id_user ?? r.id ?? `row-${i}`);
    const done = pickNum(r, ['approved_tasks', 'approved_count', 'completed_tasks', 'completed_count', 'total_approved', 'total_completed', 'tasks_completed']);
    // Poin/EXP: pakai field skor bila ada; kalau tidak ada, 100 per tugas yang selesai.
    const total =
      pickNum(r, ['total_exp', 'exp', 'total_points', 'points', 'score', 'performance_score']) ?? (done ?? 0) * 100;
    const week = pickNum(r, ['week_exp', 'weekly_exp', 'week_points', 'weekly_points', 'week_score']);
    const month = pickNum(r, ['month_exp', 'monthly_exp', 'month_points', 'monthly_points', 'month_score']);
    return {
      id,
      name,
      initials: initialsOf(name),
      level: Math.floor(total / EXP_PER_LEVEL),
      totalExp: total,
      // bila server tidak membedakan periode, semua tab memakai angka yang sama
      weekExp: week ?? total,
      monthExp: month ?? total,
      role: pickStr(r, ['role_name', 'position', 'job_title', 'jabatan']),
      questsDone: done,
      isMe: myEmployeeId !== null && id === myEmployeeId,
    };
  });
}

// ---------- Identitas perangkat (agar server tahu ini aplikasi mobile) ----------

const OS_VERSION = String(Platform.Version ?? '');

/** Header yang ikut di SEMUA request. */
const clientHeaders: Record<string, string> = {
  'X-Client-Type': CLIENT_TYPE, // 'mobile'
  'X-Platform': Platform.OS, // 'android' | 'ios'
  'X-App-Name': APP_NAME,
  'X-App-Version': APP_VERSION,
  // Diawali "Mozilla/5.0" supaya tidak ditolak proteksi hosting (InfinityFree memutus klien tanpa UA browser);
  // identitas aplikasi tetap terbaca di bagian belakang.
  'User-Agent': `Mozilla/5.0 (Linux; ${Platform.OS} ${OS_VERSION}) ${APP_NAME}/${APP_VERSION} (${CLIENT_TYPE})`,
};

// ---------- Request dasar ----------

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const url = /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...clientHeaders,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e: any) {
    throw new ApiError(
      0,
      e?.name === 'AbortError'
        ? 'Server tidak merespons. Cek koneksi/WiFi kamu.'
        : 'Tidak bisa terhubung ke server. Cek koneksi internet / alamat server.',
    );
  } finally {
    clearTimeout(timer);
  }

  const status = res.status;
  let json: any = null;
  let rawText = '';
  try {
    rawText = await res.text();
    json = JSON.parse(rawText);
  } catch {
    // respons bukan JSON
  }

  if (__DEV__ && (status < 200 || status >= 300)) {
    console.warn(`[api] ${method} ${url} -> ${status}`, rawText.slice(0, 300));
  }

  // Status 200 tapi isinya bukan JSON = server membalas halaman HTML (mis. halaman proteksi hosting,
  // halaman error PHP, atau URL salah), bukan balasan dari API HRIS.
  if (status >= 200 && status < 300 && json === null) {
    if (__DEV__) console.warn(`[api] ${method} ${url} -> ${status}, bukan JSON:`, rawText.slice(0, 200));
    throw new ApiError(
      status,
      'Server membalas halaman HTML, bukan data API. Cek alamat server, atau hosting memblokir akses aplikasi.',
    );
  }

  if (status < 200 || status >= 300 || json?.status !== 'success') {
    if (status === 401 && authToken) onUnauthorized?.();
    throw new ApiError(
      status,
      typeof json?.message === 'string' ? json.message : `Server membalas error (${status}).`,
    );
  }
  return json.data as T;
}

// ---------- Endpoint ----------

export const api = {
  login: (email: string, password: string) =>
    request<LoginData>('POST', '/login', { email, password, device_type: CLIENT_TYPE }), // device_type = 'mobile'

  /** Cabut token di server. fcm_token dikirim bila sudah ada. */
  logout: () => request<unknown>('POST', '/logout', { fcm_token: fcmToken ?? '' }),

  /** Tugas milik karyawan yang login. */
  myTasks: () => request<HrisTask[]>('GET', TASKS_API_URL),

  /** Laporan performa task (leaderboard), sudah diubah ke LeaderEntry[]. */
  leaderboard: async () => toLeaderEntries(await request<unknown>('GET', LEADERBOARD_API_URL)),

  /** Tugas tim bawahan (untuk manager/owner). scope: 'all' | 'owner'. */
  teamTasks: (scope: 'all' | 'owner') => request<HrisTask[]>('GET', `/get-team-tasks?scope=${scope}`),

  /** Daftar tugas Papan Misi = API task employee (TASKS_API_URL di config.ts). */
  tasks: () => api.myTasks(),

  /** Centang/lepas satu item checklist. Mengembalikan tugas terbaru. */
  toggleTaskItem: (idTaskItem: string) =>
    request<HrisTask>('POST', '/toggle-task-item', { id_task_item: idTaskItem }),

  /** Mulai tugas (hanya dari status pending). */
  startTask: (idTask: string) => request<HrisTask>('POST', '/start-task', { id_task: idTask }),

  /** Serahkan tugas ke atasan untuk ditinjau. */
  submitTask: (idTask: string, submissionNotes: string, attachmentUrl?: string) =>
    request<HrisTask>('POST', '/submit-task', {
      id_task: idTask,
      submission_notes: submissionNotes,
      ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}),
    }),
};
