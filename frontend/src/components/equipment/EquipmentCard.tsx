import { useState } from 'react';
import { Edit, Trash2, Search, Navigation, Package as PackageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { BaseCard, StatusBadge, ConfirmDialog } from '../shared';
import { useEquipment } from '../../hooks/useEquipment';
import type { Equipment, EquipmentType } from '../../types/database';

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: () => void;
}

export const EquipmentCard = ({ equipment, onEdit }: EquipmentCardProps) => {
  const { deleteEquipment } = useEquipment({ autoFetch: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEquipment(equipment.id);
      toast.success('Vybavení bylo smazáno');
      setShowDeleteConfirm(false);
    } catch (error: unknown) {
      console.error('Delete error:', error);
      if (error.message.includes('used in findings')) {
        toast.error('Nelze smazat vybavení použité v nálezech');
      } else {
        toast.error('Chyba při mazání vybavení');
      }
    } finally {
      setDeleting(false);
    }
  };

  const getTypeIcon = (type: EquipmentType) => {
    switch (type) {
      case 'DETECTOR': return Search;
      case 'GPS': return Navigation;
      default: return PackageIcon;
    }
  };

  const getTypeLabel = (type: EquipmentType) => {
    switch (type) {
      case 'DETECTOR': return 'Detektor';
      case 'GPS': return 'GPS';
      default: return 'Ostatní';
    }
  };

  const getTypeColor = (type: EquipmentType) => {
    switch (type) {
      case 'DETECTOR': return 'amber';
      case 'GPS': return 'blue';
      default: return 'gray';
    }
  };

  const Icon = getTypeIcon(equipment.type);

  return (
    <>
      <BaseCard className="hover:scale-[1.02] transition-transform">
        <div className="flex flex-col h-full">
          {/* Icon & Type */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <StatusBadge 
              type={equipment.type} 
              label={getTypeLabel(equipment.type)}
              color={getTypeColor(equipment.type)}
            />
          </div>

          {/* Name */}
          <h3 className="font-display text-lg text-white mb-2 truncate">
            {equipment.name}
          </h3>

          {/* Manufacturer & Model */}
          {(equipment.manufacturer || equipment.model) && (
            <p className="text-sm text-white/60 font-mono mb-2 truncate">
              {[equipment.manufacturer, equipment.model].filter(Boolean).join(' ')}
            </p>
          )}

          {/* Notes */}
          {equipment.notes && (
            <p className="text-xs text-white/40 font-mono mb-3 line-clamp-2">
              {equipment.notes}
            </p>
          )}

          {/* Usage Stats */}
          <div className="mt-auto pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/50 font-mono uppercase">
                Použito
              </span>
              <span className="text-lg font-display text-primary">
                {equipment.usageCount || 0}×
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white font-mono text-xs transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                Upravit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-mono text-xs transition-all"
                title="Smazat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Smazat vybavení?"
        message={(equipment.usageCount || 0) > 0 
          ? `Toto vybavení je použito v ${equipment.usageCount} ${equipment.usageCount === 1 ? 'nálezu' : (equipment.usageCount || 0) < 5 ? 'nálezech' : 'nálezech'}. Smazání není možné.`
          : 'Opravdu chcete smazat toto vybavení? Tato akce je nevratná.'
        }
        confirmLabel={(equipment.usageCount || 0) > 0 ? undefined : "Ano, smazat"}
        cancelLabel={(equipment.usageCount || 0) > 0 ? "OK" : "Zrušit"}
        variant="danger"
        onConfirm={(equipment.usageCount || 0) > 0 ? (() => setShowDeleteConfirm(false)) : handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleting}
      />
    </>
  );
};

