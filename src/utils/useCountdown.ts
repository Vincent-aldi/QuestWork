import { useEffect, useState } from 'react';
import { pad2 } from './format';

/** Hitung mundur HH:MM:SS; diulang dari awal saat mencapai 0. */
export function useCountdown(startSeconds: number): string {
  const [s, setS] = useState(startSeconds);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v > 0 ? v - 1 : startSeconds)), 1000);
    return () => clearInterval(id);
  }, [startSeconds]);
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}
