import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, User, Clock, Users, Lock, Cookie, Mail } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Footer } from '../components/Footer';

export const PrivacyPage = () => {
  return (
    <>
      <SEOHead
        title="Zásady ochrany osobních údajů"
        description="Zásady ochrany osobních údajů služby eArcheo. Informace o zpracování, uchovávání a ochraně vašich dat podle GDPR."
        keywords="GDPR, ochrana osobních údajů, soukromí, eArcheo, zpracování dat"
        canonicalUrl="/privacy"
      />
      
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 243, 255, 0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 243, 255, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
          </div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-[150px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/10 bg-surface/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-white/50 hover:text-primary font-mono text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zpět na hlavní stránku
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          {/* Title */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-mono text-xs tracking-wider">GDPR COMPLIANT</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Zásady ochrany osobních údajů
            </h1>
            <p className="text-white/50 font-mono text-sm">
              eArcheo / eArcheo Plus
            </p>
          </div>

          {/* Intro */}
          <div className="p-6 bg-surface/60 border border-white/10 rounded-2xl mb-10">
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              Společnost <strong className="text-white">Golden Nose s.r.o.</strong> (provozovatel služby eArcheo a eArcheo Plus) 
              respektuje vaše soukromí a chrání vaše osobní údaje. Toto prohlášení vysvětluje, jaké osobní údaje shromažďujeme, 
              jak je využíváme a jak jsou zabezpečeny, v souladu s nařízením GDPR a souvisejícími právními předpisy.
            </p>
          </div>

          {/* Content sections */}
          <div className="space-y-10 text-white/70 font-mono text-sm leading-relaxed">
            
            {/* Správce */}
            <Section 
              icon={<User className="w-5 h-5" />}
              title="Správce osobních údajů"
            >
              <div className="p-4 bg-surface/60 border border-white/10 rounded-xl mb-4">
                <p className="text-white font-display text-lg mb-2">Golden Nose s.r.o.</p>
                <ul className="space-y-1 text-white/60 text-xs">
                  <li>IČO: 24142484, DIČ: CZ24142484</li>
                  <li>Sídlo: Novodvorská 1082/94, 142 00 Praha 4 – Braník</li>
                  <li>Zapsána v OR u Městského soudu v Praze, sp. zn. C 182542</li>
                </ul>
              </div>
              <p>
                Kontaktní e-mail: <a href="mailto:info@earcheo.cz" className="text-primary hover:underline">info@earcheo.cz</a> nebo{' '}
                <a href="mailto:podpora@earcheo.cz" className="text-primary hover:underline">podpora@earcheo.cz</a>
              </p>
              <p className="mt-2 text-white/40 text-xs">
                Správce nejmenoval pověřence pro ochranu osobních údajů.
              </p>
            </Section>

            {/* Jaké údaje */}
            <Section 
              icon={<Shield className="w-5 h-5" />}
              title="Jaké údaje zpracováváme"
            >
              <p className="mb-4">Zpracováváme pouze údaje nezbytné pro registraci uživatele a využívání služby:</p>
              
              <div className="grid gap-4">
                <DataCard 
                  title="Identifikační a kontaktní údaje"
                  items={['Jméno a příjmení', 'E-mailová adresa', 'Přihlašovací jméno']}
                />
                <DataCard 
                  title="Údaje pro přihlášení"
                  items={['Heslo (hashované)', 'Údaje o přihlášení přes třetí strany (Facebook)']}
                />
                <DataCard 
                  title="Údaje o službě a nálezech"
                  items={['Nálezy a jejich popisy', 'Fotografie nálezů', 'Lokalizace nálezu']}
                />
                <DataCard 
                  title="Platební a fakturační údaje"
                  items={['Informace o předplatném', 'Datum transakce', 'Fakturační údaje']}
                  note="Údaje o platební kartě nezpracováváme – zadáváte je přímo platební bráně GoPay"
                />
                <DataCard 
                  title="Technické a analytické údaje"
                  items={['IP adresa', 'Typ prohlížeče', 'Soubory cookies']}
                />
              </div>
            </Section>

            {/* Účely zpracování */}
            <Section 
              icon={<Shield className="w-5 h-5" />}
              title="Účely a právní základy zpracování"
            >
              <p className="mb-4">Vaše osobní údaje zpracováváme pouze pro legitimní účely podle čl. 6 GDPR:</p>
              
              <div className="space-y-4">
                <LegalBasis 
                  title="Plnění smlouvy"
                  article="čl. 6 odst. 1 písm. b)"
                  description="Poskytování služby eArcheo – vytvoření a správa účtu, ukládání nálezů, AI identifikace, zákaznická podpora, zpracování plateb."
                />
                <LegalBasis 
                  title="Splnění právní povinnosti"
                  article="čl. 6 odst. 1 písm. c)"
                  description="Uchovávání údajů na daňových dokladech, poskytování údajů orgánům veřejné moci."
                />
                <LegalBasis 
                  title="Oprávněný zájem"
                  article="čl. 6 odst. 1 písm. f)"
                  description="Zlepšování a ochrana služby (analytika), přímý marketing vůči stávajícím zákazníkům."
                />
                <LegalBasis 
                  title="Souhlas"
                  article="čl. 6 odst. 1 písm. a)"
                  description="Zasílání newsletterů a obchodních sdělení. Souhlas můžete kdykoli odvolat."
                />
              </div>
            </Section>

            {/* Doba uchovávání */}
            <Section 
              icon={<Clock className="w-5 h-5" />}
              title="Doba uchovávání údajů"
            >
              <div className="space-y-4">
                <RetentionCard 
                  title="Údaje o účtu"
                  period="Po dobu trvání účtu"
                  note="Po zrušení účtu většinu údajů vymažeme do 30 dnů"
                />
                <RetentionCard 
                  title="Platební a fakturační údaje"
                  period="10 let od konce zdaňovacího období"
                  note="Max. 15 let pro potřeby obrany právních nároků"
                />
                <RetentionCard 
                  title="Marketing"
                  period="Do odvolání souhlasu"
                  note="Nejdéle 3 roky od poslední aktivity"
                />
              </div>
            </Section>

            {/* Příjemci */}
            <Section 
              icon={<Users className="w-5 h-5" />}
              title="Příjemci osobních údajů"
            >
              <p className="mb-4">Vaše osobní údaje nepředáváme třetím osobám pro jejich vlastní marketing. V nezbytném rozsahu je mohou zpracovávat:</p>
              <ul className="list-none space-y-2 ml-4">
                <ListItem><strong className="text-white">GoPay</strong> – poskytovatel platební brány</ListItem>
                <ListItem><strong className="text-white">Poskytovatelé hostingu</strong> – provoz infrastruktury a zálohování</ListItem>
                <ListItem><strong className="text-white">E-mailové služby</strong> – rozesílání transakčních oznámení</ListItem>
                <ListItem><strong className="text-white">Orgány veřejné moci</strong> – jen pokud nám to ukládá zákon</ListItem>
              </ul>
              <p className="mt-4 text-white/50 text-xs">
                Osobní údaje zpracováváme převážně v rámci EU. Pokud by došlo k přenosu do třetích zemí, zajistíme odpovídající úroveň ochrany.
              </p>
            </Section>

            {/* Vaše práva */}
            <Section 
              icon={<Shield className="w-5 h-5" />}
              title="Vaše práva"
            >
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <RightCard title="Právo na přístup" description="Zjistit, jaké údaje zpracováváme" />
                <RightCard title="Právo na opravu" description="Opravit nepřesné údaje" />
                <RightCard title="Právo na výmaz" description="Požádat o vymazání údajů" />
                <RightCard title="Právo na omezení" description="Dočasně omezit zpracování" />
                <RightCard title="Právo vznést námitku" description="Proti přímému marketingu" />
                <RightCard title="Právo na přenositelnost" description="Získat údaje ve strojovém formátu" />
                <RightCard title="Právo odvolat souhlas" description="Kdykoli odvolat udělený souhlas" />
                <RightCard title="Právo podat stížnost" description="U ÚOOÚ (www.uoou.cz)" />
              </div>
              
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-primary text-xs mb-2 font-display">Jak uplatnit svá práva:</p>
                <p className="text-white/60 text-xs">
                  E-mailem na <a href="mailto:podpora@earcheo.cz" className="text-primary hover:underline">podpora@earcheo.cz</a>. 
                  Žádost vyřídíme do 30 dnů. Před poskytnutím informací můžeme ověřit vaši totožnost.
                </p>
              </div>
            </Section>

            {/* Zabezpečení */}
            <Section 
              icon={<Lock className="w-5 h-5" />}
              title="Zabezpečení osobních údajů"
            >
              <p className="mb-4">K ochraně vašich údajů používáme vhodná technická a organizační opatření:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <SecurityCard icon="🔒" title="HTTPS/TLS" description="Šifrované spojení" />
                <SecurityCard icon="🔐" title="Hashování" description="Bezpečné ukládání hesel" />
                <SecurityCard icon="👤" title="Omezený přístup" description="Pouze pro pověřené osoby" />
                <SecurityCard icon="💾" title="Zálohování" description="Pravidelné zálohy a aktualizace" />
              </div>
            </Section>

            {/* Cookies */}
            <Section 
              icon={<Cookie className="w-5 h-5" />}
              title="Cookies a sledovací technologie"
            >
              <p className="mb-4">Web eArcheo.cz používá cookies:</p>
              <div className="space-y-3">
                <CookieCard 
                  type="Nezbytné"
                  description="Zajišťují funkčnost webu (přihlášení, nastavení)"
                  color="emerald"
                />
                <CookieCard 
                  type="Analytické"
                  description="Vyhodnocování návštěvnosti (pouze se souhlasem)"
                  color="amber"
                />
                <CookieCard 
                  type="Marketingové"
                  description="V současnosti nepoužíváme"
                  color="white"
                />
              </div>
            </Section>

            {/* Závěr */}
            <Section 
              icon={<Mail className="w-5 h-5" />}
              title="Závěrečné informace"
            >
              <div className="p-4 bg-surface/60 border border-white/10 rounded-xl mb-4">
                <p className="text-white/50 text-xs">
                  Toto znění Zásad ochrany osobních údajů je účinné od <strong className="text-white">1. 1. 2026</strong>. 
                  Obsah může být průběžně aktualizován. O podstatných změnách vás budeme informovat.
                </p>
              </div>
              <p>
                Máte-li dotazy k ochraně osobních údajů, kontaktujte nás na{' '}
                <a href="mailto:podpora@earcheo.cz" className="text-primary hover:underline">podpora@earcheo.cz</a>.
              </p>
            </Section>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

// Section component
interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section = ({ icon, title, children }: SectionProps) => (
  <section className="relative">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
        {icon}
      </div>
      <h2 className="font-display text-xl text-white pt-2">{title}</h2>
    </div>
    <div className="ml-[52px]">
      {children}
    </div>
  </section>
);

// List item
const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2">
    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-white/30" />
    <span>{children}</span>
  </li>
);

// Data card
interface DataCardProps {
  title: string;
  items: string[];
  note?: string;
}

const DataCard = ({ title, items, note }: DataCardProps) => (
  <div className="p-4 bg-surface/60 border border-white/10 rounded-xl">
    <p className="text-white font-display text-sm mb-2">{title}</p>
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-white/50 text-xs">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          {item}
        </li>
      ))}
    </ul>
    {note && <p className="mt-2 text-emerald-400/60 text-xs">{note}</p>}
  </div>
);

