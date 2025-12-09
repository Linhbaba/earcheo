import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CreditCard, Shield, AlertTriangle, Mail, Scale } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Footer } from '../components/Footer';

export const TermsPage = () => {
  return (
    <>
      <SEOHead
        title="Podmínky použití"
        description="Podmínky použití a obchodní podmínky služby eArcheo a eArcheo Plus. Práva a povinnosti uživatelů."
        keywords="podmínky použití, obchodní podmínky, eArcheo, eArcheo Plus"
        canonicalUrl="/terms"
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
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px]" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-4">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-primary font-mono text-xs tracking-wider">PRÁVNÍ DOKUMENT</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Podmínky použití
            </h1>
            <p className="text-white/50 font-mono text-sm">
              Obchodní podmínky služby eArcheo a eArcheo Plus
            </p>
          </div>

          {/* Content sections */}
          <div className="space-y-10 text-white/70 font-mono text-sm leading-relaxed">
            
            {/* Section 1 */}
            <Section 
              icon={<FileText className="w-5 h-5" />}
              title="1. Poskytovatel služby"
            >
              <p className="mb-4">Službu eArcheo a eArcheo Plus provozuje:</p>
              <div className="p-4 bg-surface/60 border border-white/10 rounded-xl mb-4">
                <p className="text-white font-display text-lg mb-2">Golden Nose s.r.o.</p>
                <ul className="space-y-1 text-white/60 text-xs">
                  <li>IČO: 24142484</li>
                  <li>DIČ: CZ24142484</li>
                  <li>Sídlo: Novodvorská 1082/94, 142 00 Praha 4 – Braník</li>
                  <li>Zapsána v OR u Městského soudu v Praze, sp. zn. C 182542</li>
                </ul>
              </div>
              <p>
                Kontaktní e-mail: <a href="mailto:info@earcheo.cz" className="text-primary hover:underline">info@earcheo.cz</a> nebo <a href="mailto:podpora@earcheo.cz" className="text-primary hover:underline">podpora@earcheo.cz</a>
              </p>
            </Section>

            {/* Section 2 */}
            <Section 
              icon={<FileText className="w-5 h-5" />}
              title="2. Popis služby eArcheo a eArcheo Plus"
            >
              <h4 className="text-white font-display text-base mb-3">2.1 Základní služba eArcheo</h4>
              <p className="mb-4">
                eArcheo je webová aplikace pro evidenci a správu nálezů pro archeology, numismatiky, filatelisty a další sběratele. Umožňuje zejména:
              </p>
              <ul className="list-none space-y-2 mb-6 ml-4">
                <ListItem>zakládat uživatelské účty</ListItem>
                <ListItem>evidovat nálezy (včetně popisů a fotografií)</ListItem>
                <ListItem>ukládat nálezy do vlastního digitálního katalogu</ListItem>
                <ListItem>využívat základní funkce vyhledávání a filtrování</ListItem>
              </ul>
              <p className="mb-6 text-white/50 text-xs">
                Bezplatná verze eArcheo může mít omezené funkce, např. limitovaný počet uložených nálezů (typicky do 50 objevů).
              </p>

              <h4 className="text-white font-display text-base mb-3">2.2 Prémiová služba eArcheo Plus</h4>
              <p className="mb-4">
                eArcheo Plus je prémiová nadstavba nad základní aplikací, která přináší zejména:
              </p>
              <ul className="list-none space-y-2 ml-4">
                <ListItem highlight>AI identifikaci nálezů – možnost nahrát fotografii nálezu a nechat ji porovnat s databází</ListItem>
                <ListItem highlight>rozšířenou kapacitu pro ukládání nálezů – prakticky neomezený počet objevů</ListItem>
                <ListItem>další rozšířené funkce (detailní statistiky, pokročilé vyhledávání, export dat, prioritní podpora)</ListItem>
              </ul>
            </Section>

            {/* Section 3 */}
            <Section 
              icon={<Shield className="w-5 h-5" />}
              title="3. Uživatelský účet a registrace"
            >
              <p className="mb-4">Pro používání eArcheo je nutné vytvořit si uživatelský účet:</p>
              <ul className="list-none space-y-2 ml-4">
                <ListItem>Registrací potvrzujete, že jste starší 16 let (nebo máte souhlas zákonného zástupce)</ListItem>
                <ListItem>Při registraci zadáváte pravdivé a aktuální údaje; případné změny jste povinni aktualizovat</ListItem>
                <ListItem>Přístupové údaje (zejména heslo) nesmíte sdílet s třetími osobami</ListItem>
                <ListItem>Správce je oprávněn účet zablokovat v případě podezření na zneužití</ListItem>
              </ul>
              <p className="mt-4 text-white/50 text-xs">
                Registrace může probíhat buď přes klasický formulář (e-mail + heslo), nebo prostřednictvím služeb třetích stran (např. Facebook Login).
              </p>
            </Section>

            {/* Section 4 */}
            <Section 
              icon={<CreditCard className="w-5 h-5" />}
              title="4. Ceník a předplatné eArcheo Plus"
            >
              <p className="mb-4">Pro eArcheo Plus nabízíme tyto varianty předplatného (ceny včetně 21 % DPH):</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <PriceCard 
                  title="Měsíční"
                  price="99 Kč"
                  period="měsíc"
                />
                <PriceCard 
                  title="Roční"
                  price="990 Kč"
                  period="rok"
                  highlight
                  note="cca 82,50 Kč / měsíc"
                />
              </div>

              <h4 className="text-white font-display text-base mb-3">4.1 Opakovaná platba</h4>
              <ul className="list-none space-y-2 mb-6 ml-4">
                <ListItem>Částka se strhává automaticky z platební karty prostřednictvím platební brány GoPay</ListItem>
                <ListItem>Při objednávce musíte výslovně udělit souhlas se zřízením opakované platby</ListItem>
                <ListItem>U ročního předplatného vás upozorníme e-mailem min. 7 dní před dalším stržením</ListItem>
              </ul>

              <h4 className="text-white font-display text-base mb-3">4.2 Způsob platby</h4>
              <ul className="list-none space-y-2 ml-4">
                <ListItem>Platba probíhá bezhotovostně online kartou (Visa, Mastercard) přes GoPay</ListItem>
                <ListItem>Platí se předem na celé období (měsíční/roční)</ListItem>
                <ListItem>Transakce probíhají v CZK</ListItem>
                <ListItem>Údaje o kartě zpracovává pouze GoPay; Golden Nose s.r.o. k nim nemá přístup</ListItem>
              </ul>
            </Section>

            {/* Section 5-7 */}
            <Section 
              icon={<Scale className="w-5 h-5" />}
              title="5-7. Objednávka, poskytování služby a práva spotřebitele"
            >
              <h4 className="text-white font-display text-base mb-3">Uzavření smlouvy</h4>
              <ul className="list-none space-y-2 mb-6 ml-4">
                <ListItem>Nabídka předplatného je vždy aktuální na webu eArcheo.cz</ListItem>
                <ListItem>Smlouva je uzavřena v momentě úspěšného zaplacení předplatného</ListItem>
                <ListItem>Potvrzení objednávky včetně podmínek zašleme e-mailem</ListItem>
                <ListItem>Smlouva je uzavírána v českém jazyce a řídí se právem ČR</ListItem>
              </ul>

              <h4 className="text-white font-display text-base mb-3">Odstoupení od smlouvy</h4>
              <p className="mb-4">
                Jako spotřebitel máte právo odstoupit od smlouvy do <strong className="text-white">14 dnů</strong> od jejího uzavření bez udání důvodu.
              </p>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-primary text-xs mb-2 font-display">Jak uplatnit odstoupení:</p>
                <p className="text-white/60 text-xs">
                  Zašlete e-mail na <a href="mailto:podpora@earcheo.cz" className="text-primary hover:underline">podpora@earcheo.cz</a> s předmětem „Odstoupení od smlouvy". 
                  Uveďte své jméno, e-mail použitý při registraci a datum objednávky. 
                  Peníze vracíme do 14 dnů od doručení odstoupení.
                </p>
              </div>
            </Section>

            {/* Section 8 */}
            <Section 
              icon={<AlertTriangle className="w-5 h-5" />}
              title="8. Reklamace služby"
            >
              <p className="mb-4">
                Reklamaci můžete uplatnit, pokud eArcheo Plus nefunguje podle popisu (např. dlouhodobá nedostupnost, technická závada, chybná platba).
              </p>
              
              <h4 className="text-white font-display text-base mb-3">Postup reklamace</h4>
              <ol className="list-decimal list-inside space-y-2 mb-6 text-white/60">
                <li>Kontaktujte nás e-mailem na <a href="mailto:podpora@earcheo.cz" className="text-primary hover:underline">podpora@earcheo.cz</a></li>
                <li>Popište problém, uveďte svůj registrační e-mail a případné číslo objednávky</li>
                <li>Reklamaci vyřídíme nejpozději do 30 dnů</li>
              </ol>

              <h4 className="text-white font-display text-base mb-3">Možné způsoby řešení</h4>
              <ul className="list-none space-y-2 ml-4">
                <ListItem>odstranění vady (oprava funkce)</ListItem>
                <ListItem>poskytnutí náhradního plnění (prodloužení předplatného)</ListItem>
                <ListItem>vrácení poměrné části nebo celé zaplacené ceny</ListItem>
              </ul>
            </Section>

            {/* Section 9-11 */}
            <Section 
              icon={<Shield className="w-5 h-5" />}
              title="9-11. Odpovědnost, ochrana údajů a závěrečná ustanovení"
            >
              <h4 className="text-white font-display text-base mb-3">Odpovědnost za obsah</h4>
              <ul className="list-none space-y-2 mb-6 ml-4">
                <ListItem>Uživatel odpovídá za obsah, který do eArcheo nahrává</ListItem>
                <ListItem>Výstupy AI mají doporučující charakter a nejsou závazným odborným posudkem</ListItem>
                <ListItem>Provozovatel neodpovídá za škodu způsobenou okolnostmi mimo jeho kontrolu</ListItem>
              </ul>

              <h4 className="text-white font-display text-base mb-3">Ochrana osobních údajů</h4>
              <p className="mb-6">
                Podrobnosti o zpracování osobních údajů naleznete na stránce{' '}
                <Link to="/privacy" className="text-primary hover:underline">Zásady ochrany osobních údajů</Link>.
              </p>

              <div className="p-4 bg-surface/60 border border-white/10 rounded-xl">
                <p className="text-white/50 text-xs">
                  Tyto Podmínky použití nabývají účinnosti dne <strong className="text-white">1. 1. 2026</strong>. 
                  Aktuální znění je vždy zveřejněno na webu eArcheo.cz. 
                  O podstatných změnách vás budeme informovat e-mailem alespoň 14 dní před účinností změny.
                </p>
              </div>
            </Section>

            {/* Contact */}
            <Section 
              icon={<Mail className="w-5 h-5" />}
              title="Kontakt"
            >
              <p>
                V případě dotazů k těmto podmínkám nás kontaktujte na{' '}
                <a href="mailto:info@earcheo.cz" className="text-primary hover:underline">info@earcheo.cz</a> nebo{' '}
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
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <h2 className="font-display text-xl text-white pt-2">{title}</h2>
    </div>
    <div className="ml-[52px]">
      {children}
    </div>
  </section>
);

// List item component
interface ListItemProps {
  children: React.ReactNode;
  highlight?: boolean;
}

const ListItem = ({ children, highlight }: ListItemProps) => (
  <li className="flex items-start gap-2">
    <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${highlight ? 'bg-primary' : 'bg-white/30'}`} />
    <span className={highlight ? 'text-white/80' : ''}>{children}</span>
  </li>
);

// Price card component
interface PriceCardProps {
  title: string;
  price: string;
  period: string;
  highlight?: boolean;
  note?: string;
}

const PriceCard = ({ title, price, period, highlight, note }: PriceCardProps) => (
  <div className={`p-4 rounded-xl border ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-surface/60 border-white/10'}`}>
    <p className={`font-mono text-xs mb-1 ${highlight ? 'text-primary' : 'text-white/50'}`}>{title}</p>
    <p className="font-display text-2xl text-white">
      {price} <span className="text-white/50 text-sm">/ {period}</span>
    </p>
    {note && <p className="text-primary/60 text-xs mt-1">{note}</p>}
  </div>
);



