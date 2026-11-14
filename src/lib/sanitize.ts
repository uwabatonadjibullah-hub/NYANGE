/** Trim strings, drop empty / undefined values, and cap lengths. Firestore never receives `undefined`. */
export function clean<T extends object>(obj: T, limits: Partial<Record<keyof T, number>> = {}): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string') {
      const t = v.trim();
      if (!t) continue;
      const max = limits[k as keyof T];
      out[k] = max ? t.slice(0, max) : t;
    } else {
      out[k] = v;
    }
  }
  return out as Partial<T>;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Human-friendly reference shown to the person who submitted, e.g. NR-NOT-7KQ2MX. */
export function makeReceipt(prefix: 'NOT' | 'DES' | 'MSG'): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `NR-${prefix}-${s}`;
}

export function isPlausibleContact(v: string): boolean {
  const t = v.trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t);
  const phone = /^\+?[0-9 ()-]{7,20}$/.test(t);
  return email || phone;
}
