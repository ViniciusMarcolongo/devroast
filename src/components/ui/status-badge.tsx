import type { ComponentPropsWithoutRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const statusBadgeVariants = tv({
  base: "inline-flex items-center gap-2 font-mono-ui leading-none",
  variants: {
    tone: {
      critical: "text-danger",
      warning: "text-warning",
      good: "text-accent-green",
      muted: "text-text-secondary",
    },
    size: {
      sm: "text-[12px]",
      md: "text-[13px]",
    },
  },
  defaultVariants: {
    tone: "muted",
    size: "sm",
  },
});

const statusBadgeDotVariants = tv({
  base: "size-2 rounded-full bg-current",
});

const statusBadgeLabelVariants = tv({
  base: "leading-none",
});

export type StatusBadgeRootProps = ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof statusBadgeVariants>;

export type StatusBadgeDotProps = ComponentPropsWithoutRef<"span">;

export type StatusBadgeLabelProps = ComponentPropsWithoutRef<"span">;

export function StatusBadgeRoot({
  children,
  className,
  size,
  tone,
  ...props
}: StatusBadgeRootProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ size, tone }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadgeDot({ className, ...props }: StatusBadgeDotProps) {
  return (
    <span className={cn(statusBadgeDotVariants(), className)} {...props} />
  );
}

export function StatusBadgeLabel({
  children,
  className,
  ...props
}: StatusBadgeLabelProps) {
  return (
    <span className={cn(statusBadgeLabelVariants(), className)} {...props}>
      {children}
    </span>
  );
}

export {
  statusBadgeDotVariants,
  statusBadgeLabelVariants,
  statusBadgeVariants,
};
