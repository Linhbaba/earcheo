import OpenAI from 'openai';

// Inicializace OpenAI klienta
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Typy nálezů
export type FindingType = 'COIN' | 'STAMP' | 'MILITARY' | 'TERRAIN' | 'GENERAL' | 'UNKNOWN';
export type AnalysisLevel = 'quick' | 'detailed' | 'expert';

// Konfigurace modelů podle úrovně
export const MODEL_CONFIG: Record<AnalysisLevel, { model: string; maxTokens: number }> = {
  quick: { model: 'gpt-4o', maxTokens: 1000 },
  detailed: { model: 'gpt-4o', maxTokens: 2000 },
  expert: { model: 'gpt-4o', maxTokens: 4000 }, // o3-deep-research až bude dostupný
};

// Ceny v kreditech
export const CREDIT_COSTS: Record<AnalysisLevel, number> = {
  quick: 1,
  detailed: 5,
  expert: 25,
};

// Systémové prompty podle typu nálezu
const SYSTEM_PROMPTS: Record<FindingType, string> = {
  COIN: `Jsi expert numismatik s hlubokou znalostí mincí a bankovek z celého světa a všech období.
Analyzuj obrázky mince/bankovky a identifikuj:
- Typ položky (mince, bankovka, medaile, žeton)
- Nominál a měnu
- Rok ražby/vydání
- Mincovnu nebo tiskárnu
- Materiál
- Stav (grading: G, VG, F, VF, EF, AU, UNC)
- Katalogové číslo (Krause pro mince, Pick pro bankovky)
- Historický kontext
- Odhadovanou tržní hodnotu (rozsah v Kč)

Pokud jsou k dispozici obě strany (avers a revers), analyzuj obě.`,

  STAMP: `Jsi expert filatelista s hlubokou znalostí poštovních známek.
Analyzuj obrázek známky a identifikuj:
- Zemi vydání
- Rok vydání
- Katalogová čísla (Pofis pro ČS/ČR, Michel pro mezinárodní)
- Nominál
- Typ položky (známka, celistvost, FDC, aršík)
- Typ perforace (zoubkování)
- Typ tisku
- Barvu
- Stav (razítkovaná/nerazítkovaná, kvalita lepu)
- Historický kontext
- Odhadovanou tržní hodnotu`,

  MILITARY: `Jsi expert na vojenskou historii a militárie.
Analyzuj vojenský předmět a identifikuj:
- Typ předmětu
- Armádu/zemi původu
- Období/konflikt (např. 1. sv. válka, 2. sv. válka)
- Jednotku (pokud je identifikovatelná)
- Materiál
- Autenticitu (originál/replika)
- Stav
- Historický kontext
- Odhadovanou tržní hodnotu`,

  TERRAIN: `Jsi archeolog a expert na historické nálezy z terénu.
Analyzuj nález a identifikuj:
- Typ předmětu
- Odhadované období/dataci
- Materiál
- Možný účel/funkci
- Stav zachování
- Historický kontext
- Doporučení pro konzervaci
- Zajímavosti a podobné nálezy`,

  GENERAL: `Jsi expert na historické předměty a starožitnosti.
Analyzuj tento předmět a identifikuj:
- Typ předmětu
- Odhadované období
- Materiál
- Možný účel
- Stav
- Historický význam
- Odhadovanou hodnotu`,

  UNKNOWN: `Jsi expert na identifikaci historických předmětů a starožitností.
Nejprve urči, o jaký typ předmětu se jedná (mince, známka, militárie, terénní nález, nebo jiný).
Poté proveď detailní analýzu a identifikuj:
- Typ předmětu
- Období/dataci
- Materiál
- Účel/funkci
- Stav
- Historický kontext
- Odhadovanou hodnotu

Na začátku odpovědi uveď určený typ předmětu a míru jistoty (v procentech).`,
};

