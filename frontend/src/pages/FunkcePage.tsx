import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, Search, User, Package, Bookmark, 
  Calendar, Split, Sparkles, Mountain, Map, Layers, Radar,
  Coins, Mail, Medal, Target
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const FunkcePage = () => {
  const [openCategory, setOpenCategory] = useState<string | null>('findings');

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <>
      <SEOHead
        title="Funkce a nástroje | eArcheo"
        description="Kompletní přehled funkcí eArcheo platformy. Správa nálezů, mapové vrstvy, LiDAR data, historické ortofoto, nástroje pro sběratele a detektoráře."
        keywords="funkce eArcheo, nástroje pro detektoráře, správa nálezů, LiDAR mapa, ortofoto archiv, katastrální mapy, numismatika aplikace, evidence sbírek"
        canonicalUrl="/funkce"
        ogType="website"
      />

      <div className="min-h-screen bg-background">
        <Navbar />

        <main id="main-content" className="relative z-10 pt-20 pb-16">
          {/* Hero Section */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-6">
              <span className="text-primary text-xs tracking-wider">KOMPLETNÍ PŘEHLED</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
              Funkce a nástroje
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
              Vše co potřebujete pro evidenci sbírek, průzkum terénu a správu nálezů na jednom místě.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-background font-display transition-all hover:shadow-[0_0_30px_rgba(0,243,255,0.3)]"
            >
              Vyzkoušet zdarma
              <ChevronRight className="w-4 h-4" />
            </Link>
          </section>

          {/* Collector Types */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">
                Pro koho je eArcheo
              </h2>
              <p className="text-white/50 text-sm sm:text-base">
                Platforma pro všechny vášnivé sběratele a badatele
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <CollectorCard 
                icon={<Coins className="w-8 h-8" />}
                title="Numismatici"
                description="Mince a bankovky"
                color="amber"
              />
              <CollectorCard 
                icon={<Mail className="w-8 h-8" />}
                title="Filatelisté"
                description="Poštovní známky"
                color="emerald"
              />
              <CollectorCard 
                icon={<Medal className="w-8 h-8" />}
                title="Militárie"
                description="Vojenské předměty"
                color="red"
              />
              <CollectorCard 
                icon={<Target className="w-8 h-8" />}
                title="Detektoráři"
                description="Hledání artefaktů"
                color="cyan"
              />
            </div>
          </section>

          {/* Map Features */}
          <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-4">
                <span className="text-white/60 text-xs tracking-wider">TECHNOLOGIE</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">
                Klíčové mapové vrstvy
              </h2>
              <p className="text-white/50 text-sm sm:text-base">
                Pracujte s nejpřesnějšími daty pro průzkum krajiny
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Layers className="w-6 h-6" />}
                title="LiDAR Data"
                description="Vysoké rozlišení z ČÚZK"
                image="/lidar.webp"
              />
              <FeatureCard 
                icon={<Map className="w-6 h-6" />}
                title="Více vrstev"
                description="Satelitní snímky, ortofoto ČÚZK"
                image="/vrstvy.webp"
              />
              <FeatureCard 
                icon={<Radar className="w-6 h-6" />}
                title="3D Terén"
                description="Interaktivní vizualizace reliéfu"
                image="/3D.webp"
              />
            </div>
          </section>

          {/* Detailed Features */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-4">
                <span className="text-primary text-xs tracking-wider">VERZE 1.3</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">
                Nástroje pro objevitele
              </h2>
              <p className="text-white/50 text-sm sm:text-base">
                Přehled funkcí pro evidenci nálezů, výprav a studium map
              </p>
            </div>

            <div className="space-y-4">
              {/* Category 1: Findings & Profile */}
              <FeatureCategory 
                title="Správa nálezů a profil" 
                isOpen={openCategory === 'findings'} 
                onToggle={() => toggleCategory('findings')}
              >
                <NewFeatureCard
                  icon={<User className="w-7 h-7" />}
                  title="Profil"
                  description="Správa profilu s statistikami, achievementy a nastavením"
                  features={['Editace profilu', 'Statistiky nálezů', 'Avatar a bio']}
                />
                <NewFeatureCard
                  icon={<Search className="w-7 h-7" />}
                  title="Nálezy"
                  description="Wizard pro výběr typu nálezu s rozšířenými poli"
                  features={['Mince, Známky, Militárie, Terén', 'Dynamická pole podle typu', 'Vlastní uživatelská pole', 'Fotogalerie + GPS']}
                />
                <NewFeatureCard
                  icon={<Package className="w-7 h-7" />}
                  title="Vybavení"
                  description="Správa vašeho archeologického vybavení"
                  features={['Detektory kovů', 'GPS zařízení', 'Další nástroje', 'Statistiky použití']}
                />
              </FeatureCategory>

              {/* Category 2: Map Data */}
              <FeatureCategory 
                title="Mapová data a historie" 
                isOpen={openCategory === 'maps'} 
                onToggle={() => toggleCategory('maps')}
              >
                <NewFeatureCard
                  icon={<Calendar className="w-7 h-7" />}
                  title="Ortofoto archiv"
                  description="Historické snímky ČÚZK od 2007 do 2022"
                  features={['16 let historie', 'HD kvalita', 'Celé území ČR', 'Rychlá volba roku']}
                />
                <NewFeatureCard
                  icon={<Mountain className="w-7 h-7" />}
                  title="ZABAGED vrstevnice"
                  description="Přesné výškopisné linie pro čtení terénu"
                  features={['1m krok', 'Plynulé překrytí', 'Nastavitelná průhlednost', 'Ideální pro analýzu reliéfu']}
                />
                <NewFeatureCard
                  icon={<Map className="w-7 h-7" />}
                  title="Katastrální mapy"
                  description="Aktuální parcely z ČÚZK jako overlay"
                  features={['Čísla parcel', 'Kombinace s LiDAR', 'Řízení opacity', 'Rychlé přepínání']}
                />
              </FeatureCategory>

              {/* Category 3: Tools & UI */}
              <FeatureCategory 
                title="Pokročilé nástroje a UI" 
                isOpen={openCategory === 'tools'} 
                onToggle={() => toggleCategory('tools')}
              >
                <NewFeatureCard
                  icon={<Split className="w-7 h-7" />}
                  title="Custom L/R setup"
                  description="Porovnání dvou map s nezávislými vrstvami"
                  features={['Swipe & split režim', 'Horizontální porovnání', 'Individuální filtry', 'Plynulé přepínání']}
                />
                <NewFeatureCard
                  icon={<Bookmark className="w-7 h-7" />}
                  title="Uložené pohledy"
                  description="Vytvářejte presety s kompletním nastavením mapy"
                  features={['Až 10 presetů', 'Uloží vrstvy i zoom', 'Sdílení připravujeme', 'Přehledné spravování']}
                />
                <NewFeatureCard
                  icon={<Sparkles className="w-7 h-7" />}
                  title="Vylepšené UI"
                  description="Moderní rozhraní navržené pro rychlou práci v terénu"
                  features={['Floating action button', 'Bottom bar pro mobil', 'Jednotné ovládání', 'Rychlé akce']}
                />
              </FeatureCategory>
            </div>
          </section>

          {/* CTA */}
          <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Připraveni začít?
            </h2>
            <p className="text-white/50 text-lg mb-8">
              Zaregistrujte se zdarma a objevte všechny možnosti platformy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="px-8 py-4 bg-primary hover:bg-primary/90 rounded-xl text-background font-display text-lg transition-all hover:shadow-[0_0_40px_rgba(0,243,255,0.4)]"
              >
                Začít objevovat
              </Link>
              <Link
                to="/magazin"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl text-white transition-all"
              >
                Číst magazín
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

// Components
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
}

const FeatureCard = ({ icon, title, description, image }: FeatureCardProps) => (
  <div className="group relative overflow-hidden p-6 bg-surface/40 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-primary/30 transition-all hover:bg-surface/60">
    {image && (
      <>
        <img 
          src={image} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
      </>
    )}
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all">
        {icon}
      </div>
      <h3 className="font-display text-white text-lg mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed max-w-[80%]">{description}</p>
    </div>
  </div>
);

interface FeatureCategoryProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FeatureCategory = ({ title, isOpen, onToggle, children }: FeatureCategoryProps) => (
  <div 
    className={`
      rounded-xl overflow-hidden bg-surface/40 backdrop-blur-sm transition-all duration-300 border
      ${isOpen ? 'border-primary/50 shadow-[0_0_20px_rgba(0,243,255,0.15)]' : 'border-white/10 hover:border-primary/30'}
    `}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-all duration-300"
    >
      <h3 className="font-display text-lg text-white">{title}</h3>
      <ChevronDown className={`w-5 h-5 text-white/50 transition-all duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
    </button>
    {isOpen && (
      <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {children}
      </div>
    )}
  </div>
);

interface NewFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const NewFeatureCard = ({ icon, title, description, features }: NewFeatureCardProps) => (
  <div className="p-6 bg-surface/60 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-primary/30 transition-all group">
    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:shadow-[0_0_25px_rgba(0,243,255,0.25)] transition-all">
      {icon}
    </div>
    <h3 className="font-display text-white text-xl mb-2">{title}</h3>
    <p className="text-white/60 text-sm mb-4 leading-relaxed">{description}</p>
    <ul className="space-y-2">
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-2 text-white/50 text-xs">
          <div className="w-1 h-1 rounded-full bg-primary" />
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

// Collector card
interface CollectorCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'amber' | 'emerald' | 'red' | 'cyan';
}

const colorClasses = {
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500/50',
    iconBg: 'bg-amber-500/20',
    iconBorder: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/20',
    iconBorder: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    hoverBorder: 'hover:border-red-500/50',
    iconBg: 'bg-red-500/20',
    iconBorder: 'border-red-500/30',
    text: 'text-red-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
  },
  cyan: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    hoverBorder: 'hover:border-primary/50',
    iconBg: 'bg-primary/20',
    iconBorder: 'border-primary/30',
    text: 'text-primary',
    glow: 'group-hover:shadow-[0_0_30px_rgba(0,243,255,0.2)]',
  },
};

const CollectorCard = ({ icon, title, description, color }: CollectorCardProps) => {
  const classes = colorClasses[color];
  
  return (
    <div className={`group relative p-6 ${classes.bg} backdrop-blur-sm border ${classes.border} ${classes.hoverBorder} rounded-2xl transition-all duration-300 ${classes.glow}`}>
      <div className={`absolute top-0 right-0 w-20 h-20 ${classes.bg} rounded-bl-[100px] opacity-50`} />
      <div className="relative z-10">
        <div className={`w-16 h-16 rounded-2xl ${classes.iconBg} border ${classes.iconBorder} flex items-center justify-center ${classes.text} mb-4 transition-all ${classes.glow}`}>
          {icon}
        </div>
        <h3 className="font-display text-white text-xl mb-1">{title}</h3>
        <p className={`${classes.text} text-sm`}>{description}</p>
      </div>
    </div>
  );
};
