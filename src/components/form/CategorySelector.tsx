import { useState, useEffect, useRef } from 'react';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface CategorySelectorProps {
  initialSelectedIds?: string[];
}

export function CategorySelector({ initialSelectedIds = [] }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/admin/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        // Set initial selected categories
        if (initialSelectedIds.length > 0) {
          const initial = data.filter((cat: Category) => initialSelectedIds.includes(cat._id));
          setSelectedCategories(initial);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading categories:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = categories.filter(cat => 
    !selectedCategories.find(sc => sc._id === cat._id) &&
    (cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cat.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addCategory = (cat: Category) => {
    setSelectedCategories(prev => [...prev, cat]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeCategory = (catId: string) => {
    setSelectedCategories(prev => prev.filter(c => c._id !== catId));
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Caricamento categorie...</div>;
  }

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#FF6B35] focus-within:border-[#FF6B35] cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {selectedCategories.map(cat => (
            <span
              key={cat._id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#FF6B35] text-white text-xs rounded-full"
            >
              {cat.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCategory(cat._id);
                }}
                className="hover:bg-[#ff8555] rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedCategories.length === 0 ? "Cerca e seleziona categorie..." : ""}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
          />
        </div>
      </div>

      {isOpen && filteredCategories.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCategories.map(cat => (
            <button
              key={cat._id}
              type="button"
              onClick={() => addCategory(cat)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="text-sm font-medium text-gray-900">{cat.name}</div>
              {cat.description && (
                <div className="text-xs text-gray-500">{cat.description}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {selectedCategories.map((cat, index) => (
        <input
          key={cat._id}
          type="hidden"
          name={`category_ids[${index}]`}
          value={cat._id}
        />
      ))}
    </div>
  );
}
