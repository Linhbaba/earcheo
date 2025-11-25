export interface VisualFilters {
  invert: number;      // % 0-100
  contrast: number;    // % 50-200
  saturation: number;  // % 50-200
  brightness: number;  // % 50-150
  hue: number;         // deg -180 to 180
  shadows: number;     // % 0-200 (zvýraznění stínů)
}

export const defaultVisualFilters: VisualFilters = {
  invert: 0,
  contrast: 100,
  saturation: 120,
  brightness: 100,
  hue: 0,
  shadows: 100,
};
