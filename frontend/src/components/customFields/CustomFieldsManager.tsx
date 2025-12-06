import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Loader } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { CustomFieldForm } from './CustomFieldForm';
import { ConfirmDialog } from '../shared';
import { useCustomFields } from '../../hooks/useCustomFields';
import { CUSTOM_FIELD_TYPE_LABELS } from '../../utils/findingFieldsConfig';
import type { CustomField, CreateCustomFieldRequest } from '../../types/database';

export const CustomFieldsManager = () => {
  const { 
    customFields, 
    loading, 
    createCustomField, 
    updateCustomField, 
    deleteCustomField 
  } = useCustomFields();
  
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deletingField, setDeletingField] = useState<CustomField | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (data: CreateCustomFieldRequest) => {
    await createCustomField(data);
    toast.success('Pole bylo vytvořeno');
  };

  const handleUpdate = async (data: CreateCustomFieldRequest) => {
    if (!editingField) return;
    await updateCustomField(editingField.id, data);
    toast.success('Pole bylo aktualizováno');
    setEditingField(null);
  };

  const handleDelete = async () => {
    if (!deletingField) return;
    
    setDeleting(true);
    try {
      await deleteCustomField(deletingField.id);
      toast.success('Pole bylo smazáno');
      setDeletingField(null);
    } catch (error) {
      toast.error('Nepodařilo se smazat pole');
    } finally {
      setDeleting(false);
    }
  };

  const getIcon = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-white">Vlastní pole</h3>
          <p className="text-xs text-white/50 font-mono">
            {customFields.length}/10 polí
          </p>
        </div>
        
        {customFields.length < 10 && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-mono text-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Nové pole
          </button>
        )}
      </div>

      {/* List */}
      {customFields.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
          <p className="text-white/40 font-mono text-sm mb-2">
            Zatím nemáte žádná vlastní pole
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-primary font-mono text-sm hover:underline"
          >
            Vytvořit první pole
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {customFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg group hover:border-white/20 transition-colors"
            >
              {/* Drag handle (placeholder) */}
              <div className="text-white/20 cursor-grab">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                {getIcon(field.icon) || <span className="text-xs font-mono">#</span>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-mono text-sm truncate">
                  {field.name}
                </p>
                <p className="text-white/40 font-mono text-xs">
                  {CUSTOM_FIELD_TYPE_LABELS[field.fieldType as keyof typeof CUSTOM_FIELD_TYPE_LABELS]}
                  {field.fieldType === 'select' && field.options && (
                    <span className="text-white/30"> · {field.options.split(',').length} možností</span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingField(field)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                  title="Upravit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingField(field)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400 transition-colors"
                  title="Smazat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <CustomFieldForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit modal */}
      {editingField && (
        <CustomFieldForm
          field={editingField}
          onSubmit={handleUpdate}
          onClose={() => setEditingField(null)}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingField}
        title="Smazat vlastní pole?"
        message={`Pole "${deletingField?.name}" bude smazáno včetně všech jeho hodnot u nálezů. Tato akce je nevratná.`}
        confirmLabel="Ano, smazat"
        cancelLabel="Zrušit"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingField(null)}
        loading={deleting}
      />
    </div>
  );
};
