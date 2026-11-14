import { BookOpen, GitFork, Home, Mail, Menu, PenLine, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LANGUAGES, useI18n, type TKey } from '../i18n';
import { pick, useSiteContent } from '../lib/content';
import type { Language } from '../lib/types';
import { Logo } from './Logo';
import { useRecordMe } from './RecordMeContext';

const NAV: { to: string; key: TKey }[] = [
  { to: '/', key: 'navHome' },
  { to: '/family-tree', key: 'navTree' },
  { to: '/history', key: 'navHistory' },
  { to: '/gallery', key: 'navGallery' },
  { to: '/contact', key: 'navContact' },
  { to: '/support', key: 'navSupport' },
];

function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{t('navLanguage')}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Language)}
        className="min-h-11 cursor-pointer rounded-md border border-line-strong bg-white px-2 text-base font-medium text-ink focus:outline-2 focus:outline-primary"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {compact ? l.short : l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function AnnouncementBar() {
  const { lang, t } = useI18n();
  const content = useSiteContent();
  const text = pick(content.announcement.text, lang);
  if (!content.announcement.active || !text) return null;
  return (
    <div className="bg-primary text-white" role="region" aria-label={t('announcement')}>
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-base">
        <span className="font-semibold text-mint">{t('announcement')}: </span>
        {text}
      </p>
    </div>
  );
}

export default function Layout() {
  const { t } = useI18n();
  const { openRecordMe } = useRecordMe();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-base font-medium transition-colors ${isActive ? 'text-primary underline decoration-2 underline-offset-8' : 'text-ink hover:text-primary'}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:p-3">
        {t('skipToContent')}
      </a>
      <AnnouncementBar />
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 lg:h-20">
          <Link to="/" className="rounded-md" aria-label={t('navHome')}>
            <Logo sub={t('brandSub')} />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={desktopLink}>
                {t(n.key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LanguageSelect />
            </div>
            <div className="sm:hidden">
              <LanguageSelect compact />
            </div>
            <button
              type="button"
              onClick={() => openRecordMe()}
              className="hidden min-h-11 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 font-semibold text-white hover:bg-primary-hover lg:inline-flex"
            >
              <PenLine className="h-5 w-5" aria-hidden />
              {t('navRecordMe')}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-ink hover:bg-mint lg:hidden"
              aria-label={t('navMenu')}
              aria-expanded={menuOpen}
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={t('navMenu')}>
          <button type="button" className="absolute inset-0 bg-black/40" aria-label={t('navClose')} onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-serif text-xl text-primary">{t('navMenu')}</span>
              <button type="button" onClick={() => setMenuOpen(false)} className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-mint" aria-label={t('navClose')}>
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <nav aria-label="Main" className="flex flex-col p-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) => `rounded-md px-4 py-3 text-lg ${isActive ? 'bg-mint font-semibold text-primary' : 'text-ink hover:bg-mint-soft'}`}
                >
                  {t(n.key)}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto space-y-3 border-t border-line p-4">
              <LanguageSelect />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openRecordMe();
                }}
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white"
              >
                <PenLine className="h-5 w-5" aria-hidden />
                {t('navRecordMe')}
              </button>
            </div>
          </div>
        </div>
      )}

      <main id="main" className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      <footer className="bg-primary pb-24 text-white lg:pb-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
          <div>
            <Logo light sub={t('brandSub')} />
            <p className="mt-4 max-w-sm text-mint">{t('footerTagline')}</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-1 sm:justify-self-end">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="inline-flex min-h-11 items-center text-white hover:text-mint hover:underline">
                {t(n.key)}
              </Link>
            ))}
            <Link to="/privacy" className="inline-flex min-h-11 items-center text-white hover:text-mint hover:underline">{t('footerPrivacy')}</Link>
            <Link to="/admin" className="inline-flex min-h-11 items-center text-white hover:text-mint hover:underline" rel="nofollow">{t('footerAdmin')}</Link>
          </nav>
        </div>
        <p className="border-t border-white/15 px-4 py-4 text-center text-sm text-mint">
          © {new Date().getFullYear()} · {t('footerRights')}
        </p>
      </footer>

      {/* Mobile bottom navigation: the four most used destinations + one clear action */}
      <nav aria-label="Quick" className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {[
            { to: '/', key: 'navHome' as TKey, Icon: Home },
            { to: '/family-tree', key: 'navTree' as TKey, Icon: GitFork },
            { to: '/history', key: 'navHistory' as TKey, Icon: BookOpen },
            { to: '/contact', key: 'navContact' as TKey, Icon: Mail },
          ].map(({ to, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${isActive ? 'text-primary' : 'text-muted'}`}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : ''}`} aria-hidden />
                  <span>{t(key)}</span>
                </>
              )}
            </NavLink>
          ))}
          <button type="button" onClick={() => openRecordMe()} className="flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 text-xs font-semibold text-primary">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <PenLine className="h-4 w-4" aria-hidden />
            </span>
            <span>{t('navRecordMe')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
