import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

export const TagInput = ({ 
  tags, 
  onChange, 
  suggestions = [],
  placeholder = 'Přidat kategorii...',
  maxTags = 5,
  disabled = false
}: TagInputProps) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Default suggestions
  const defaultSuggestions = [
    'Mince',
    'Nástroje',
    'Keramika',
    'Šperky',
    'Zbraně',
    'Střelivo',
    'Stavební prvky',
    'Militaria',
    'Historické předměty',
    'Ostatní'
  ];

  const allSuggestions = [...new Set([...suggestions, ...defaultSuggestions])];
  
  // Filter suggestions based on input and existing tags
  const filteredSuggestions = allSuggestions
    .filter(s => 
      s.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(s)
    )
    .slice(0, 8);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    
    onChange([...tags, trimmed]);
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInput('');
    }
  };

  return (
    <div className="space-y-2">
      {/* Tags display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm font-mono"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="hover:bg-primary/20 rounded p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      {tags.length < maxTags && (
        <div className="relative">
          <div className="flex items-center gap-2 w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
            <Plus className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 bg-transparent text-white font-mono text-sm placeholder-white/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {input && (
              <button
                type="button"
                onClick={() => addTag(input)}
                disabled={disabled}
                className="text-xs text-primary/70 hover:text-primary font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Enter
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-surface/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-10">
              <div className="p-2 border-b border-white/10">
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider">
                  Návrhy kategorií
                </p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredSuggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addTag(suggestion)}
                    className="w-full text-left px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 font-mono text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-white/40 font-mono">
        {tags.length === 0 
          ? 'Zadejte vlastní kategorie nebo vyberte z návrhů'
          : `${tags.length}/${maxTags} kategorií`}
      </p>
    </div>
  );
};

