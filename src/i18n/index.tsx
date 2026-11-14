import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Gender, Language, Person } from '../lib/types';
import type { RelationshipKey } from '../lib/genealogy';
import { en, type Dict } from './en';
import { fr } from './fr';
import { rw } from './rw';
import { sw } from './sw';

export type TKey = keyof Dict;
const DICTS: Record<Language, Dict> = { en, sw, rw, fr };
export const LANGUAGES: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'sw', label: 'Kiswahili', short: 'SW' },
  { code: 'rw', label: 'Kinyarwanda', short: 'RW' },
  { code: 'fr', label: 'Français', short: 'FR' },
];
const STORAGE_KEY = 'nyange_language';

interface I18n {
  lang: Language;
  setLang: (l: Language) => void;
  /** false until the visitor has picked a language (first visit). */
  hasChosen: boolean;
  t: (key: TKey, params?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18n | null>(null);

const isLanguage = (v: unknown): v is Language => v === 'en' || v === 'sw' || v === 'rw' || v === 'fr';

function savedLang(): Language | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLanguage(saved) ? saved : null;
  } catch {
    return null; // storage unavailable
  }
}

function initialLang(): Language {
  const saved = savedLang();
  if (saved) return saved;
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
  return isLanguage(nav) ? nav : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(initialLang);
  const [hasChosen, setHasChosen] = useState<boolean>(() => savedLang() !== null);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((l: Language) => {
    setLangState(l);
    setHasChosen(true);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);
  const t = useCallback(
    (key: TKey, params?: Record<string, string | number>) => {
      let s = DICTS[lang][key] ?? en[key] ?? String(key);
      if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
    [lang],
  );
  const value = useMemo(() => ({ lang, setLang, t, hasChosen }), [lang, setLang, t, hasChosen]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const c = useContext(Ctx);
  if (!c) throw new Error('useI18n must be used inside LanguageProvider');
  return c;
}

export function generationLabel(t: I18n['t'], n: number): string {
  const keys: TKey[] = ['gen0', 'gen1', 'gen2', 'gen3', 'gen4'];
  return n < keys.length ? t(keys[n]) : t('genN', { n });
}

export function relationshipLabel(t: I18n['t'], key: RelationshipKey, gender: Gender): string {
  if (key === 'self') return t('rel_self');
  const g = gender === 'male' ? 'm' : gender === 'female' ? 'f' : 'u';
  const specific = `rel_${key}_${g}` as TKey;
  const neutral = `rel_${key}_u` as TKey;
  return specific in en ? t(specific) : t(neutral);
}

export function statusLabel(t: I18n['t'], p: Person): string {
  return p.status === 'verified' ? t('statusVerified') : p.status === 'unconfirmed' ? t('statusUnconfirmed') : t('statusListed');
}
