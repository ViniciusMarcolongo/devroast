"use client";

import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  placeholder as placeholderExtension,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { ChevronDown } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  CodeBlockHeader,
  SwitchControl,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
} from "@/components/ui";
import {
  editorLanguageSelectOptions,
  getCodeLanguageLabel,
  getFileNameForLanguage,
  isSupportedCodeLanguageId,
  loadCodeLanguageExtension,
  type SupportedCodeLanguageId,
} from "@/lib/code-languages";
import { detectCodeLanguage } from "@/lib/detect-code-language";

type CodeEditorShellProps = {
  actionLabel?: string;
  helperText?: string;
  placeholder?: string;
};

const MAX_SNIPPET_CHAR_COUNT = 2000;

const editorHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#f59e0b" },
  { tag: [tags.atom, tags.bool, tags.number], color: "#f97316" },
  { tag: [tags.string, tags.special(tags.string)], color: "#22c55e" },
  { tag: [tags.comment, tags.quote], color: "#6b7280", fontStyle: "italic" },
  { tag: [tags.variableName, tags.name], color: "#fafafa" },
  { tag: [tags.propertyName, tags.attributeName], color: "#38bdf8" },
  { tag: [tags.function(tags.variableName), tags.labelName], color: "#a78bfa" },
  { tag: [tags.typeName, tags.className], color: "#facc15" },
  { tag: [tags.operator, tags.punctuation], color: "#9ca3af" },
  { tag: [tags.tagName], color: "#f87171" },
  { tag: [tags.angleBracket], color: "#6b7280" },
  { tag: [tags.meta], color: "#10b981" },
]);

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#101010",
      color: "#fafafa",
      fontFamily: "var(--font-mono-ui)",
      fontSize: "13px",
      height: "100%",
      textAlign: "left",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono-ui)",
      lineHeight: "1.45",
      minHeight: "320px",
      maxHeight: "560px",
      overflow: "auto",
      textAlign: "left",
    },
    ".cm-gutters": {
      backgroundColor: "#0f0f0f",
      borderRight: "1px solid rgba(42, 42, 42, 0.7)",
      color: "#4b5563",
      minWidth: "48px",
    },
    ".cm-gutter": {
      minHeight: "320px",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      boxSizing: "border-box",
      fontFamily: "var(--font-mono-ui)",
      fontSize: "13px",
      lineHeight: "1.45",
      minWidth: "24px",
      paddingLeft: "12px",
      paddingRight: "12px",
      textAlign: "right",
    },
    ".cm-content": {
      minHeight: "320px",
      caretColor: "#fafafa",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
    ".cm-line": {
      lineHeight: "1.45",
      padding: "0",
    },
    ".cm-activeLine": {
      backgroundColor: "transparent",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(16, 185, 129, 0.2)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#fafafa",
    },
    ".cm-placeholder": {
      color: "#4b5563",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(16, 185, 129, 0.24)",
    },
  },
  { dark: true },
);

const baseExtensions: Extension[] = [
  history(),
  drawSelection(),
  dropCursor(),
  highlightActiveLine(),
  lineNumbers(),
  keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
  syntaxHighlighting(editorHighlightStyle),
  editorTheme,
  EditorState.tabSize.of(2),
];

type CodeEditorSurfaceProps = {
  code: string;
  languageExtension: Extension;
  onCodeChange: (value: string) => void;
  placeholder: string;
};

function CodeEditorSurface({
  code,
  languageExtension,
  onCodeChange,
  placeholder,
}: CodeEditorSurfaceProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onCodeChangeRef = useRef(onCodeChange);
  const languageCompartmentRef = useRef(new Compartment());

  onCodeChangeRef.current = onCodeChange;

  useEffect(() => {
    if (!hostRef.current || viewRef.current) {
      return;
    }

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: code,
        extensions: [
          ...baseExtensions,
          placeholderExtension(placeholder),
          languageCompartmentRef.current.of(languageExtension),
          EditorView.contentAttributes.of({
            "aria-label": "Paste code editor",
          }),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) {
              return;
            }

            onCodeChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [code, languageExtension, placeholder]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view) {
      return;
    }

    const currentCode = view.state.doc.toString();

    if (currentCode === code) {
      return;
    }

    view.dispatch({
      changes: {
        from: 0,
        to: currentCode.length,
        insert: code,
      },
    });
  }, [code]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view) {
      return;
    }

    view.dispatch({
      effects: languageCompartmentRef.current.reconfigure(languageExtension),
    });
  }, [languageExtension]);

  return <div className="min-h-[320px]" ref={hostRef} />;
}

