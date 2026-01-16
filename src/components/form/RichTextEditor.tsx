import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { EditorConfig, EditorState, NodeKey } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import {
  $createParagraphNode,
  $createNodeSelection,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $isNodeSelection,
  $setSelection,
  DecoratorNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import { ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  blockType: 'paragraph' | 'h1' | 'h2' | 'h3' | 'quote';
  imageSelected: boolean;
  imageWidth: number | null;
  imageAlign: 'left' | 'center' | 'right' | null;
  selectedImageKey: string | null;
};

type ImagePayload = {
  src: string;
  alt?: string;
  width?: number | null;
  align?: 'left' | 'center' | 'right';
};

class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | null;
  __align: 'left' | 'center' | 'right';

  static getType() {
    return 'image';
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__align, node.__key);
  }

  constructor(
    src: string,
    altText = '',
    width: number | null = null,
    align: 'left' | 'center' | 'right' = 'left',
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__align = align;
  }

  createDOM(_config: EditorConfig) {
    const span = document.createElement('span');
    return span;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    if (!this.__src) return null;
    return (
      <ImageComponent
        nodeKey={this.getKey()}
      />
    );
  }

  static importJSON(serialized: ImagePayload) {
    return new ImageNode(
      serialized.src,
      serialized.alt || '',
      serialized.width ?? null,
      serialized.align ?? 'left'
    );
  }

  exportJSON() {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__altText,
      width: this.__width,
      align: this.__align,
    };
  }

  exportDOM() {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    if (this.__altText) {
      element.setAttribute('alt', this.__altText);
    }
    if (this.__width) {
      element.style.width = `${this.__width}%`;
    }
    if (this.__align === 'center') {
      element.style.display = 'block';
      element.style.margin = '0 auto';
    } else if (this.__align === 'right') {
      element.style.display = 'block';
      element.style.marginLeft = 'auto';
    }
    return { element };
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: (domNode: Node) => {
          if (domNode instanceof HTMLImageElement) {
            const widthFromStyle = domNode.style.width?.replace('%', '');
            const width = widthFromStyle ? Number(widthFromStyle) : null;
            let align: 'left' | 'center' | 'right' = 'left';
            if (domNode.style.marginLeft === 'auto' && domNode.style.marginRight === 'auto') {
              align = 'center';
            } else if (domNode.style.marginLeft === 'auto') {
              align = 'right';
            }
            return { node: $createImageNode({ src: domNode.src, alt: domNode.alt, width, align }) };
          }
          return null;
        },
        priority: 0,
      }),
    };
  }

  setWidth(width: number | null) {
    const writable = this.getWritable();
    writable.__width = width;
  }

  getWidth() {
    return this.__width;
  }

  setAlign(align: 'left' | 'center' | 'right') {
    const writable = this.getWritable();
    writable.__align = align;
  }

  getAlign() {
    return this.__align;
  }
}

const $createImageNode = ({ src, alt, width, align }: ImagePayload) => {
  return new ImageNode(src, alt || '', width ?? null, align ?? 'left');
};

const $isImageNode = (node: unknown): node is ImageNode => {
  return node instanceof ImageNode;
};

const $getSelectedImageNode = (): ImageNode | null => {
  const selection = $getSelection();
  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes();
    return nodes.find($isImageNode) || null;
  }
  if ($isRangeSelection(selection)) {
    const node = selection.anchor.getNode();
    if ($isImageNode(node)) return node;
    const parent = node.getParent();
    if ($isImageNode(parent)) return parent;
  }
  return null;
};

const ImageComponent = ({
  nodeKey,
}: {
  nodeKey: NodeKey;
}) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [imageState, setImageState] = useState<{
    src: string;
    alt: string;
    width: number | null;
    align: 'left' | 'center' | 'right';
  } | null>(null);

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          const newState = {
            src: node.__src,
            alt: node.__altText,
            width: node.getWidth(),
            align: node.getAlign(),
          };
          setImageState(newState);
        }
      });
    });

    // Initial read
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        setImageState({
          src: node.__src,
          alt: node.__altText,
          width: node.getWidth(),
          align: node.getAlign(),
        });
      }
    });

    return unregister;
  }, [editor, nodeKey]);

  if (!imageState) return null;

  const { src, alt, width, align } = imageState;

  return (
    <span className="block max-w-full">
      <img
        src={src}
        alt={alt}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          editor.update(() => {
            const selection = $createNodeSelection();
            selection.add(nodeKey);
            $setSelection(selection);
          });
          clearSelection();
          setSelected(true);
          editor.focus();
        }}
        className={`rounded-lg my-3 ${isSelected ? 'ring-2 ring-[#FF6B35]' : ''}`}
        style={{
          maxWidth: '100%',
          width: width ? `${width}%` : '100%',
          display: 'block',
          margin: align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0',
        }}
      />
    </span>
  );
};


