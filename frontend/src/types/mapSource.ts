// Typy zdrojů map pro L/R výběr

export type MapSourceType = 
  | 'LIDAR'      // LiDAR DMR5G (terén)
  | 'ORTOFOTO'   // Ortofoto ČÚZK (aktuální)
  | 'ARCHIVE'    // Archivní ortofoto ČÚZK (2007-2022)
  | 'SATELLITE'  // MapTiler Satelit (globální)
  | 'DARK'       // Tmavá mapa
  | 'CLASSIC';   // Klasická mapa

export interface MapSideConfig {
  source: MapSourceType;
  archiveYear?: number | null; // Pouze pro ARCHIVE
}

// Kategorie pro dropdown menu
export const MAP_SOURCE_CATEGORIES = {
  TEREN: {
    label: 'Terén',
    sources: ['LIDAR'] as MapSourceType[],
  },
  LETECKE: {
    label: 'Letecké snímky',
    sources: ['ORTOFOTO', 'ARCHIVE'] as MapSourceType[],
  },
  MAPY: {
    label: 'Mapové podklady',
    sources: ['SATELLITE', 'DARK', 'CLASSIC'] as MapSourceType[],
  },
} as const;

// Metadata pro jednotlivé zdroje
export const MAP_SOURCE_META: Record<MapSourceType, {
  label: string;
  shortLabel: string;
  icon: string; // Lucide icon name
  description: string;
}> = {
  LIDAR: {
    label: 'LiDAR DMR5G',
    shortLabel: 'LiDAR',
    icon: 'Mountain',
    description: '3D model terénu z laserového skenování',
  },
  ORTOFOTO: {
    label: 'Ortofoto ČÚZK',
    shortLabel: 'Ortofoto',
    icon: 'Image',
    description: 'Aktuální letecké snímky ČR',
  },
  ARCHIVE: {
    label: 'Archiv ČÚZK',
    shortLabel: 'Archiv',
    icon: 'Calendar',
    description: 'Historické letecké snímky 1998-2022',
  },
  SATELLITE: {
    label: 'Satelit',
    shortLabel: 'Satelit',
    icon: 'Globe',
    description: 'Globální satelitní snímky',
  },
  DARK: {
    label: 'Tmavá mapa',
    shortLabel: 'Tmavá',
    icon: 'Moon',
    description: 'Tmavý mapový podklad',
  },
  CLASSIC: {
    label: 'Klasická mapa',
    shortLabel: 'Klasická',
    icon: 'Map',
    description: 'Standardní mapový podklad',
  },
};

// Dostupné roky archivního ortofota (dle WMS Capabilities ČÚZK)
export const ARCHIVE_YEARS = [
  1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006,
  2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022
];

// Default konfigurace
export const DEFAULT_LEFT_CONFIG: MapSideConfig = {
  source: 'LIDAR',
};

export const DEFAULT_RIGHT_CONFIG: MapSideConfig = {
  source: 'ORTOFOTO',
};

