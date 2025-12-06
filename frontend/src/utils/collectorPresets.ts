import type { CollectorType, EquipmentType } from '../types/database';

// Výchozí kategorie nálezů podle typu sběratele
export const CATEGORY_PRESETS: Record<CollectorType, string[]> = {
  NUMISMATIST: [
    'Mince', 'Bankovky', 'Medaile', 'Žetony', 'Plakety', 
    'Stříbrné mince', 'Zlaté mince', 'Antické mince', 'Středověké mince',
    'České mince', 'Zahraniční mince', 'Pamětní mince', 'Ceniny'
  ],
  PHILATELIST: [
    'Známky', 'Obálky FDC', 'Pohlednice', 'Celistvosti', 'Razítka',
    'Kolky', 'Nálepky', 'Telefonní karty', 'Aršíky', 'Příležitostné tisky',
    'Dopisnice', 'Poštovní průvodky', 'Celiny'
  ],
  MILITARIA: [
    'Odznaky', 'Medaile', 'Výstroj', 'Dokumenty', 'Zbraně', 'Helmy', 'Uniformy',
    'Nášivky', 'Knoflíky', 'Přezky', 'Vyznamenání', 'Hodnostní označení',
    'Plakety', 'Pamětní předměty', 'Součástky zbraní', 'Munice', 'Nábojnice'
  ],
  DETECTORIST: [
    'Mince', 'Šperky', 'Militaria', 'Keramika', 'Nástroje', 'Podkovy', 'Knoflíky',
    'Prsteny', 'Přezky', 'Fibuly', 'Křížky', 'Medailonky', 'Přívěsky',
    'Olověné plomby', 'Pečetidla', 'Zvonky', 'Nože', 'Klíče', 'Zámky',
    'Střepy', 'Projektily', 'Rolničky', 'Thimbles'
  ],
};

// Výchozí typy vybavení podle typu sběratele
export const EQUIPMENT_PRESETS: Record<CollectorType, EquipmentType[]> = {
  NUMISMATIST: ['MAGNIFIER', 'CATALOG', 'STORAGE', 'OTHER'],
  PHILATELIST: ['MAGNIFIER', 'CATALOG', 'STORAGE', 'OTHER'],
  MILITARIA: ['CATALOG', 'STORAGE', 'OTHER'],
  DETECTORIST: ['DETECTOR', 'GPS', 'OTHER'],
};

// Názvy typů vybavení v češtině
export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  DETECTOR: 'Detektor kovů',
  GPS: 'GPS zařízení',
  MAGNIFIER: 'Lupa / Mikroskop',
  CATALOG: 'Katalog',
  STORAGE: 'Úložný systém',
  OTHER: 'Ostatní',
};

// Popis typů vybavení
export const EQUIPMENT_TYPE_DESCRIPTIONS: Record<EquipmentType, string> = {
  DETECTOR: 'Detektory kovů pro terénní hledání',
  GPS: 'GPS navigace a lokalizační zařízení',
  MAGNIFIER: 'Lupy, mikroskopy a optická zařízení',
  CATALOG: 'Katalogy, příručky a referenční materiály',
  STORAGE: 'Alba, boxy, kazety a úložné systémy',
  OTHER: 'Další vybavení a nástroje',
};

// Získání všech relevantních kategorií podle typů sběratele uživatele
export function getCategoriesForCollectorTypes(collectorTypes: CollectorType[]): string[] {
  if (collectorTypes.length === 0) {
    // Pokud nemá vybrán žádný typ, vrátíme všechny kategorie
    const allCategories = new Set<string>();
    Object.values(CATEGORY_PRESETS).forEach(categories => {
      categories.forEach(cat => allCategories.add(cat));
    });
    return Array.from(allCategories).sort();
  }
  
  // Sloučíme kategorie ze všech vybraných typů
  const categories = new Set<string>();
  collectorTypes.forEach(type => {
    CATEGORY_PRESETS[type].forEach(cat => categories.add(cat));
  });
  
  return Array.from(categories).sort();
}

// Získání všech relevantních typů vybavení podle typů sběratele uživatele
export function getEquipmentTypesForCollectorTypes(collectorTypes: CollectorType[]): EquipmentType[] {
  if (collectorTypes.length === 0) {
    // Pokud nemá vybrán žádný typ, vrátíme všechny typy vybavení
    return ['DETECTOR', 'GPS', 'MAGNIFIER', 'CATALOG', 'STORAGE', 'OTHER'];
  }
  
  // Sloučíme typy vybavení ze všech vybraných typů
  const equipmentTypes = new Set<EquipmentType>();
  collectorTypes.forEach(type => {
    EQUIPMENT_PRESETS[type].forEach(eq => equipmentTypes.add(eq));
  });
  
  // Seřadíme podle pořadí v původním enum
  const order: EquipmentType[] = ['DETECTOR', 'GPS', 'MAGNIFIER', 'CATALOG', 'STORAGE', 'OTHER'];
  return order.filter(type => equipmentTypes.has(type));
}

// Názvy typů sběratelství v češtině
export const COLLECTOR_TYPE_LABELS: Record<CollectorType, string> = {
  NUMISMATIST: 'Numismatik',
  PHILATELIST: 'Filatelista',
  MILITARIA: 'Sběratel militárií',
  DETECTORIST: 'Detektorář',
};

// Krátké popisky typů sběratelství
export const COLLECTOR_TYPE_DESCRIPTIONS: Record<CollectorType, string> = {
  NUMISMATIST: 'Mince, bankovky a medaile',
  PHILATELIST: 'Poštovní známky a celistvosti',
  MILITARIA: 'Vojenské předměty a odznaky',
  DETECTORIST: 'Terénní hledání artefaktů',
};

// Barvy pro typy sběratelství (Tailwind classes)
export const COLLECTOR_TYPE_COLORS: Record<CollectorType, { text: string; bg: string; border: string }> = {
  NUMISMATIST: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  PHILATELIST: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  MILITARIA: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  DETECTORIST: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
};

// Ikony pro typy sběratelství (Lucide icon names)
export const COLLECTOR_TYPE_ICONS: Record<CollectorType, string> = {
  NUMISMATIST: 'Coins',
  PHILATELIST: 'Mail',
  MILITARIA: 'Medal',
  DETECTORIST: 'Target',
};

// Re-export from findingFieldsConfig for convenience
export { COLLECTOR_TO_FINDING_TYPE, getDefaultFindingType } from './findingFieldsConfig';

