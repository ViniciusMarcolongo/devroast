"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as React from "react";
import { createContext, useContext, useState } from "react";
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
  checked: boolean;
  onCheckedChange?: BaseSwitchProps["onCheckedChange"];
  rootProps: Omit<
    BaseSwitchProps,
    "checked" | "children" | "className" | "defaultChecked" | "onCheckedChange"
  >;
  size: SwitchSize;
  toggle: (checked: boolean, eventDetails: unknown) => void;
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

export type SwitchControlProps = {
  children?: ReactNode;
  className?: string;
};

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
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = "md",
  ...props
}: SwitchRootProps) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    useState(defaultChecked);
  const isControlled = typeof checked === "boolean";
  const currentChecked = checked ?? uncontrolledChecked;

  const contextValue: SwitchContextValue = {
    checked: currentChecked,
    onCheckedChange,
    rootProps: props,
    size,
    toggle: (nextChecked, eventDetails) => {
      if (!isControlled) {
        setUncontrolledChecked(nextChecked);
      }

      onCheckedChange?.(nextChecked, eventDetails as never);
    },
  };

  return (
    <SwitchContext.Provider value={contextValue}>
      <div className={cn(switchWrapperVariants({ size }), className)}>
        {children}
      </div>
    </SwitchContext.Provider>
  );
}

export const SwitchControl = React.forwardRef<
  HTMLButtonElement,
  SwitchControlProps
>(({ children, className }, ref) => {
  const { checked, rootProps, size, toggle } = useSwitchContext();

  return (
    <BaseSwitch.Root
      {...rootProps}
      checked={checked}
      className={cn(switchRootVariants({ size }), className)}
      nativeButton={false}
      onCheckedChange={toggle}
      ref={ref}
    >
      {children}
    </BaseSwitch.Root>
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
