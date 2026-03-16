"use client";

import type { ComponentPropsWithoutRef } from "react";
import { createContext, useContext } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const diffLineVariants = tv({
  base: "flex w-full items-start gap-2 px-4 py-2 font-mono-ui text-[13px]",
  variants: {
    kind: {
      add: "bg-success-soft text-text-primary",
      remove: "bg-danger-soft text-text-secondary",
      context: "bg-transparent text-text-secondary",
    },
  },
  defaultVariants: {
    kind: "context",
  },
});

const diffPrefixVariants = tv({
  base: "shrink-0",
  variants: {
    kind: {
      add: "text-accent-green",
      remove: "text-danger",
      context: "text-text-tertiary",
    },
  },
  defaultVariants: {
    kind: "context",
  },
});

type DiffLineKind = NonNullable<VariantProps<typeof diffLineVariants>["kind"]>;

type DiffLineContextValue = {
  kind: DiffLineKind;
};

const DiffLineContext = createContext<DiffLineContextValue | null>(null);

function useDiffLineContext() {
  const context = useContext(DiffLineContext);

  if (!context) {
    throw new Error("DiffLine components must be used within DiffLineRoot.");
  }

  return context;
}

export type DiffLineRootProps = ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof diffLineVariants>;

export type DiffLinePrefixProps = ComponentPropsWithoutRef<"span">;

export type DiffLineCodeProps = ComponentPropsWithoutRef<"span">;

export function DiffLineRoot({
  children,
  className,
  kind = "context",
  ...props
}: DiffLineRootProps) {
  return (
    <DiffLineContext.Provider value={{ kind }}>
      <div className={cn(diffLineVariants({ kind }), className)} {...props}>
        {children}
      </div>
    </DiffLineContext.Provider>
  );
}

export function DiffLinePrefix({
  children,
  className,
  ...props
}: DiffLinePrefixProps) {
  const { kind } = useDiffLineContext();
  const resolvedPrefix =
    children ?? (kind === "add" ? "+" : kind === "remove" ? "-" : " ");

  return (
    <span className={cn(diffPrefixVariants({ kind }), className)} {...props}>
      {resolvedPrefix}
    </span>
  );
}

export function DiffLineCode({
  children,
  className,
  ...props
}: DiffLineCodeProps) {
  return (
    <span className={cn("min-w-0", className)} {...props}>
      {children}
    </span>
  );
}

export { diffLineVariants, diffPrefixVariants };
