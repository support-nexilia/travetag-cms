import { useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/Modal';

type MediaType = 'image' | 'video' | 'file';

type MediaRecord = {
  _id: string;
  type: MediaType;
  file: {
    path: string;
    sizes?: { s?: string; xl?: string };
    formats?: { m3u?: string; mp4?: string };
    url?: string;
  };
  original_filename?: string;
  mime_type?: string;
  title?: string;
  alt?: string;
  created_at?: string;
};

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  previewUrl?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mediaType?: MediaType;
  onSelect: (media: MediaRecord) => void;
};

const getPreviewUrl = (media: MediaRecord) => {
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

const detectUploadType = (file: File): MediaType => {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  return 'file';
};

const getKindLabel = (type: MediaType) => {
  if (type === 'video') return 'Video';
  if (type === 'image') return 'Immagine';
  return 'File';
};

const FileIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 text-gray-500">
    <path
      fill="currentColor"
      d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 1.5V9h4.5L14 4.5ZM8 12h8v1.5H8V12Zm0 3h8v1.5H8V15Zm0 3h5v1.5H8V18Z"
    />
  </svg>
);

export function MediaLibraryModal({ isOpen, onClose, mediaType, onSelect }: Props) {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const queueRef = useRef<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MediaRecord | null>(null);

  const typeParam = useMemo(() => (mediaType ? `?type=${mediaType}` : ''), [mediaType]);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch(`/admin/api/media${typeParam}`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [isOpen, typeParam]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const setQueueProgress = (id: string, progress: number) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, progress } : item)),
    );
  };

  const setQueueStatus = (id: string, status: UploadItem['status'], error?: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, error } : item)),
    );
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
  };

  const buildUploadItems = (files: File[]) =>
    files.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      file,
      progress: 0,
      status: 'pending' as const,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

  const setQueueWithFiles = (files: File[]) => {
    const next = buildUploadItems(files);
    setQueue((prev) => {
      prev.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return next;
    });
  };

  const uploadToPresignedUrl = (
    url: string,
    headers: Record<string, string>,
    file: File,
    onProgress: (progress: number) => void,
  ) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      Object.entries(headers || {}).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload fallito (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error('Upload fallito'));
      xhr.send(file);
    });

  const handleUpload = async () => {
    const pending = queue.filter((item) => item.status === 'pending' || item.status === 'error');
    if (pending.length === 0) return;
    setUploading(true);
    try {
      for (const item of pending) {
        const file = item.file;
        setQueueStatus(item.id, 'uploading');
        try {
          const presignResponse = await fetch('/admin/api/media/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
            }),
          });

          if (!presignResponse.ok) {
            throw new Error('Presign fallito');
          }

          const presign = await presignResponse.json();

          await uploadToPresignedUrl(presign.uploadUrl, presign.headers, file, (progress) =>
            setQueueProgress(item.id, progress),
          );

          const finalizeResponse = await fetch('/admin/api/media/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mediaType: detectUploadType(file),
              tmpKey: presign.key,
              entity: 'media',
              entityId: 'library',
              field: 'file',
              filename: file.name,
              contentType: file.type,
              size: file.size,
              saveToLibrary: true,
            }),
          });

          if (!finalizeResponse.ok) {
            throw new Error('Finalize fallito');
          }

          const result = await finalizeResponse.json();
          if (result?.mediaId) {
            const itemResponse = await fetch(`/admin/api/media/${result.mediaId}`);
            const itemData = await itemResponse.json();
            if (itemData?._id) {
              setItems((prev) => [itemData, ...prev]);
            }
          }
          setQueueStatus(item.id, 'done');
          setTimeout(() => removeFromQueue(item.id), 1200);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Errore upload';
          setQueueStatus(item.id, 'error', message);
        }
      }
    } catch (error) {
      console.error('Media upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    const dropped = Array.from(event.dataTransfer.files || []);
    if (dropped.length > 0) {
      setQueueWithFiles(dropped);
    }
  };

  const acceptValue = mediaType && mediaType !== 'file' ? `${mediaType}/*` : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleziona media"
      description="Scegli un file dalla libreria o caricane uno nuovo."
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div
          className={`rounded-2xl border-2 border-dashed p-6 shadow-sm transition ${
            isDragActive ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 bg-white/90'
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
        >
          <label
            htmlFor="media-modal-drop-input"
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 text-center"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-gray-500">
                <path
                  fill="currentColor"
                  d="M12 3l4 4h-3v6h-2V7H8l4-4zm-7 14h14v2H5v-2z"
                />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Trascina qui il file</h3>
              <p className="text-xs text-gray-500">Oppure clicca per selezionarlo dal tuo computer.</p>
            </div>
            <input
              id="media-modal-drop-input"
              type="file"
              accept={acceptValue}
              multiple
              onChange={(event) => {
                setQueueWithFiles(Array.from(event.target.files || []));
              }}
              className="sr-only"
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {queue.length > 0 ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-600">
                  {queue.length} file selezionati
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Nessun file selezionato</span>
            )}
            <Button onClick={handleUpload} disabled={queue.length === 0 || uploading}>
              {uploading ? 'Caricamento...' : 'Carica'}
            </Button>
          </div>
          {queue.length > 0 ? (
            <div className="mt-4 space-y-3">
              {queue.map((item) => {
                const kind = detectUploadType(item.file);
                return (
                  <div key={item.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                          {item.previewUrl ? (
                            <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-gray-600">
                              {kind === 'video' ? 'VID' : 'FILE'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-700 truncate">{item.file.name}</div>
                          <div className="text-[10px] uppercase tracking-wide text-gray-400">
                            {item.status === 'done'
                              ? 'Completato'
                              : item.status === 'error'
                                ? 'Errore'
                                : item.status === 'uploading'
                                  ? 'Caricamento'
                                  : 'In attesa'}
                          </div>
                        </div>
                      </div>
                      {item.status === 'pending' || item.status === 'error' ? (
                        <button
                          type="button"
                          onClick={() => removeFromQueue(item.id)}
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold text-gray-700 shadow-sm hover:border-gray-400 hover:text-gray-900"
                        >
                          Rimuovi
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'error' ? 'bg-red-400' : 'bg-[#FF6B35]'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    {item.error ? (
                      <div className="mt-2 text-[11px] text-red-500">{item.error}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        {isLoading ? (
          <p className="mt-4 text-sm text-gray-500">Caricamento media...</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Nessun media disponibile.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {items.map((item) => {
              const preview = getPreviewUrl(item);
              const label = getKindLabel(item.type);
              return (
                <div
                  key={item._id}
                  onClick={() => onSelect(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(item);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group flex flex-col gap-2 rounded-xl border border-gray-200 bg-white/90 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF6B35] hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-700 shadow">
                      {label}
                    </span>
                    {item.type === 'image' && preview ? (
                      <img src={preview} alt={item.original_filename || 'media'} className="h-full w-full object-cover" />
                    ) : item.type === 'video' ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-gray-600">
                        <span className="rounded-full bg-gray-900/70 px-2 py-1 text-[10px] font-semibold text-white">
                          PLAY
                        </span>
                        <span>Anteprima video</span>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-gray-600">
                        <FileIcon />
                        <span>Documento</span>
                      </div>
                    )}
                    {item.type === 'video' && preview ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setPreviewUrl(preview);
                        }}
                        className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-gray-700 shadow hover:text-[#FF6B35]"
                      >
                        Guarda
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-gray-700 shadow hover:text-red-500"
                    >
                      Elimina
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-700 line-clamp-1">
                      {item.original_filename || item.file.path}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-gray-400">
                      {item.mime_type || 'media'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {previewUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-800">Anteprima video</h3>
              <button
                type="button"
                onClick={() => setPreviewUrl('')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Chiudi
              </button>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl bg-black">
              <video src={previewUrl} controls className="h-full w-full" />
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const response = await fetch(`/admin/api/media/${deleteTarget._id}`, { method: 'DELETE' });
          if (response.ok) {
            setItems((prev) => prev.filter((entry) => entry._id !== deleteTarget._id));
          }
          setDeleteTarget(null);
        }}
        title="Elimina media"
        message="Vuoi eliminare questo file dalla libreria?"
        confirmText="Elimina"
        cancelText="Annulla"
        variant="destructive"
      />
    </Modal>
  );
}
