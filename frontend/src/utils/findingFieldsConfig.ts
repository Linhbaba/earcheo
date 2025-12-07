// Centrální konfigurace polí pro nálezy
// Všechna pole jsou definována zde pro snadnou správu

// Typy nálezů
export const FINDING_TYPES = {
  COIN: 'COIN',
  STAMP: 'STAMP',
  MILITARY: 'MILITARY',
  TERRAIN: 'TERRAIN',
  GENERAL: 'GENERAL',
} as const;

export type FindingType = typeof FINDING_TYPES[keyof typeof FINDING_TYPES];

// Metadata typů nálezů (label, ikona, barva)
export const FINDING_TYPE_META: Record<FindingType, {
  label: string;
  description: string;
  icon: string;
  color: {
    text: string;
    bg: string;
    border: string;
    hoverBorder: string;
    glow: string;
  };
}> = {
  COIN: {
    label: 'Mince / Numismatika',
    description: 'Mince, bankovky, medaile, žetony',
    icon: 'Coins',
    color: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      hoverBorder: 'hover:border-amber-500/50',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    },
  },
  STAMP: {
    label: 'Známka / Filatelie',
    description: 'Poštovní známky, obálky, celistvosti',
    icon: 'Mail',
    color: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-500/50',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
  },
  MILITARY: {
    label: 'Vojenský předmět',
    description: 'Odznaky, medaile, výstroj, dokumenty',
    icon: 'Medal',
    color: {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      hoverBorder: 'hover:border-red-500/50',
      glow: 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    },
  },
  TERRAIN: {
    label: 'Terénní nález',
    description: 'Detektorové nálezy, povrchové sběry',
    icon: 'Target',
    color: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      hoverBorder: 'hover:border-cyan-500/50',
      glow: 'group-hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]',
    },
  },
  GENERAL: {
    label: 'Obecný předmět',
    description: 'Veteš, starožitnosti, ostatní',
    icon: 'Package',
    color: {
      text: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      hoverBorder: 'hover:border-slate-500/50',
      glow: 'group-hover:shadow-[0_0_20px_rgba(148,163,184,0.2)]',
    },
  },
};

// Typy polí ve formuláři
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

// Definice jednoho pole
export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  suffix?: string; // např. "cm", "g"
  options?: string[]; // pro select
  forTypes: (FindingType | 'ALL')[]; // pro které typy nálezů se zobrazuje
  section: 'identification' | 'specific' | 'provenance'; // sekce ve formuláři
  order: number; // pořadí v sekci
}

