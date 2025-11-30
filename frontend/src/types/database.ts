// Database types for frontend
// Generated from Prisma schema

export type EquipmentType = 'DETECTOR' | 'GPS' | 'OTHER';

export interface User {
  id: string;
  email: string;
  nickname?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  contact?: string | null;
  experience?: string | null;
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
  
  // Extended fields
  condition?: string | null;
  depth?: number | null;
  locationName?: string | null;
  historicalContext?: string | null;
  material?: string | null;
  
  isPublic: boolean;
  images: FindingImage[];
  equipment: Equipment[];
  
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
  condition?: string;
  depth?: number;
  locationName?: string;
  historicalContext?: string;
  material?: string;
  isPublic?: boolean;
  equipmentIds?: string[];
}

export interface UpdateFindingRequest {
  title?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  description?: string;
  category?: string;
  condition?: string;
  depth?: number;
  locationName?: string;
  historicalContext?: string;
  material?: string;
  isPublic?: boolean;
  equipmentIds?: string[];
}

export interface UploadImageRequest {
  image: string; // base64 encoded
  filename: string;
}


// Feature Requests
export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'PLANNED' | 'IN_PROGRESS' | 'DONE';
  authorId: string;
  authorName: string;
  votes: number;
  votedBy: string[];
  hasVoted: boolean;
  createdAt: string;
  updatedAt: string;
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

