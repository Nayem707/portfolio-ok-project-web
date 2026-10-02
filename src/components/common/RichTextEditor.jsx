import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bars3BottomLeftIcon,
  BoldIcon,
  H2Icon,
  H3Icon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import {
  classNames,
  isRichTextEmpty,
  plainTextToHtml,
  sanitizeRichText,
  toRichTextHtml,
} from "@/utils";

const TOOLS = [
  { label: "Paragraph", icon: Bars3BottomLeftIcon, block: "p" },
  { label: "Heading", icon: H2Icon, block: "h2" },
  { label: "Subheading", icon: H3Icon, block: "h3" },
  { label: "Bold", icon: BoldIcon, command: "bold" },
  { label: "Italic", icon: ItalicIcon, command: "italic" },
  {
    label: "Bullet list",
    icon: ListBulletIcon,
    command: "insertUnorderedList",
  },
  {
    label: "Numbered list",
    icon: NumberedListIcon,
    command: "insertOrderedList",
  },
];

const currentBlock = () => {
  const value = String(document.queryCommandValue("formatBlock") || "");
  return value.replace(/[<>]/g, "").toLowerCase();
};

// document.execCommand is deprecated but remains the only native,
// dependency-free way to drive contentEditable formatting in all browsers.
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}) {
  const editorRef = useRef(null);
  const emittedRef = useRef(null);
  const [active, setActive] = useState({});
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === emittedRef.current) return;
    const html = toRichTextHtml(value);
    editor.innerHTML = html;
    emittedRef.current = value;
    setEmpty(isRichTextEmpty(html));
  }, [value]);

  const emit = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = sanitizeRichText(editor.innerHTML);
    const next = isRichTextEmpty(html) ? "" : html;
    setEmpty(!next);
    emittedRef.current = next;
    onChange?.(next);
  }, [onChange]);

  const refreshActive = useCallback(() => {
    const editor = editorRef.current;
    const selection = document.getSelection();
    if (
      !editor ||
      !selection?.anchorNode ||
      !editor.contains(selection.anchorNode)
    )
      return;
    const block = currentBlock();
    setActive({
      p: block === "p" || block === "div",
      h2: block === "h2",
      h3: block === "h3",
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActive);
    return () => document.removeEventListener("selectionchange", refreshActive);
  }, [refreshActive]);

  const applyTool = (tool) => {
    editorRef.current?.focus();
    document.execCommand("defaultParagraphSeparator", false, "p");
    if (tool.block) {
      const block = currentBlock() === tool.block ? "p" : tool.block;
      document.execCommand("formatBlock", false, `<${block}>`);
    } else {
      document.execCommand(tool.command);
    }
    emit();
    refreshActive();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    const content = html ? sanitizeRichText(html) : plainTextToHtml(text);
    document.execCommand("insertHTML", false, content);
    emit();
  };

  return (
    <div
      className={classNames(
        "focus-within:border-primary-500 focus-within:ring-primary-100 overflow-hidden rounded-lg border border-slate-300 bg-white transition focus-within:ring-2",
        className,
      )}
    >
      <div
        role="toolbar"
        aria-label="Description formatting"
        className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5"
      >
        {TOOLS.map((tool) => {
          const key = tool.block || tool.command;
          return (
            <button
              key={key}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              aria-pressed={!!active[key]}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyTool(tool)}
              className={classNames(
                "flex h-8 w-8 items-center justify-center rounded-md transition",
                active[key]
                  ? "bg-primary-100 text-primary-700"
                  : "text-slate-500 hover:bg-slate-200 hover:text-slate-700",
              )}
            >
              <tool.icon className="h-4.5 w-4.5" />
            </button>
          );
        })}
      </div>
      <div className="relative">
        {empty && placeholder && (
          <span className="pointer-events-none absolute top-2.5 left-3.5 text-sm text-slate-400">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label="Description"
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onPaste={handlePaste}
          onFocus={() =>
            document.execCommand("defaultParagraphSeparator", false, "p")
          }
          className="rich-text max-h-[28rem] min-h-40 overflow-y-auto px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none"
        />
      </div>
    </div>
  );
}
