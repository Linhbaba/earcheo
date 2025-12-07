import { Link } from 'react-router-dom';
import { ArrowLeft, Package, User, Map, Search, Zap, Shield, Image, MapPin, Layers, Bookmark, Settings, Trash2, Mountain, Calendar, Smartphone, Wrench, Target, Users, Ruler, BarChart3, Rocket, Wand2, Coins, Hash, Mail, Banknote, ScrollText, Pickaxe } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const ChangelogPage = () => {
  return (
    <>
      <SEOHead
        title="Changelog - Historie změn | eArcheo"
        description="Sledujte vývoj platformy eArcheo - všechny nové funkce, vylepšení a opravy."
        canonicalUrl="/changelog"
      />
      <div className="min-h-screen bg-background text-white">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/10 bg-surface/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-primary transition-colors font-mono text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Zpět
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Title */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary font-mono text-xs tracking-wider">LIVE UPDATES</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-4">
              Changelog
            </h1>
            <p className="text-white/50 font-mono text-sm sm:text-base">
              Historie vývoje platformy eArcheo
            </p>
          </div>

          {/* Changelog Entries */}
          <div className="space-y-12">

            {/* v1.2 - ROZŠÍŘENÁ EVIDENCE PRO SBĚRATELE */}
            <ChangelogEntry
              version="1.2"
              date="7. prosince 2025"
              badge="NEW ✨"
              badgeColor="primary"
            >
              <ChangeItem icon={<Mail />} title="Filatelie - kompletní evidence">
                Nová pole pro známky: Pofis/Michel katalogy, typ položky (Celistvost, FDC, Aršík), perforace, typ tisku, barva, papír, lep, vodoznak a razítko.
              </ChangeItem>
              <ChangeItem icon={<Banknote />} title="Notafilie - bankovky a série">
                Rozšíření pro bankovky: Pick katalog, série, emise, prefix, podpis guvernéra, ochranné prvky. Typ položky: Mince, Bankovka, Medaile, Žeton, Notgeld.
              </ChangeItem>
              <ChangeItem icon={<Pickaxe />} title="Archeologie - profesionální dokumentace">
                Nová pole pro archeologické nálezy: stratigrafie, kontext (SU/sektor), metoda výzkumu, interpretace, nálezová situace.
              </ChangeItem>
              <ChangeItem icon={<ScrollText />} title="12 specifických polí pro filatelii">
                Typ položky, rok vydání, Pofis č., Michel č., jiný katalog, perforace, typ tisku, barva, papír, lep, vodoznak, razítko.
              </ChangeItem>
              <ChangeItem icon={<Coins />} title="12 specifických polí pro numismatiku">
                Typ položky, nominál, rok, mincovna/tiskárna, katalog, Pick č., grading, série, emise, prefix, podpis, ochranné prvky.
              </ChangeItem>
              <ChangeItem icon={<Image />} title="Nový OG obrázek">
                Aktualizovaný náhledový obrázek pro sdílení na sociálních sítích.
              </ChangeItem>
            </ChangelogEntry>

            {/* v1.1 - WIZARD & CUSTOM FIELDS */}
            <ChangelogEntry
              version="1.1"
              date="6. prosince 2025"
              badge="STABLE"
              badgeColor="green"
            >
              <ChangeItem icon={<Wand2 />} title="Wizard pro typ nálezu">
                Nový průvodce při vytváření nálezu - vyberte typ (Mince, Známky, Militárie, Terén, Obecný) a zobrazí se relevantní pole pro danou kategorii.
              </ChangeItem>
              <ChangeItem icon={<Coins />} title="Rozšířená pole podle typu">
                Specifická pole pro každý typ nálezu: numismatika (nominál, mincovna, grading), filatelie (perforace, razítko), militárie (armáda, konflikt), terén (signál detektoru, typ pozemku).
              </ChangeItem>
              <ChangeItem icon={<Hash />} title="Vlastní uživatelská pole">
                Vytvořte si až 10 vlastních polí pro evidenci nálezů - text, číslo, datum nebo výběr z možností. Každé pole může mít vlastní ikonu.
              </ChangeItem>
              <ChangeItem icon={<Package />} title="Univerzální pole">
                Nová společná pole pro všechny typy: období/datace, rozměry, hmotnost, původ, způsob získání, odhadovaná hodnota, úložné místo.
              </ChangeItem>
              <ChangeItem icon={<Zap />} title="Dynamické sekce formuláře">
                Formulář pro nálezy nyní zobrazuje sekce podle vybraného typu - méně polí, lepší přehlednost.
              </ChangeItem>
            </ChangelogEntry>
            
            {/* v1.0 - RELEASE */}
            <ChangelogEntry
              version="1.0"
              date="5. prosince 2025"
              badge="RELEASE 🎉"
              badgeColor="green"
            >
              <ChangeItem icon={<Rocket />} title="Oficiální release verze 1.0">
                eArcheo opouští beta verzi! Stabilní platforma připravená pro každodenní použití s kompletní sadou funkcí pro archeologický průzkum.
              </ChangeItem>
              <ChangeItem icon={<Target />} title="Sector Planner">
                Nový plánovač sektorů pro systematický průzkum terénu. Kreslete polygony, generujte trasy a sledujte postup průzkumu v reálném čase.
              </ChangeItem>
              <ChangeItem icon={<Users />} title="Typy sběratelů">
                Profil nyní podporuje různé typy sběratelů - numismatik, filatelista, militaria, detektorář. Přizpůsobte si eArcheo svému zaměření.
              </ChangeItem>
              <ChangeItem icon={<User />} title="Onboarding wizard">
                Noví uživatelé jsou provázeni nastavením profilu včetně výběru typu sběratele a oblíbených aktivit.
              </ChangeItem>
              <ChangeItem icon={<Ruler />} title="Měřicí nástroje">
                Měřte vzdálenosti a plochy přímo na mapě. Ideální pro plánování průzkumu a dokumentaci lokalit.
              </ChangeItem>
              <ChangeItem icon={<BarChart3 />} title="Google Analytics">
                Anonymní sledování používání mapy pro lepší pochopení, které funkce jsou nejužitečnější.
              </ChangeItem>
              <ChangeItem icon={<Zap />} title="Optimalizace serverless funkcí">
                Sloučení API endpointů pro rychlejší odezvu a nižší náklady na provoz.
              </ChangeItem>
            </ChangelogEntry>

            {/* BETA v1.4 */}
            <ChangelogEntry
              version="BETA 1.4"
              date="1. prosince 2025"
              badge="STABLE"
              badgeColor="green"
            >
              <ChangeItem icon={<Smartphone />} title="Vylepšené mobilní ovládání">
                Nové tlačítka +/- pro přesné ovládání rozdělovače mapy na dotykových zařízeních. Prevence nechtěného refreshe stránky při tažení.
              </ChangeItem>
              <ChangeItem icon={<Wrench />} title="Stabilizace API">
                Opraveny kritické chyby v databázových dotazech, které způsobovaly pády při načítání nálezů a profilu.
              </ChangeItem>
              <ChangeItem icon={<Zap />} title="Optimalizace Service Workeru">
                Vylepšené cachování - API požadavky již neblokují offline funkce, mapy se načítají rychleji.
              </ChangeItem>
            </ChangelogEntry>
            
            {/* BETA v1.3 */}
            <ChangelogEntry
              version="BETA 1.3"
              date="30. listopadu 2025"
              badge="STABLE"
              badgeColor="green"
            >
              <ChangeItem icon={<Settings />} title="Nový L/R systém mapy">
                Kompletně přepracované ovládání mapy - nezávislý výběr vrstev pro levou a pravou stranu s podporou swipe porovnání
              </ChangeItem>
              <ChangeItem icon={<Calendar />} title="Archiv ortofoto 2007-2022">
                Přístup k historickým leteckým snímkům ČÚZK s možností výběru konkrétního roku
              </ChangeItem>
              <ChangeItem icon={<Mountain />} title="ZABAGED vrstevnice">
                Nová vrstva s výškopisnými daty - vrstevnice z databáze ZABAGED
              </ChangeItem>
              <ChangeItem icon={<Layers />} title="Katastrální mapy">
                Overlay vrstva s katastrálními hranicemi a parcelními čísly
              </ChangeItem>
              <ChangeItem icon={<Bookmark />} title="Uložené pohledy">
                Možnost uložit si aktuální nastavení mapy (vrstvy, filtry, pozice) pro rychlé načtení později
              </ChangeItem>
              <ChangeItem icon={<Zap />} title="Vylepšené UI">
                Přepracovaný CommandDeck s intuitivnějším ovládáním a lepší organizací funkcí
              </ChangeItem>
              <ChangeItem icon={<Shield />} title="Bezpečnost">
                Vylepšené CSP hlavičky, lepší validace na API endpointech
              </ChangeItem>
              <ChangeItem icon={<Trash2 />} title="Čištění kódu">
                Odstranění nepoužívaných komponent a optimalizace bundle size
              </ChangeItem>
            </ChangelogEntry>
            
            {/* BETA v1.2 */}
            <ChangelogEntry
              version="BETA 1.2"
              date="28. listopadu 2025"
              badge="STABLE"
              badgeColor="green"
            >
              <ChangeItem icon={<Zap />} title="Smart Router">
                Přihlášení uživatelé nyní jdou rovnou na mapu, ne na landing page
              </ChangeItem>
              <ChangeItem icon={<Shield />} title="Vercel Analytics">
                Integrace sledování návštěvnosti pro lepší pochopení využití platformy
              </ChangeItem>
              <ChangeItem icon={<Package />} title="Changelog">
                Nová stránka s historií všech změn a vylepšení
              </ChangeItem>
            </ChangelogEntry>

            {/* BETA v1.1 */}
            <ChangelogEntry
              version="BETA 1.1"
              date="26. listopadu 2025"
              badge="STABLE"
              badgeColor="green"
            >
              <ChangeItem icon={<User />} title="Profil uživatele">
                Kompletní správa profilu s statistikami, editací a avatarem
              </ChangeItem>
              <ChangeItem icon={<Package />} title="Vybavení">
                Správa archeologického vybavení (detektory, GPS, nástroje) s použitím v nálezech
              </ChangeItem>
              <ChangeItem icon={<Search />} title="Nálezy">
                Kompletní systém pro dokumentaci nálezů s fotkami, GPS souřadnicemi a kategoriemi
              </ChangeItem>
              <ChangeItem icon={<MapPin />} title="Interaktivní mapa">
                Zobrazení nálezů jako markery přímo na mapě
              </ChangeItem>
              <ChangeItem icon={<Image />} title="Fotogalerie">
                Upload a správa fotek s lightbox zobrazením a thumbnaily
              </ChangeItem>
            </ChangelogEntry>

            {/* BETA v1.0 */}
            <ChangelogEntry
              version="BETA 1.0"
              date="15. listopadu 2025"
              badge="INITIAL"
              badgeColor="amber"
            >
              <ChangeItem icon={<Map />} title="LiDAR Vizualizace">
                Interaktivní 3D vizualizace terénu z DMR5G dat
              </ChangeItem>
              <ChangeItem icon={<Map />} title="Více vrstev">
                Satelitní snímky, ortofoto ČÚZK, historické mapy
              </ChangeItem>
              <ChangeItem icon={<Shield />} title="Auth0 integrace">
                Bezpečné přihlašování a správa uživatelů
              </ChangeItem>
              <ChangeItem icon={<Search />} title="Geocoding">
                Vyhledávání lokalit pomocí OpenStreetMap Nominatim
              </ChangeItem>
            </ChangelogEntry>

          </div>

          {/* Footer info */}
          <div className="mt-16 p-6 bg-surface/40 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="font-display text-lg text-white mb-2">
              Nápady na nové funkce?
            </h3>
            <p className="text-white/60 font-mono text-sm mb-4">
              Máte nápad na vylepšení? Hlasujte pro existující návrhy nebo přidejte vlastní!
            </p>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary font-mono text-sm transition-all"
            >
              Navrhnout funkci
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center py-8 border-t border-white/10 mt-12">
          <p className="text-white/30 font-mono text-xs">
            © 2025 eArcheo · <a href="mailto:ahoj@earcheo.cz" className="hover:text-primary/70 transition-colors">ahoj@earcheo.cz</a>
          </p>
        </footer>
      </div>
    </>
  );
};

