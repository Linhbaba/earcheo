import OpenAI from 'openai';

// Inicializace OpenAI klienta
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Typy nálezů
export type FindingType = 'COIN' | 'STAMP' | 'MILITARY' | 'TERRAIN' | 'GENERAL' | 'UNKNOWN';
export type AnalysisLevel = 'quick' | 'detailed' | 'expert';

// Konfigurace modelů podle úrovně (aktualizováno pro 2025)
// Docs: https://platform.openai.com/docs/models/gpt-4.1
// Docs: https://platform.openai.com/docs/models/gpt-5.2
export const MODEL_CONFIG: Record<AnalysisLevel, { model: string; maxTokens: number; useWebSearch?: boolean }> = {
  quick: { model: 'gpt-4.1-mini', maxTokens: 1000 },      // Rychlý, levný pro základní analýzu
  detailed: { model: 'gpt-4.1', maxTokens: 2500 },        // Plný vision model pro detailní analýzu
  expert: { model: 'gpt-5.2', maxTokens: 8000, useWebSearch: true }, // GPT-5.2 Thinking s web search
};

// Ceny v kreditech
export const CREDIT_COSTS: Record<AnalysisLevel, number> = {
  quick: 5,
  detailed: 15,
  expert: 30,
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
  const userMessage = buildUserMessage(findingType, imageUrls.length, userContext);
  
  // Pro expert level použij Responses API s web search
  if (level === 'expert' && config.useWebSearch) {
    return analyzeWithWebSearch(imageUrls, systemPrompt, userMessage, config);
  }
  
  // Pro quick a detailed použij Chat Completions API
  return analyzeWithChatCompletions(imageUrls, systemPrompt, userMessage, level, config);
}

// Chat Completions API (quick, detailed)
async function analyzeWithChatCompletions(
  imageUrls: string[],
  systemPrompt: string,
  userMessage: string,
  level: AnalysisLevel,
  config: { model: string; maxTokens: number }
): Promise<{ result: AnalysisResult; tokensUsed: number }> {
  const imageContent = imageUrls.map((url) => ({
    type: 'image_url' as const,
    image_url: {
      url,
      detail: level === 'quick' ? 'low' as const : 'high' as const,
    },
  }));

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

// Responses API s web search (expert)
async function analyzeWithWebSearch(
  imageUrls: string[],
  systemPrompt: string,
  userMessage: string,
  config: { model: string; maxTokens: number }
): Promise<{ result: AnalysisResult; tokensUsed: number }> {
  // Sestavení input pro Responses API
  const inputContent: Array<{ type: string; image_url?: { url: string; detail: string }; text?: string }> = [];
  
  // Přidej obrázky
  for (const url of imageUrls) {
    inputContent.push({
      type: 'input_image',
      image_url: { url, detail: 'high' },
    });
  }
  
  // Přidej textový prompt
  inputContent.push({
    type: 'input_text',
    text: `${systemPrompt}\n\n${userMessage}\n\nVrať odpověď jako validní JSON objekt s těmito povinnými poli: title, fullAnalysis. Ostatní pole vyplň podle nálezu.`,
  });

  try {
    // Použij Responses API s web search
    const response = await openai.responses.create({
      model: config.model,
      input: inputContent as any,
      tools: [{ type: 'web_search' as any }],
      text: {
        format: {
          type: 'json_schema',
          name: 'finding_analysis',
          schema: ANALYSIS_SCHEMA,
          strict: false,
        },
      },
    } as any);

    // Extrahuj odpověď z Responses API
    let content = '';
    let tokensUsed = 0;
    
    // Responses API vrací output array
    if (response.output && Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === 'message' && item.content) {
          for (const contentItem of item.content) {
            if (contentItem.type === 'output_text') {
              content = contentItem.text;
            }
          }
        }
      }
    }
    
    // Fallback - zkus najít text přímo
    if (!content && (response as any).output_text) {
      content = (response as any).output_text;
    }

    if (!content) {
      throw new Error('No response content from Responses API');
    }

    // Parsuj JSON
    let result: AnalysisResult;
    try {
      // Zkus najít JSON v odpovědi (může být obalený textem)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]) as AnalysisResult;
      } else {
        result = JSON.parse(content) as AnalysisResult;
      }
    } catch (parseError) {
      console.error('Failed to parse Responses API response:', content);
      throw new Error('Invalid response format from AI');
    }

    // Odhadni tokeny (Responses API nevrací přesný počet)
    tokensUsed = Math.round((content.length + systemPrompt.length + userMessage.length) / 4);

    return { result, tokensUsed };
  } catch (error) {
    // Fallback na Chat Completions pokud Responses API selže
    console.warn('Responses API failed, falling back to Chat Completions:', error);
    return analyzeWithChatCompletions(imageUrls, systemPrompt, userMessage, 'detailed', config);
  }
}

