import React, { useState, useEffect } from 'react';

interface SectionOption {
  value: string;
  label: string;
}

interface Props {
  name: string;
  label: string;
  defaultValue?: string[];
  availableOptions: SectionOption[];
}

export function SectionsSelector({ name, label, defaultValue = [], availableOptions }: Props) {
  const [selectedSections, setSelectedSections] = useState<SectionOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize selected sections from defaultValue
    const initial = defaultValue
      .map(val => availableOptions.find(opt => opt.value === val))
      .filter((opt): opt is SectionOption => opt !== undefined);
    setSelectedSections(initial);
  }, []);

  const filteredOptions = availableOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSections.find(s => s.value === option.value)
  );

  const addSection = (option: SectionOption) => {
    setSelectedSections([...selectedSections, option]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeSection = (value: string) => {
    setSelectedSections(selectedSections.filter(s => s.value !== value));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...selectedSections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setSelectedSections(newSections);
  };

  const moveDown = (index: number) => {
    if (index === selectedSections.length - 1) return;
    const newSections = [...selectedSections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setSelectedSections(newSections);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#FF6B35] focus-within:border-transparent">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSections.map((section, index) => (
              <span
                key={section.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#FF6B35] text-white text-sm rounded"
              >
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="hover:bg-white/20 px-1 rounded disabled:opacity-30"
                  title="Sposta su"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === selectedSections.length - 1}
                  className="hover:bg-white/20 px-1 rounded disabled:opacity-30"
                  title="Sposta giù"
                >
                  ↓
                </button>
                <span>{section.label}</span>
                <button
                  type="button"
                  onClick={() => removeSection(section.value)}
                  className="hover:bg-white/20 px-1 rounded"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedSections.length === 0 ? "Cerca e seleziona sezioni..." : "Aggiungi altra sezione..."}
            className="w-full outline-none text-sm"
          />
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => addSection(option)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.value}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hidden inputs for form submission - array of values in order */}
      {selectedSections.map((section, index) => (
        <input
          key={section.value}
          type="hidden"
          name={`${name}[${index}]`}
          value={section.value}
        />
      ))}
    </div>
  );
}
