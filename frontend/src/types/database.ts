// Database types for frontend
// Generated from Prisma schema

export type EquipmentType = 'DETECTOR' | 'GPS' | 'MAGNIFIER' | 'CATALOG' | 'STORAGE' | 'OTHER';
export type FindingVisibility = 'PRIVATE' | 'ANONYMOUS' | 'PUBLIC';
export type CollectorType = 'NUMISMATIST' | 'PHILATELIST' | 'MILITARIA' | 'DETECTORIST';
export type FindingType = 'COIN' | 'STAMP' | 'MILITARY' | 'TERRAIN' | 'GENERAL';
export type CustomFieldType = 'text' | 'number' | 'date' | 'select';

export interface User {
  id: string;
  email: string;
  nickname?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  contact?: string | null;
  experience?: string | null;
  collectorTypes: CollectorType[];
  onboardingCompleted: boolean;
  socialLinks: SocialLink[];
  favoriteLocations: FavoriteLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  userId: string;
  platform: string;
  url: string;
  createdAt: string;
}

export interface FavoriteLocation {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  notes?: string | null;
  createdAt: string;
}

export interface Equipment {
  id: string;
  userId: string;
  name: string;
  type: EquipmentType;
  manufacturer?: string | null;
  model?: string | null;
  notes?: string | null;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Finding {
  id: string;
  userId: string;
  title: string;
  latitude: number;
  longitude: number;
  date: string;
  description: string;
  category: string;
  
  // Typ nálezu (wizard)
  findingType: FindingType;
  
  // Existující rozšířená pole
  condition?: string | null;
  depth?: number | null;
  locationName?: string | null;
  historicalContext?: string | null;
  material?: string | null;
  
  // Univerzální pole (identifikace)
  period?: string | null;
  periodFrom?: number | null;
  periodTo?: number | null;
  dimensions?: string | null;
  weight?: number | null;
  
  // Specifická pole - COIN (numismatika - mince i bankovky)
  coinItemType?: string | null;
  denomination?: string | null;
  mintYear?: number | null;
  mint?: string | null;
  catalogNumber?: string | null;
  pickNumber?: string | null;
  grade?: string | null;
  series?: string | null;
  emission?: string | null;
  prefix?: string | null;
  signature?: string | null;
  securityFeatures?: string | null;
  
  // Specifická pole - STAMP (filatelie)
  stampYear?: number | null;
  stampCatalogNumber?: string | null;
  pofisNumber?: string | null;
  michelNumber?: string | null;
  stampItemType?: string | null;
  perforation?: string | null;
  printType?: string | null;
  cancellation?: string | null;
  paperType?: string | null;
  gumType?: string | null;
  watermark?: string | null;
  stampColor?: string | null;
  
  // Specifická pole - MILITARY (militárie)
  army?: string | null;
  conflict?: string | null;
  unit?: string | null;
  authenticity?: string | null;
  
  // Specifická pole - TERRAIN (detektoráři + archeologie)
  detectorSignal?: string | null;
  landType?: string | null;
  soilConditions?: string | null;
  stratigraphy?: string | null;
  context?: string | null;
  excavationMethod?: string | null;
  interpretation?: string | null;
  findingSituation?: string | null;
  
  // Provenience
  origin?: string | null;
  acquisitionMethod?: string | null;
  estimatedValue?: string | null;
  storageLocation?: string | null;
  
  visibility: FindingVisibility;
  isPublic?: boolean; // Legacy
  images: FindingImage[];
  equipment: Equipment[];
  customFieldValues?: CustomFieldValue[];
  user?: {
    id: string;
    nickname?: string | null;
    avatarUrl?: string | null;
  } | null;
  
  createdAt: string;
  updatedAt: string;
}

export interface FindingImage {
  id: string;
  findingId: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  filename: string;
  filesize: number;
  order: number;
  createdAt: string;
}

// API Request/Response types

export interface CreateProfileRequest {
  email: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  contact?: string;
  experience?: string;
  collectorTypes?: CollectorType[];
  onboardingCompleted?: boolean;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  favoriteLocations?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    notes?: string;
  }>;
}

export interface CreateEquipmentRequest {
  name: string;
  type: EquipmentType;
  manufacturer?: string;
  model?: string;
  notes?: string;
}

export interface UpdateEquipmentRequest {
  name?: string;
  type?: EquipmentType;
  manufacturer?: string;
  model?: string;
  notes?: string;
}

export interface CreateFindingRequest {
  title: string;
  latitude: number;
  longitude: number;
  date: string; // ISO datetime
  description: string;
  category: string;
  findingType?: FindingType;
  
  // Existující rozšířená pole
  condition?: string;
  depth?: number;
  locationName?: string;
  historicalContext?: string;
  material?: string;
  
  // Univerzální pole
  period?: string;
  periodFrom?: number;
  periodTo?: number;
  dimensions?: string;
  weight?: number;
  
  // Specifická pole - COIN (mince i bankovky)
  coinItemType?: string;
  denomination?: string;
  mintYear?: number;
  mint?: string;
  catalogNumber?: string;
  pickNumber?: string;
  grade?: string;
  series?: string;
  emission?: string;
  prefix?: string;
  signature?: string;
  securityFeatures?: string;
  
