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
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <div className="flex items-center gap-3">
            {mediaType === 'image' && preview ? (
              <img src={preview} alt="Preview" className="h-14 w-14 rounded-md object-cover" />
            ) : (
              <div className="relative h-14 w-20 rounded-md bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 text-white shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                    Video
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg">▶</span>
                </div>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700">
                {mediaType === 'video' ? 'Video selezionato' : 'Immagine selezionata'}
              </span>
              {mediaType === 'video' && preview ? (
                <a href={preview} target="_blank" rel="noreferrer" className="text-xs text-[#FF6B35] hover:underline">
                  Apri anteprima
                </a>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRemoved(true)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
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
