import { doc, getDoc } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import type { Language, LocalizedText, SiteContent } from './types';

/** Family-approved biography (verbatim from the family's brief). Editable by administrators. */
export const DEFAULT_CONTENT: SiteContent = {
  announcement: { active: false, text: {} },
  biography: {
    en: 'NYANGE RADJABU was a generous man who spent most of his life in Kamembe, Rwanda, and spent his final period in Burundi. He was a devoted Muslim who raised his children according to Islamic values while maintaining Rwandan values and traditions. He believed in helping others and made sure that his wives and children were taken care of on a daily basis. His legacy continues through the generations of descendants who form his extended family.',
    sw: 'NYANGE RADJABU alikuwa mtu mkarimu aliyeishi sehemu kubwa ya maisha yake huko Kamembe, Rwanda, na kipindi chake cha mwisho alikiishi nchini Burundi. Alikuwa Mwislamu mwaminifu aliyewalea watoto wake kwa mujibu wa maadili ya Kiislamu huku akidumisha maadili na desturi za Kinyarwanda. Aliamini kusaidia wengine na alihakikisha wake zake na watoto wake wanatunzwa kila siku. Urithi wake unaendelea kupitia vizazi vya wazao wanaounda familia yake pana.',
    rw: 'NYANGE RADJABU yari umugabo w’umutima mwiza wamaze igice kinini cy’ubuzima bwe i Kamembe mu Rwanda, aza gusoza iminsi ye mu Burundi. Yari Umuyisilamu wiyeguriye Imana wareze abana be akurikije amahame ya Kisilamu ari nako yubahiriza indangagaciro n’umuco nyarwanda. Yizeraga gufasha abandi kandi yitaga ku bagore be n’abana be buri munsi. Umurage we urakomeza binyuze mu bisekuru by’abamukomokaho bagize umuryango we mugari.',
  },
  contact: {},
  donation: { enabled: false, intro: {}, channels: [] },
  gallery: [],
};

export function pick(text: LocalizedText | undefined, lang: Language): string {
  if (!text) return '';
  return text[lang] || text.en || text.sw || text.rw || '';
}

let cache: SiteContent | null = null;
let inflight: Promise<SiteContent> | null = null;

export function mergeContent(data: Partial<SiteContent> | undefined): SiteContent {
  return {
    announcement: { ...DEFAULT_CONTENT.announcement, ...(data?.announcement ?? {}) },
    biography: { ...DEFAULT_CONTENT.biography, ...(data?.biography ?? {}) },
    contact: { ...(data?.contact ?? {}) },
    donation: { ...DEFAULT_CONTENT.donation, ...(data?.donation ?? {}), channels: data?.donation?.channels ?? [] },
    gallery: data?.gallery ?? [],
  };
}

export function loadContent(force = false): Promise<SiteContent> {
  if (cache && !force) return Promise.resolve(cache);
  if (inflight && !force) return inflight;
  inflight = getDoc(doc(db, 'content', 'site'))
    .then((snap) => (cache = mergeContent(snap.exists() ? (snap.data() as Partial<SiteContent>) : undefined)))
    .catch(() => (cache = DEFAULT_CONTENT))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(cache ?? DEFAULT_CONTENT);
  useEffect(() => {
    let alive = true;
    loadContent().then((c) => alive && setContent(c));
    return () => {
      alive = false;
    };
  }, []);
  return content;
}
