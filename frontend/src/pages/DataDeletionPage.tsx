import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Settings, Mail, Facebook, AlertTriangle, Clock, Shield } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Footer } from '../components/Footer';

export const DataDeletionPage = () => {
  return (
    <>
      <SEOHead
        title="Smazání účtu a dat"
        description="Instrukce ke smazání účtu a osobních dat v aplikaci eArcheo. Jak požádat o výmaz údajů podle GDPR."
        keywords="smazání účtu, výmaz dat, GDPR, osobní údaje, eArcheo"
        canonicalUrl="/data-deletion"
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
          <div className="absolute top-1/3 right-1/3 w-[600px] h-[600px] bg-red-500/3 rounded-full blur-[150px]" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-mono text-xs tracking-wider">DATA DELETION</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Smazání účtu a osobních dat
            </h1>
            <p className="text-white/50 font-mono text-sm">
              Instrukce ke smazání účtu v eArcheo / eArcheo Plus
            </p>
          </div>

          {/* Intro */}
          <div className="p-6 bg-surface/60 border border-white/10 rounded-2xl mb-10">
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              Tato stránka popisuje, jak můžete požádat o smazání svého účtu a osobních údajů spojených se službou 
              <strong className="text-white"> eArcheo / eArcheo Plus</strong>, včetně dat získaných prostřednictvím 
              přihlášení přes Facebook nebo jiné externí služby.
            </p>
          </div>

          {/* Content sections */}
          <div className="space-y-10 text-white/70 font-mono text-sm leading-relaxed">
            
            {/* Method 1 - In App */}
            <Section 
              icon={<Settings className="w-5 h-5" />}
              title="1. Smazání účtu přímo v aplikaci"
              number="01"
            >
              <p className="mb-4">Pokud máte přístup ke svému účtu:</p>
              
              <div className="space-y-3 mb-6">
                <StepCard number={1} text="Přihlaste se na webu eArcheo.cz" />
                <StepCard number={2} text='V uživatelském rozhraní otevřete Nastavení účtu' />
                <StepCard number={3} text='Vyberte možnost „Zrušit účet" / „Smazat účet" a postup ověřte' />
              </div>

              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl mb-4">
                <p className="text-red-400 text-xs mb-2 font-display">Po potvrzení dojde k:</p>
                <ul className="space-y-1.5">
                  <DeleteItem>zrušení vašeho účtu</DeleteItem>
                  <DeleteItem>vymazání osobních údajů v naší aplikaci</DeleteItem>
                  <DeleteItem>vymazání uložených nálezů a souvisejících dat</DeleteItem>
                  <DeleteItem>odhlášení ze všech aktivních relací</DeleteItem>
                </ul>
              </div>

              <p className="text-white/50 text-xs">
                K výmazu dat v databázi dojde bez zbytečného odkladu, obvykle do několika minut. 
                Některé údaje můžeme uchovat po zákonem stanovenou dobu (např. faktury) – viz{' '}
                <Link to="/privacy" className="text-primary hover:underline">Zásady ochrany osobních údajů</Link>.
              </p>
            </Section>

            {/* Method 2 - Email */}
            <Section 
              icon={<Mail className="w-5 h-5" />}
              title="2. Žádost o smazání e-mailem"
              number="02"
            >
              <p className="mb-4">
                Pokud nemáte k účtu přístup (např. zapomenuté přihlašovací údaje) nebo nemůžete použít funkci smazání přímo v aplikaci, 
                můžete požádat o výmaz dat e-mailem.
              </p>

              <div className="p-5 bg-surface/80 border border-primary/20 rounded-xl mb-6">
                <p className="text-primary text-xs mb-4 font-display">Postup žádosti e-mailem:</p>
                <div className="space-y-3">
                  <StepCard 
                    number={1} 
                    text={<>Napište e-mail na adresu <a href="mailto:podpora@earcheo.cz" className="text-primary hover:underline">podpora@earcheo.cz</a></>} 
                  />
                  <StepCard 
                    number={2} 
                    text='Do předmětu uveďte „Žádost o smazání účtu a dat"' 
                  />
                  <StepCard 
                    number={3} 
                    text="V těle zprávy uveďte registrační e-mail, celé jméno a žádost o smazání" 
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-400 text-xs font-display mb-1">Lhůta pro vyřízení</p>
                  <p className="text-white/60 text-xs">
                    Vaši žádost vyřídíme <strong className="text-white">bez zbytečného odkladu</strong>, 
                    nejpozději do 30 dnů od jejího doručení. Po provedení výmazu vám zašleme potvrzení e-mailem.
                  </p>
                </div>
              </div>
            </Section>

            {/* Facebook */}
            <Section 
              icon={<Facebook className="w-5 h-5" />}
              title="3. Data získaná přes Facebook Login"
              number="03"
            >
              <p className="mb-4">
                Pokud jste se do eArcheo přihlašovali prostřednictvím Facebooku, aplikace mohla získat:
              </p>
              
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                <FacebookDataCard text="Jméno a příjmení" />
                <FacebookDataCard text="E-mailová adresa" />
                <FacebookDataCard text="Interní Facebook ID" />
              </div>

              <p className="mb-4">Při smazání účtu postupujeme takto:</p>
              <ul className="list-none space-y-2 mb-6 ml-4">
                <ListItem>Vaše údaje uložené v naší databázi (včetně údajů z Facebooku) vymažeme</ListItem>
                <ListItem>Zneplatníme interní vazby k vašemu Facebook ID</ListItem>
              </ul>

              <div className="p-4 bg-[#1877F2]/5 border border-[#1877F2]/20 rounded-xl">
                <p className="text-[#1877F2] text-xs mb-3 font-display flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Odebrání aplikace na Facebooku
                </p>
                <p className="text-white/60 text-xs mb-3">
                  Doporučujeme po smazání účtu eArcheo také odebrat aplikaci ve svém profilu na Facebooku:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-white/50 text-xs">
                  <li>Přihlaste se na Facebook</li>
                  <li>Otevřete <strong className="text-white/70">Nastavení</strong> → <strong className="text-white/70">Aplikace a weby</strong></li>
                  <li>Najděte aplikaci <strong className="text-white/70">eArcheo</strong></li>
                  <li>Klikněte na „Odebrat"</li>
                </ol>
              </div>
            </Section>

            {/* Retained data */}
            <Section 
              icon={<AlertTriangle className="w-5 h-5" />}
              title="4. Údaje, které nemůžeme okamžitě smazat"
              number="04"
            >
              <p className="mb-4">
                Z důvodu zákonných povinností musíme některé údaje uchovat i po zrušení účtu:
              </p>
              
              <div className="space-y-3 mb-6">
                <RetainedCard 
                  title="Daňové doklady"
                  description="Údaje na fakturách po dobu stanovenou zákonem"
                />
                <RetainedCard 
                  title="Právní nároky"
                  description="Údaje nezbytné pro uplatnění nebo obhajobu právních nároků (max. po dobu promlčecí lhůty)"
                />
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-400 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Tyto údaje však nejsou dále zpracovávány pro běžný provoz služby, nepoužíváme je pro marketing 
                  a žádným způsobem nezhoršují vaše soukromí v rámci eArcheo.
                </p>
              </div>
            </Section>

            {/* Contact */}
            <Section 
              icon={<Mail className="w-5 h-5" />}
              title="5. Kontakt pro dotazy k výmazu dat"
              number="05"
            >
              <p className="mb-4">Máte-li jakékoli dotazy týkající se smazání účtu nebo osobních údajů, kontaktujte nás:</p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <a 
                  href="mailto:podpora@earcheo.cz"
                  className="group flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl hover:border-primary/40 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-display text-sm">Podpora</p>
                    <p className="text-primary text-xs">podpora@earcheo.cz</p>
                  </div>
                </a>
                <a 
                  href="mailto:info@earcheo.cz"
                  className="group flex items-center gap-3 p-4 bg-surface/60 border border-white/10 rounded-xl hover:border-white/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-display text-sm">Obecné dotazy</p>
                    <p className="text-white/50 text-xs">info@earcheo.cz</p>
                  </div>
                </a>
              </div>

              <div className="p-5 bg-surface/60 border border-white/10 rounded-xl">
                <p className="text-white/60 text-xs leading-relaxed">
                  Vaše soukromí bereme vážně a vyhovění žádosti o výmaz je naší zákonnou povinností i prioritou. 
                  Pokud se rozhodnete naše služby nadále nevyužívat, zajistíme bezpečné odstranění vašich dat 
                  v souladu s <strong className="text-white">GDPR</strong> a platnými právními předpisy.
                </p>
              </div>
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
  number: string;
  children: React.ReactNode;
}

const Section = ({ icon, title, number, children }: SectionProps) => (
  <section className="relative">
    <div className="flex items-start gap-3 mb-4">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
          {icon}
        </div>
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-surface border border-white/10 rounded text-[9px] text-white/40 font-mono">
          {number}
        </span>
      </div>
      <h2 className="font-display text-xl text-white pt-2">{title}</h2>
    </div>
    <div className="ml-[52px]">
      {children}
    </div>
  </section>
);

// Step card
interface StepCardProps {
  number: number;
  text: React.ReactNode;
}

const StepCard = ({ number, text }: StepCardProps) => (
  <div className="flex items-center gap-3 p-3 bg-surface/60 border border-white/10 rounded-xl">
    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-mono flex-shrink-0">
      {number}
    </div>
    <p className="text-white/70 text-xs">{text}</p>
  </div>
);

// Delete item
const DeleteItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center gap-2 text-white/60 text-xs">
    <Trash2 className="w-3 h-3 text-red-400 flex-shrink-0" />
    {children}
  </li>
);

// List item
const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2">
    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-white/30" />
    <span>{children}</span>
  </li>
);

// Facebook data card
const FacebookDataCard = ({ text }: { text: string }) => (
  <div className="p-3 bg-[#1877F2]/5 border border-[#1877F2]/20 rounded-xl text-center">
    <p className="text-white/70 text-xs">{text}</p>
  </div>
);

// Retained card
interface RetainedCardProps {
  title: string;
  description: string;
}

const RetainedCard = ({ title, description }: RetainedCardProps) => (
  <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-white font-display text-sm">{title}</p>
      <p className="text-white/50 text-xs mt-1">{description}</p>
    </div>
  </div>
);