  // Specifická pole - STAMP
  stampYear?: number;
  stampCatalogNumber?: string;
  pofisNumber?: string;
  michelNumber?: string;
  stampItemType?: string;
  perforation?: string;
  printType?: string;
  cancellation?: string;
  paperType?: string;
  gumType?: string;
  watermark?: string;
  stampColor?: string;
  
  // Specifická pole - MILITARY
  army?: string;
  conflict?: string;
  unit?: string;
  authenticity?: string;
  
  // Specifická pole - TERRAIN (+ archeologie)
  detectorSignal?: string;
  landType?: string;
  soilConditions?: string;
  stratigraphy?: string;
  context?: string;
  excavationMethod?: string;
  interpretation?: string;
  findingSituation?: string;
  
  // Provenience
  origin?: string;
  acquisitionMethod?: string;
  estimatedValue?: string;
  storageLocation?: string;
  
  visibility?: FindingVisibility;
  isPublic?: boolean;
  equipmentIds?: string[];
  customFieldValues?: Array<{ customFieldId: string; value: string }>;
}

export interface UpdateFindingRequest {
  title?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  description?: string;
  category?: string;
  findingType?: FindingType;
  
  // Existující rozšířená pole
  condition?: string;
  depth?: number;
  locationName?: string;
  historicalContext?: string;
  material?: string;
  
  // Univerzální pole
  period?: string;
  periodFrom?: number;
  periodTo?: number;
  dimensions?: string;
  weight?: number;
  
  // Specifická pole - COIN (mince i bankovky)
  coinItemType?: string;
  denomination?: string;
  mintYear?: number;
  mint?: string;
  catalogNumber?: string;
  pickNumber?: string;
  grade?: string;
  series?: string;
  emission?: string;
  prefix?: string;
  signature?: string;
  securityFeatures?: string;
  
  // Specifická pole - STAMP
  stampYear?: number;
  stampCatalogNumber?: string;
  pofisNumber?: string;
  michelNumber?: string;
  stampItemType?: string;
  perforation?: string;
  printType?: string;
  cancellation?: string;
  paperType?: string;
  gumType?: string;
  watermark?: string;
  stampColor?: string;
  
  // Specifická pole - MILITARY
  army?: string;
  conflict?: string;
  unit?: string;
  authenticity?: string;
  
  // Specifická pole - TERRAIN (+ archeologie)
  detectorSignal?: string;
  landType?: string;
  soilConditions?: string;
  stratigraphy?: string;
  context?: string;
  excavationMethod?: string;
  interpretation?: string;
  findingSituation?: string;
  
  // Provenience
  origin?: string;
  acquisitionMethod?: string;
  estimatedValue?: string;
  storageLocation?: string;
  
  visibility?: FindingVisibility;
  isPublic?: boolean;
  equipmentIds?: string[];
  customFieldValues?: Array<{ customFieldId: string; value: string }>;
}

export interface UploadImageRequest {
  image: string; // base64 encoded
  filename: string;
}


// Feature Requests
export interface FeatureComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'PLANNED' | 'IN_PROGRESS' | 'DONE';
  authorId: string;
  authorName: string;
  votes: number;
  hasVoted: boolean;
  createdAt: string;
  comments: FeatureComment[];
}

export interface CreateFeatureRequest {
  title: string;
  description?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Map Setup
export interface MapSetupConfig {
  leftMapConfig: { source: string; archiveYear?: number | null };
  rightMapConfig: { source: string; archiveYear?: number | null };
  splitMode: 'vertical' | 'horizontal' | 'none';
  exaggeration: number;
  isKatastrActive: boolean;
  katastrOpacity: number;
  isVrstevniceActive: boolean;
  vrstevniceOpacity: number;
  visualFilters: {
    invert: number;
    contrast: number;
    saturation: number;
    brightness: number;
    hue: number;
    shadows: number;
  };
  filtersEnabled: boolean;
  viewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
  };
}

export interface MapSetup {
  id: string;
  name: string;
  config: MapSetupConfig;
  createdAt: string;
}

// Sector Planner Types
export type TrackStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: number[][];
}

export interface Sector {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  geometry: GeoJSONPolygon;
  stripWidth: number;
  walkingSpeed: number;
  tracks?: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  sectorId: string;
  geometry: GeoJSONLineString;
  status: TrackStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectorRequest {
  name: string;
  description?: string;
  geometry: GeoJSONPolygon;
  stripWidth?: number;
  walkingSpeed?: number;
}

export interface UpdateSectorRequest {
  name?: string;
  description?: string;
  geometry?: GeoJSONPolygon;
  stripWidth?: number;
  walkingSpeed?: number;
}

export interface CreateTracksRequest {
  sectorId: string;
  tracks: Array<{
    geometry: GeoJSONLineString;
    order: number;
  }>;
}

export interface UpdateTrackRequest {
  status?: TrackStatus;
}

// Custom Fields
export interface CustomField {
  id: string;
  userId: string;
  name: string;
  fieldType: CustomFieldType;
  options?: string | null; // Pro select: "Ano,Ne,Možná" (čárkou oddělené)
  icon?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValue {
  id: string;
  findingId: string;
  customFieldId: string;
  value: string;
  customField?: CustomField;
  createdAt: string;
}

export interface CreateCustomFieldRequest {
  name: string;
  fieldType: CustomFieldType;
  options?: string;
  icon?: string;
}

export interface UpdateCustomFieldRequest {
  name?: string;
  fieldType?: CustomFieldType;
  options?: string;
  icon?: string;
  order?: number;
}

