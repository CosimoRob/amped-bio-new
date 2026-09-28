import React, { MouseEvent, useCallback, useMemo, useState, useEffect, ReactNode } from "react";
import { Descendant, Editor, Element as SlateElement, Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from "slate-react";
import { Button, Toolbar } from "./SlateComponents";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from "lucide-react";
import {
  CustomEditor,
  CustomElement,
  CustomElementType,
  CustomElementWithAlign,
  CustomTextKey,
} from "./custom-types";
import { htmlToSlate } from "./SlateRenderer";

// Debounce utility function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
};

const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"] as const;

type AlignType = (typeof TEXT_ALIGN_TYPES)[number];
type CustomElementFormat = CustomElementType | AlignType;

interface RichTextEditorProps {
  initialValue?: string;
  onSave?: (value: string) => void; // Changed from Descendant[] to string
  debounceTime?: number;
}

// Typed text is text, never markup. Without this, typing <img onerror=...> in the
// editor produced live HTML. The deserializer (DOMParser) decodes these back to text.
const escapeHtmlText = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Function to convert Slate nodes to HTML string
const slateToHtml = (nodes: Descendant[]): string => {
  return nodes
    .map(node => {
      if (Editor.isEditor(node)) {
        return "";
      }

      if (!("text" in node)) {
        const element = node as CustomElement;
        let tag = "p";
        let attrs = "";

        // Determine the HTML tag based on element type
        switch (element.type) {
          case "block-quote":
            tag = "blockquote";
            break;
          case "heading-one":
            tag = "h1";
            break;
          case "heading-two":
            tag = "h2";
            break;
          case "list-item":
            tag = "li";
            break;
          case "numbered-list":
            tag = "ol";
            break;
        }

        // Handle alignment
        if (isAlignElement(element) && element.align) {
          attrs = ` style="text-align: ${element.align}"`;
        }

        // Recursively convert children
        const children = element.children.map(child => slateToHtml([child])).join("");

        return `<${tag}${attrs}>${children}</${tag}>`;
      }

      // Handle text nodes with formatting
      let text = escapeHtmlText(node.text);
      if (node.bold) text = `<strong>${text}</strong>`;
      if (node.italic) text = `<em>${text}</em>`;
      if (node.underline) text = `<u>${text}</u>`;
      if (node.code) text = `<code>${text}</code>`;

      return text;
    })
    .join("");
};

const TextEditor = ({ initialValue, onSave, debounceTime = 1000 }: RichTextEditorProps) => {
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>(htmlToSlate(initialValue ?? ""));
  // Track the last saved content
  const [lastSavedContent, setLastSavedContent] = useState<string>(initialValue ?? "");

  // Set up debounced save function with HTML conversion
  const debouncedSave = useMemo(
    () =>
      onSave
        ? debounce((val: Descendant[]) => {
            const htmlContent = slateToHtml(val);
            // Only call onSave if content has changed
            if (htmlContent !== lastSavedContent) {
              onSave(htmlContent);
              setLastSavedContent(htmlContent);
            }
          }, debounceTime)
        : undefined,
    [onSave, debounceTime, lastSavedContent]
  );

  // Call the debouncedSave function when value changes
  useEffect(() => {
    if (debouncedSave) {
      debouncedSave(value);
    }
  }, [value, debouncedSave]);

  return (
    <Slate editor={editor} initialValue={value} onChange={setValue}>
      <Toolbar>
        {/* Text formatting dropdown group */}
        <MarkButtonGroup />

        {/* Alignment dropdown group */}
        <BlockButtonDropdown icon={<AlignLeft className="w-4 h-4" />}>
          <BlockButton format="left" icon={<AlignLeft className="w-4 h-4" />} label="Left" />
          <BlockButton format="center" icon={<AlignCenter className="w-4 h-4" />} label="Center" />
          <BlockButton format="right" icon={<AlignRight className="w-4 h-4" />} label="Right" />
          <BlockButton
            format="justify"
            icon={<AlignJustify className="w-4 h-4" />}
            label="Justify"
          />
        </BlockButtonDropdown>
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        className="min-h-[200px] p-2 border border-gray-400 rounded-md"
      />
    </Slate>
  );
};

// New dropdown component for block buttons
interface BlockButtonDropdownProps {
  icon: ReactNode;
  children: ReactNode;
}

const BlockButtonDropdown = ({ icon, children }: BlockButtonDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onMouseDown={(e: MouseEvent) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1"
      >
        {icon}
        <ChevronDown className="w-3 h-3" />
      </Button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded border border-gray-200 z-10 min-w-[150px]"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-1 flex flex-col gap-1">{children}</div>
        </div>
      )}
    </div>
  );
};

// Group for mark buttons (bold, italic, etc.)
const MarkButtonGroup = () => {
  return (
    <div className="flex gap-1">
      <MarkButton format="bold" icon={<Bold className="w-4 h-4" />} />
      <MarkButton format="italic" icon={<Italic className="w-4 h-4" />} />
      <MarkButton format="underline" icon={<Underline className="w-4 h-4" />} />
    </div>
  );
};

const toggleBlock = (editor: CustomEditor, format: CustomElementFormat) => {
  const isActive = isBlockActive(editor, format, isAlignType(format) ? "align" : "type");

  // Remove list-related unwrapping logic
  let newProperties: Partial<SlateElement>;
  if (isAlignType(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);
};

const toggleMark = (editor: CustomEditor, format: CustomTextKey) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: CustomEditor,
  format: CustomElementFormat,
  blockType: "type" | "align" = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => {
        if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
          if (blockType === "align" && isAlignElement(n)) {
            return n.align === format;
          }
          return n.type === format;
        }
        return false;
      },
    })
  );

  return !!match;
};

const isMarkActive = (editor: CustomEditor, format: CustomTextKey) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }: RenderElementProps) => {
  const style: React.CSSProperties = {};
  if (isAlignElement(element)) {
    style.textAlign = element.align as AlignType;
  }
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

interface BlockButtonProps {
  format: CustomElementFormat;
  icon: React.ReactNode;
  label?: string;
}

const BlockButton = ({ format, icon, label }: BlockButtonProps) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format, isAlignType(format) ? "align" : "type")}
      onMouseDown={(event: MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      className="flex items-center gap-2 w-full px-2 py-1 justify-start"
    >
      {icon}
      {label && <span className="text-sm">{label}</span>}
    </Button>
  );
};

interface MarkButtonProps {
  format: CustomTextKey;
  icon: React.ReactNode;
}

const MarkButton = ({ format, icon }: MarkButtonProps) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </Button>
  );
};

const isAlignType = (format: CustomElementFormat): format is AlignType => {
  return TEXT_ALIGN_TYPES.includes(format as AlignType);
};

const isAlignElement = (element: CustomElement): element is CustomElementWithAlign => {
  return "align" in element;
};

export default TextEditor;
