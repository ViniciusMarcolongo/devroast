import type { Extension } from "@codemirror/state";

const supportedLanguageIds = [
  "plaintext",
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "python",
  "json",
  "bash",
  "sql",
  "html",
  "css",
] as const;

type SupportedLanguageIdTuple = typeof supportedLanguageIds;

export type SupportedCodeLanguageId = SupportedLanguageIdTuple[number];
export type LanguageSelectValue = SupportedCodeLanguageId | "auto";

type LanguageOption = {
  extension: string;
  label: string;
};

const languageOptions: Record<SupportedCodeLanguageId, LanguageOption> = {
  plaintext: {
    extension: "txt",
    label: "Plain text",
  },
  javascript: {
    extension: "js",
    label: "JavaScript",
  },
  typescript: {
    extension: "ts",
    label: "TypeScript",
  },
  tsx: {
    extension: "tsx",
    label: "TSX",
  },
  jsx: {
    extension: "jsx",
    label: "JSX",
  },
  python: {
    extension: "py",
    label: "Python",
  },
  json: {
    extension: "json",
    label: "JSON",
  },
  bash: {
    extension: "sh",
    label: "Bash",
  },
  sql: {
    extension: "sql",
    label: "SQL",
  },
  html: {
    extension: "html",
    label: "HTML",
  },
  css: {
    extension: "css",
    label: "CSS",
  },
};

const supportedLanguageSet = new Set<string>(supportedLanguageIds);

export const editorLanguageSelectOptions = [
  {
    label: "Auto",
    value: "auto",
  },
  ...supportedLanguageIds
    .filter((languageId) => languageId !== "plaintext")
    .map((languageId) => ({
      label: languageOptions[languageId].label,
      value: languageId,
    })),
] as const satisfies ReadonlyArray<{
  label: string;
  value: LanguageSelectValue;
}>;

export function getCodeLanguageLabel(languageId: SupportedCodeLanguageId) {
  return languageOptions[languageId].label;
}

export function getFileNameForLanguage(languageId: SupportedCodeLanguageId) {
  return `paste-your-code.${languageOptions[languageId].extension}`;
}

export function isSupportedCodeLanguageId(
  value: string,
): value is SupportedCodeLanguageId {
  return supportedLanguageSet.has(value);
}

export async function loadCodeLanguageExtension(
  languageId: SupportedCodeLanguageId,
): Promise<Extension> {
  switch (languageId) {
    case "javascript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript();
    }
    case "typescript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ typescript: true });
    }
    case "tsx": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ jsx: true, typescript: true });
    }
    case "jsx": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ jsx: true });
    }
    case "python": {
      const { python } = await import("@codemirror/lang-python");
      return python();
    }
    case "json": {
      const { json } = await import("@codemirror/lang-json");
      return json();
    }
    case "bash": {
      const [{ StreamLanguage }, { shell }] = await Promise.all([
        import("@codemirror/language"),
        import("@codemirror/legacy-modes/mode/shell"),
      ]);

      return StreamLanguage.define(shell);
    }
    case "sql": {
      const { sql } = await import("@codemirror/lang-sql");
      return sql();
    }
    case "html": {
      const { html } = await import("@codemirror/lang-html");
      return html();
    }
    case "css": {
      const { css } = await import("@codemirror/lang-css");
      return css();
    }
    default:
      return [];
  }
}