export function CodeEditorShell({
  actionLabel = "$ roast_my_code",
  helperText = "allow tabs, auto detect on, 2k char limit, paste and cry",
  placeholder = "// paste your code here\n// we will roast it soon\n",
}: CodeEditorShellProps) {
  const [code, setCode] = useState("");
  const [detectedLanguage, setDetectedLanguage] =
    useState<SupportedCodeLanguageId>("plaintext");
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedCodeLanguageId | null>(null);
  const [languageExtension, setLanguageExtension] = useState<Extension>([]);

  const activeLanguage = selectedLanguage ?? detectedLanguage;
  const characterCount = code.length;
  const isOverCharacterLimit = characterCount > MAX_SNIPPET_CHAR_COUNT;
  const isDisabled = code.trim().length === 0 || isOverCharacterLimit;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDetectedLanguage(detectCodeLanguage(code));
    }, 160);

    return () => {
      window.clearTimeout(handle);
    };
  }, [code]);

  useEffect(() => {
    let isCancelled = false;

    loadCodeLanguageExtension(activeLanguage).then((extension) => {
      if (!isCancelled) {
        setLanguageExtension(extension);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeLanguage]);

  const fileName = useMemo(
    () => getFileNameForLanguage(activeLanguage),
    [activeLanguage],
  );

  const languageStatusLabel = useMemo(() => {
    if (selectedLanguage) {
      return `manual: ${getCodeLanguageLabel(selectedLanguage)}`;
    }

    return `Auto (${getCodeLanguageLabel(detectedLanguage)})`;
  }, [detectedLanguage, selectedLanguage]);

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.target.value;

    if (nextValue === "auto") {
      setSelectedLanguage(null);
      return;
    }

    if (isSupportedCodeLanguageId(nextValue)) {
      setSelectedLanguage(nextValue);
    }
  }

  return (
    <div className="flex w-full max-w-[780px] flex-col gap-4 text-left">
      <div className="overflow-hidden border border-border-subtle bg-surface-primary">
        <CodeBlockHeader
          actions={
            <>
              <div className="relative">
                <label className="sr-only" htmlFor="editor-language-select">
                  Select code language
                </label>
                <select
                  className="h-7 min-w-[138px] appearance-none border border-border-subtle bg-surface-primary px-2 pr-7 font-mono-ui text-[11px] text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:border-accent-green"
                  id="editor-language-select"
                  onChange={handleLanguageChange}
                  value={selectedLanguage ?? "auto"}
                >
                  {editorLanguageSelectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-text-tertiary" />
              </div>
              <span className="hidden font-mono-body text-[11px] text-text-tertiary md:block">
                {languageStatusLabel}
              </span>
            </>
          }
          fileName={fileName}
        />

        <div className="bg-[#101010]">
          <CodeEditorSurface
            code={code}
            languageExtension={languageExtension}
            onCodeChange={setCode}
            placeholder={placeholder}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SwitchRoot defaultChecked>
            <SwitchControl>
              <SwitchThumb />
            </SwitchControl>
            <SwitchLabel>roast mode</SwitchLabel>
          </SwitchRoot>
          <p className="font-mono-body text-[11px] text-text-tertiary">
            {helperText}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <span
            className={`font-mono-body text-[11px] ${
              isOverCharacterLimit ? "text-danger" : "text-text-tertiary"
            }`}
          >
            {characterCount.toLocaleString()}/
            {MAX_SNIPPET_CHAR_COUNT.toLocaleString()} chars
          </span>
          <Button className="min-w-[164px]" disabled={isDisabled}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
