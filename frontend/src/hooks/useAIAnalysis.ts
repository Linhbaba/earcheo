import { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { FindingType } from '../utils/findingFieldsConfig';
import type { KnownInfo } from '../components/findings/KnownInfoInput';

export type AnalysisLevel = 'quick' | 'detailed' | 'expert';

// Mapování výsledku AI na pole formuláře
export interface AIAnalysisResult {
  // Detekce typu
  detectedType?: FindingType;
  typeConfidence?: number;
  
  // Základní
  title?: string;
  category?: string;
  description?: string;
  
  // Identifikace
  material?: string;
  period?: string;
  periodFrom?: number;
  periodTo?: number;
  condition?: string;
  dimensions?: string;
  weight?: number;
  historicalContext?: string;
  estimatedValue?: string;
  
  // Numismatika
  coinItemType?: string;
  denomination?: string;
  mintYear?: number;
  mint?: string;
  catalogNumber?: string;
  pickNumber?: string;
  grade?: string;
  
  // Filatelie
  stampYear?: number;
  stampCatalogNumber?: string;
  pofisNumber?: string;
  michelNumber?: string;
  stampItemType?: string;
  perforation?: string;
  printType?: string;
  stampColor?: string;
  
  // Militárie
  army?: string;
  conflict?: string;
  unit?: string;
  authenticity?: string;
  
  // Terén
  interpretation?: string;
  
  // Původ
  origin?: string;
  
  // Extra
  fullAnalysis?: string;
  sources?: string[];
}

interface AnalysisState {
  loading: boolean;
  error: string | null;
  result: AIAnalysisResult | null;
  tokensUsed: number;
  duration: number;
}

interface AnalyzeOptions {
  findingId?: string;
  imageUrls: string[];
  findingType: FindingType;
  level: AnalysisLevel;
  context?: KnownInfo;
}

export const useAIAnalysis = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    error: null,
    result: null,
    tokensUsed: 0,
    duration: 0,
  });

  const analyze = useCallback(async (options: AnalyzeOptions): Promise<AIAnalysisResult | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = await getAccessTokenSilently();
      
      // Pro existující nález použij findings API, jinak credits API
      const endpoint = options.findingId 
        ? `/api/findings/${options.findingId}/images?action=analyze`
        : '/api/credits';
      
      const body = options.findingId 
        ? {
            imageIds: [], // Použije všechny obrázky nálezu
            level: options.level,
            findingType: options.findingType,
            context: options.context ? {
              materialTags: options.context.materialTags,
              periodTags: options.context.periodTags,
              originTags: options.context.originTags,
              notes: options.context.notes,
            } : undefined,
          }
        : {
            action: 'analyze',
            images: options.imageUrls, // base64 nebo URL
            level: options.level,
            findingType: options.findingType,
            context: options.context ? {
              materialTags: options.context.materialTags,
              periodTags: options.context.periodTags,
              originTags: options.context.originTags,
              notes: options.context.notes,
            } : undefined,
          };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      
      setState({
        loading: false,
        error: null,
        result: data.result,
        tokensUsed: data.tokensUsed || 0,
        duration: data.duration || 0,
      });

      return data.result;
    } catch (error) {
      console.error('AI Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [getAccessTokenSilently]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      result: null,
      tokensUsed: 0,
      duration: 0,
    });
  }, []);

  return {
    analyze,
    reset,
    loading: state.loading,
    error: state.error,
    result: state.result,
    tokensUsed: state.tokensUsed,
    duration: state.duration,
  };
};

// Helper pro získání vyplněných polí z AI výsledku
export function getFilledFieldKeys(result: AIAnalysisResult): string[] {
  return Object.entries(result)
    .filter(([key, value]) => {
      // Ignoruj meta pole
      if (['detectedType', 'typeConfidence', 'fullAnalysis', 'sources'].includes(key)) {
        return false;
      }
      // Pole je vyplněné pokud není null/undefined/prázdný string
      return value !== null && value !== undefined && value !== '';
    })
    .map(([key]) => key);
}

