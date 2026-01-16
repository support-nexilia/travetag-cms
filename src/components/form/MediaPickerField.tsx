import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';

type MediaType = 'image' | 'video' | 'file';

type MediaRecord = {
  _id: string;
  type: MediaType;
  file: {
    sizes?: { s?: string; xl?: string };
    formats?: { m3u?: string; mp4?: string };
    url?: string;
  };
};

type Props = {
  name: string;
  label: string;
  mediaType: MediaType;
  initialMediaId?: string;
  required?: boolean;
};

const getPreviewUrl = (media?: MediaRecord) => {
  if (!media) return '';
  if (media.type === 'video') {
    const raw = media.file.formats?.m3u || media.file.formats?.mp4 || '';
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  }
  if (media.type === 'image') {
    return media.file.sizes?.s || media.file.sizes?.xl || '';
  }
  return media.file.url || '';
};

export function MediaPickerField({
  name,
  label,
  mediaType,
  initialMediaId,
  required,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<MediaRecord | null>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (!initialMediaId) return;
    fetch(`/admin/api/media/${initialMediaId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?._id) {
          setSelected(data);
          setRemoved(false);
        }
      })
      .catch(() => undefined);
  }, [initialMediaId]);

  const preview = getPreviewUrl(selected);

  return (
    <div>
      <input type="hidden" name={name} value={removed ? '' : selected?._id || ''} />
      <input type="hidden" name={`${name}_remove`} value={removed ? 'true' : 'false'} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
          {selected && !removed ? 'Cambia media' : 'Scegli media'}
        </Button>
      </div>
      {selected && !removed ? (
        <div className="mt-3 flex items-center gap-3">
          {preview && mediaType === 'image' ? (
            <img src={preview} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <a href={preview} target="_blank" rel="noreferrer" className="text-sm text-[#FF6B35] hover:underline">
              Anteprima video
            </a>
          )}
          <button
            type="button"
            onClick={() => setRemoved(true)}
            className="text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Rimuovi
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-500">{required ? 'Selezione obbligatoria' : 'Nessun media selezionato'}</p>
      )}
      <MediaLibraryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mediaType={mediaType}
        onSelect={(media) => {
          setSelected(media);
          setRemoved(false);
          setIsOpen(false);
        }}
      />
    </div>
  );
}
