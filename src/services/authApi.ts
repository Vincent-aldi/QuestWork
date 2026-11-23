import { api, ApiError, clearAuthToken, playerFromLogin, setAuthToken, setMyEmployeeId } from './api';
import type { LoginPayload, LoginResult } from './fakeAuth';

// Dipertahankan agar import lama (App.tsx) tetap jalan.
export { clearAuthToken, getAuthToken } from './api';

/** POST /login  { email, password, device_type } */
export async function login({ identifier, password }: LoginPayload): Promise<LoginResult> {
  try {
    const data = await api.login(identifier.trim(), password);
    if (!data?.access_token) return { ok: false, message: 'Respons server tidak berisi token.' };
    setAuthToken(data.access_token);
    setMyEmployeeId(data.id_employee ?? null);
    const player = playerFromLogin(data);
    return { ok: true, displayName: player.name, player };
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        ok: false,
        message: e.status === 401 ? 'Email atau kata sandi salah. Coba lagi, Petualang.' : e.message,
      };
    }
    return { ok: false, message: 'Login gagal. Coba lagi.' };
  }
}

/** POST /logout, lalu hapus token lokal. Selalu "berhasil" dari sisi pengguna. */
export async function logout(): Promise<void> {
  try {
    await api.logout();
  } catch {
    // abaikan: token lokal tetap dihapus
  } finally {
    clearAuthToken();
    setMyEmployeeId(null);
  }
}