// Centrální definice všech polí
export const FIELD_DEFINITIONS: FieldDefinition[] = [
  // === IDENTIFICATION (univerzální) ===
  {
    key: 'period',
    label: 'Období / Datace',
    type: 'text',
    placeholder: 'např. 19. století, Středověk',
    forTypes: ['ALL'],
    section: 'identification',
    order: 1,
  },
  {
    key: 'periodFrom',
    label: 'Rok od',
    type: 'number',
    placeholder: 'např. 1800',
    forTypes: ['ALL'],
    section: 'identification',
    order: 2,
  },
  {
    key: 'periodTo',
    label: 'Rok do',
    type: 'number',
    placeholder: 'např. 1900',
    forTypes: ['ALL'],
    section: 'identification',
    order: 3,
  },
  {
    key: 'dimensions',
    label: 'Rozměry',
    type: 'text',
    placeholder: 'např. 2.5 × 2.0 × 0.3 cm',
    forTypes: ['ALL'],
    section: 'identification',
    order: 4,
  },
  {
    key: 'weight',
    label: 'Hmotnost',
    type: 'number',
    placeholder: 'např. 12.5',
    suffix: 'g',
    forTypes: ['ALL'],
    section: 'identification',
    order: 5,
  },
  {
    key: 'material',
    label: 'Materiál',
    type: 'text',
    placeholder: 'např. stříbro, bronz, keramika',
    forTypes: ['ALL'],
    section: 'identification',
    order: 6,
  },
  {
    key: 'condition',
    label: 'Stav',
    type: 'text',
    placeholder: 'např. dobrý, poškozený',
    forTypes: ['ALL'],
    section: 'identification',
    order: 7,
  },

  // === COIN (numismatika - mince i bankovky) ===
  {
    key: 'coinItemType',
    label: 'Typ položky',
    type: 'select',
    options: ['', 'Mince', 'Bankovka', 'Medaile', 'Žeton', 'Notgeld'],
    forTypes: ['COIN'],
    section: 'specific',
    order: 1,
  },
  {
    key: 'denomination',
    label: 'Nominál',
    type: 'text',
    placeholder: 'např. 1 koruna, 100 Kč',
    forTypes: ['COIN'],
    section: 'specific',
    order: 2,
  },
  {
    key: 'mintYear',
    label: 'Rok ražby / vydání',
    type: 'number',
    placeholder: 'např. 1928',
    forTypes: ['COIN'],
    section: 'specific',
    order: 3,
  },
  {
    key: 'mint',
    label: 'Mincovna / Tiskárna',
    type: 'text',
    placeholder: 'např. Kremnica, STC',
    forTypes: ['COIN'],
    section: 'specific',
    order: 4,
  },
  {
    key: 'catalogNumber',
    label: 'Katalogové číslo',
    type: 'text',
    placeholder: 'např. KM#123, Šimek 456',
    forTypes: ['COIN'],
    section: 'specific',
    order: 5,
  },
  {
    key: 'pickNumber',
    label: 'Pick č. (bankovky)',
    type: 'text',
    placeholder: 'např. P-15, P-92a',
    forTypes: ['COIN'],
    section: 'specific',
    order: 6,
  },
  {
    key: 'grade',
    label: 'Kvalita / Grading',
    type: 'select',
    options: ['', 'G (Good)', 'VG (Very Good)', 'F (Fine)', 'VF (Very Fine)', 'XF (Extremely Fine)', 'AU (About Uncirculated)', 'UNC (Uncirculated)', 'Proof', 'PMG graded', 'PCGS graded'],
    forTypes: ['COIN'],
    section: 'specific',
    order: 7,
  },
  {
    key: 'series',
    label: 'Série',
    type: 'text',
    placeholder: 'např. A, B, první emise',
    forTypes: ['COIN'],
    section: 'specific',
    order: 8,
  },
  {
    key: 'emission',
    label: 'Emise',
    type: 'text',
    placeholder: 'např. 1993, první',
    forTypes: ['COIN'],
    section: 'specific',
    order: 9,
  },
  {
    key: 'prefix',
    label: 'Prefix série',
    type: 'text',
    placeholder: 'např. A01, B99',
    forTypes: ['COIN'],
    section: 'specific',
    order: 10,
  },
  {
    key: 'signature',
    label: 'Podpis',
    type: 'text',
    placeholder: 'např. guvernér XY',
    forTypes: ['COIN'],
    section: 'specific',
    order: 11,
  },
  {
    key: 'securityFeatures',
    label: 'Ochranné prvky',
    type: 'textarea',
    placeholder: 'např. vodoznak, hologram, proužek...',
    forTypes: ['COIN'],
    section: 'specific',
    order: 12,
  },

  // === STAMP (filatelie) ===
  {
    key: 'stampItemType',
    label: 'Typ položky',
    type: 'select',
    options: ['', 'Známka', 'Celistvost', 'FDC', 'Dopis', 'Výstřižek', 'Aršík', 'Kupón', 'Pohlednice'],
    forTypes: ['STAMP'],
    section: 'specific',
    order: 1,
  },
  {
    key: 'stampYear',
    label: 'Rok vydání',
    type: 'number',
    placeholder: 'např. 1918',
    forTypes: ['STAMP'],
    section: 'specific',
    order: 2,
  },
  {
    key: 'pofisNumber',
    label: 'Pofis č.',
    type: 'text',
    placeholder: 'např. 1, 125A',
    forTypes: ['STAMP'],
    section: 'specific',
    order: 3,
  },
  {
    key: 'michelNumber',
    label: 'Michel č.',
    type: 'text',
    placeholder: 'např. 123, 456A',
    forTypes: ['STAMP'],
    section: 'specific',
    order: 4,
  },
  {
    key: 'stampCatalogNumber',
    label: 'Jiný katalog',
    type: 'text',
    placeholder: 'např. Scott 123, Yvert 456',
    forTypes: ['STAMP'],
    section: 'specific',
    order: 5,
  },
  {
    key: 'perforation',
    label: 'Perforace / Zoubkování',
    type: 'text',
    placeholder: 'např. 14:13½, nezoubkovaná',
    forTypes: ['STAMP'],
    section: 'specific',
    order: 6,
  },
  {
    key: 'printType',
    label: 'Typ tisku',
    type: 'select',
    options: ['', 'Ocelotisk', 'Hlubotisk', 'Knihtisk', 'Ofset', 'Kombinovaný'],
    forTypes: ['STAMP'],
    section: 'specific',
    order: 7,
  },
  {
    key: 'stampColor',
    label: 'Barva',
    type: 'text',
    placeholder: 'např. modrá, červenohnědá',
    forTypes: ['STAMP'],
    section: 'specific',
    order: 8,
  },
  {
    key: 'paperType',
    label: 'Typ papíru',
    type: 'text',
    placeholder: 'např. křídový, obyčejný',
    forTypes: ['STAMP'],
    section: 'specific',
    order: 9,
  },
  {
    key: 'gumType',
    label: 'Lep',
    type: 'select',
    options: ['', 'Originální', 'Bez lepu', 'Přelep', 'Narušený'],
    forTypes: ['STAMP'],
    section: 'specific',
    order: 10,
  },
  {
    key: 'watermark',
    label: 'Vodoznak',
    type: 'text',
    placeholder: 'např. lipové listy, bez vodoznaku',
    forTypes: ['STAMP'],
    section: 'specific',
    order: 11,
  },
  {
    key: 'cancellation',
    label: 'Razítko',
    type: 'select',
    options: ['', 'Neražená', 'Denní razítko', 'Příležitostné razítko', 'Ručně (pero)', 'Strojové'],
    forTypes: ['STAMP'],
    section: 'specific',
    order: 12,
  },

  // === MILITARY (militárie) ===
  {
    key: 'army',
    label: 'Armáda / Země',
    type: 'text',
    placeholder: 'např. Wehrmacht, ČSLA, US Army',
    forTypes: ['MILITARY'],
    section: 'specific',
    order: 1,
  },
  {
    key: 'conflict',
    label: 'Konflikt / Období',
    type: 'text',
    placeholder: 'např. 1. sv. válka, Studená válka',
    forTypes: ['MILITARY'],
    section: 'specific',
    order: 2,
  },
  {
    key: 'unit',
    label: 'Jednotka',
    type: 'text',
    placeholder: 'např. 7. pěší pluk',
    forTypes: ['MILITARY'],
    section: 'specific',
    order: 3,
  },
  {
    key: 'authenticity',
    label: 'Autenticita',
    type: 'select',
    options: ['', 'Originál', 'Dobová reprodukce', 'Moderní reprodukce', 'Neověřeno'],
    forTypes: ['MILITARY'],
    section: 'specific',
    order: 4,
  },

  // === TERRAIN (detektoráři + archeologie) ===
  {
    key: 'depth',
    label: 'Hloubka nálezu',
    type: 'number',
    placeholder: 'např. 15',
    suffix: 'cm',
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 1,
  },
  {
    key: 'detectorSignal',
    label: 'Signál detektoru',
    type: 'text',
    placeholder: 'např. VDI 78, vysoký tón',
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 2,
  },
  {
    key: 'landType',
    label: 'Typ pozemku',
    type: 'select',
    options: ['', 'Pole (orná půda)', 'Louka', 'Les', 'Zahrada', 'Staveniště', 'Břeh vodního toku', 'Jiný'],
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 3,
  },
  {
    key: 'soilConditions',
    label: 'Půdní podmínky',
    type: 'text',
    placeholder: 'např. písčitá, jílovitá, kamenitá',
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 4,
  },
  {
    key: 'stratigraphy',
    label: 'Stratigrafie / Vrstva',
    type: 'text',
    placeholder: 'např. vrstva 3, SU 105',
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 5,
  },
  {
    key: 'context',
    label: 'Kontext (SU/sektor)',
    type: 'text',
    placeholder: 'např. sonda A, sektor 12',
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 6,
  },
  {
    key: 'excavationMethod',
    label: 'Metoda výzkumu',
    type: 'select',
    options: ['', 'Detektorový průzkum', 'Povrchový sběr', 'Sondáž', 'Plošný výzkum', 'Záchranný výzkum', 'Jiná'],
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 7,
  },
  {
    key: 'interpretation',
    label: 'Interpretace',
    type: 'textarea',
    placeholder: 'např. pravděpodobně středověká spona...',
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 8,
  },
  {
    key: 'findingSituation',
    label: 'Nálezová situace',
    type: 'text',
    placeholder: 'např. in situ, přemístěno orbou',
    forTypes: ['TERRAIN'],
    section: 'specific',
    order: 9,
  },

  // === PROVENANCE (pro všechny) ===
  {
    key: 'origin',
    label: 'Původ / Země',
    type: 'text',
    placeholder: 'např. Rakousko-Uhersko, Německo',
    forTypes: ['ALL'],
    section: 'provenance',
    order: 1,
  },
  {
    key: 'acquisitionMethod',
    label: 'Způsob získání',
    type: 'select',
    options: ['', 'Nález', 'Koupě', 'Dar', 'Dědictví', 'Výměna', 'Jiný'],
    forTypes: ['ALL'],
    section: 'provenance',
    order: 2,
  },
  {
    key: 'estimatedValue',
    label: 'Odhadovaná hodnota',
    type: 'text',
    placeholder: 'např. 500 Kč, neznámá',
    forTypes: ['ALL'],
    section: 'provenance',
    order: 3,
  },
  {
    key: 'storageLocation',
    label: 'Úložné místo',
    type: 'text',
    placeholder: 'např. Album č. 3, Vitrina',
    forTypes: ['ALL'],
    section: 'provenance',
    order: 4,
  },
  {
    key: 'historicalContext',
    label: 'Historický kontext',
    type: 'textarea',
    placeholder: 'Historické souvislosti, zajímavosti...',
    forTypes: ['ALL'],
    section: 'provenance',
    order: 5,
  },
];

