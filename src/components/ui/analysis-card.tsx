import type { ComponentPropsWithoutRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

import {
  StatusBadgeDot,
  StatusBadgeLabel,
  StatusBadgeRoot,
  type StatusBadgeRootProps,
} from "./status-badge";

const analysisCardVariants = tv({
  base: "flex w-full flex-col gap-3 border border-border-subtle bg-app-bg p-5 text-left",
  variants: {
    size: {
      md: "max-w-[480px]",
      lg: "max-w-[560px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const analysisCardTitleVariants = tv({
  base: "font-mono-ui text-[13px] text-text-primary",
});

const analysisCardDescriptionVariants = tv({
  base: "font-mono-body text-[12px] leading-[1.5] text-text-secondary",
});

export type AnalysisCardRootProps = ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof analysisCardVariants>;

export type AnalysisCardBadgeProps = StatusBadgeRootProps;

export type AnalysisCardTitleProps = ComponentPropsWithoutRef<"p">;

export type AnalysisCardDescriptionProps = ComponentPropsWithoutRef<"p">;

export function AnalysisCardRoot({
  children,
  className,
  size,
  ...props
}: AnalysisCardRootProps) {
  return (
    <div className={cn(analysisCardVariants({ size }), className)} {...props}>
      {children}
    </div>
  );
}

export function AnalysisCardBadge({
  children,
  className,
  size,
  tone,
  ...props
}: AnalysisCardBadgeProps) {
  return (
    <StatusBadgeRoot className={className} size={size} tone={tone} {...props}>
      <StatusBadgeDot />
      <StatusBadgeLabel>{children}</StatusBadgeLabel>
    </StatusBadgeRoot>
  );
}

export function AnalysisCardTitle({
  children,
  className,
  ...props
}: AnalysisCardTitleProps) {
  return (
    <p className={cn(analysisCardTitleVariants(), className)} {...props}>
      {children}
    </p>
  );
}

export function AnalysisCardDescription({
  children,
  className,
  ...props
}: AnalysisCardDescriptionProps) {
  return (
    <p className={cn(analysisCardDescriptionVariants(), className)} {...props}>
      {children}
    </p>
  );
}

export {
  analysisCardDescriptionVariants,
  analysisCardTitleVariants,
  analysisCardVariants,
};
