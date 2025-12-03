/**
 * GeoJSON Import/Export utilities
 */

import type { GeoJSONPolygon, GeoJSONLineString, Sector, Track } from '../types/database';

interface GeoJSONFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: GeoJSONPolygon | GeoJSONLineString | { type: string; coordinates: unknown };
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface ImportedSector {
  name: string;
  description?: string;
  geometry: GeoJSONPolygon;
  tracks: Array<{
    geometry: GeoJSONLineString;
    order: number;
    status?: string;
  }>;
}

/**
 * Import GeoJSON file content and extract sector data
 */
export function importGeoJSON(content: string): ImportedSector | null {
  try {
    const data = JSON.parse(content);
    
    // Handle FeatureCollection
    if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      return parseFeatureCollection(data as GeoJSONFeatureCollection);
    }
    
    // Handle single Feature (polygon only)
    if (data.type === 'Feature' && data.geometry?.type === 'Polygon') {
      return {
        name: data.properties?.name || 'Importovaný sektor',
        description: data.properties?.description,
        geometry: data.geometry as GeoJSONPolygon,
        tracks: [],
      };
    }
    
    // Handle raw Polygon
    if (data.type === 'Polygon' && Array.isArray(data.coordinates)) {
      return {
        name: 'Importovaný sektor',
        geometry: data as GeoJSONPolygon,
        tracks: [],
      };
    }
    
    return null;
  } catch (err) {
    console.error('Failed to parse GeoJSON:', err);
    return null;
  }
}

/**
 * Parse FeatureCollection to extract sector and tracks
 */
function parseFeatureCollection(fc: GeoJSONFeatureCollection): ImportedSector | null {
  let sectorGeometry: GeoJSONPolygon | null = null;
  let sectorName = 'Importovaný sektor';
  let sectorDescription: string | undefined;
  const tracks: ImportedSector['tracks'] = [];
  
  for (const feature of fc.features) {
    const geom = feature.geometry;
    
    if (geom.type === 'Polygon') {
      // This is the sector polygon
      sectorGeometry = geom as GeoJSONPolygon;
      sectorName = (feature.properties?.name as string) || sectorName;
      sectorDescription = feature.properties?.description as string | undefined;
    } else if (geom.type === 'LineString') {
      // This is a track
      tracks.push({
        geometry: geom as GeoJSONLineString,
        order: typeof feature.properties?.order === 'number' ? feature.properties.order : tracks.length,
        status: feature.properties?.status as string | undefined,
      });
    }
  }
  
  if (!sectorGeometry) {
    return null;
  }
  
  // Sort tracks by order
  tracks.sort((a, b) => a.order - b.order);
  
  return {
    name: sectorName,
    description: sectorDescription,
    geometry: sectorGeometry,
    tracks,
  };
}

/**
 * Export sector and tracks to GeoJSON
 */
export function exportSectorToGeoJSON(sector: Sector, tracks: Track[]): string {
  const features: GeoJSONFeature[] = [
    // Sector polygon
    {
      type: 'Feature',
      properties: {
        name: sector.name,
        description: sector.description,
        type: 'sector',
        createdAt: sector.createdAt,
      },
      geometry: sector.geometry,
    },
    // Tracks
    ...tracks.map(track => ({
      type: 'Feature' as const,
      properties: {
        type: 'track',
        status: track.status,
        order: track.order,
      },
      geometry: track.geometry,
    })),
  ];
  
  const featureCollection: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    features,
  };
  
  return JSON.stringify(featureCollection, null, 2);
}

/**
 * Validate GeoJSON file content
 */
export function validateGeoJSON(content: string): { valid: boolean; error?: string } {
  try {
    const data = JSON.parse(content);
    
    if (data.type === 'FeatureCollection') {
      if (!Array.isArray(data.features)) {
        return { valid: false, error: 'FeatureCollection musí obsahovat pole features' };
      }
      
      const hasPolygon = data.features.some(
        (f: GeoJSONFeature) => f.geometry?.type === 'Polygon'
      );
      
      if (!hasPolygon) {
        return { valid: false, error: 'GeoJSON neobsahuje žádný polygon' };
      }
      
      return { valid: true };
    }
    
    if (data.type === 'Feature') {
      if (data.geometry?.type !== 'Polygon') {
        return { valid: false, error: 'Feature musí obsahovat polygon' };
      }
      return { valid: true };
    }
    
    if (data.type === 'Polygon') {
      return { valid: true };
    }
    
    return { valid: false, error: 'Nepodporovaný formát GeoJSON' };
  } catch {
    return { valid: false, error: 'Neplatný JSON formát' };
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Nepodařilo se načíst soubor'));
    reader.readAsText(file);
  });
}

