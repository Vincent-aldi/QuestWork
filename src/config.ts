// Alamat backend HRIS. Ganti di sini kalau IP/port server berubah.
// Catatan: HP/emulator harus satu jaringan WiFi dengan server (192.168.x.x = jaringan lokal).
// Tanpa garis miring di akhir. "localhost" TIDAK bisa dipakai dari HP.
export const API_BASE_URL = 'http://192.168.18.104';
export const API_TIMEOUT_MS = 15000;

// Identitas klien yang dikirim ke backend supaya admin/server bisa mendeteksi login dari aplikasi mobile.
export const APP_NAME = 'QuestWork';
export const APP_VERSION = '1.0.0'; // samakan dengan "version" di app.json
export const CLIENT_TYPE = 'mobile';

// API task employee: tugas yang diberikan KEPADA user yang login (GET + Bearer token).
export const TASKS_API_URL = 'http://192.168.18.104/get-my-tasks';

// API leaderboard: laporan performa task seluruh karyawan (GET + Bearer token).
export const LEADERBOARD_API_URL = 'http://192.168.18.104/get-task-performance-report';

// (Tidak dipakai lagi oleh Papan Misi, disisakan untuk referensi.) Sumber daftar tugas:
//   'my'   -> GET /get-my-tasks            tugas yang diberikan KEPADA user yang login (disarankan untuk karyawan)
//   'team' -> GET /get-team-tasks?scope=   tugas bawahan; kosong bila user tidak punya bawahan
export const TASK_SOURCE: 'my' | 'team' = 'my';
// Dipakai bila TASK_SOURCE = 'team'. 'all' = semua tugas tim, 'owner' = hanya yang diberikan owner.
export const TEAM_TASK_SCOPE: 'all' | 'owner' = 'all';

// Login Google belum terhubung ke backend. Ubah ke true setelah integrasinya siap.
export const GOOGLE_LOGIN_ENABLED = false;
