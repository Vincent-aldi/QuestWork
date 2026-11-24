// Penyelesai tantangan anti-bot hosting InfinityFree (halaman "aes.js" + toNumbers(...)).
//
// Server membalas HTML berisi JavaScript yang: mendekripsi data (AES-128-CBC) lalu menyimpan hasilnya
// sebagai cookie `__test`. Setelah cookie itu ikut terkirim, request berikutnya diteruskan ke API.
// Aplikasi tidak menjalankan JavaScript halaman, jadi langkah itu ditiru di sini.
//
// Catatan: ini workaround. Kalau InfinityFree mengubah mekanisme proteksinya, ini bisa berhenti bekerja.

// ---------- AES-128 (dekripsi saja) ----------

const SBOX = new Uint8Array(256);
const INV_SBOX = new Uint8Array(256);

(function buildTables() {
  // S-box dibangun dari invers di GF(2^8) + transformasi affine (menghindari salah ketik tabel)
  let p = 1;
  let q = 1;
  do {
    // p *= 3
    p = p ^ ((p << 1) & 0xff) ^ (p & 0x80 ? 0x1b : 0);
    // q /= 3
    q ^= q << 1;
    q ^= q << 2;
    q ^= q << 4;
    q &= 0xff;
    if (q & 0x80) q ^= 0x09;
    const x = q ^ rotl8(q, 1) ^ rotl8(q, 2) ^ rotl8(q, 3) ^ rotl8(q, 4);
    SBOX[p] = (x ^ 0x63) & 0xff;
  } while (p !== 1);
  SBOX[0] = 0x63;
  for (let i = 0; i < 256; i++) INV_SBOX[SBOX[i]] = i;
})();

function rotl8(x: number, s: number) {
  return ((x << s) | (x >> (8 - s))) & 0xff;
}

function xtime(a: number) {
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
}

function mul(a: number, b: number) {
  let r = 0;
  while (b) {
    if (b & 1) r ^= a;
    a = xtime(a);
    b >>= 1;
  }
  return r;
}

function expandKey(key: number[]): Uint8Array[] {
  // 11 round key (masing-masing 16 byte) untuk AES-128
  const w = new Uint8Array(176);
  w.set(key);
  let rcon = 1;
  for (let i = 16; i < 176; i += 4) {
    let t0 = w[i - 4];
    let t1 = w[i - 3];
    let t2 = w[i - 2];
    let t3 = w[i - 1];
    if (i % 16 === 0) {
      const r0 = SBOX[t1] ^ rcon;
      const r1 = SBOX[t2];
      const r2 = SBOX[t3];
      const r3 = SBOX[t0];
      t0 = r0;
      t1 = r1;
      t2 = r2;
      t3 = r3;
      rcon = xtime(rcon);
    }
    w[i] = w[i - 16] ^ t0;
    w[i + 1] = w[i - 15] ^ t1;
    w[i + 2] = w[i - 14] ^ t2;
    w[i + 3] = w[i - 13] ^ t3;
  }
  const rounds: Uint8Array[] = [];
  for (let r = 0; r < 11; r++) rounds.push(w.slice(r * 16, r * 16 + 16));
  return rounds;
}

function decryptBlock(block: Uint8Array, rk: Uint8Array[]): Uint8Array {
  const s = new Uint8Array(block);
  const addKey = (k: Uint8Array) => {
    for (let i = 0; i < 16; i++) s[i] ^= k[i];
  };
  const invShiftRows = () => {
    const t = s.slice();
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) s[((c + r) % 4) * 4 + r] = t[c * 4 + r];
  };
  const invSub = () => {
    for (let i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
  };
  const invMix = () => {
    for (let c = 0; c < 4; c++) {
      const a0 = s[c * 4];
      const a1 = s[c * 4 + 1];
      const a2 = s[c * 4 + 2];
      const a3 = s[c * 4 + 3];
      s[c * 4] = mul(a0, 14) ^ mul(a1, 11) ^ mul(a2, 13) ^ mul(a3, 9);
      s[c * 4 + 1] = mul(a0, 9) ^ mul(a1, 14) ^ mul(a2, 11) ^ mul(a3, 13);
      s[c * 4 + 2] = mul(a0, 13) ^ mul(a1, 9) ^ mul(a2, 14) ^ mul(a3, 11);
      s[c * 4 + 3] = mul(a0, 11) ^ mul(a1, 13) ^ mul(a2, 9) ^ mul(a3, 14);
    }
  };

  addKey(rk[10]);
  for (let round = 9; round >= 1; round--) {
    invShiftRows();
    invSub();
    addKey(rk[round]);
    invMix();
  }
  invShiftRows();
  invSub();
  addKey(rk[0]);
  return s;
}

/** AES-128-CBC tanpa padding. key/iv/data = array byte. */
export function aesCbcDecrypt(data: number[], key: number[], iv: number[]): number[] {
  if (key.length !== 16 || iv.length !== 16 || data.length % 16 !== 0) {
    throw new Error('Panjang key/iv/data tidak valid');
  }
  const rk = expandKey(key);
  const out: number[] = [];
  let prev = iv;
  for (let i = 0; i < data.length; i += 16) {
    const block = Uint8Array.from(data.slice(i, i + 16));
    const dec = decryptBlock(block, rk);
    for (let j = 0; j < 16; j++) out.push(dec[j] ^ prev[j]);
    prev = Array.from(block);
  }
  return out;
}

// ---------- Penyelesai tantangan ----------

const hexToBytes = (h: string) => (h.match(/../g) ?? []).map((x) => parseInt(x, 16));
const bytesToHex = (b: number[]) => b.map((x) => x.toString(16).padStart(2, '0')).join('');

/** True bila isi balasan adalah halaman tantangan anti-bot InfinityFree. */
export function isChallengePage(html: string): boolean {
  return html.includes('aes.js') && html.includes('toNumbers(');
}

/** Mengembalikan nilai header Cookie (mis. "__test=ab12...") dari halaman tantangan, atau null bila gagal. */
export function solveChallenge(html: string): string | null {
  try {
    const nums = [...html.matchAll(/toNumbers\("([0-9a-fA-F]+)"\)/g)].map((m) => m[1]);
    if (nums.length < 3) return null;
    const [a, b, c] = nums; // key, iv, ciphertext
    const plain = aesCbcDecrypt(hexToBytes(c), hexToBytes(a), hexToBytes(b));
    const name = html.match(/document\.cookie\s*=\s*"([^"=]+)="/)?.[1] ?? '__test';
    return `${name}=${bytesToHex(plain)}`;
  } catch {
    return null;
  }
}