interface ChangelogEntryProps {
  version: string;
  date: string;
  badge: string;
  badgeColor: 'primary' | 'green' | 'amber';
  children: React.ReactNode;
}

const ChangelogEntry = ({ version, date, badge, badgeColor, children }: ChangelogEntryProps) => {
  const badgeColors = {
    primary: 'bg-primary/20 border-primary/30 text-primary',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  };

  return (
    <div className="relative pl-8 border-l-2 border-white/10">
      {/* Version badge */}
      <div className="absolute -left-[1px] top-0 w-2 h-2 bg-primary rounded-full" />
      
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h2 className="font-display text-2xl text-white">
            v{version}
          </h2>
          <span className={`px-3 py-1 rounded-lg border text-xs font-mono tracking-wider ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        </div>
        <p className="text-white/40 font-mono text-sm">
          {date}
        </p>
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

interface ChangeItemProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const ChangeItem = ({ icon, title, children }: ChangeItemProps) => (
  <div className="flex gap-3 p-4 bg-surface/40 backdrop-blur-sm border border-white/10 rounded-xl hover:border-primary/30 transition-all">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
      {icon}
    </div>
    <div>
      <h3 className="font-display text-white text-sm mb-1">
        {title}
      </h3>
      <p className="text-white/50 font-mono text-xs leading-relaxed">
        {children}
      </p>
    </div>
  </div>
);

