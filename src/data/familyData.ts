import { FamilyBranch, FamilyMember, GalleryItem, FamilyLeader, DescendantNode, GrandchildRecord } from '../types';
import { 
  ALL_GRANDCHILDREN,
  getGrandchildrenByBranch,
  getGrandchildById,
  KWIRIHA_GRANDCHILDREN,
  MSELEM_GRANDCHILDREN,
  MAMA_OMARI_GRANDCHILDREN,
  MARIAM_GRANDCHILDREN,
  HAMISI_GRANDCHILDREN,
  BAGARAGAZA_GRANDCHILDREN,
  HUSSEIN_GRANDCHILDREN,
  MUGUNDA_TAUSI_GRANDCHILDREN
} from './grandchildrenData';

export {
  ALL_GRANDCHILDREN,
  getGrandchildrenByBranch,
  getGrandchildById
};

export const PATRIARCH_INFO: FamilyMember = {
  id: 'NR-GEN0-001',
  fullName: 'NYANGE RADJABU',
  gender: 'male',
  generationLevel: 0,
  isPatriarch: true,
  isDeceased: true,
  location: 'Kamembe, Rwanda & Burundi',
  verificationStatus: 'verified_audit_record',
  privacyLevel: 'public',
  biography: {
    en: 'NYANGE RADJABU was a generous man who spent most of his life in Kamembe, Rwanda, and spent his final period in Burundi. He was a devoted Muslim who raised his children according to Islamic values while maintaining Rwandan values and traditions. He believed in helping others and made sure that his wives and children were taken care of on a daily basis. His enduring legacy lives through his hundreds of descendants.',
    sw: 'NYANGE RADJABU alikuwa mtu mkarimu aliyeishi sehemu kubwa ya maisha yake huko Kamembe, Rwanda, na kipindi chake cha mwisho alikiishi nchini Burundi. Alikuwa Mwislamu mwaminifu aliyewalea watoto wake kwa mujibu wa maadili ya Kiislamu huku akidumisha desturi na maadili ya Kinyarwanda. Aliamini kusaidia wengine na alihakikisha wake zake na watoto wanatunzwa kila siku. Urithi wake unaendelea kupitia vizazi vingi vya wazao wake.',
    rw: 'NYANGE RADJABU yari umugabo w’umutima mwiza wamaze igice kinini cy’ubuzima bwe i Kamembe mu Rwanda, aza gusoza iminsi ye mu Burundi. Yari Umuyisilamu wiyeguriye Imana wareze abana be akurikije amahame ya Kisilamu ari nako yubahiriza umuco n’indangagaciro nyarwanda. Yizeraga gufasha abandi kandi yitwararitse ko abagore be n’abana bitabwaho buri munsi. Umurage we urakomeza binyuze mu babyiruka be benshi.'
  }
};

export const OFFICIAL_DOCUMENT_TITLE = 'RIPOTI YA IDADI YA FAMILIA ZA BABU NYANGE RAJABU — TOLEO LA UKAGUZI — Miaka 15+';
export const REPORTED_TOTAL_15_PLUS = 398;
export const REPORTED_SECTIONS_COUNT = 8;
export const TOTAL_GRANDCHILDREN_COUNT = 82;
export const PENDING_FAMILIES_COUNT = 7;

export const getBranchById = (branchId: string): FamilyBranch | undefined => {
  return FAMILY_BRANCHES.find((b) => b.id === branchId);
};

