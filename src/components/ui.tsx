import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useI18n } from '../i18n';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 min-h-11 text-base font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';
const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-white text-primary border border-primary hover:bg-mint',
  ghost: 'text-primary hover:bg-mint',
  danger: 'bg-danger text-white hover:bg-danger-hover',
};

export function Button({ variant = 'primary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

export function ButtonLink({ variant = 'primary', className = '', ...rest }: LinkProps & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

/** Accessible modal dialog built on the native <dialog> element (focus trap, Escape, backdrop). */
export function Dialog({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { t } = useI18n();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.body.style.overflow = 'hidden';
    }
    if (!open && d.open) d.close();
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-1.5rem)] ${wide ? 'max-w-2xl' : 'max-w-xl'} max-h-[92dvh] rounded-lg bg-white p-0 text-ink shadow-xl backdrop:bg-black/50`}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <h2 id={titleId} className="font-serif text-2xl text-primary">{title}</h2>
            <button type="button" onClick={onClose} aria-label={t('close')} className="-mr-2 -mt-1 inline-flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-mint hover:text-primary cursor-pointer">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: (props: { id: string; 'aria-describedby'?: string; required?: boolean }) => ReactNode;
  optionalText?: string;
  className?: string;
}

/** Label + control + hint, correctly associated for screen readers. */
export function Field({ label, required, hint, children, optionalText, className = '' }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block font-semibold text-ink">
        {label}
        {required ? <span className="text-danger" aria-hidden> *</span> : optionalText ? <span className="font-normal text-muted"> ({optionalText})</span> : null}
      </label>
      {children({ id, 'aria-describedby': hintId, required })}
      {hint && <p id={hintId} className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export const inputClass =
  'block w-full rounded-md border border-line-strong bg-white px-3 min-h-11 py-2 text-base text-ink placeholder:text-muted/80 focus:border-primary focus:outline-2 focus:outline-primary/40';

export function Alert({ tone, children }: { tone: 'error' | 'info' | 'success'; children: ReactNode }) {
  const tones = {
    error: 'border-danger/40 bg-danger-soft text-danger-strong',
    info: 'border-primary/20 bg-mint-soft text-ink',
    success: 'border-primary/30 bg-mint text-primary',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, intro, eyebrow }: { title: string; intro?: string; eyebrow?: string }) {
  return (
    <header className="mb-8 max-w-3xl">
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>}
      <h1 className="font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
      {intro && <p className="mt-3 text-lg text-muted">{intro}</p>}
    </header>
  );
}
