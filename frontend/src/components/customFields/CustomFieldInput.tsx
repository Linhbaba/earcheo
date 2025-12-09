import * as Icons from 'lucide-react';
import type { CustomField } from '../../types/database';

interface CustomFieldInputProps {
  field: CustomField;
  value: string;
  onChange: (customFieldId: string, value: string) => void;
  disabled?: boolean;
}

export const CustomFieldInput = ({ field, value, onChange, disabled }: CustomFieldInputProps) => {
  const baseInputClasses = "w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50";

  const getIcon = () => {
    if (!field.icon) return null;
    const IconComponent = Icons[field.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4 text-primary/70" /> : null;
  };

  // Text input
  if (field.fieldType === 'text') {
    return (
      <div>
        <label className="flex items-center gap-2 text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {getIcon()}
          {field.name}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClasses}
          placeholder={`Zadejte ${field.name.toLowerCase()}`}
          disabled={disabled}
        />
      </div>
    );
  }

  // Number input
  if (field.fieldType === 'number') {
    return (
      <div>
        <label className="flex items-center gap-2 text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {getIcon()}
          {field.name}
        </label>
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClasses}
          placeholder={`Zadejte ${field.name.toLowerCase()}`}
          disabled={disabled}
        />
      </div>
    );
  }

  // Date input
  if (field.fieldType === 'date') {
    return (
      <div>
        <label className="flex items-center gap-2 text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {getIcon()}
          {field.name}
        </label>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClasses}
          disabled={disabled}
        />
      </div>
    );
  }

  // Select input
  if (field.fieldType === 'select' && field.options) {
    const options = field.options.split(',').map(o => o.trim());
    
    return (
      <div>
        <label className="flex items-center gap-2 text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {getIcon()}
          {field.name}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={`${baseInputClasses} appearance-none cursor-pointer`}
          disabled={disabled}
        >
          <option value="" className="bg-surface text-white">-- Vyberte --</option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-surface text-white">
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};

// Komponenta pro zobrazení hodnoty vlastního pole (v detailu)
interface CustomFieldDisplayProps {
  field: CustomField;
  value: string;
}

export const CustomFieldDisplay = ({ field, value }: CustomFieldDisplayProps) => {
  if (!value) return null;

  const getIcon = () => {
    if (!field.icon) return null;
    const IconComponent = Icons[field.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-3.5 h-3.5 text-primary/70" /> : null;
  };

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-white/50 font-mono uppercase mb-1">
        {getIcon()}
        {field.name}
      </p>
      <p className="text-white/80">{value}</p>
    </div>
  );
};

