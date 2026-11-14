import { useEffect, useRef } from 'react';
import { LANGUAGES, useI18n } from '../i18n';
import type { Language } from '../lib/types';
import { Emblem } from './Logo';

/** Shown in every language at once, because the visitor has not chosen yet. */
const PROMPT: Record<Language, { title: string; hint: string }> = {
  en: { title: 'Choose your language', hint: 'You can change it later at the top of every page.' },
  sw: { title: 'Chagua lugha yako', hint: 'Unaweza kuibadilisha baadaye juu ya kila ukurasa.' },
  rw: { title: 'Hitamo ururimi rwawe', hint: 'Ushobora kuruhindura nyuma hejuru kuri buri rupapuro.' },
  fr: { title: 'Choisissez votre langue', hint: 'Vous pourrez la changer plus tard en haut de chaque page.' },
};

/**
 * First-visit language choice for the public site. It cannot be dismissed
 * without choosing, and the choice is remembered on this device.
 */
export default function LanguageChooser() {
  const { lang, setLang, hasChosen } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!hasChosen && !d.open) {
      d.showModal();
      document.body.style.overflow = 'hidden';
    }
    if (hasChosen && d.open) {
      d.close();
      document.body.style.overflow = '';
    }
  }, [hasChosen]);

  if (hasChosen) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby="lang-chooser-title"
      onCancel={(e) => e.preventDefault()}
      className="m-auto w-[calc(100%-1.5rem)] max-w-md rounded-lg bg-white p-0 text-ink shadow-xl backdrop:bg-primary/90"
    >
      <div className="px-6 py-7 text-center">
        <Emblem className="mx-auto h-16 w-16" />
        <p className="mt-3 font-serif text-xl text-primary">Nyange Radjabu</p>
        <h1 id="lang-chooser-title" className="mt-4 font-serif text-2xl leading-snug">
          {LANGUAGES.map((l) => (
            <span key={l.code} lang={l.code} className={`block ${l.code === lang ? 'text-ink' : 'text-lg text-muted'}`}>
              {PROMPT[l.code].title}
            </span>
          ))}
        </h1>
        <ul className="mt-6 space-y-3">
          {LANGUAGES.map((l, i) => (
            <li key={l.code}>
              <button
                type="button"
                lang={l.code}
                autoFocus={l.code === lang || (i === 0 && !LANGUAGES.some((x) => x.code === lang))}
                onClick={() => setLang(l.code)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-md border-2 border-line px-5 text-left text-lg font-semibold text-ink hover:border-primary hover:bg-mint-soft focus-visible:border-primary"
              >
                <span>{l.label}</span>
                <span className="rounded bg-mint px-2 py-0.5 text-sm font-bold text-primary">{l.short}</span>
              </button>
            </li>
          ))}
        </ul>
        <p lang={lang} className="mt-5 text-sm text-muted">{PROMPT[lang].hint}</p>
      </div>
    </dialog>
  );
}
