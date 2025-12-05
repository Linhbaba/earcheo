/**
 * Geometry utilities using Turf.js
 * All calculations happen in the browser
 */

import * as turf from '@turf/turf';
import type { GeoJSONPolygon, GeoJSONLineString } from '../types/database';

/**
 * Calculate area of a polygon in square meters
 */
export function calculateArea(polygon: GeoJSONPolygon): number {
  const feature = turf.polygon(polygon.coordinates);
  return turf.area(feature);
}

/**
 * Format area for display (m² or ha)
 */
export function formatArea(areaM2: number): string {
  if (areaM2 >= 10000) {
    return `${(areaM2 / 10000).toFixed(2)} ha`;
  }
  return `${Math.round(areaM2)} m²`;
}

/**
 * Calculate total length of line(s) in meters
 */
export function calculateLength(lineString: GeoJSONLineString): number {
  const feature = turf.lineString(lineString.coordinates);
  return turf.length(feature, { units: 'meters' });
}

/**
 * Format length for display (m or km)
 */
export function formatLength(lengthM: number): string {
  if (lengthM >= 1000) {
    return `${(lengthM / 1000).toFixed(2)} km`;
  }
  return `${Math.round(lengthM)} m`;
}

/**
 * Calculate optimal angle for strip generation using Minimum Bounding Rectangle
 * Returns angle in degrees and additional info for visualization
 */
export interface PolygonOrientationInfo {
  angle: number;           // Optimal rotation angle in degrees
  bearing: number;         // Bearing for strip direction
  bboxWidth: number;       // Width of rotated bbox in meters
  bboxHeight: number;      // Height of rotated bbox in meters
  numStrips: number;       // Estimated number of strips
}

export function calculatePolygonOrientation(
  polygon: GeoJSONPolygon,
  stripWidth: number = 3
): PolygonOrientationInfo {
  const feature = turf.polygon(polygon.coordinates);
  const coords = polygon.coordinates[0];
  
  // Find the optimal angle by analyzing polygon edges
  let bestAngle = 0;
  let minArea = Infinity;
  let bestWidth = 0;
  let bestHeight = 0;
  
  // Test angles based on each edge of the polygon
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    
    // Calculate edge angle using atan2
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const edgeAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Rotate polygon to align with this edge
    const rotated = turf.transformRotate(feature, -edgeAngle);
    const bbox = turf.bbox(rotated);
    
    const width = bbox[2] - bbox[0];
    const height = bbox[3] - bbox[1];
    const area = width * height;
    
    // Track the orientation with minimum bounding box area
    if (area < minArea) {
      minArea = area;
      bestAngle = edgeAngle;
      
      // Calculate actual dimensions in meters
      const corner1 = turf.point([bbox[0], bbox[1]]);
      const corner2 = turf.point([bbox[2], bbox[1]]);
      const corner3 = turf.point([bbox[0], bbox[3]]);
      
      bestWidth = turf.distance(corner1, corner2, { units: 'meters' });
      bestHeight = turf.distance(corner1, corner3, { units: 'meters' });
    }
  }
  
  // Ensure strips go along the shorter dimension for efficiency
  let bearing = bestAngle;
  let finalWidth = bestWidth;
  let finalHeight = bestHeight;
  
  if (bestWidth < bestHeight) {
    // Rotate 90° to strip along shorter dimension
    bearing = (bestAngle + 90) % 360;
    finalWidth = bestHeight;
    finalHeight = bestWidth;
  }
  
  const numStrips = Math.ceil(finalHeight / stripWidth);
  
  return {
    angle: bestAngle,
    bearing,
    bboxWidth: finalWidth,
    bboxHeight: finalHeight,
    numStrips,
  };
}

/**
 * Find the main axis (bearing) of a polygon
 * Uses the longest side of the minimum bounding rectangle
 */
export function findMainAxis(polygon: GeoJSONPolygon): number {
  const orientation = calculatePolygonOrientation(polygon);
  return orientation.bearing;
}

/**
 * Generate parallel strips across a polygon
 * Returns array of LineStrings representing the strips
 */
