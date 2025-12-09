import { useState, type FormEvent } from 'react';
import { X, Loader } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CUSTOM_FIELD_TYPE_LABELS, CUSTOM_FIELD_ICONS } from '../../utils/findingFieldsConfig';
import type { CustomField, CustomFieldType, CreateCustomFieldRequest } from '../../types/database';

interface CustomFieldFormProps {
  field?: CustomField | null;
  onSubmit: (data: CreateCustomFieldRequest) => Promise<void>;
  onClose: () => void;
}

export const CustomFieldForm = ({ field, onSubmit, onClose }: CustomFieldFormProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(field?.name || '');
  const [fieldType, setFieldType] = useState<CustomFieldType>(field?.fieldType as CustomFieldType || 'text');
  const [options, setOptions] = useState(field?.options || '');
  const [icon, setIcon] = useState(field?.icon || '');

  const isEditing = !!field;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        fieldType,
        options: fieldType === 'select' ? options.trim() : undefined,
        icon: icon || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-primary/30 rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-primary">
            {isEditing ? 'Upravit pole' : 'Nové vlastní pole'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Název */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Název pole *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="např. Číslo šuplíku"
            />
          </div>

          {/* Typ pole */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Typ pole *
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
            >
              {Object.entries(CUSTOM_FIELD_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-surface">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Options pro select */}
          {fieldType === 'select' && (
            <div>
              <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                Možnosti (oddělené čárkou) *
              </label>
              <input
                type="text"
                required={fieldType === 'select'}
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="např. Ano,Ne,Možná"
              />
              <p className="text-xs text-white/40 font-mono mt-1">
                Oddělte možnosti čárkou bez mezer
              </p>
            </div>
          )}

          {/* Ikona */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Ikona (volitelné)
            </label>
            <div className="grid grid-cols-8 gap-2">
              {CUSTOM_FIELD_ICONS.map((iconName) => {
                const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                const isSelected = icon === iconName;
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(isSelected ? '' : iconName)}
                    className={`
                      p-2 rounded-lg border transition-all
                      ${isSelected 
                        ? 'bg-primary/20 border-primary/50 text-primary' 
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'
                      }
                    `}
                    title={iconName}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 font-mono text-sm transition-colors"
              disabled={loading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                isEditing ? 'Uložit změny' : 'Vytvořit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

