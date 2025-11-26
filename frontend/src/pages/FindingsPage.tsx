import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFindings } from '../hooks/useFindings';
import { FindingCard } from '../components/findings/FindingCard';
import { FindingForm } from '../components/findings/FindingForm';
import { SectionHeader, LoadingSkeleton, EmptyState } from '../components/shared';

export const FindingsPage = () => {
  const navigate = useNavigate();
  const { findings, loading } = useFindings();
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Top Bar - použijeme stejný jako na MapPage */}
      <div className="h-[72px]" /> {/* Spacer pro fixed header */}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <SectionHeader 
          title="Moje Nálezy"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-sm tracking-wider transition-all"
            >
              <Plus className="w-4 h-4" />
              Přidat nález
            </button>
          }
        />
        
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary font-mono text-xs">
            Vše ({findings.length})
          </button>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/10 font-mono text-xs transition-colors">
            Mince
          </button>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/10 font-mono text-xs transition-colors">
            Nástroje
          </button>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/10 font-mono text-xs transition-colors">
            Keramika
          </button>
        </div>
        
        {/* Findings List */}
        {loading ? (
          <LoadingSkeleton />
        ) : findings.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Zatím žádné nálezy"
            description="Začněte přidáním svého prvního archeologického nálezu"
            action={{
              label: 'Přidat první nález',
              onClick: () => setShowForm(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {findings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                onClick={() => navigate(`/findings/${finding.id}`)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Finding Form Modal */}
      {showForm && (
        <FindingForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            // Findings list se automaticky aktualizuje díky useFindings hook
          }}
        />
      )}
    </div>
  );
};