// === HELPER FUNKCE ===

/**
 * Získá pole pro daný typ nálezu
 */
export function getFieldsForType(findingType: FindingType): FieldDefinition[] {
  return FIELD_DEFINITIONS
    .filter(field => field.forTypes.includes('ALL') || field.forTypes.includes(findingType))
    .sort((a, b) => a.order - b.order);
}

/**
 * Získá pole pro danou sekci a typ nálezu
 */
export function getFieldsForSection(
  findingType: FindingType,
  section: FieldDefinition['section']
): FieldDefinition[] {
  return getFieldsForType(findingType)
    .filter(field => field.section === section)
    .sort((a, b) => a.order - b.order);
}

/**
 * Získá všechna pole (pro případ kdy typ není vybrán)
 */
export function getAllFields(): FieldDefinition[] {
  return FIELD_DEFINITIONS.sort((a, b) => a.order - b.order);
}

/**
 * Získá všechny unikátní klíče polí (pro TypeScript typy)
 */
export function getAllFieldKeys(): string[] {
  return [...new Set(FIELD_DEFINITIONS.map(f => f.key))];
}

/**
 * Mapování CollectorType na FindingType (pro předvyplnění)
 */
export const COLLECTOR_TO_FINDING_TYPE: Record<string, FindingType> = {
  NUMISMATIST: 'COIN',
  PHILATELIST: 'STAMP',
  MILITARIA: 'MILITARY',
  DETECTORIST: 'TERRAIN',
};

