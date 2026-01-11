import { useState, useEffect, useRef } from 'react';

interface Tag {
  _id: string;
  name: string;
  description?: string;
}

interface TagSelectorProps {
  initialSelectedIds?: string[];
}

export function TagSelector({ initialSelectedIds = [] }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        setTags(data);
        // Set initial selected tags
        if (initialSelectedIds.length > 0) {
          const initial = data.filter((tag: Tag) => initialSelectedIds.includes(tag._id));
          setSelectedTags(initial);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tags:', err);
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

  const filteredTags = tags.filter(tag => 
    !selectedTags.find(st => st._id === tag._id) &&
    (tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tag.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addTag = (tag: Tag) => {
    setSelectedTags(prev => [...prev, tag]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(t => t._id !== tagId));
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Caricamento tags...</div>;
  }

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#FF6B35] focus-within:border-[#FF6B35] cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {selectedTags.map(tag => (
            <span
              key={tag._id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#FF6B35] text-white text-xs rounded-full"
            >
              {tag.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag._id);
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
            placeholder={selectedTags.length === 0 ? "Cerca e seleziona tags..." : ""}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
          />
        </div>
      </div>

      {isOpen && filteredTags.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredTags.map(tag => (
            <button
              key={tag._id}
              type="button"
              onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="text-sm font-medium text-gray-900">{tag.name}</div>
              {tag.description && (
                <div className="text-xs text-gray-500">{tag.description}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {selectedTags.map((tag, index) => (
        <input
          key={tag._id}
          type="hidden"
          name={`tag_ids[${index}]`}
          value={tag._id}
        />
      ))}
    </div>
  );
}