export const FAMILY_BRANCHES: FamilyBranch[] = [
  {
    id: 'branch-kwiriha',
    code: 'BR-01',
    name: 'Kwiriha Sudi Rajabu Family',
    swahiliName: 'Familia ya Kwiriha Sudi Rajabu',
    kinyarwandaName: 'Umuryango wa Kwiriha Sudi Rajabu',
    reportedCount15Plus: 32,
    status: 'reported_audit',
    primaryLocation: 'Kamembe, Rwanda / Regional',
    sourceDocumentRef: 'Ripoti ya Ukaguzi — Sehemu ya 1',
    grandchildrenCount: 8,
    grandchildren: KWIRIHA_GRANDCHILDREN,
    summary: {
      en: 'Official branch listed in the preliminary family audit report with 32 recorded members aged 15 and above across 8 registered grandchildren households.',
      sw: 'Sehemu rasmi ya familia iliyoorodheshwa katika ripoti ya ukaguzi ikiwa na wanachama 32 waliorekodiwa wenye miaka 15 na zaidi katika kaya 8 za wajukuu.',
      rw: 'Igice cy’umuryango cyanditswe muri raporo y’ibarura ry’ibanze gifite abanyamuryango 32 bafite imyaka 15 no hejuru mu ngo 8 z’abuzukuru.'
    },
    lineageNotes: {
      en: 'Traced through the lineage connection to Babu Nyange Radjabu. 8 grandchildren entries registered in official audit rows.',
      sw: 'Inafuata nasaba inayoungana na Babu Nyange Radjabu. Wajukuu 8 wameandikishwa katika orodha rasmi ya ukaguzi.',
      rw: 'Gikomoka ku gisekuru cyahuje na Nyange Radjabu. Abuzukuru 8 banditse mu mbonerahamwe y’ibarura ry’ibanze.'
    }
  },
  {
    id: 'branch-mselem',
    code: 'BR-02',
    name: 'Mselem Rajabu Family',
    swahiliName: 'Familia ya Mselem Rajabu',
    kinyarwandaName: 'Umuryango wa Mselem Rajabu',
    reportedCount15Plus: 116,
    status: 'reported_audit',
    primaryLocation: 'Kamembe, Rwanda / Regional & Diaspora',
    sourceDocumentRef: 'Ripoti ya Ukaguzi — Sehemu ya 2',
    grandchildrenCount: 23,
    grandchildren: MSELEM_GRANDCHILDREN,
    summary: {
      en: 'One of the largest branches recorded in the preliminary audit, with 116 verified family members aged 15+ across 23 registered grandchildren.',
      sw: 'Moja ya familia kubwa zilizorekodiwa katika ukaguzi wa awali, ikiwa na wanachama 116 wenye umri wa miaka 15+ katika wajukuu 23 waliorekodiwa.',
      rw: 'Umwe mu miryango migari yanditswe mu ibarura ry’ibanze, ufite abanyamuryango 116 bafite imyaka 15+ mu buzukuru 23 banditse.'
    },
    lineageNotes: {
      en: 'Direct lineage associated with Babu Nyange Radjabu. 23 named grandchildren entries recorded with family statistics.',
      sw: 'Nasaba ya moja kwa moja ya Babu Nyange Radjabu. Wajukuu 23 wametajwa kwa majina wakiwa na takwimu za familia zao.',
      rw: 'Ububanyi n’uburyo bw’ibisekuru bihujwe na Nyange Radjabu. Abuzukuru 23 bavuzwe mu mazina n’imibare y’ingo zabo.'
    }
  },
  {
    id: 'branch-mama-omari',
    code: 'BR-03',
    name: 'Mama Omari Rajabu Family',
    swahiliName: 'Familia ya Mama Omari Rajabu',
    kinyarwandaName: 'Umuryango wa Mama Omari Rajabu',
    reportedCount15Plus: 8,
    status: 'reported_audit',
    primaryLocation: 'Kamembe, Rwanda',
    sourceDocumentRef: 'Ripoti ya Ukaguzi — Sehemu ya 3',
    grandchildrenCount: 4,
    grandchildren: MAMA_OMARI_GRANDCHILDREN,
    summary: {
      en: 'Family branch officially recorded with 8 members aged 15 and above across 4 grandchildren entries in the preliminary audit report.',
      sw: 'Sehemu ya familia iliyorekodiwa rasmi ikiwa na wanachama 8 wenye miaka 15 na zaidi katika wajukuu 4 kwenye ripoti ya ukaguzi.',
      rw: 'Igice cy’umuryango cyanditswe ku mugaragaro n’abanyamuryango 8 bafite imyaka 15 no hejuru mu buzukuru 4.'
    },
    lineageNotes: {
      en: 'Direct maternal branch with 4 registered grandchildren: Musa (5), Issa (1), Amani (1), and Omari Kijiwe (1).',
      sw: 'Nasaba ya upande wa mama yenye wajukuu 4: Musa (5), Issa (1), Amani (1), na Omari Kijiwe (1).',
      rw: 'Igisekuru cy’umubyeyi gifite abuzukuru 4: Musa (5), Issa (1), Amani (1), na Omari Kijiwe (1).'
    }
  },
  {
    id: 'branch-mariam',
    code: 'BR-04',
    name: 'Mariam Rajabu Family',
    swahiliName: 'Familia ya Mariam Rajabu',
    kinyarwandaName: 'Umuryango wa Mariam Rajabu',
    reportedCount15Plus: 79,
    status: 'reported_audit',
    primaryLocation: 'Kamembe, Rwanda / Regional',
    sourceDocumentRef: 'Ripoti ya Ukaguzi — Sehemu ya 4',
    grandchildrenCount: 13,
    grandchildren: MARIAM_GRANDCHILDREN,
    summary: {
      en: 'Major family branch with 79 recorded members aged 15+ and 13 grandchildren entries in the preliminary audit report.',
      sw: 'Tawi kubwa la familia lenye wanachama 79 waliorekodiwa wenye miaka 15+ na wajukuu 13 katika ripoti ya ukaguzi.',
      rw: 'Igice kinini cy’umuryango gifite abanyamuryango 79 banditse bafite imyaka 15+ n’abuzukuru 13 banditse.'
    },
    lineageNotes: {
      en: 'Direct maternal branch associated with Babu Nyange Radjabu. 13 named grandchildren registered with individual family counts.',
      sw: 'Nasaba ya mama inayohusishwa na Babu Nyange Radjabu. Wajukuu 13 wametajwa kwa majina wakiwa na idadi zao.',
      rw: 'Igisekuru cy’umubyeyi gishamikiye kuri Nyange Radjabu. Abuzukuru 13 banditse mu mbonerahamwe y’ibarura.'
    }
  },
  {
    id: 'branch-hamisi',
    code: 'BR-05',
    name: 'Hamisi Rajabu Family',
    swahiliName: 'Familia ya Hamisi Rajabu',
    kinyarwandaName: 'Umuryango wa Hamisi Rajabu',
    reportedCount15Plus: 18,
    status: 'reported_audit',
    primaryLocation: 'Kamembe, Rwanda / Burundi',
    sourceDocumentRef: 'Ripoti ya Ukaguzi — Sehemu ya 5',
    grandchildrenCount: 9,
    grandchildren: HAMISI_GRANDCHILDREN,
    summary: {
      en: 'Family branch officially listed with 18 members aged 15+ across 9 registered grandchildren entries in the preliminary audit report.',
      sw: 'Tawi la familia lililoorodheshwa rasmi likiwa na wanachama 18 wenye miaka 15+ katika wajukuu 9 kwenye ripoti ya ukaguzi.',
      rw: 'Igice cy’umuryango cyanditswe ku mugaragaro gifite abanyamuryango 18 bafite imyaka 15+ mu buzukuru 9 banditse.'
    },
    lineageNotes: {
      en: 'Lineage branch connecting Kamembe and Burundi family residences. 9 grandchildren entries recorded in audit.',
      sw: 'Nasaba inayounganisha makazi ya familia ya Kamembe na Burundi. Wajukuu 9 wamerekodiwa katika ukaguzi.',
      rw: 'Igisekuru gihuza ubutura bw’umuryango i Kamembe no mu Burundi. Abuzukuru 9 banditse mu ibarura.'
    }
  },
  {
    id: 'branch-bagaragaza',
    code: 'BR-06',
    name: 'Bagaragaza Saeed Miraji Family',
    swahiliName: 'Familia ya Bagaragaza Saeed Miraji',
    kinyarwandaName: 'Umuryango wa Bagaragaza Saeed Miraji',
    reportedCount15Plus: 31,
    status: 'reported_audit',
    primaryLocation: 'Kamembe, Rwanda / Regional',
    sourceDocumentRef: 'Ripoti ya Ukaguzi — Sehemu ya 6',
    grandchildrenCount: 11,
    grandchildren: BAGARAGAZA_GRANDCHILDREN,
    summary: {
      en: 'Family branch officially listed with 31 members aged 15+ across 11 registered grandchildren entries in the preliminary audit report.',
      sw: 'Tawi la familia lililoorodheshwa rasmi lenye wanachama 31 wenye miaka 15+ katika wajukuu 11 waliorekodiwa.',
      rw: 'Igice cy’umuryango cyanditswe ku mugaragaro gifite abanyamuryango 31 bafite imyaka 15+ mu buzukuru 11 banditse.'
    },
    lineageNotes: {
      en: 'Traced through the Bagaragaza Saeed Miraji family connection to Babu Nyange Radjabu. 11 grandchildren recorded with household numbers.',
      sw: 'Inafuata uhusiano wa Bagaragaza Saeed Miraji na Babu Nyange Radjabu. Wajukuu 11 wametajwa na takwimu za kaya zao.',
      rw: 'Gishingiye ku isano ry’umuryango wa Bagaragaza Saeed Miraji na Nyange Radjabu. Abuzukuru 11 banditse.'
    }
  },
  {
    id: 'branch-hussein',
    code: 'BR-07',
    name: 'Hussein Rajabu Family',
    swahiliName: 'Familia ya Hussein Rajabu',
    kinyarwandaName: 'Umuryango wa Hussein Rajabu',
    reportedCount15Plus: 6,
    status: 'reported_audit',
    primaryLocation: 'Kamembe, Rwanda',
    sourceDocumentRef: 'Ripoti ya Ukaguzi — Sehemu ya 7',
    grandchildrenCount: 6,
    grandchildren: HUSSEIN_GRANDCHILDREN,
    summary: {
      en: 'Family branch officially recorded with 6 members aged 15+ and 6 registered grandchildren entries in the preliminary audit report.',
      sw: 'Sehemu ya familia iliyorekodiwa rasmi ikiwa na wanachama 6 wenye miaka 15+ na wajukuu 6 waliorekodiwa kwenye ripoti ya ukaguzi.',
      rw: 'Igice cy’umuryango cyanditswe ku mugaragaro gifite abanyamuryango 6 bafite imyaka 15+ n’abuzukuru 6 banditse.'
    },
    lineageNotes: {
      en: 'Direct lineage branch with 6 grandchildren registered in preliminary audit report.',
      sw: 'Nasaba ya moja kwa moja yenye wajukuu 6 waliorekodiwa katika ripoti ya awali ya ukaguzi.',
      rw: 'Igisekuru cy’umuryango wa hafi gifite abuzukuru 6 banditse muri raporo y’ibanze.'
    }
  },
  {
    id: 'branch-mugunda-tausi',
    code: 'BR-08',
    name: 'Mugunda Rashid & Nyiramukarani Tausi Family',
    swahiliName: 'Familia ya Mugunda Rashid & Nyiramukarani Tausi',
    kinyarwandaName: 'Umuryango wa Mugunda Rashid & Nyiramukarani Tausi',
    reportedCount15Plus: 108,
    status: 'reported_audit',
    primaryLocation: 'Kamembe, Rwanda / Regional & Diaspora',
    sourceDocumentRef: 'Ripoti ya Ukaguzi — Sehemu ya 8',
    grandchildrenCount: 8,
    grandchildren: MUGUNDA_TAUSI_GRANDCHILDREN,
    summary: {
      en: 'Major family section with 108 submitted members aged 15+ and 8 registered grandchildren entries. Individual grandchild counts remain unavailable as specified in the audit.',
      sw: 'Sehemu kubwa ya familia yenye wanachama 108 waliowasilishwa wenye miaka 15+ na wajukuu 8. Idadi ya mtu mmoja mmoja bado haipatikani kama ilivyoelezwa katika ukaguzi.',
      rw: 'Igice gikuru cy’umuryango gifite abanyamuryango 108 n’abuzukuru 8 banditse. Imibare ya buri muntu ntabwo iraboneka nk’uko biteganyijwe mu ibarura.'
    },
    lineageNotes: {
      en: 'Official submitted section with 8 named grandchildren. Individual counts remain unavailable in accordance with the audit source.',
      sw: 'Sehemu iliyowasilishwa rasmi yenye wajukuu 8. Idadi za kibinafsi bado hazijawekwa kulingana na ripoti ya ukaguzi.',
      rw: 'Igice cyatanzwe gifite abuzukuru 8. Imibare ya buri muntu ku giti cye ntiyanditswe mu ibarura ry’ibanze.'
    }
  }
];

