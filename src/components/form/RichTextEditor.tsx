import { useState, useEffect, useRef } from 'react';

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({ name, defaultValue = '', placeholder = 'Inserisci il contenuto...', rows = 4 }: RichTextEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [isVisualMode, setIsVisualMode] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isVisualMode && editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = defaultValue;
    }
  }, [defaultValue, isVisualMode]);

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const toggleMode = () => {
    if (isVisualMode) {
      // Da Visual a HTML
      const html = editorRef.current?.innerHTML || '';
      setContent(html);
    } else {
      // Da HTML a Visual
      const html = textareaRef.current?.value || '';
      setContent(html);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
        }
      }, 0);
    }
    setIsVisualMode(!isVisualMode);
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Mode Toggle Tabs */}
      <div className="flex gap-0 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => !isVisualMode && toggleMode()}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            isVisualMode 
              ? 'bg-white border-b-2 border-[#FF6B35] text-[#FF6B35]' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Visual
        </button>
        <button
          type="button"
          onClick={() => isVisualMode && toggleMode()}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            !isVisualMode 
              ? 'bg-white border-b-2 border-[#FF6B35] text-[#FF6B35]' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          HTML
        </button>
      </div>

      {/* Toolbar - solo in modalità Visual */}
      {isVisualMode && (
        <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300 font-bold"
            title="Grassetto"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300 italic"
            title="Corsivo"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300 underline"
            title="Sottolineato"
          >
            U
          </button>
          
          <div className="w-px bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h1>')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300"
            title="Titolo 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h2>')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300"
            title="Titolo 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h3>')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300"
            title="Titolo 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<p>')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300"
            title="Paragrafo"
          >
            P
          </button>
          
          <div className="w-px bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300"
            title="Lista puntata"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300"
            title="Lista numerata"
          >
            1. List
          </button>
          
          <div className="w-px bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={() => {
              const url = prompt('Inserisci URL:');
              if (url) execCommand('createLink', url);
            }}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300"
            title="Link"
          >
            🔗
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('removeFormat')}
            className="px-2 py-1 text-sm hover:bg-gray-200 rounded border border-gray-300"
            title="Rimuovi formattazione"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor Area - Visual or HTML */}
      {isVisualMode ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="px-3 py-2 min-h-[100px] focus:outline-none max-w-none"
          style={{ minHeight: `${rows * 1.5}rem` }}
          data-placeholder={placeholder}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          className="w-full px-3 py-2 focus:outline-none font-mono text-sm resize-none"
          style={{ minHeight: `${rows * 1.5}rem` }}
          placeholder="Inserisci HTML..."
          spellCheck={false}
        />
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={content} />
    </div>
  );
}

export default RichTextEditor;