// Pomocná funkce pro sestavení systémového promptu
function buildSystemPrompt(
  findingType: FindingType,
  level: AnalysisLevel,
  userContext?: UserContext
): string {
  let prompt = SYSTEM_PROMPTS[findingType];
  
  if (level === 'expert') {
    // Specifické expert instrukce podle typu
    const expertInstructions: Record<FindingType, string> = {
      COIN: `\n\n=== EXPERTNÍ NUMISMATICKÁ ANALÝZA ===
Proveď hloubkový výzkum s využitím webového vyhledávání:

📚 KATALOGY (vyhledej online):
- Krause World Coins - najdi přesné KM# číslo
- Pick Standard Catalog - pro bankovky P# číslo
- Numista.com - ověř varianty a vzácnost
- CoinArchives.com - najdi aukční výsledky

🔍 ANALÝZA:
1. Přesná identifikace (země, období, nominál, ročník)
2. Mincovna a mincmistr (značky)
3. Varianty a chyboražby
4. Náklad a vzácnost
5. Autenticita (známky falzifikátů)
6. Grading podle Sheldon scale

💰 HODNOTA (vyhledej aktuální ceny):
- Heritage Auctions, Stack's Bowers
- MA-Shops, VCoins
- Aukro.cz, Sběratel.cz
- Uveď cenové rozpětí podle stavu

📖 V poli 'sources' uveď všechny URL a reference.`,

      STAMP: `\n\n=== EXPERTNÍ FILATELISTICKÁ ANALÝZA ===
Proveď hloubkový výzkum s využitím webového vyhledávání:

📚 KATALOGY (vyhledej online):
- Pofis - pro ČS/ČR známky
- Michel - mezinárodní katalog
- Stanley Gibbons - britské známky
- Scott - americký katalog
- Colnect.com - databáze známek

🔍 ANALÝZA:
1. Přesná katalogová čísla (Pofis, Michel)
2. Typ tisku (ocelotisk, hlubotisk, ofset)
3. Perforace (měření zoubkování)
4. Papír a lep
5. Barva a odstíny
6. Vady a varietní tisky
7. Razítka (denní, příležitostné)

💰 HODNOTA (vyhledej aktuální ceny):
- Burda Auction, Merkur Revue
- Delcampe.net, Hipstamp
- Filatelie Klim
- Uveď ceny pro * a ** kvalitu

📖 V poli 'sources' uveď všechny URL a reference.`,

      MILITARY: `\n\n=== EXPERTNÍ ANALÝZA MILITÁRIÍ ===
Proveď hloubkový výzkum s využitím webového vyhledávání:

📚 DATABÁZE (vyhledej online):
- Wehrmacht-Awards.com
- Gentleman's Military Interest Club
- Deutsches Historisches Museum
- Imperial War Museum

🔍 ANALÝZA:
1. Přesná identifikace předmětu
2. Armáda, jednotka, hodnost
3. Období a konflikt
4. Výrobce a značení
5. Materiál a provedení
6. Autenticita (známky originality vs. repliky)
7. Provenance (historie vlastnictví)

💰 HODNOTA (vyhledej aktuální ceny):
- Hermann-Historica auctions
- Weitze.net
- Aukce militárií
- Srovnej s prodanými kusy

📖 V poli 'sources' uveď všechny URL a reference.`,

      TERRAIN: `\n\n=== EXPERTNÍ ARCHEOLOGICKÁ ANALÝZA ===
Proveď hloubkový výzkum s využitím webového vyhledávání:

📚 DATABÁZE (vyhledej online):
- Portable Antiquities Scheme (finds.org.uk)
- Archaeology Data Service
- Museum digitální sbírky
- Academia.edu - odborné články

🔍 ANALÝZA:
1. Typologické zařazení
2. Datace (absolutní i relativní)
3. Kulturní kontext
4. Analogie z publikovaných nálezů
5. Stav a patina
6. Doporučení pro konzervaci
7. Vědecký význam

💰 HODNOTA:
- Sbíratelská vs. vědecká hodnota
- Podobné nálezy v aukcích
- Timeline Auctions, Roma Numismatics

📖 V poli 'sources' uveď všechny URL a reference.`,

      GENERAL: `\n\n=== EXPERTNÍ ANALÝZA STAROŽITNOSTI ===
Proveď hloubkový výzkum s využitím webového vyhledávání:

📚 DATABÁZE (vyhledej online):
- Christie's, Sotheby's archives
- Invaluable.com
- LiveAuctioneers
- 1stDibs, Chairish

🔍 ANALÝZA:
1. Typ a funkce předmětu
2. Období a styl
3. Původ a provenience
4. Materiál a technika
5. Značky a signatury
6. Stav a restaurování
7. Podobné kusy ve sbírkách

💰 HODNOTA:
- Aukční výsledky
- Antikvariáty a galerie
- Faktory ovlivňující cenu

📖 V poli 'sources' uveď všechny URL a reference.`,

      UNKNOWN: `\n\n=== EXPERTNÍ IDENTIFIKACE ===
Proveď hloubkový výzkum s využitím webového vyhledávání:

🔍 PRVNÍ KROK - IDENTIFIKACE:
1. Pomocí reverse image search najdi podobné předměty
2. Urči kategorii (mince, známka, militárie, archeologie, jiné)
3. Uveď míru jistoty v procentech

📚 NÁSLEDNĚ:
- Vyhledej v relevantních databázích podle určené kategorie
- Najdi přesnou identifikaci
- Porovnej s podobnými kusy

💰 HODNOTA:
- Vyhledej aukční výsledky
- Uveď cenové rozpětí

📖 V poli 'sources' uveď všechny URL a reference.`,
    };

    prompt += expertInstructions[findingType];
    prompt += `\n\n🌐 Máš přístup k webovému vyhledávání - POUŽIJ HO pro ověření katalogových čísel, cen a zdrojů.`;
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