/**
 * AUTHENTIC THREE-GENERATION HERITAGE GATE ROOT (LEVELS 0 - 2 ONLY)
 * Strictly preserves Level 0 Patriarch, 8 Level 1 Branches, and all 82 named Level 2 grandchildren.
 * Zero unverified or fabricated Level 3+ descendants.
 */
export const DESCENDANT_TREE_ROOT: DescendantNode = {
  id: 'nr-root-0',
  fullName: 'NYANGE RADJABU',
  gender: 'male',
  generationLevel: 0,
  branchId: 'patriarch-root',
  branchName: 'Original Family Patriarch',
  location: 'Kamembe, Rwanda & Burundi',
  verificationStatus: 'verified_audit_record',
  note: {
    en: 'Level 0 Lineage Patriarch. Root founder of all branches.',
    sw: 'Babu wa Nasaba Ngazi ya 0. Mwanzilishi wa familia zote.',
    rw: 'Umukurambere w’Igisekuru ku rwego rwa 0. Inkomoko y’imiryango yose.'
  },
  children: FAMILY_BRANCHES.map((b) => ({
    id: `node-${b.id}`,
    fullName: b.name,
    gender: b.id.includes('mariam') || b.id.includes('mama-omari') ? 'female' : 'male',
    generationLevel: 1,
    branchId: b.id,
    branchName: b.name,
    location: b.primaryLocation,
    verificationStatus: 'verified_audit_record',
    note: {
      en: `Level 1 child branch of Babu Nyange Radjabu. ${b.reportedCount15Plus} recorded members aged 15+.`,
      sw: `Tawi la ngazi ya 1 la mtoto wa Babu Nyange Radjabu. Wanachama ${b.reportedCount15Plus} waliorekodiwa wenye miaka 15+.`,
      rw: `Igice cyo ku rwego rwa 1 cy’umwana wa Babu Nyange Radjabu. Abanyamuryango ${b.reportedCount15Plus} bafite imyaka 15+.`
    },
    children: getGrandchildrenByBranch(b.id).map((gc) => ({
      id: `node-${gc.id}`,
      fullName: gc.fullName,
      gender: 'unspecified',
      generationLevel: 2,
      branchId: gc.branchId,
      branchName: gc.branchName,
      location: gc.location || 'Kamembe, Rwanda',
      verificationStatus: 'verified_audit_record',
      note: {
        en: `Level 2 grandchild (#${gc.orderNumber} in ${b.name}). ${gc.reportedFamilyCount15Plus !== undefined ? `${gc.reportedFamilyCount15Plus} members aged 15+` : 'Individual count unavailable in audit'}.`,
        sw: `Mjukuu ngazi ya 2 (#${gc.orderNumber} katika ${b.name}).`,
        rw: `Umwuzukuru ku rwego rwa 2 (#${gc.orderNumber} muri ${b.name}).`
      },
      children: [] // Terminal leaf at Level 2! Strictly zero fabricated descendants.
    }))
  }))
};

