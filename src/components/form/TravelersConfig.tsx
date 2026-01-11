import { useState } from 'react';

interface TravelerType {
  allowed: boolean;
  min: number;
  max: number;
  price: number;
}

interface Props {
  initialConfig?: {
    adults?: TravelerType;
    children?: TravelerType;
    couples?: TravelerType;
    newborns?: TravelerType;
  };
  onConfigChange?: (config: any) => void;
}

export function TravelersConfig({ initialConfig, onConfigChange }: Props) {
  const [travelers, setTravelers] = useState({
    adults: initialConfig?.adults || { allowed: true, min: 1, max: 2, price: 0 },
    children: initialConfig?.children || { allowed: false, min: 0, max: 0, price: 0 },
    couples: initialConfig?.couples || { allowed: false, min: 0, max: 0, price: 0 },
    newborns: initialConfig?.newborns || { allowed: false, min: 0, max: 0, price: 0 },
  });

  const updateTraveler = (type: keyof typeof travelers, field: keyof TravelerType, value: any) => {
    const newTravelers = {
      ...travelers,
      [type]: { ...travelers[type], [field]: value },
    };
    setTravelers(newTravelers);
    onConfigChange?.(newTravelers);
  };

  const toggleAllowed = (type: keyof typeof travelers, allowed: boolean) => {
    updateTraveler(type, 'allowed', allowed);
  };

  const renderTravelerSection = (
    type: keyof typeof travelers,
    label: string,
    defaultChecked = false
  ) => {
    const config = travelers[type];

    return (
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name={`travelers_${type}_allowed`}
            checked={config.allowed}
            onChange={(e) => toggleAllowed(type, e.target.checked)}
            className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
          />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </label>

        {config.allowed && (
          <div className="ml-6 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min</label>
              <input
                type="number"
                name={`travelers_${type}_min`}
                value={config.min}
                onChange={(e) => updateTraveler(type, 'min', parseInt(e.target.value))}
                min="0"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Max</label>
              <input
                type="number"
                name={`travelers_${type}_max`}
                value={config.max}
                onChange={(e) => updateTraveler(type, 'max', parseInt(e.target.value))}
                min="0"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Prezzo €</label>
              <input
                type="number"
                name={`price_${type}`}
                value={config.price}
                onChange={(e) => updateTraveler(type, 'price', parseFloat(e.target.value))}
                step="0.01"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">
        Configurazione Viaggiatori e Prezzi
      </h3>

      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        {renderTravelerSection('adults', 'Adulti', true)}
        {renderTravelerSection('children', 'Bambini')}
        {renderTravelerSection('couples', 'Coppie')}
        {renderTravelerSection('newborns', 'Neonati')}
      </div>
    </div>
  );
}