// JSON schema pro strukturovaný výstup
const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    // Detekce typu (pro UNKNOWN)
    detectedType: {
      type: 'string',
      enum: ['COIN', 'STAMP', 'MILITARY', 'TERRAIN', 'GENERAL'],
      description: 'Detekovaný typ nálezu',
    },
    typeConfidence: {
      type: 'number',
      description: 'Jistota určení typu (0-100)',
    },
    
    // Základní identifikace
    title: { type: 'string', description: 'Navržený název nálezu' },
    category: { type: 'string', description: 'Kategorie nálezu' },
    description: { type: 'string', description: 'Popis nálezu' },
    
    // Univerzální pole
    material: { type: 'string', description: 'Materiál' },
    period: { type: 'string', description: 'Období/datace (text)' },
    periodFrom: { type: 'integer', description: 'Rok od' },
    periodTo: { type: 'integer', description: 'Rok do' },
    condition: { type: 'string', description: 'Stav' },
    dimensions: { type: 'string', description: 'Rozměry' },
    weight: { type: 'number', description: 'Hmotnost v gramech' },
    historicalContext: { type: 'string', description: 'Historický kontext' },
    estimatedValue: { type: 'string', description: 'Odhadovaná hodnota' },
    
    // Numismatika
    coinItemType: { 
      type: 'string', 
      enum: ['Mince', 'Bankovka', 'Medaile', 'Žeton', 'Notgeld'],
      description: 'Typ položky' 
    },
    denomination: { type: 'string', description: 'Nominál' },
    mintYear: { type: 'integer', description: 'Rok ražby/vydání' },
    mint: { type: 'string', description: 'Mincovna/Tiskárna' },
    catalogNumber: { type: 'string', description: 'Katalogové číslo' },
    pickNumber: { type: 'string', description: 'Pick katalogové číslo (bankovky)' },
    grade: { 
      type: 'string', 
      enum: ['G (Good)', 'VG (Very Good)', 'F (Fine)', 'VF (Very Fine)', 'XF (Extremely Fine)', 'AU (About Uncirculated)', 'UNC (Uncirculated)', 'Proof', 'PMG graded', 'PCGS graded'],
      description: 'Kvalita/grading' 
    },
    // COIN bankovky - rozšíření
    series: { type: 'string', description: 'Série' },
    emission: { type: 'string', description: 'Emise' },
    prefix: { type: 'string', description: 'Prefix série' },
    signature: { type: 'string', description: 'Podpis' },
    securityFeatures: { type: 'string', description: 'Ochranné prvky' },
    
    // Filatelie
    stampYear: { type: 'integer', description: 'Rok vydání' },
    stampCatalogNumber: { type: 'string', description: 'Katalogové číslo' },
    pofisNumber: { type: 'string', description: 'Pofis katalogové číslo' },
    michelNumber: { type: 'string', description: 'Michel katalogové číslo' },
    stampItemType: { 
      type: 'string', 
      enum: ['Známka', 'Celistvost', 'FDC', 'Dopis', 'Výstřižek', 'Aršík', 'Kupón', 'Pohlednice'],
      description: 'Typ položky' 
    },
    perforation: { type: 'string', description: 'Perforace' },
    printType: { 
      type: 'string', 
      enum: ['Ocelotisk', 'Hlubotisk', 'Knihtisk', 'Ofset', 'Kombinovaný'],
      description: 'Typ tisku' 
    },
    stampColor: { type: 'string', description: 'Barva' },
    // STAMP rozšíření
    cancellation: { 
      type: 'string', 
      enum: ['Neražená', 'Denní razítko', 'Příležitostné razítko', 'Ručně (pero)', 'Strojové'],
      description: 'Razítko' 
    },
    paperType: { type: 'string', description: 'Typ papíru' },
    gumType: { 
      type: 'string', 
      enum: ['Originální', 'Bez lepu', 'Přelep', 'Narušený'],
      description: 'Lep' 
    },
    watermark: { type: 'string', description: 'Vodoznak' },
    
    // Militárie
    army: { type: 'string', description: 'Armáda/země' },
    conflict: { type: 'string', description: 'Konflikt/období' },
    unit: { type: 'string', description: 'Jednotka' },
    authenticity: { 
      type: 'string', 
      enum: ['Originál', 'Dobová reprodukce', 'Moderní reprodukce', 'Neověřeno'],
      description: 'Autenticita' 
    },
    
    // Terén
    interpretation: { type: 'string', description: 'Interpretace nálezu' },
    
    // Původ
    origin: { type: 'string', description: 'Původ/země' },
    
    // Plný text analýzy
    fullAnalysis: { type: 'string', description: 'Kompletní textová analýza' },
    
    // Zdroje (pro expert level)
    sources: {
      type: 'array',
      items: { type: 'string' },
      description: 'Zdroje a reference',
    },
  },
  required: ['title', 'fullAnalysis'],
};