export function generateStrips(
  polygon: GeoJSONPolygon,
  stripWidth: number = 3,
  bearing?: number
): GeoJSONLineString[] {
  const feature = turf.polygon(polygon.coordinates);
  
  // Use provided bearing or calculate from polygon
  const mainBearing = bearing ?? findMainAxis(polygon);
  
  // Get bounding box and expand slightly
  const bbox = turf.bbox(feature);
  const bboxPolygon = turf.bboxPolygon(bbox);
  const buffered = turf.buffer(bboxPolygon, stripWidth * 2, { units: 'meters' });
  const expandedBbox = turf.bbox(buffered!);
  
  // Calculate diagonal length for line extension
  const diagonal = turf.distance(
    turf.point([expandedBbox[0], expandedBbox[1]]),
    turf.point([expandedBbox[2], expandedBbox[3]]),
    { units: 'meters' }
  );
  
  // Get center of the polygon
  const center = turf.center(feature);
  
  // Calculate perpendicular bearing for strip offset
  const perpBearing = (mainBearing + 90) % 360;
  
  // Determine how many strips we need
  const polygonWidth = calculatePolygonWidth(polygon, perpBearing);
  const numStrips = Math.ceil(polygonWidth / stripWidth) + 2;
  
  const strips: GeoJSONLineString[] = [];
  
  // Generate strips from one side to the other
  for (let i = -Math.floor(numStrips / 2); i <= Math.floor(numStrips / 2); i++) {
    const offset = i * stripWidth;
    
    // Offset the center point
    const offsetCenter = turf.destination(
      center,
      offset,
      perpBearing,
      { units: 'meters' }
    );
    
    // Create a long line through the offset center
    const start = turf.destination(
      offsetCenter,
      diagonal,
      mainBearing,
      { units: 'meters' }
    );
    const end = turf.destination(
      offsetCenter,
      diagonal,
      mainBearing + 180,
      { units: 'meters' }
    );
    
    const line = turf.lineString([
      start.geometry.coordinates,
      end.geometry.coordinates,
    ]);
    
    // Intersect with polygon
    const clipped = turf.lineIntersect(line, feature);
    
    if (clipped.features.length >= 2) {
      // Sort intersection points by distance along the line
      const points = clipped.features.map(f => f.geometry.coordinates as [number, number]);
      
      if (points.length >= 2) {
        // Create line segment(s) within the polygon
        const lineStartCoords = start.geometry.coordinates as [number, number];
        const lineEndCoords = end.geometry.coordinates as [number, number];
        const segments = createSegmentsFromIntersections(points, polygon, lineStartCoords, lineEndCoords);
        strips.push(...segments);
      }
    }
  }
  
  return strips;
}

/**
 * Calculate polygon width along a given bearing
 */
function calculatePolygonWidth(polygon: GeoJSONPolygon, _bearing: number): number {
  const feature = turf.polygon(polygon.coordinates);
  const bbox = turf.bbox(feature);
  
  // Create points at opposite corners
  const p1 = turf.point([bbox[0], bbox[1]]);
  const p2 = turf.point([bbox[2], bbox[3]]);
  
  // Project onto the perpendicular axis
  return turf.distance(p1, p2, { units: 'meters' });
}

/**
 * Create line segments from intersection points
 * Projects points along the line to ensure correct ordering
 */
function createSegmentsFromIntersections(
  points: [number, number][],
  polygon: GeoJSONPolygon,
  lineStart: [number, number],
  lineEnd: [number, number]
): GeoJSONLineString[] {
  if (points.length < 2) return [];
  
  // Sort points by their distance along the line direction
  const lineVector = [lineEnd[0] - lineStart[0], lineEnd[1] - lineStart[1]];
  
  points.sort((a, b) => {
    const projA = (a[0] - lineStart[0]) * lineVector[0] + (a[1] - lineStart[1]) * lineVector[1];
    const projB = (b[0] - lineStart[0]) * lineVector[0] + (b[1] - lineStart[1]) * lineVector[1];
    return projA - projB;
  });
  
  const segments: GeoJSONLineString[] = [];
  const polyFeature = turf.polygon(polygon.coordinates);
  
  // Check each consecutive pair - only keep segments whose midpoint is inside
  for (let i = 0; i < points.length - 1; i++) {
    const midpoint: [number, number] = [
      (points[i][0] + points[i + 1][0]) / 2,
      (points[i][1] + points[i + 1][1]) / 2,
    ];
    
    if (turf.booleanPointInPolygon(turf.point(midpoint), polyFeature)) {
      const lineString: GeoJSONLineString = {
        type: 'LineString',
        coordinates: [points[i], points[i + 1]],
      };
      segments.push(lineString);
    }
  }
  
  return segments;
}