const ToolbarButton = ({
  label,
  title,
  onClick,
  active,
}: {
  label: string;
  title: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`px-2.5 py-1 text-sm rounded-md border transition ${
      active
        ? 'border-[#FF6B35] text-[#FF6B35] bg-white shadow-sm'
        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/70'
    }`}
    title={title}
  >
    {label}
  </button>
);

const getBlockType = () => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return 'paragraph';
  const node = selection.anchor.getNode();
  const element = node.getTopLevelElement();
  if (!element) return 'paragraph';
  if ($isHeadingNode(element)) {
    return element.getTag() as 'h1' | 'h2' | 'h3';
  }
  if (element.getType() === 'quote') return 'quote';
  return 'paragraph';
};

const ToolbarPlugin = ({ onInsertImage }: { onInsertImage: () => void }) => {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<ToolbarState>({
    bold: false,
    italic: false,
    underline: false,
    blockType: 'paragraph',
    imageSelected: false,
    imageWidth: null,
    imageAlign: null,
    selectedImageKey: null,
  });
  const [customWidth, setCustomWidth] = useState('70');

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        const imageNode = $getSelectedImageNode();
        setState({
          bold: $isRangeSelection(selection) ? selection.hasFormat('bold') : false,
          italic: $isRangeSelection(selection) ? selection.hasFormat('italic') : false,
          underline: $isRangeSelection(selection) ? selection.hasFormat('underline') : false,
          blockType: $isRangeSelection(selection) ? getBlockType() : 'paragraph',
          imageSelected: Boolean(imageNode),
          imageWidth: imageNode?.getWidth() ?? null,
          imageAlign: imageNode?.getAlign() ?? null,
          selectedImageKey: imageNode?.getKey() ?? null,
        });
      });
    });
  }, [editor]);

  const setParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const setHeading = (level: 1 | 2 | 3) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(`h${level}`));
      }
    });
  };

  const setQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const clearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      ['bold', 'italic', 'underline'].forEach((format) => {
        if (selection.hasFormat(format as any)) {
          selection.toggleFormat(format as any);
        }
      });
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-1 rounded-lg bg-white/60 px-1 py-0.5">
        <ToolbarButton
          label="B"
          title="Grassetto"
          active={state.bold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        />
        <ToolbarButton
          label="I"
          title="Corsivo"
          active={state.italic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        />
        <ToolbarButton
          label="U"
          title="Sottolineato"
          active={state.underline}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        />
      </div>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <div className="flex items-center gap-1 rounded-lg bg-white/60 px-1 py-0.5">
        <ToolbarButton
          label="H1"
          title="Titolo 1"
          active={state.blockType === 'h1'}
          onClick={() => setHeading(1)}
        />
        <ToolbarButton
          label="H2"
          title="Titolo 2"
          active={state.blockType === 'h2'}
          onClick={() => setHeading(2)}
        />
        <ToolbarButton
          label="H3"
          title="Titolo 3"
          active={state.blockType === 'h3'}
          onClick={() => setHeading(3)}
        />
        <ToolbarButton
          label="P"
          title="Paragrafo"
          active={state.blockType === 'paragraph'}
          onClick={setParagraph}
        />
        <ToolbarButton
          label="❝"
          title="Citazione"
          active={state.blockType === 'quote'}
          onClick={setQuote}
        />
      </div>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <div className="flex items-center gap-1 rounded-lg bg-white/60 px-1 py-0.5">
        <ToolbarButton
          label="•"
          title="Lista puntata"
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        />
        <ToolbarButton
          label="1."
          title="Lista numerata"
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        />
        <ToolbarButton
          label="↩︎"
          title="Rimuovi lista"
          onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
        />
      </div>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <div className="flex items-center gap-1 rounded-lg bg-white/60 px-1 py-0.5">
        <ToolbarButton
          label="🔗"
          title="Link"
          onClick={() => {
            const url = prompt('Inserisci URL:');
            if (url) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
            }
          }}
        />
        <ToolbarButton label="🖼️" title="Inserisci immagine" onClick={onInsertImage} />
        <ToolbarButton label="✕" title="Rimuovi formattazione" onClick={clearFormatting} />
      </div>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <div className="flex items-center gap-1 rounded-lg bg-white/60 px-1 py-0.5">
        <ToolbarButton
          label="↞"
          title={state.imageSelected ? 'Allinea immagine a sinistra' : 'Allinea a sinistra'}
          active={state.imageSelected && state.imageAlign === 'left'}
          onClick={() => {
            if (state.imageSelected && state.selectedImageKey) {
              editor.update(() => {
                const node = $getNodeByKey(state.selectedImageKey!);
                if ($isImageNode(node)) node.setAlign('left');
              });
            } else {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
            }
          }}
        />
        <ToolbarButton
          label="↔"
          title={state.imageSelected ? 'Allinea immagine al centro' : 'Allinea al centro'}
          active={state.imageSelected && state.imageAlign === 'center'}
          onClick={() => {
            if (state.imageSelected && state.selectedImageKey) {
              editor.update(() => {
                const node = $getNodeByKey(state.selectedImageKey!);
                if ($isImageNode(node)) node.setAlign('center');
              });
            } else {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
            }
          }}
        />
        <ToolbarButton
          label="↠"
          title={state.imageSelected ? 'Allinea immagine a destra' : 'Allinea a destra'}
          active={state.imageSelected && state.imageAlign === 'right'}
          onClick={() => {
            if (state.imageSelected && state.selectedImageKey) {
              editor.update(() => {
                const node = $getNodeByKey(state.selectedImageKey!);
                if ($isImageNode(node)) node.setAlign('right');
              });
            } else {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
            }
          }}
        />
        <ToolbarButton
          label="≡"
          title="Giustifica"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
        />
      </div>

      {state.imageSelected && state.selectedImageKey ? (
        <>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <div className="flex items-center gap-1 rounded-lg bg-white/60 px-1 py-0.5">
            <ToolbarButton
              label="25%"
              title="Immagine 25%"
              active={state.imageWidth === 25}
              onClick={() =>
                editor.update(() => {
                  const node = $getNodeByKey(state.selectedImageKey!);
                  if ($isImageNode(node)) node.setWidth(25);
                })
              }
            />
            <ToolbarButton
              label="50%"
              title="Immagine 50%"
              active={state.imageWidth === 50}
              onClick={() =>
                editor.update(() => {
                  const node = $getNodeByKey(state.selectedImageKey!);
                  if ($isImageNode(node)) node.setWidth(50);
                })
              }
            />
            <ToolbarButton
              label="75%"
              title="Immagine 75%"
              active={state.imageWidth === 75}
              onClick={() =>
                editor.update(() => {
                  const node = $getNodeByKey(state.selectedImageKey!);
                  if ($isImageNode(node)) node.setWidth(75);
                })
              }
            />
            <ToolbarButton
              label="100%"
              title="Immagine 100%"
              active={state.imageWidth === null || state.imageWidth === 100}
              onClick={() =>
                editor.update(() => {
                  const node = $getNodeByKey(state.selectedImageKey!);
                  if ($isImageNode(node)) node.setWidth(null);
                })
              }
            />
            <div className="flex items-center gap-1 pl-2">
              <input
                type="number"
                min={10}
                max={100}
                value={customWidth}
                onChange={(event) => setCustomWidth(event.target.value)}
                className="w-14 rounded-md border border-gray-200 bg-white px-1 py-0.5 text-[11px] text-gray-700"
                placeholder="%"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const value = Number(customWidth);
                  if (!Number.isFinite(value) || value < 10 || value > 100) return;
                  editor.update(() => {
                    const node = $getNodeByKey(state.selectedImageKey!);
                    if ($isImageNode(node)) node.setWidth(value);
                  });
                }}
                className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700 hover:border-gray-300"
              >
                Applica
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

const Placeholder = ({ text }: { text: string }) => (
  <div className="pointer-events-none absolute top-3 left-4 text-sm text-gray-400">{text}</div>
);

export function RichTextEditor({
  name,
  defaultValue = '',
  placeholder = 'Inserisci il contenuto...',
  rows = 4,
}: RichTextEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [isVisualMode, setIsVisualMode] = useState(true);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [pendingHtml, setPendingHtml] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editorConfig = {
    namespace: 'traveltag-editor',
    theme: {
      paragraph: 'mb-3',
      heading: {
        h1: 'text-2xl font-semibold mt-4 mb-2',
        h2: 'text-xl font-semibold mt-4 mb-2',
        h3: 'text-lg font-semibold mt-3 mb-2',
      },
      quote: 'border-l-4 border-gray-200 pl-4 italic text-gray-600',
      text: {
        bold: 'font-semibold',
        italic: 'italic',
        underline: 'underline',
      },
    },
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode, ImageNode],
  };

  const handleChange = (editorState: EditorState, editor: any) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      setContent(html);
    });
  };

  const setHtmlContent = useCallback((html: string, editor: any) => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      if (nodes.length === 0) {
        root.append($createParagraphNode());
      } else {
        root.append(...nodes);
      }
    });
  }, []);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex gap-0 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => {
            if (!isVisualMode) {
              setPendingHtml(content);
              setIsVisualMode(true);
            }
          }}
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
          onClick={() => {
            if (isVisualMode) {
              setIsVisualMode(false);
            }
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            !isVisualMode
              ? 'bg-white border-b-2 border-[#FF6B35] text-[#FF6B35]'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          HTML
        </button>
      </div>

      {isVisualMode ? (
        <div style={{ minHeight: `${rows * 1.6}rem` }} className="min-h-[180px] bg-white">
          {isMounted ? (
            <LexicalComposer initialConfig={editorConfig}>
              <ToolbarPlugin onInsertImage={() => setIsMediaOpen(true)} />
              <div className="relative">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable className="min-h-[180px] px-4 py-3 text-sm leading-relaxed focus:outline-none" />
                  }
                  placeholder={<Placeholder text={placeholder} />}
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              <OnChangePlugin onChange={handleChange} />
              <LexicalBridge
                html={pendingHtml}
                fallbackHtml={defaultValue}
                onSynced={() => setPendingHtml(null)}
                onSyncHtml={setHtmlContent}
              />
              <MediaBridge
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onInsert={(src, alt, editor) => {
                  editor.update(() => {
                    const selection = $getSelection();
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(`<img src="${src}" alt="${alt}" />`, 'text/html');
                    const nodes = $generateNodesFromDOM(editor, dom);
                    if ($isRangeSelection(selection)) {
                      $insertNodes(nodes);
                    } else {
                      $getRoot().append(...nodes);
                    }
                  });
                }}
              />
            </LexicalComposer>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">Caricamento editor...</div>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="w-full px-4 py-3 focus:outline-none font-mono text-sm resize-none bg-white"
          style={{ minHeight: `${rows * 1.6}rem` }}
          placeholder="Inserisci HTML..."
          spellCheck={false}
        />
      )}

      <input type="hidden" name={name} value={content} />
    </div>
  );
}

const LexicalBridge = ({
  html,
  fallbackHtml,
  onSyncHtml,
  onSynced,
}: {
  html: string | null;
  fallbackHtml: string;
  onSyncHtml: (html: string, editor: any) => void;
  onSynced: () => void;
}) => {
  const [editor] = useLexicalComposerContext();
  const hasInitializedRef = useRef(false);
  const lastHtmlRef = useRef<string | null>(null);

  useEffect(() => {
    if (html !== null && html !== lastHtmlRef.current) {
      onSyncHtml(html, editor);
      lastHtmlRef.current = html;
      onSynced();
      return;
    }
    if (!hasInitializedRef.current && fallbackHtml) {
      onSyncHtml(fallbackHtml, editor);
      lastHtmlRef.current = fallbackHtml;
      hasInitializedRef.current = true;
    }
  }, [editor, html, fallbackHtml, onSyncHtml, onSynced]);

  return null;
};

const MediaBridge = ({
  isOpen,
  onClose,
  onInsert,
}: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (src: string, alt: string, editor: any) => void;
}) => {
  const [editor] = useLexicalComposerContext();

  return (
    <MediaLibraryModal
      isOpen={isOpen}
      onClose={onClose}
      mediaType="image"
      onSelect={(media) => {
        const src = media.file?.sizes?.xl || media.file?.sizes?.s || '';
        const alt = media.alt || media.title || media.original_filename || 'Immagine';
        if (src) {
          onInsert(src, alt, editor);
        }
        onClose();
      }}
    />
  );
};

export default RichTextEditor;
