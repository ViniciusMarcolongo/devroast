import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border border-transparent font-mono-ui text-[13px] font-medium leading-none transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent-green/40",
  variants: {
    variant: {
      primary:
        "bg-accent-green text-accent-green-foreground hover:bg-accent-green-hover",
      secondary:
        "border-border-subtle bg-transparent text-text-primary hover:bg-white/4",
      outline:
        "border-border-subtle bg-transparent text-text-secondary hover:bg-ghost-hover hover:text-text-primary",
      ghost:
        "bg-transparent text-text-secondary hover:bg-ghost-hover hover:text-text-primary",
    },
    size: {
      sm: "min-h-8 px-4 py-2",
      md: "min-h-[39px] px-6 py-2.5",
      lg: "min-h-11 px-7 py-3",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    fullWidth: false,
  },
});

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