/**
 * Získá výchozí typ nálezu podle typu sběratele
 */
export function getDefaultFindingType(collectorTypes: string[]): FindingType {
  if (collectorTypes.length === 0) {
    return 'GENERAL';
  }
  // Vrátí první mapovaný typ, nebo GENERAL
  for (const ct of collectorTypes) {
    if (COLLECTOR_TO_FINDING_TYPE[ct]) {
      return COLLECTOR_TO_FINDING_TYPE[ct];
    }
  }
  return 'GENERAL';
}

// Typy pro custom fields
export type CustomFieldType = 'text' | 'number' | 'date' | 'select';

export const CUSTOM_FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Text',
  number: 'Číslo',
  date: 'Datum',
  select: 'Výběr z možností',
};

// Dostupné ikony pro custom fields
export const CUSTOM_FIELD_ICONS = [
  'Hash', 'Tag', 'Bookmark', 'Star', 'Heart', 'Flag',
  'Box', 'Archive', 'Folder', 'File', 'FileText', 'Image',
  'Calendar', 'Clock', 'MapPin', 'Navigation',
  'DollarSign', 'Euro', 'CreditCard', 'Wallet',
  'User', 'Users', 'Building', 'Home',
  'Link', 'Paperclip', 'Key', 'Lock',
  'Check', 'X', 'AlertCircle', 'Info',
] as const;
