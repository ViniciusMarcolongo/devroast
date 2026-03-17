import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { type BundledLanguage, codeToTokens } from "shiki";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const codeBlockVariants = tv({
  base: "overflow-hidden bg-surface-primary",
  variants: {
    size: {
      md: "w-full max-w-[560px]",
      lg: "w-full max-w-[720px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type CodeBlockProps = Omit<ComponentPropsWithoutRef<"div">, "children"> &
  VariantProps<typeof codeBlockVariants> & {
    code: string;
    lang?: BundledLanguage;
    showLineNumbers?: boolean;
  };

export type CodeBlockHeaderProps = ComponentPropsWithoutRef<"div"> & {
  actions?: ReactNode;
  fileName?: string;
};

function getTokenStyle(token: {
  bgColor?: string;
  color?: string;
  htmlStyle?: Record<string, string>;
}) {
  if (token.htmlStyle) {
    return token.htmlStyle as CSSProperties;
  }

  return {
    backgroundColor: token.bgColor,
    color: token.color,
  } satisfies CSSProperties;
}

export async function CodeBlock({
  className,
  code,
  lang = "typescript",
  showLineNumbers = true,
  size,
  ...props
}: CodeBlockProps) {
  const rawLines = code.split("\n");
  let lineOffset = 0;
  const lineKeys = rawLines.map((line) => {
    const key = `${lineOffset}-${line.length}`;
    lineOffset += line.length + 1;
    return key;
  });
  const { bg, fg, tokens } = await codeToTokens(code, {
    lang,
    theme: "vesper",
  });

  return (
    <div className={cn(codeBlockVariants({ size }), className)} {...props}>
      <pre
        className="overflow-x-auto"
        style={{
          backgroundColor: bg,
          color: fg,
        }}
      >
        <code className="grid font-mono-ui text-[12px] leading-[1.5] md:text-[13px]">
          {tokens.map((line, index) => {
            const rawLine = rawLines[index] ?? "";
            const serializedLine = line
              .map((token) => `${token.offset}:${token.content}`)
              .join("|");

            return (
              <span
                className="grid min-h-[1.5em] grid-cols-[minmax(0,1fr)]"
                key={`line-${lineKeys[index]}-${serializedLine}`}
              >
                <span
                  className={cn(
                    showLineNumbers &&
                      "grid grid-cols-[40px_minmax(0,1fr)] gap-0",
                  )}
                >
                  {showLineNumbers ? (
                    <span className="border-r border-border-subtle bg-surface-muted px-[10px] py-[3px] text-right text-text-tertiary">
                      {index + 1}
                    </span>
                  ) : null}
                  <span className="px-4 py-[3px] md:px-5">
                    {line.length > 0 ? (
                      line.map((token) => (
                        <span
                          key={`${rawLine}-${token.offset}-${token.content}`}
                          style={getTokenStyle(token)}
                        >
                          {token.content}
                        </span>
                      ))
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </span>
                </span>
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

export function CodeBlockHeader({
  actions,
  className,
  fileName,
  ...props
}: CodeBlockHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-3 border-b border-border-subtle px-4",
        className,
      )}
      {...props}
    >
      <span className="size-2.5 rounded-full bg-danger" />
      <span className="size-2.5 rounded-full bg-warning" />
      <span className="size-2.5 rounded-full bg-accent-green" />
      <span className="min-w-0 flex-1" />
      {actions}
      {fileName ? (
        <span className="font-mono-ui text-[12px] text-text-tertiary">
          {fileName}
        </span>
      ) : null}
    </div>
  );
}

export { codeBlockVariants };
