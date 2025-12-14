// Konfigurace AI analýzy

export type AnalysisLevel = 'none' | 'quick' | 'detailed' | 'expert';

// Ceny v kreditech
export const ANALYSIS_COSTS: Record<AnalysisLevel, number> = {
  none: 0,
  quick: 1,
  detailed: 5,
  expert: 25, // Přibližná cena, může se lišit
};

// Popisky úrovní
export const ANALYSIS_LEVEL_LABELS: Record<AnalysisLevel, string> = {
  none: 'Bez AI',
  quick: 'Rychlá analýza',
  detailed: 'Detailní analýza',
  expert: 'Expertní analýza',
};

// Pole která AI může vyplnit
export const AI_FILLABLE_FIELDS = [
  // Základní
  'title',
  'category',
  'description',
  
  // Identifikace
  'material',
  'period',
  'periodFrom',
  'periodTo',
  'condition',
  'dimensions',
  'weight',
  'historicalContext',
  'estimatedValue',
  
  // Numismatika
  'coinItemType',
  'denomination',
  'mintYear',
  'mint',
  'catalogNumber',
  'pickNumber',
  'grade',
  
  // Filatelie
  'stampYear',
  'stampCatalogNumber',
  'pofisNumber',
  'michelNumber',
  'stampItemType',
  'perforation',
  'printType',
  'stampColor',
  
  // Militárie
  'army',
  'conflict',
  'unit',
  'authenticity',
  
  // Terén
  'interpretation',
  
  // Původ
  'origin',
] as const;

export type AIFillableField = typeof AI_FILLABLE_FIELDS[number];

// Pole podle úrovně analýzy
export const FIELDS_BY_LEVEL: Record<AnalysisLevel, AIFillableField[]> = {
  none: [],
  quick: [
    'title',
    'category',
    'description',
    'material',
    'period',
    'condition',
  ],
  detailed: [
    'title',
    'category',
    'description',
    'material',
    'period',
    'periodFrom',
    'periodTo',
    'condition',
    'dimensions',
    'weight',
    'coinItemType',
    'denomination',
    'mintYear',
    'mint',
    'catalogNumber',
    'grade',
    'stampYear',
    'stampCatalogNumber',
    'stampItemType',
    'army',
    'conflict',
    'interpretation',
    'origin',
  ],
  expert: AI_FILLABLE_FIELDS as unknown as AIFillableField[],
};

// Odhadovaný čas analýzy
export const ANALYSIS_TIME_ESTIMATE: Record<AnalysisLevel, string> = {
  none: '-',
  quick: '~5 sekund',
  detailed: '~15 sekund',
  expert: '2-5 minut',
};

// Ověří, jestli má uživatel dost kreditů
export function canAffordAnalysis(balance: number, level: AnalysisLevel): boolean {
  return balance >= ANALYSIS_COSTS[level];
}

// Získá doporučenou úroveň podle zůstatku
export function getRecommendedLevel(balance: number): AnalysisLevel {
  if (balance >= 25) return 'expert';
  if (balance >= 5) return 'detailed';
  if (balance >= 1) return 'quick';
  return 'none';
}

