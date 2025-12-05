import { useState, useEffect } from 'react';
import { X, ChevronLeft, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';
import { useSectors } from '../../hooks/useSectors';
import { useTracks } from '../../hooks/useTracks';
import type { Sector, GeoJSONPolygon, GeoJSONLineString } from '../../types/database';
import { 
  generateStrips,
  createSnakeRoute,
} from '../../utils/geometry';
import { SectorList } from './SectorList';
import { SectorDetail } from './SectorDetail';
import { SectorForm } from './SectorForm';

interface SectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDrawing: () => void;
  drawnPolygon: GeoJSONPolygon | null;
  drawingPolygon: [number, number][]; // In-progress drawing coordinates
  onClearDrawing: () => void;
  onEditPolygon: () => void; // Re-enable drawing to edit polygon
  onSelectSector: (sector: Sector | null) => void;
  selectedSector: Sector | null;
  onStripPreviewChange?: (strips: GeoJSONLineString[]) => void; // Live strip preview
}

type PanelView = 'list' | 'detail' | 'create' | 'edit';

export const SectorPanel = ({
  isOpen,
  onClose,
  onStartDrawing,
  drawnPolygon,
  drawingPolygon,
  onClearDrawing,
  onEditPolygon,
  onSelectSector,
  selectedSector,
  onStripPreviewChange,
}: SectorPanelProps) => {
  const { sectors, loading, createSector, updateSector, deleteSector, fetchSectors } = useSectors();
  const { tracks, createTracks, fetchTracks, deleteTracks } = useTracks();
  
  const [view, setView] = useState<PanelView>('list');
  const [stripWidth, setStripWidth] = useState(3);
  const [generatedStrips, setGeneratedStrips] = useState<GeoJSONLineString[]>([]);

  // Reset view when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setGeneratedStrips([]);
    }
  }, [isOpen]);

  // When a sector is selected, load its tracks
  useEffect(() => {
    if (selectedSector) {
      fetchTracks(selectedSector.id);
      setView('detail');
    }
  }, [selectedSector?.id]);

  // Handle creating new sector
  const handleCreate = async (name: string, description?: string) => {
    if (!drawnPolygon) {
      toast.error('Nejprve nakreslete polygon na mapě');
      return;
    }

    try {
      const sector = await createSector({
        name,
        description,
        geometry: drawnPolygon,
        stripWidth,
      });
      
      toast.success('Sektor byl vytvořen');
      onClearDrawing();
      onSelectSector(sector);
      setView('detail');
    } catch (err) {
      toast.error('Nepodařilo se vytvořit sektor');
    }
  };

  // Handle updating sector
  const handleUpdate = async (id: string, name: string, description?: string) => {
    try {
      const sector = await updateSector(id, { name, description });
      toast.success('Sektor byl aktualizován');
      onSelectSector(sector);
      setView('detail');
    } catch (err) {
      toast.error('Nepodařilo se aktualizovat sektor');
    }
  };

  // Handle deleting sector
  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento sektor?')) return;
    
    try {
      await deleteSector(id);
      toast.success('Sektor byl smazán');
      onSelectSector(null);
      setView('list');
    } catch (err) {
      toast.error('Nepodařilo se smazat sektor');
    }
  };

  // Generate strips preview
  const handleGenerateStrips = () => {
    if (!selectedSector) return;
    
    const strips = generateStrips(selectedSector.geometry, stripWidth);
    const snakeRoute = createSnakeRoute(strips);
    setGeneratedStrips(snakeRoute);
  };

  // Save generated tracks
  const handleSaveTracks = async () => {
    if (!selectedSector || generatedStrips.length === 0) return;

    try {
      await createTracks(
        selectedSector.id,
        generatedStrips.map((geometry, index) => ({ geometry, order: index }))
      );
      toast.success(`${generatedStrips.length} pásů bylo uloženo`);
      setGeneratedStrips([]);
      fetchSectors(); // Refresh to get updated track count
    } catch (err) {
      toast.error('Nepodařilo se uložit pásy');
    }
  };

  // Reset tracks
  const handleResetTracks = async () => {
    if (!selectedSector) return;
    if (!confirm('Opravdu chcete smazat všechny pásy?')) return;

    try {
      await deleteTracks(selectedSector.id);
      toast.success('Pásy byly smazány');
      setGeneratedStrips([]);
    } catch (err) {
      toast.error('Nepodařilo se smazat pásy');
    }
  };

  // Export sector as GeoJSON
  const handleExport = () => {
    if (!selectedSector) return;

    const geoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: selectedSector.name,
            description: selectedSector.description,
            type: 'sector',
          },
          geometry: selectedSector.geometry,
        },
        ...tracks.map(track => ({
          type: 'Feature',
          properties: {
            status: track.status,
            order: track.order,
            type: 'track',
          },
          geometry: track.geometry,
        })),
      ],
    };

    const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSector.name.replace(/\s+/g, '_')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('GeoJSON exportován');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-24 left-6 z-40 w-80 max-h-[calc(100vh-140px)] bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <button
              onClick={() => {
                setView('list');
                onSelectSector(null);
                setGeneratedStrips([]);
              }}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <Grid3X3 className="w-5 h-5 text-emerald-400" />
          <span className="font-display text-white text-sm">
            {view === 'list' && 'Sektory'}
            {view === 'detail' && selectedSector?.name}
            {view === 'create' && 'Nový sektor'}
            {view === 'edit' && 'Upravit sektor'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* List View */}
        {view === 'list' && (
          <SectorList
            sectors={sectors}
            loading={loading}
            onSelect={(sector) => {
              onSelectSector(sector);
              setView('detail');
            }}
            onNewSector={() => {
              setView('create');
              onStartDrawing();
            }}
          />
        )}

        {/* Create View */}
        {view === 'create' && (
          <SectorForm
            drawnPolygon={drawnPolygon}
            drawingPolygon={drawingPolygon}
            stripWidth={stripWidth}
            onStripWidthChange={setStripWidth}
            onSubmit={handleCreate}
            onCancel={() => {
              setView('list');
              onClearDrawing();
            }}
            onEditPolygon={onEditPolygon}
            onStripsGenerated={onStripPreviewChange}
          />
        )}

        {/* Edit View */}
        {view === 'edit' && selectedSector && (
          <SectorForm
            initialName={selectedSector.name}
            initialDescription={selectedSector.description || ''}
            drawnPolygon={selectedSector.geometry}
            stripWidth={selectedSector.stripWidth}
            onStripWidthChange={setStripWidth}
            onSubmit={(name, desc) => handleUpdate(selectedSector.id, name, desc)}
            onCancel={() => setView('detail')}
            isEdit
          />
        )}

        {/* Detail View */}
        {view === 'detail' && selectedSector && (
          <SectorDetail
            sector={selectedSector}
            tracks={tracks}
            generatedStrips={generatedStrips}
            stripWidth={stripWidth}
            onStripWidthChange={setStripWidth}
            onGenerateStrips={handleGenerateStrips}
            onSaveTracks={handleSaveTracks}
            onResetTracks={handleResetTracks}
            onEdit={() => setView('edit')}
            onDelete={() => handleDelete(selectedSector.id)}
            onExport={handleExport}
          />
        )}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400/30 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400/30 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400/30 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400/30 rounded-br-xl" />
    </div>
  );
};