/**
 * Create a snake route from strips (alternating direction)
 * Returns ordered array of LineStrings
 */
export function createSnakeRoute(strips: GeoJSONLineString[]): GeoJSONLineString[] {
  if (strips.length === 0) return [];
  
  // Sort strips by their midpoint (to get proper order)
  const sortedStrips = [...strips].sort((a, b) => {
    const midA = getMidpoint(a);
    const midB = getMidpoint(b);
    return midA[1] - midB[1]; // Sort by latitude
  });
  
  // Alternate direction for snake pattern
  return sortedStrips.map((strip, index) => {
    if (index % 2 === 1) {
      // Reverse every other strip
      return {
        type: 'LineString' as const,
        coordinates: [...strip.coordinates].reverse(),
      };
    }
    return strip;
  });
}

/**
 * Get midpoint of a LineString
 */
function getMidpoint(line: GeoJSONLineString): [number, number] {
  const coords = line.coordinates;
  const midIndex = Math.floor(coords.length / 2);
  return coords[midIndex] as [number, number];
}

/**
 * Calculate total length of all strips combined
 */
export function calculateTotalLength(strips: GeoJSONLineString[]): number {
  return strips.reduce((total, strip) => {
    return total + calculateLength(strip);
  }, 0);
}

/**
 * Convert coordinates array to GeoJSON Polygon
 */
export function coordsToPolygon(coords: [number, number][]): GeoJSONPolygon {
  // Ensure the polygon is closed
  const closedCoords = [...coords];
  if (
    closedCoords.length > 0 &&
    (closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
     closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1])
  ) {
    closedCoords.push(closedCoords[0]);
  }
  
  return {
    type: 'Polygon',
    coordinates: [closedCoords],
  };
}

/**
 * Check if a polygon is valid (has at least 3 unique points)
 */
export function isValidPolygon(coords: [number, number][]): boolean {
  if (coords.length < 3) return false;
  
  // Check for unique points
  const uniquePoints = new Set(coords.map(c => `${c[0]},${c[1]}`));
  return uniquePoints.size >= 3;
}

/**
 * Get center point of a polygon
 */
export function getPolygonCenter(polygon: GeoJSONPolygon): [number, number] {
  const feature = turf.polygon(polygon.coordinates);
  const center = turf.center(feature);
  return center.geometry.coordinates as [number, number];
}

/**
 * Get bounding box of a polygon
 */
export function getPolygonBbox(polygon: GeoJSONPolygon): [number, number, number, number] {
  const feature = turf.polygon(polygon.coordinates);
  return turf.bbox(feature) as [number, number, number, number];
}

/**
 * Validate GeoJSON structure
 */
export function isValidGeoJSON(obj: unknown): obj is GeoJSONPolygon | GeoJSONLineString {
  if (!obj || typeof obj !== 'object') return false;
  
  const geo = obj as { type?: string; coordinates?: unknown };
  
  if (!geo.type || !Array.isArray(geo.coordinates)) return false;
  
  if (geo.type === 'Polygon') {
    // Check polygon structure
    return (
      Array.isArray(geo.coordinates[0]) &&
      geo.coordinates[0].length >= 4 &&
      Array.isArray(geo.coordinates[0][0]) &&
      geo.coordinates[0][0].length === 2
    );
  }
  
  if (geo.type === 'LineString') {
    // Check linestring structure
    return (
      geo.coordinates.length >= 2 &&
      Array.isArray(geo.coordinates[0]) &&
      (geo.coordinates[0] as number[]).length === 2
    );
  }
  
  return false;
}