// Rozhraní pro výsledek analýzy
export interface AnalysisResult {
  detectedType?: FindingType;
  typeConfidence?: number;
  title: string;
  category?: string;
  description?: string;
  material?: string;
  period?: string;
  periodFrom?: number;
  periodTo?: number;
  condition?: string;
  dimensions?: string;
  weight?: number;
  historicalContext?: string;
  estimatedValue?: string;
  coinItemType?: string;
  denomination?: string;
  mintYear?: number;
  mint?: string;
  catalogNumber?: string;
  pickNumber?: string;
  grade?: string;
  stampYear?: number;
  stampCatalogNumber?: string;
  pofisNumber?: string;
  michelNumber?: string;
  stampItemType?: string;
  perforation?: string;
  printType?: string;
  stampColor?: string;
  // STAMP rozšíření
  cancellation?: string;
  paperType?: string;
  gumType?: string;
  watermark?: string;
  // Militárie
  army?: string;
  conflict?: string;
  unit?: string;
  authenticity?: string;
  interpretation?: string;
  origin?: string;
  fullAnalysis: string;
  sources?: string[];
  // COIN bankovky
  series?: string;
  emission?: string;
  prefix?: string;
  signature?: string;
  securityFeatures?: string;
}

// Rozhraní pro kontext od uživatele
export interface UserContext {
  materialTags?: string[];
  periodTags?: string[];
  originTags?: string[];
  notes?: string;
  location?: string;
}

// Hlavní funkce pro analýzu
export async function analyzeImages(
  imageUrls: string[],
  findingType: FindingType,
  level: AnalysisLevel,
  userContext?: UserContext
): Promise<{ result: AnalysisResult; tokensUsed: number }> {
  const config = MODEL_CONFIG[level];
  const systemPrompt = buildSystemPrompt(findingType, level, userContext);
  
  // Sestavení zprávy s obrázky
  const imageContent = imageUrls.map((url, index) => ({
    type: 'image_url' as const,
    image_url: {
      url,
      detail: level === 'quick' ? 'low' as const : 'high' as const,
    },
  }));
  
  const userMessage = buildUserMessage(findingType, imageUrls.length, userContext);

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          ...imageContent,
          { type: 'text', text: userMessage },
        ],
      },
    ],
    max_tokens: config.maxTokens,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'finding_analysis',
        schema: ANALYSIS_SCHEMA,
        strict: false,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  let result: AnalysisResult;
  try {
    result = JSON.parse(content) as AnalysisResult;
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Invalid response format from AI');
  }
  
  const tokensUsed = response.usage?.total_tokens || 0;

  return { result, tokensUsed };
}

// Pomocná funkce pro sestavení systémového promptu
function buildSystemPrompt(
  findingType: FindingType,
  level: AnalysisLevel,
  userContext?: UserContext
): string {
  let prompt = SYSTEM_PROMPTS[findingType];
  
  if (level === 'expert') {
    prompt += `\n\nProveď důkladnou expertní analýzu. Uveď zdroje a reference, pokud jsou známé.
Poskytni co nejpřesnější katalogová čísla a odhad hodnoty.`;
  }
  
  prompt += `\n\nOdpověz ve strukturovaném JSON formátu v češtině.`;
  
  return prompt;
}

// Pomocná funkce pro sestavení uživatelské zprávy
function buildUserMessage(
  findingType: FindingType,
  imageCount: number,
  userContext?: UserContext
): string {
  let message = 'Analyzuj ';
  
  if (findingType === 'COIN' && imageCount >= 2) {
    message += 'tuto minci. První obrázek je avers (líc), druhý revers (rub).';
  } else if (findingType === 'STAMP' && imageCount >= 2) {
    message += 'tuto známku. První obrázek je přední strana, druhý zadní strana.';
  } else {
    message += 'tento nález.';
  }
  
  if (userContext) {
    const contextParts: string[] = [];
    
    if (userContext.materialTags?.length) {
      contextParts.push(`Materiál (odhad uživatele): ${userContext.materialTags.join(', ')}`);
    }
    if (userContext.periodTags?.length) {
      contextParts.push(`Období (odhad uživatele): ${userContext.periodTags.join(', ')}`);
    }
    if (userContext.originTags?.length) {
      contextParts.push(`Původ (odhad uživatele): ${userContext.originTags.join(', ')}`);
    }
    if (userContext.notes) {
      contextParts.push(`Poznámky uživatele: "${userContext.notes}"`);
    }
    if (userContext.location) {
      contextParts.push(`Místo nálezu: ${userContext.location}`);
    }
    
    if (contextParts.length > 0) {
      message += '\n\nKontext od uživatele:\n' + contextParts.join('\n');
      message += '\n\nPotvrď nebo vyvrať hypotézy uživatele.';
    }
  }
  
  return message;
}

// Funkce pro odhad ceny před analýzou
export function estimateCost(level: AnalysisLevel, imageCount: number): number {
  // Základní cena + bonus za více obrázků u expert úrovně
  let cost = CREDIT_COSTS[level];
  
  if (level === 'expert' && imageCount > 2) {
    cost += (imageCount - 2) * 5; // +5 kreditů za každý další obrázek
  }
  
  return cost;
}

