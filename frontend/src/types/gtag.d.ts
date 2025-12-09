// Google Analytics gtag type declarations

interface GtagEventParams {
  // Map click events
  lng?: number;
  lat?: number;
  zoom?: number;
  bearing?: number;
  pitch?: number;
  
  // Layer click events
  layer?: string;
  feature_id?: string | number;
  name?: string;
  type?: string;
  
  // Layer toggle events
  state?: 'on' | 'off';
  
  // Map move events
  center_lng?: number;
  center_lat?: number;
  
  // Generic params
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js' | 'set',
      targetId: string | Date,
      params?: GtagEventParams
    ) => void;
    dataLayer?: unknown[];
  }
}

export {};


