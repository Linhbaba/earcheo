import type { FieldDefinition } from '../../utils/findingFieldsConfig';

interface DynamicFieldProps {
  field: FieldDefinition;
  value: string | number | null | undefined;
  onChange: (key: string, value: string | number | null) => void;
  disabled?: boolean;
}

export const DynamicField = ({ field, value, onChange, disabled }: DynamicFieldProps) => {
  const handleChange = (newValue: string) => {
    if (field.type === 'number') {
      const numValue = newValue === '' ? null : parseFloat(newValue);
      onChange(field.key, numValue);
    } else {
      onChange(field.key, newValue || null);
    }
  };

  const baseInputClasses = "w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50";

  // Text input
  if (field.type === 'text') {
    return (
      <div>
        <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {field.label}
        </label>
        <div className="relative">
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClasses}
            placeholder={field.placeholder}
            disabled={disabled}
          />
          {field.suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">
              {field.suffix}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Number input
  if (field.type === 'number') {
    return (
      <div>
        <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {field.label}
        </label>
        <div className="relative">
          <input
            type="number"
            step="any"
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`${baseInputClasses} ${field.suffix ? 'pr-12' : ''}`}
            placeholder={field.placeholder}
            disabled={disabled}
          />
          {field.suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">
              {field.suffix}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Date input
  if (field.type === 'date') {
    return (
      <div>
        <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {field.label}
        </label>
        <input
          type="date"
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseInputClasses}
          disabled={disabled}
        />
      </div>
    );
  }

  // Select input
  if (field.type === 'select' && field.options) {
    return (
      <div>
        <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {field.label}
        </label>
        <select
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className={`${baseInputClasses} appearance-none cursor-pointer`}
          disabled={disabled}
        >
          {field.options.map((option) => (
            <option key={option} value={option} className="bg-surface text-white">
              {option || '-- Vyberte --'}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Textarea
  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
          {field.label}
        </label>
        <textarea
          rows={3}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className={`${baseInputClasses} resize-none`}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      </div>
    );
  }

  return null;
};

// Komponenta pro zobrazení hodnoty pole (v detailu)
interface DynamicFieldDisplayProps {
  field: FieldDefinition;
  value: string | number | null | undefined;
}

export const DynamicFieldDisplay = ({ field, value }: DynamicFieldDisplayProps) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const displayValue = field.suffix 
    ? `${value} ${field.suffix}`
    : String(value);

  return (
    <div>
      <p className="text-xs text-white/50 font-mono uppercase mb-1">{field.label}</p>
      <p className="text-white/80">{displayValue}</p>
    </div>
  );
};

