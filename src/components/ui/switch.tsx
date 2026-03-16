"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as React from "react";
import { createContext, useContext } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const switchWrapperVariants = tv({
  base: "inline-flex items-center gap-3 font-mono-ui outline-none disabled:pointer-events-none disabled:opacity-50",
  variants: {
    size: {
      sm: "text-[12px]",
      md: "text-[12px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const switchRootVariants = tv({
  base: "inline-flex shrink-0 items-center rounded-full p-[3px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-green/40 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg data-[checked]:justify-end data-[checked]:bg-accent-green data-[unchecked]:justify-start data-[unchecked]:bg-border-subtle",
  variants: {
    size: {
      sm: "h-5 w-9",
      md: "h-[22px] w-10",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const switchThumbVariants = tv({
  base: "rounded-full transition-colors data-[checked]:bg-accent-green-foreground data-[unchecked]:bg-text-secondary",
  variants: {
    size: {
      sm: "size-[14px]",
      md: "size-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const switchLabelVariants = tv({
  base: "leading-none transition-colors",
  variants: {
    checked: {
      true: "text-accent-green",
      false: "text-text-secondary",
    },
  },
  defaultVariants: {
    checked: false,
  },
});

type BaseSwitchProps = Omit<
  ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
  "children" | "className" | "nativeButton" | "render"
>;

type SwitchSize = NonNullable<
  VariantProps<typeof switchWrapperVariants>["size"]
>;

type SwitchContextValue = {
  buttonProps: ComponentPropsWithoutRef<"button">;
  checked: boolean;
  size: SwitchSize;
};

const SwitchContext = createContext<SwitchContextValue | null>(null);

function useSwitchContext() {
  const context = useContext(SwitchContext);

  if (!context) {
    throw new Error("Switch components must be used within SwitchRoot.");
  }

  return context;
}

export type SwitchRootProps = BaseSwitchProps &
  VariantProps<typeof switchWrapperVariants> & {
    children: ReactNode;
    className?: string;
  };

export type SwitchControlProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "type"
>;

export type SwitchThumbProps = Omit<
  ComponentPropsWithoutRef<typeof BaseSwitch.Thumb>,
  "className"
> & {
  className?: string;
};

export type SwitchLabelProps = ComponentPropsWithoutRef<"span">;

export function SwitchRoot({
  children,
  className,
  onCheckedChange,
  size = "md",
  ...props
}: SwitchRootProps) {
  return (
    <BaseSwitch.Root
      {...props}
      nativeButton
      onCheckedChange={(checked, eventDetails) => {
        onCheckedChange?.(checked, eventDetails);
      }}
      render={(buttonProps, state) => (
        <SwitchContext.Provider
          value={{ buttonProps, checked: state.checked, size }}
        >
          <div className={cn(switchWrapperVariants({ size }), className)}>
            {children}
          </div>
        </SwitchContext.Provider>
      )}
    />
  );
}

export const SwitchControl = React.forwardRef<
  HTMLButtonElement,
  SwitchControlProps
>(({ children, className, ...props }, ref) => {
  const { buttonProps, size } = useSwitchContext();

  return (
    <button
      {...buttonProps}
      {...props}
      className={cn(
        buttonProps.className,
        switchRootVariants({ size }),
        className,
      )}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  );
});

SwitchControl.displayName = "SwitchControl";

export function SwitchThumb({ className, ...props }: SwitchThumbProps) {
  const { size } = useSwitchContext();

  return (
    <BaseSwitch.Thumb
      className={cn(switchThumbVariants({ size }), className)}
      {...props}
    />
  );
}

export function SwitchLabel({
  children,
  className,
  ...props
}: SwitchLabelProps) {
  const { checked } = useSwitchContext();

  return (
    <span
      className={cn(switchLabelVariants({ checked }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

export {
  switchLabelVariants,
  switchRootVariants,
  switchThumbVariants,
  switchWrapperVariants,
};