export const UNRECORDED_BRANCHES_NOTE = {
  en: 'Important Note: The official report indicates that 7 families of the grandfather’s children have not yet submitted their census numbers. The platform is actively awaiting submissions to ensure complete genealogical inclusion.',
  sw: 'Ujumbe Muhimu: Ripoti rasmi inaeleza kuwa familia 7 za watoto wa babu bado hazijawasilisha idadi ya watu wao. Jukwaa hili linasubiri taarifa zao ili kukamilisha nasaba nzima ya familia.',
  rw: 'Icyitonderwa cy’ingenzi: Raporo yemewe igaragaza ko indi miryango 7 y’abana ba sogokuru itaratanga imibare y’abantu bayo. Uru rubuga rurakomeza gutegereza amakuru yabo kugira ngo ibarura ryuzure.'
};

export const FAMILY_VALUES = [
  {
    id: 'faith',
    title: {
      en: 'Faith & Islamic Values',
      sw: 'Imani & Maadili ya Kiislamu',
      rw: 'Ukwemera & Indangagaciro za Kisilamu'
    },
    desc: {
      en: 'Living with steadfast faith in Allah, integrity, righteousness, and upright moral character as taught and lived by Babu Nyange Radjabu.',
      sw: 'Kuishi kwa imani thabiti kwa Mwenyezi Mungu, uadilifu, na tabia njema kama alivyofundisha na kuishi Babu Nyange Radjabu.',
      rw: 'Kubaho ufite ukwemera gushyitse mu Mana, ubunyangamugayo n’imyifatire myiza nk’uko Babu Nyange Radjabu yabitoje akanabibaho.'
    }
  },
  {
    id: 'unity',
    title: {
      en: 'Family Unity & Solidarity',
      sw: 'Umoja wa Familia & Mshikamano',
      rw: 'Ubumwe bw’Umuryango & Ubufatanye'
    },
    desc: {
      en: 'Preserving fraternal bonds, mutual support across branches and borders, and maintaining cohesive family ties across all generations.',
      sw: 'Kudumisha undugu, kusaidiana kati ya pande zote na mipakani, na kulinda uhusiano wa kifamilia kwa vizazi vyote.',
      rw: 'Gusigasira ubuvandimwe, gufashanya hagati y’imiryango no hejuru y’imbibi, no kurinda ubumwe bw’abakomoka bose.'
    }
  },
  {
    id: 'generosity',
    title: {
      en: 'Generosity & Compassion',
      sw: 'Ukarimu & Huruma',
      rw: 'Ubugwaneza & Impuhwe'
    },
    desc: {
      en: 'Emulating the patriarch’s spirit of extending an open hand to those in need, taking care of relatives, widows, and vulnerable community members.',
      sw: 'Kufuata mfano wa ukarimu wa babu wa kunyoosha mkono kwa wenye shida, kuwajali jamaa, wajane na jamii kwa ujumla.',
      rw: 'Gukurikiza urugero rw’umutima w’ubugwaneza wa sogokuru wo gufasha abatishoboye, kwita ku bavandimwe n’abapfakazi.'
    }
  },
  {
    id: 'responsibility',
    title: {
      en: 'Responsibility & Family Care',
      sw: 'Wajibu & Utunzaji wa Familia',
      rw: 'Inshingano & Kwita ku Muryango'
    },
    desc: {
      en: 'Ensuring that every family member, child, and household is nurtured, educated, and protected with enduring dignity.',
      sw: 'Kuhakikisha kila mwanachama, mtoto na kaya inatunzwa, kulelewa na kulindwa kwa heshima na utu.',
      rw: 'Gukora uko bishoboka kose ngo buri munyamuryango, umwana n’urugo bitabweho, barerwe kandi barindwe mu cyubahiro.'
    }
  },
  {
    id: 'heritage',
    title: {
      en: 'Rwandan Heritage & Dignity',
      sw: 'Urithi wa Kinyarwanda & Heshima',
      rw: 'Umurage w’Umuco Nyarwanda & Agaciro'
    },
    desc: {
      en: 'Honoring our ancestral roots in Kamembe, Rwanda, preserving authentic family customs, language, and generational memory.',
      sw: 'Kuheshimu asili yetu ya Kamembe, Rwanda, kulinda mila halisi za familia, lugha, na kumbukumbu ya vizazi.',
      rw: 'Gusigasira amateka n’imizi y’abakurambere i Kamembe mu Rwanda, kubungabunga imico myiza y’umuryango n’ururimi.'
    }
  },
  {
    id: 'continuity',
    title: {
      en: 'Generational Continuity',
      sw: 'Mwendelezo wa Vizazi',
      rw: 'Ihererekanyamurage ry’Ibisekuru'
    },
    desc: {
      en: 'Building digital and physical archives so our children, grandchildren, and future descendants forever know their roots.',
      sw: 'Kujenga nyaraka za kidijitali na kumbukumbu ili watoto wetu, wajukuu na vizazi vijavyo vijue asili yao daima.',
      rw: 'Kubaka inyandiko z’ikoranabuhanga n’umurage kugira ngo abana bacu n’abazabakomokaho batazazima amateka yabo.'
    }
  }
];

