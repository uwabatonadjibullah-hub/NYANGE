import { useEffect } from 'react';

/** Sets the page title and, for private pages, asks search engines not to index them. */
export function useMeta(title: string, opts: { noindex?: boolean } = {}) {
  useEffect(() => {
    document.title = title ? `${title} · Nyange Radjabu Family Heritage` : 'Nyange Radjabu Family Heritage';
    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (opts.noindex) {
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = 'robots';
        document.head.appendChild(tag);
      }
      tag.content = 'noindex, nofollow';
    } else if (tag) {
      tag.remove();
    }
  }, [title, opts.noindex]);
}
