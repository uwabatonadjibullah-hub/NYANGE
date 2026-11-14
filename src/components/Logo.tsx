export function Emblem({ className = 'h-10 w-10', light = false }: { className?: string; light?: boolean }) {
  const main = light ? '#E0FFC2' : '#064734';
  const accent = light ? '#064734' : '#E0FFC2';
  return (
    <svg viewBox="0 0 100 100" className={`${className} shrink-0`} aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="47" fill={light ? 'rgba(224,255,194,0.12)' : 'rgba(6,71,52,0.06)'} stroke={main} strokeWidth="2.5" />
      <path d="M32 78 C38 74 44 76 50 78 C56 76 62 74 68 78 C65 83 35 83 32 78 Z" fill={main} />
      <path d="M48 50 C48 62 46 72 43 78 L57 78 C54 72 52 62 52 50 Z" fill={main} />
      <path d="M49 54 C42 50 34 50 24 58 C29 50 36 44 47 46" stroke={main} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M51 54 C58 50 66 50 76 58 C71 50 64 44 53 46" stroke={main} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M49 46 C47 38 44 32 40 26 C46 30 50 35 50 42 C50 35 54 30 60 26 C56 32 53 38 51 46" fill={main} />
      <polygon points="24,56 20,50 24,44 28,50" fill={accent} stroke={main} strokeWidth="1.4" />
      <polygon points="50,25 46,20 50,15 54,20" fill={accent} stroke={main} strokeWidth="1.4" />
      <polygon points="76,56 72,50 76,44 80,50" fill={accent} stroke={main} strokeWidth="1.4" />
      <circle cx="50" cy="50" r="3.5" fill={accent} stroke={main} strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ light = false, sub }: { light?: boolean; sub: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <Emblem light={light} />
      <span className="flex flex-col leading-tight">
        <span className={`font-serif text-lg font-semibold ${light ? 'text-white' : 'text-primary'}`}>Nyange Radjabu</span>
        <span className={`text-sm ${light ? 'text-mint' : 'text-muted'}`}>{sub}</span>
      </span>
    </span>
  );
}
