import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { type BundledLanguage, codeToTokens } from "shiki";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const codeBlockVariants = tv({
  base: "overflow-hidden border border-border-subtle bg-surface-primary",
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
    fileName?: string;
    lang?: BundledLanguage;
    showLineNumbers?: boolean;
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
  fileName = "file.ts",
  lang = "typescript",
  showLineNumbers = true,
  size,
  ...props
}: CodeBlockProps) {
  const rawLines = code.split("\n");
  const { bg, fg, tokens } = await codeToTokens(code, {
    lang,
    theme: "vesper",
  });

  return (
    <div className={cn(codeBlockVariants({ size }), className)} {...props}>
      <div className="flex h-10 items-center gap-3 border-b border-border-subtle px-4">
        <span className="size-2.5 rounded-full bg-danger" />
        <span className="size-2.5 rounded-full bg-warning" />
        <span className="size-2.5 rounded-full bg-accent-green" />
        <span className="min-w-0 flex-1" />
        <span className="font-mono-ui text-[12px] text-text-tertiary">
          {fileName}
        </span>
      </div>

      <pre
        className="overflow-x-auto p-3"
        style={{
          backgroundColor: bg,
          color: fg,
        }}
      >
        <code className="grid font-mono-ui text-[13px] leading-[1.45]">
          {tokens.map((line, index) => {
            const lineKey = `${line[0]?.offset ?? `empty-${rawLines[index] ?? ""}`}-${rawLines[index] ?? ""}`;

            return (
              <span
                className="grid min-h-[1.45em] grid-cols-[minmax(0,1fr)]"
                key={lineKey}
              >
                <span
                  className={cn(
                    showLineNumbers &&
                      "grid grid-cols-[28px_minmax(0,1fr)] gap-3",
                  )}
                >
                  {showLineNumbers ? (
                    <span className="text-right text-text-tertiary">
                      {index + 1}
                    </span>
                  ) : null}
                  <span>
                    {line.length > 0 ? (
                      line.map((token) => (
                        <span
                          key={`${token.offset}-${token.content}`}
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

export { codeBlockVariants };
