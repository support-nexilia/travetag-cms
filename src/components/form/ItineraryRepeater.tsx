import { useState } from 'react';

interface ItineraryItem {
  title: string;
  content: string;
}

interface Props {
  initialItems?: ItineraryItem[];
}

export function ItineraryRepeater({ initialItems = [] }: Props) {
  const [items, setItems] = useState<ItineraryItem[]>(
    initialItems.length > 0 ? initialItems : [{ title: '', content: '' }]
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addItem = () => {
    setItems([...items, { title: '', content: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItineraryItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">Itinerario</h3>
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          + Aggiungi Tappa
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:border-gray-400 transition-colors ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg cursor-grab active:cursor-grabbing">⋮⋮</span>
                <span className="text-sm font-medium text-gray-700">
                  Itinerario {index + 1}
                </span>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700 text-xl font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <input type="hidden" name={`itinerary_items[${index}][order]`} value={index} />
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Titolo</label>
                <input
                  type="text"
                  name={`itinerary_items[${index}][title]`}
                  value={item.title}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                  placeholder="es: Arrivo a Firenze"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Descrizione</label>
                <textarea
                  name={`itinerary_items[${index}][content]`}
                  value={item.content}
                  onChange={(e) => updateItem(index, 'content', e.target.value)}
                  rows={3}
                  placeholder="Descrizione dettagliata della tappa"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden input for item count */}
      <input type="hidden" name="itinerary_count" value={items.length} />
    </div>
  );
}
