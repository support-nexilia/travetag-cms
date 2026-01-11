import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface TypeItem {
  key: string;
  value: string;
}

interface TypesRepeaterProps {
  name: string;
  label: string;
  defaultValue?: Record<string, string>;
}

export default function TypesRepeater({ name, label, defaultValue = {} }: TypesRepeaterProps) {
  const [items, setItems] = useState<TypeItem[]>(() => {
    // Convert Record to array
    return Object.entries(defaultValue).map(([key, value]) => ({ key, value }));
  });

  const addItem = () => {
    setItems([...items, { key: '', value: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'key' | 'value', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          size="sm"
        >
          + Aggiungi Tipo
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Nessun tipo aggiunto. Clicca "Aggiungi Tipo" per iniziare.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor={`${name}_key_${index}`} className="text-xs">
                Chiave
              </Label>
              <Input
                id={`${name}_key_${index}`}
                type="text"
                value={item.key}
                onChange={(e) => updateItem(index, 'key', e.target.value)}
                placeholder="es. Tipo"
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`${name}_value_${index}`} className="text-xs">
                Valore
              </Label>
              <Input
                id={`${name}_value_${index}`}
                type="text"
                value={item.value}
                onChange={(e) => updateItem(index, 'value', e.target.value)}
                placeholder="es. Tour guidato"
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              onClick={() => removeItem(index)}
              variant="destructive"
              size="sm"
            >
              Rimuovi
            </Button>
          </div>
        ))}
      </div>

      {/* Hidden input to store JSON for form submission */}
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          items.reduce((acc, item) => {
            if (item.key.trim() && item.value.trim()) {
              acc[item.key.trim()] = item.value.trim();
            }
            return acc;
          }, {} as Record<string, string>)
        )}
      />
    </div>
  );
}
