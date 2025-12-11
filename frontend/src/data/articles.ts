export type ArticleCategory = 'numismatika' | 'archeologie' | 'historie';

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  publishedAt: string;
  coverImage: string;
  focusKeyword: string;
};

export const categoryLabels: Record<ArticleCategory, string> = {
  numismatika: 'Numismatika',
  archeologie: 'Archeologie',
  historie: 'Historie',
};

export const categoryColors: Record<ArticleCategory, { bg: string; text: string; border: string }> = {
  numismatika: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  archeologie: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  historie: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
};

export const articles: Article[] = [
  {
    id: '1',
    slug: 'senon-40-000-rimskych-minci',
    title: 'Objev 40 000 římských mincí ve francouzské vesnici Senon',
    excerpt: 'Ve francouzském Senonu archeologové objevili tři nádoby se zhruba 40 000 římskými mincemi z 3.–4. století n. l.',
    focusKeyword: 'římské mince Senon',
    category: 'numismatika',
    publishedAt: '2024-12-01',
    coverImage: '/40000_coins/roman-coins-france-cover.webp',
    content: `# Objev 40 000 římských mincí ve francouzské vesnici Senon

*Ve francouzské vesnici Senon narazili archeologové na tři keramické nádoby plné mincí. Uvnitř bylo ukryto zhruba 40 000 římských mincí, uložených před 1700–1800 lety přímo v podlaze domu.*

## Tři nádoby plné římských mincí

Výzkum vedl francouzský [Národní institut pro preventivní archeologický výzkum (INRAP)](https://www.inrap.fr/). Během záchranných prací odhalil tým tři velké keramické nádoby, zakopané v jámách pod úrovní podlahy obytné místnosti.

![Archeologická dokumentace nálezu](/40000_coins/coin-excavation.webp)

Podle odhadů numismatiků:

- první nádoba obsahovala asi 23–24 tisíc mincí (cca 38 kg),
- druhá nádoba kolem 18–19 tisíc mincí (cca 50 kg),
- třetí nádoba se dochovala jen ve stopách – v jámě zůstaly tři osamocené mince.

Lokalita leží v oblasti někdejšího území keltského kmene Mediomatriců, zhruba 100 km od Lucemburska. V době uložení mincí šlo o hustě osídlený prostor s římskou městskou zástavbou.

## Poklad, nebo domácí spoření?

Na první pohled to vypadá jako klasický „poklad" ukrytý ve spěchu před nebezpečím. Interpretace INRAP je ale opatrnější. Datace mincí míří zhruba do let 280–310 n. l., tedy do období krize římské říše a její pozdější konsolidace.

Důležité detaily:

- nádoby byly **součástí domu**, ne tajnou skrýší někde v lese,
- jejich hrdla byla v úrovni podlahy – majitelé k nim měli snadný přístup,
- u dvou nádob byly nalezeny mince „přilepené" na vnější straně – zřejmě spadlé při manipulaci v době, kdy už byly nádoby zakopané.

To všechno naznačuje spíše **dlouhodobé ukládání úspor** – něco jako římská verze domácí pokladničky. Depozit mohl sloužit rodině celé roky, s možností postupných vkladů a výběrů.

## Požár, zkáza osady a nevyzvednuté úspory

Archeologové zjistili, že sídliště v Senonu zasáhl na počátku 4. století velký požár. Osada byla poté znovu obnovena, ale druhý požár znamenal definitivní konec. Obyvatelé místo opustili – a s ním i své úspory uložené v keramických nádobách.

Nádoby s římskými mincemi tak ležely v zemi zapomenuté víc než tisíc let. Teprve systematický archeologický výzkum umožnil zachytit nejen samotné mince, ale hlavně jejich **původní kontext**: přesnou polohu, napojení na dům a okolní zástavbu.

## Proč jsou římské mince ze Senonu tak důležité

Nález 40 000 římských mincí ze Senonu není unikátní jen množstvím. Důležité je hlavně to, že:

- jde o **pečlivě zdokumentovaný depot** přímo z obytné čtvrti,
- ukazuje konkrétní podobu toho, jak mohlo vypadat **„spoření" v římské Galii**,
- umožní srovnat skladbu mincí s dalšími známými [evropskými depoty mincí](/magazin/svedsko-20-000-stribrnych-minci).

Pro sběratele a numismatiky je zajímavé, že podobné depoty se objevují i v jiných částech Evropy – například [středověký stříbrný poklad ve Švédsku](/magazin/svedsko-20-000-stribrnych-minci) nebo [vzácné zlaté mince jako Ship Ryal Alžběty I.](/magazin/elizabeth-i-ship-ryal-rekordni-prodej)

---

## Zdroje

- [INRAP – Institut national de recherches archéologiques préventives](https://www.inrap.fr/)
- [Ministerstvo kultury Francie – archeologický kontext](https://www.culture.gouv.fr/)
`,
  },
  {
    id: '2',
    slug: 'elizabeth-i-ship-ryal-rekordni-prodej',
    title: 'Rekordní prodej: zlatá mince Alžběty I. se vydražila za 372 000 dolarů',
    excerpt: 'Vzácná zlatá mince Alžběty I., tzv. Ship Ryal, se na aukci prodala za rekordních 372 000 dolarů.',
    focusKeyword: 'zlatá mince Alžběty I.',
    category: 'numismatika',
    publishedAt: '2024-11-28',
    coverImage: '/elizabeth/Kanutus-Coin-Front.webp',
    content: `# Rekordní prodej: zlatá mince Alžběty I. se vydražila za 372 000 dolarů

*Vzácná zlatá mince Alžběty I., známá jako „Ship Ryal", se na listopadové aukci v USA prodala za 372 000 dolarů. Jde o rekordní částku za tento typ mince a jeden z nejzajímavějších prodejů britské numismatiky posledních let.*

## Co je zlatý „Ship Ryal" Alžběty I.

Dražený kus byl tzv. **Elizabeth I gold Ship Ryal of 15 Shillings**, ražený přibližně mezi lety 1584–1586. Na lícové straně mince je královna Alžběta I.:

- stojí na palubě lodi,
- v rukou drží žezlo a královské jablko,
- má bohatý šat a typický alžbětinský límec.

Motiv lodi není náhodný – vyjadřuje anglickou **námořní sílu** a sebevědomí království na prahu koloniální éry. Symbolicky odkazuje i na porážku španělské Armady v roce 1588 a nástup Anglie jako mocnosti, která ovládá moře.

Na rubu mince je:

- kříž se zdobnými prvky,
- centrální růže na zářivém slunci,
- korunovaní lvi v polích mezi rameny kříže,
- latinský text „IHS AVT TRANSIENS PER MEDIV ILLORVM IBAT" – biblický citát z Lukáše 4:30 („Ale Ježíš prošel jejich středem a šel svou cestou"), běžný na tudorovských zlatých ražbách.

## Proč byla mince tak drahá

Rekordní cena 372 000 dolarů nevznikla jen kvůli obsahu zlata. Rozhodlo několik faktorů:

- **extrémní vzácnost**: Ship Ryal Alžběty I. se dochoval v malém počtu kusů, navíc většina v nižší kvalitě,
- **stav**: dražený kus byl hodnocen stupněm MS63 ([NGC](https://www.ngccoin.com/)) – na minci starou více než 430 let jde o špičkový stav,
- **historický kontext**: období námořní expanze, sir Francis Drake, napětí se Španělskem,
- **provenience**: pochází z významné sbírky, což zvyšuje prestiž i cenu.

Aukční síň [Heritage Auctions](https://www.ha.com/) označila tuto zlatou minci Alžběty I. za jednu z nejvyhledávanějších britských mincí vůbec. Patří zároveň k posledním ražbám, které stále nesou „středověký" styl, než nastoupily modernější motivy.

## Ryal, rial a další měny se stejným jménem

V článcích se často plete **ryal** a **rial**. Historický ryal:

- byl typ zlaté mince, známý zejména ve Skotsku a Anglii,
- v případě „Ship Ryal" šlo o hodnotu 15 šilinků,
- dnes se už v Británii nerazí.

Moderní **rial** je naopak:

- oficiální měna například v Íránu, Ománu nebo Jemenu,
- s historickým ryalem sdílí jen podobný název, nikoli typ či navázanost na britskou měnovou historii.

Pro sběratele je důležitá právě historická **zlatá mince Alžběty I.**, kde hodnota spočívá v souhře kovu, příběhu a stavu zachování.

## Co rekordní prodej znamená pro numismatiku

Dražba Ship Ryalu ukazuje několik trendů:

- špičkové **historické mince** jsou vnímány jako investiční i kulturní artefakty,
- rekordní částky padají častěji u kusů s jasným příběhem a špičkovou kvalitou,
- britská, římská i středověká numismatika drží dlouhodobě vysoký zájem.

Na eArcheu se věnujeme i dalším příběhům [numismatických depotů](/magazin/senon-40-000-rimskych-minci) – od římských nálezů až po [historické mince v Evropě](/magazin/svedsko-20-000-stribrnych-minci).

Rekordní prodej Ship Ryalu jen potvrzuje, že svět mincí je dnes stejně živý jako v době, kdy se tyto ražby rodily v mincovnách.

---

## Zdroje

- [Heritage Auctions](https://www.ha.com/) – aukční síň
- [Royal Mint Museum](https://www.royalmintmuseum.org.uk/) – historie britských mincí
- [NGC Grading](https://www.ngccoin.com/) – numismatické hodnocení
`,
  },
  {
    id: '3',
    slug: 'arabske-texty-supernova-1181',
    title: 'Středověké arabské texty pomáhají najít stopu po supernově z roku 1181',
    excerpt: 'Dva středověké arabské texty z Káhiry upřesňují polohu supernovy z roku 1181 na obloze a pomáhají astronomům identifikovat její pozůstatek.',
    focusKeyword: 'supernova 1181',
    category: 'historie',
    publishedAt: '2024-11-25',
    coverImage: '/arabske_texty_supernova/saladin-manuscript.webp',
    content: `# Středověké arabské texty pomáhají najít stopu po supernově z roku 1181

*Bez dalekohledů, bez astrofyziky, jen „nová hvězda" na obloze a pero v ruce. Tak vypadalo pozorování supernovy v roce 1181. Dnes se k těmto zápisům vracejí vědci a zjišťují, že středověké arabské texty umí upřesnit polohu dávné exploze hvězdy lépe než mnohé moderní katalogy.*

## Když supernovu sledují básníci a kronikáři

Supernova je jedna z největších explozí, jaké ve vesmíru známe. Vzniká, když masivní hvězda dočerpá palivo, zhroutí se a krátce zazáří tak jasně, že je vidět i ve dne. V historii lidstva bylo takových jevů v naší galaxii zaznamenáno jen několik málo desítek – a většina spadá do doby dávno před vynálezem dalekohledu.

![Historický archivní dokument](/arabske_texty_supernova/archives-supernova.webp)

Vědci proto sahají k neobvyklému zdroji: **historickým textům**. Záznamy kronikářů, dvorních učenců nebo básníků často popisují:

- že se objevila nová, neobvyklá hvězda,
- jak byla jasná,
- jaký měla odstín,
- kde na obloze ležela,
- jak dlouho byla viditelná.

Právě tyto detaily dnes astronomům pomáhají zpětně dohledat **pozůstatek supernovy** – mlhovinu nebo kompaktní objekt, který po výbuchu zůstal.

## Poema pro Saladina a „henou zbarvená ruka"

V nedávné studii se tým vedený Ralphem Neuhäuserem (Astrophysical Institute, Universität Jena) zaměřil na dva **arabské texty z Káhiry**:

- báseň Ibn Sanā' al-Mulka na počest sultána Saladina, psaná kolem let 1181–1182,
- kroniku učence Ahmada ibn Alí al-Maqrízího z 15. století.

Báseň na Saladina popisuje „novou hvězdu", která se objevila v souhvězdí přezdívaném **„henou barvená ruka"** – arabském souhvězdí odpovídajícím části dnešní **Kasiopeje**. V téže době zaznamenaly neobvyklou hvězdu i čínské a japonské prameny, ale bez přesného určení polohy.

Díky arabskému popisu mají dnes vědci mnohem lepší představu, kde na obloze hledat pozůstatek exploze z roku 1181. Kandidátem je mlhovina a zvláštní hvězda v Kasiopeji známá jako Pa 30. Arabský text tak slouží jako **další „souřadnice"**, které zužují okruh možností.

## Supernova 1006 – nejjasnější hvězda posledních dvou tisíc let

Druhý zkoumaný text, al-Maqrízího kronika, popisuje jinou událost: supernovu z roku **1006 n. l.** Ta patří mezi nejjasnější historické supernovy vůbec – dle dobových popisů byla srovnatelná s Měsícem. Exploze se odehrála v naší galaxii, „jen" asi 6000 světelných let daleko.

U této supernovy už máme dnes poměrně přesný obrázek: známe

- její polohu,
- pozůstatek v podobě rozsáhlé mlhoviny,
- průběh zjasnění i pomalé miznutí.

Arabský text tak v tomto případě spíš potvrzuje to, co astronomie znala z jiných zdrojů. Přidanou hodnotou je ale propojení **historického vyprávění** s moderními daty – další dílek skládanky, která ukazuje, jak lidé vnímali extrémně jasnou „novou hvězdu" před více než tisícem let.

## Když se potkají historie a astronomie

Příběh supernovy 1181 krásně ukazuje, jak spolu dokážou spolupracovat obory, které na první pohled nemají nic společného:

- arabisté a historici čtou a interpretují texty,
- astronomové převádějí slovní popisy na souřadnice na obloze,
- astrofyzici pak porovnávají kandidátní objekty (mlhoviny, zvláštní hvězdy) s očekávanými vlastnostmi pozůstatků supernov.

Výsledek? Lepší šance, že konkrétní **supernova 1181** dostane „tvář" – tedy jednoznačně přiřazený objekt na obloze.

Na eArcheu se většinou věnujeme nálezům v zemi – [mincím](/magazin/senon-40-000-rimskych-minci), šperkům, hrobům. Tento příběh ukazuje „archeologii oblohy": místo lopaty tu pracuje textová kritika a astrofyzika, ale princip je podobný. Staré prameny, správně přečtené a zasazené do kontextu, dokážou po staletích odhalit stopy událostí, které by jinak zůstaly jen mlhavou legendou.

---

## Zdroje

- [Astronomische Nachrichten (Wiley)](https://onlinelibrary.wiley.com/journal/15213994) – vědecký časopis
- [Bodleian Library](https://www.bodleian.ox.ac.uk/) – oxfordská knihovna s rukopisy
- [NASA ADS](https://ui.adsabs.harvard.edu/) – astronomická databáze
`,
  },
  {
    id: '4',
    slug: 'svedsko-20-000-stribrnych-minci',
    title: 'Rybář ve Švédsku objevil asi 20 000 středověkých stříbrných mincí',
    excerpt: 'Při hledání žížal u letního domu nedaleko Stockholmu objevil rybář měděný kotlík s až 20 000 stříbrnými mincemi z 12. století.',
    focusKeyword: 'středověký stříbrný poklad',
    category: 'archeologie',
    publishedAt: '2024-11-20',
    coverImage: '/fisherman/Swedish-Silver-Treasure.webp',
    content: `# Rybář ve Švédsku objevil asi 20 000 středověkých stříbrných mincí

*Šel si jen pro žížaly na návnadu. Místo toho našel měděný kotlík plný stříbrných mincí a šperků. Nález u letního domu nedaleko Stockholmu patří k největším středověkým stříbrným pokladům ve Švédsku.*

## Poklad v měděném kotlíku

Nález se odehrál u letního domu v oblasti nedaleko Stockholmu. Rybář při hledání návnady narazil na zkorodovaný měděný kotlík, který se při odkrytí začal rozpadat. Uvnitř ale byl:

- hutný „balík" stříbrných mincí,
- stříbrné prsteny a přívěsky,
- další drobné šperky a části výzdoby.

Celková hmotnost pokladu je kolem 6 kg. Podle vyjádření stockholmské krajské správy může jít o **jeden z největších stříbrných pokladů z raného středověku**, jaký byl ve Švédsku dosud nalezen.

Rybář postupoval správně – nález nahlásil úřadům a umožnil archeologům provést systematický výzkum. Podle švédských zákonů nyní může dostat nálezné, jehož výše závisí na historické a materiální hodnotě depotu.

## Mince krále Knuta Erikssona a biskupské ražby

![Mince krále Knuta Erikssona](/fisherman/Knut-Eriksson-Coin.webp)

První analýzy mincí ukazují, že většina pochází z **12. století**. Mnohé nesou latinský nápis **KANUTUS**, odkazující na švédského krále **Knut Erikssona**, který vládl zhruba mezi lety 1172–1195. Jeho vláda je spojena s:

- rozvojem psané administrativy,
- obnovou královské mincovní výroby po dvacetileté pauze,
- relativně stabilním obdobím (Knut zemřel přirozenou smrtí, což u tehdejších švédských králů nebylo pravidlem).

![Mince s nápisem Kanutus](/fisherman/Kanutus-Coin-Front.webp)

Kromě královských mincí se v kotlíku objevily i vzácnější **biskupské mince**. Ty mívají motiv:

- biskupa s berlí (crozier),
- často také kostel či jiný sakrální symbol.

![Biskupská mince - líc](/fisherman/Bishop-Coin-Front.webp)

![Biskupská mince - rub](/fisherman/Bishop-Coin-Back.webp)

Jejich přítomnost naznačuje, že v tehdejším Švédsku měli církevní hodnostáři významnou ekonomickou i politickou moc. Biskupové si mohli razit vlastní mince, vyjednávat s králem a vstupovat do širších mocenských vztahů.

## Proč byl stříbrný poklad ukrytý

Na otázku „proč to někdo zakopal" zatím neexistuje jednoznačná odpověď. Nejčastější hypotézy:

- **ukrytí majetku v době nejistoty** – konec 12. století přinesl mocenské konflikty i expanzi švédské moci do Finska,
- **rodinná rezerva** – soukromý majetek uložený v době krizí nebo hrozícího konfliktu,
- **majetek instituce** – kombinace královských a biskupských mincí může naznačovat i církevní nebo lokální „pokladnu".

Jisté je, že se pro středověký stříbrný poklad nikdo nevrátil. Kotlík zůstal v zemi stát za stromy, les se změnil, krajina se přetvořila – a až o mnoho staletí později ho náhodou odhalil člověk, který původně chtěl jen chytat ryby.

## Středověký stříbrný poklad v širším kontextu

Švédský nález hezky zapadá do „mapy" evropských depotů mincí:

- v Galii se nacházejí obrovské [římské depoty mincí](/magazin/senon-40-000-rimskych-minci),
- na aukcích se prodávají [vzácné historické zlaté mince](/magazin/elizabeth-i-ship-ryal-rekordni-prodej) za stovky tisíc dolarů.

Příběh středověkého stříbrného pokladu ze Švédska připomíná, že pod povrchem krajiny zůstávají stále uložené kapitoly historie, které čekají na svůj objev – někdy pod motykou archeologa, jindy pod lopatkou člověka, který šel původně jen „na žížaly".

---

## Zdroje

- [American Numismatic Society](https://www.numismatics.org/) – numismatická společnost
`,
  },
];

// Helper functions
export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find(article => article.slug === slug);
};

export const getArticlesByCategory = (category: ArticleCategory): Article[] => {
  return articles.filter(article => article.category === category);
};

export const getFeaturedArticle = (): Article => {
  return articles[0];
};

export const getRelatedArticles = (currentSlug: string, limit: number = 3): Article[] => {
  const current = getArticleBySlug(currentSlug);
  if (!current) return articles.slice(0, limit);
  
  return articles
    .filter(a => a.slug !== currentSlug)
    .sort((a, b) => {
      // Prioritize same category
      if (a.category === current.category && b.category !== current.category) return -1;
      if (b.category === current.category && a.category !== current.category) return 1;
      return 0;
    })
    .slice(0, limit);
};

// Calculate reading time
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Get all article slugs (for prerendering)
export const getAllArticleSlugs = (): string[] => {
  return articles.map(article => article.slug);
};
