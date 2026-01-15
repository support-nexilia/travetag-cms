import { useMemo, useRef, useState } from 'react';

type PreviewType = 'image' | 'video';

type MediaUploadFieldProps = {
  id: string;
  label: string;
  name?: string;
  accept?: string;
  previewUrl?: string;
  previewType?: PreviewType;
  helperText?: string;
};

export function MediaUploadField({
  id,
  label,
  name = id,
  accept,
  previewUrl,
  previewType = 'image',
  helperText,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isRemoved, setIsRemoved] = useState(false);

  const showPicker = useMemo(() => !previewUrl || isRemoved, [previewUrl, isRemoved]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${Math.round(file.size / 1024)} KB`);
    } else {
      setFileName('');
      setFileSize('');
    }
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setFileName('');
    setFileSize('');
  };

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-2">{label}</span>
      <input
        type="file"
        id={id}
        name={name}
        accept={accept}
        className="sr-only"
        ref={inputRef}
        onChange={handleChange}
      />
      <input type="hidden" name={`${name}_remove`} value={isRemoved ? 'true' : 'false'} />
      {showPicker ? (
        <>
          <label
            htmlFor={id}
            className="flex items-center justify-between gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white shadow-sm border border-gray-200">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 3l4 4h-3v6h-2V7H8l4-4zm-7 14h14v2H5v-2z"
                  />
                </svg>
              </span>
              <span>
                <span className="block font-medium text-gray-700">
                  {fileName || 'Carica un file'}
                </span>
                <span className="block text-xs text-gray-500">
                  {fileSize || 'Clicca per selezionare'}
                </span>
              </span>
            </span>
            <span className="rounded-md bg-white px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200">
              {fileName ? 'Cambia' : 'Scegli file'}
            </span>
          </label>
          {fileName ? (
            <button
              type="button"
              onClick={handleClear}
              className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Rimuovi file
            </button>
          ) : null}
        </>
      ) : null}
      {previewUrl ? (
        <div className="mt-3">
          {previewType === 'video' ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-[#FF6B35] hover:underline"
            >
              Anteprima video
            </a>
          ) : (
            <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
          )}
          {previewUrl && !isRemoved ? (
            <button
              type="button"
              onClick={() => setIsRemoved(true)}
              className="mt-2 block text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Rimuovi file
            </button>
          ) : null}
        </div>
      ) : null}
      {helperText ? <p className="text-xs text-gray-500 mt-2">{helperText}</p> : null}
    </div>
  );
}
