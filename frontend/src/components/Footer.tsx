import { Link } from 'react-router-dom';
import { 
  Map, 
  FileText, 
  Mail, 
  Shield, 
  Trash2,
  ExternalLink,
  Sparkles,
  Github,
  Heart
} from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative z-10 border-t border-white/10 bg-gradient-to-b from-transparent via-surface/50 to-surface/80">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0a1628] to-[#0d1f35] border border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" className="text-primary/60" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" className="text-primary/80" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-primary"/>
                  <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
                  <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
                  <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
                  <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg text-white tracking-wider">eArcheo</h3>
                <span className="text-[10px] text-primary/60 font-mono tracking-widest uppercase">Pro objevitele</span>
              </div>
            </div>
            <p className="text-white/40 font-mono text-xs leading-relaxed mb-6 max-w-xs">
              Moderní platforma pro evidenci sbírek a průzkum krajiny. 
              LiDAR, ortofoto a historické mapy pro archeology, numismatiky i detektoráře.
            </p>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-primary/10 border border-primary/30 rounded-lg text-primary text-[10px] font-mono tracking-wider">
                v1.2
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-mono tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-display text-sm text-white mb-4 flex items-center gap-2">
              <Map className="w-4 h-4 text-primary" />
              Aplikace
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/map" icon={<Map className="w-3.5 h-3.5" />}>
                Interaktivní mapa
              </FooterLink>
              <FooterLink to="/features" icon={<Sparkles className="w-3.5 h-3.5" />}>
                Požadavky na funkce
              </FooterLink>
              <FooterLink to="/changelog" icon={<FileText className="w-3.5 h-3.5" />}>
                Changelog
              </FooterLink>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display text-sm text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Právní informace
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/terms" icon={<FileText className="w-3.5 h-3.5" />}>
                Podmínky použití
              </FooterLink>
              <FooterLink to="/privacy" icon={<Shield className="w-3.5 h-3.5" />}>
                Ochrana osobních údajů
              </FooterLink>
              <FooterLink to="/data-deletion" icon={<Trash2 className="w-3.5 h-3.5" />}>
                Smazání účtu a dat
              </FooterLink>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-display text-sm text-white mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Kontakt
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a 
                  href="mailto:ahoj@earcheo.cz"
                  className="group flex items-center gap-2.5 text-white/50 hover:text-primary font-mono text-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  ahoj@earcheo.cz
                </a>
              </li>
              <li>
                <a 
                  href="mailto:podpora@earcheo.cz"
                  className="group flex items-center gap-2.5 text-white/50 hover:text-primary font-mono text-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  podpora@earcheo.cz
                </a>
              </li>
            </ul>
            
            {/* Company info */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-white/30 font-mono text-[10px] leading-relaxed">
                Golden Nose s.r.o.<br />
                IČO: 24142484<br />
                Praha 4 – Braník
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-white/30 font-mono text-xs flex items-center gap-2">
              © {currentYear} eArcheo · Všechna práva vyhrazena
            </p>
            
            {/* Made by PicturesControl */}
            <div className="flex items-center gap-2">
              <span className="text-white/30 font-mono text-[10px]">Vytvořilo</span>
              <a 
                href="https://picturescontrol.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <img 
                  src="/logo_picturescontrol.webp" 
                  alt="PicturesControl" 
                  className="h-3.5"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </footer>
  );
};

// Footer link component
interface FooterLinkProps {
  to: string;
  icon?: React.ReactNode;
  external?: boolean;
  children: React.ReactNode;
}

const FooterLink = ({ to, icon, external, children }: FooterLinkProps) => {
  const className = "group flex items-center gap-2.5 text-white/50 hover:text-primary font-mono text-xs transition-all";
  
  if (external) {
    return (
      <li>
        <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
          {icon && <span className="group-hover:scale-110 transition-transform">{icon}</span>}
          {children}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
      </li>
    );
  }
  
  return (
    <li>
      <Link to={to} className={className}>
        {icon && <span className="group-hover:scale-110 transition-transform">{icon}</span>}
        {children}
      </Link>
    </li>
  );
};

