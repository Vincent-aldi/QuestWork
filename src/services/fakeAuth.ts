// Simulasi autentikasi (tanpa backend).
// Kredensial demo: andi@kantor.co.id  /  sandi: quest123
import type { Player } from '../types';

export interface LoginPayload {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface LoginResult {
  ok: boolean;
  message?: string;
  displayName?: string;
  player?: Player; // profil dari backend (hanya terisi pada login sungguhan)
}

const DEMO_USERS = ['andi@kantor.co.id'];
const DEMO_PASSWORD = 'quest123';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export async function fakeLogin({ identifier, password }: LoginPayload): Promise<LoginResult> {
  await wait(1200);
  const ok = DEMO_USERS.includes(identifier.trim().toLowerCase()) && password === DEMO_PASSWORD;
  return ok
    ? { ok: true, displayName: 'Andi' }
    : { ok: false, message: 'Email atau kata sandi salah. Coba lagi, Petualang.' };
}

export async function fakeGoogleLogin(): Promise<LoginResult> {
  await wait(800);
  return { ok: true, displayName: 'Andi (Google Workspace)' };
}