// Legal basis card
interface LegalBasisProps {
  title: string;
  article: string;
  description: string;
}

const LegalBasis = ({ title, article, description }: LegalBasisProps) => (
  <div className="p-4 bg-surface/60 border border-white/10 rounded-xl">
    <div className="flex items-center gap-2 mb-2">
      <p className="text-white font-display text-sm">{title}</p>
      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-[10px] font-mono">
        {article}
      </span>
    </div>
    <p className="text-white/50 text-xs">{description}</p>
  </div>
);

// Retention card
interface RetentionCardProps {
  title: string;
  period: string;
  note: string;
}

const RetentionCard = ({ title, period, note }: RetentionCardProps) => (
  <div className="flex items-start gap-4 p-4 bg-surface/60 border border-white/10 rounded-xl">
    <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-white font-display text-sm">{title}</p>
      <p className="text-emerald-400 text-xs mt-1">{period}</p>
      <p className="text-white/40 text-xs mt-1">{note}</p>
    </div>
  </div>
);

// Right card
interface RightCardProps {
  title: string;
  description: string;
}

const RightCard = ({ title, description }: RightCardProps) => (
  <div className="p-3 bg-surface/60 border border-white/10 rounded-xl">
    <p className="text-white font-display text-xs mb-1">{title}</p>
    <p className="text-white/40 text-[10px]">{description}</p>
  </div>
);

// Security card
interface SecurityCardProps {
  icon: string;
  title: string;
  description: string;
}

const SecurityCard = ({ icon, title, description }: SecurityCardProps) => (
  <div className="flex items-center gap-3 p-3 bg-surface/60 border border-white/10 rounded-xl">
    <span className="text-lg">{icon}</span>
    <div>
      <p className="text-white font-display text-xs">{title}</p>
      <p className="text-white/40 text-[10px]">{description}</p>
    </div>
  </div>
);

// Cookie card
interface CookieCardProps {
  type: string;
  description: string;
  color: 'emerald' | 'amber' | 'white';
}

const CookieCard = ({ type, description, color }: CookieCardProps) => {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    white: 'bg-white/5 border-white/10 text-white/50',
  };
  
  return (
    <div className={`p-3 rounded-xl border ${colors[color]}`}>
      <p className="font-display text-xs mb-1">{type}</p>
      <p className="text-white/50 text-[10px]">{description}</p>
    </div>
  );
};