export const GALLERY_ARCHIVES: GalleryItem[] = [
  {
    id: 'arch-doc-01',
    title: {
      en: 'Official Preliminary Family Audit Report (miaka 15+)',
      sw: 'Ripoti Rasmi ya Idadi ya Familia za Babu Nyange Rajabu — Toleo la Ukaguzi',
      rw: 'Raporo Yemewe y’Ibarura ry’Imiryango ya Babu Nyange Rajabu — Icyiciro cy’Igenzura'
    },
    category: 'archives',
    year: 'Source Document',
    contributor: 'Family Census Committee',
    isArchiveDocument: true,
    documentExcerpt: 'RIPOTI YA IDADI YA FAMILIA ZA BABU NYANGE RAJABU — TOLEO LA UKAGUZI — Miaka 15+\nTotal 398 recorded members across 8 listed branches.',
    placeholderType: 'document',
    description: {
      en: 'Official 3-page preliminary census and audit document documenting 398 family members aged 15 and above across 8 registered sections, noting 7 pending families.',
      sw: 'Nyaraka rasmi ya kurasa 3 ya ukaguzi wa awali inayoorodhesha wanachama 398 wa familia wenye miaka 15 na zaidi katika sehemu 8, ikibainisha familia 7 zinazosubiriwa.',
      rw: 'Inyandiko yemewe y’amapaji 3 y’ibarura ry’ibanze ryanditse abantu 398 bafite imyaka 15 no hejuru mu bice 8, inagaragaza imiryango 7 igitegerejwe.'
    }
  },
  {
    id: 'arch-land-02',
    title: {
      en: 'Historical Family Homesteads in Kamembe, Rwanda',
      sw: 'Makazi ya Kihistoria ya Familia huko Kamembe, Rwanda',
      rw: 'Ubutaka n’Amakuru y’Amateka y’Ingo z’Umuryango i Kamembe mu Rwanda'
    },
    category: 'historical',
    year: 'Historical Archive',
    contributor: 'Elder Lineage Registry',
    isArchiveDocument: true,
    documentExcerpt: 'Documented residency of Babu Nyange Radjabu in Kamembe, Cyangugu sector, Rwanda.',
    placeholderType: 'landscape',
    description: {
      en: 'Archival record tracing the historical settlement and homestead of Babu Nyange Radjabu in Kamembe, on the shores of Lake Kivu, Rwanda.',
      sw: 'Kumbukumbu ya nyaraka inayoelezea makazi ya kihistoria ya Babu Nyange Radjabu huko Kamembe, kando ya Ziwa Kivu, Rwanda.',
      rw: 'Inyandiko y’amateka igaragaza aho Babu Nyange Radjabu yari atuye i Kamembe ku nkengero z’Ikiyaga cya Kivu mu Rwanda.'
    }
  },
  {
    id: 'arch-burundi-03',
    title: {
      en: 'Memorial and Final Resting Heritage in Burundi',
      sw: 'Urithi wa Kumbukumbu na Hatua za Mwisho nchini Burundi',
      rw: 'Amateka y’Igihe cya Nyuma cy’Ubuzima bwa Nyange Radjabu mu Burundi'
    },
    category: 'historical',
    year: 'Historical Memorial',
    contributor: 'Heritage Preservation Secretariat',
    isArchiveDocument: true,
    placeholderType: 'emblem',
    description: {
      en: 'Historical documentation recording the final period of Babu Nyange Radjabu’s life in Burundi, his lasting legacy, and gravesite preservation protocols.',
      sw: 'Nyaraka za kihistoria zinazorekodi kipindi cha mwisho cha maisha ya Babu Nyange Radjabu nchini Burundi na heshima ya urithi wake.',
      rw: 'Inyandiko z’amateka zigaragaza igice cyanyuma cy’ubuzima bwa Babu Nyange Radjabu mu Burundi n’uburyo bwo gusigasira urwibutso rwe.'
    }
  },
  {
    id: 'arch-reunion-04',
    title: {
      en: 'Inter-Generational Family Assembly Archive',
      sw: 'Kumbukumbu ya Mkutano Mkuu wa Vizazi vya Familia',
      rw: 'Inyandiko n’Urwibutso rw’Inama Nkuru y’Abakomoka ku Muryango'
    },
    category: 'gatherings',
    year: 'Ongoing Archive',
    contributor: 'Family Assembly Committee',
    isArchiveDocument: false,
    placeholderType: 'gathering',
    description: {
      en: 'Dedicated archival collection awaiting verified high-resolution photographs from regional family reunions and gatherings.',
      sw: 'Kumbukumbu maalum inayongojea picha halisi zilizothibitishwa za mikutano na mikusanyiko ya kifamilia.',
      rw: 'Icyiciro cyahariwe kwakira amafoto yizewe kandi yemejwe y’amahuriro n’inama z’abanyamuryango bose.'
    }
  }
];

export const FAMILY_LEADERS: FamilyLeader[] = [
  {
    id: 'council-elders',
    role: {
      en: 'Council of Family Elders',
      sw: 'Baraza la Wazee wa Familia',
      rw: 'Inama y’Abakuru b’Umuryango'
    },
    name: 'Official Family Council (Representing all branches)',
    status: 'provisional_placeholder',
    responsibilities: {
      en: 'Custodianship of family values, dispute mediation, lineage verification, and preservation of the historical heritage of Babu Nyange Radjabu.',
      sw: 'Ulinzi wa maadili ya familia, usuluhishi, uthibitishaji wa nasaba, na uhifadhi wa urithi wa kihistoria wa Babu Nyange Radjabu.',
      rw: 'Kurinda indangagaciro z’umuryango, gukemura impaka, kwemeza ibisekuru, no kubungabunga umurage w’amateka wa Babu Nyange Radjabu.'
    },
    contactNotes: {
      en: 'Official contact point to be published following formal family assembly ratification.',
      sw: 'Mawasiliano rasmi yatatangazwa baada ya kuidhinishwa na mkutano mkuu wa familia.',
      rw: 'Aderesi yemewe izatangazwa nyuma yo kwemezwa n’inama nkuru y’umuryango.'
    }
  },
  {
    id: 'census-committee',
    role: {
      en: 'Census & Genealogy Secretariat',
      sw: 'Sekretarieti ya Sensa na Nasaba',
      rw: 'Ubunyamabanga bw’Ibarura n’Ibisekuru'
    },
    name: 'Preliminary Census & Verification Working Group',
    status: 'active',
    responsibilities: {
      en: 'Receiving new family records, verifying descendant submissions, coordinating with unsubmitted branches, and managing the digital family archive.',
      sw: 'Kupokea kumbukumbu mpya za familia, kuthibitisha taarifa za wazao, kuratibu na familia ambazo hazijawasilisha, na kusimamia kumbukumbu za kidijitali.',
      rw: 'Kwakira amakuru mashya y’abanyamuryango, kugenzura abakomoka, guhuza n’imiryango itaratanga imibare, no gucunga umurage w’ikoranabuhanga.'
    },
    contactNotes: {
      en: 'Direct submission via Record Me or Contact Us pages on this official platform.',
      sw: 'Wasilisha moja kwa moja kupitia ukurasa wa Niandikishe (Record Me) au Wasiliana Nasi.',
      rw: 'Ohereza amakuru ako kanya binyuze ku rupapuro rwa Nyandika (Record Me) cyangwa Twandikire.'
    }
  },
  {
    id: 'treasury-trustees',
    role: {
      en: 'Family Heritage & Welfare Trustees',
      sw: 'Wadhamini wa Urithi na Ustawi wa Familia',
      rw: 'Akanama k’Umutungo n’Imibereho Myiza y’Umuryango'
    },
    name: 'Welfare & Heritage Trust Committee',
    status: 'provisional_placeholder',
    responsibilities: {
      en: 'Overseeing family donations, elder support initiatives, ancestral site maintenance, and student welfare programmes.',
      sw: 'Kusimamia michango ya familia, huduma kwa wazee, utunzaji wa maeneo ya kihistoria, na kusaidia wanafunzi wa familia.',
      rw: 'Gucunga inkunga n’imisanzu y’umuryango, kwita ku bageze mu zabukuru, kubungabunga ahantu ndangamateka, no gufasha abanyeshuri.'
    },
    contactNotes: {
      en: 'Official financial accounts are presently undergoing verification by designated trustees.',
      sw: 'Akaunti rasmi za fedha zinathibitishwa na wadhamini walioteuliwa.',
      rw: 'Konti zemewe z’imari ziri mu nzira yo kwemezwa n’abashinzwe umutungo batoranyijwe.'
    }
  }
];
