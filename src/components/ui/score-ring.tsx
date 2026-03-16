import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const scoreRingVariants = tv({
  base: "relative isolate flex items-center justify-center rounded-full",
  variants: {
    size: {
      sm: "size-36",
      md: "size-[180px]",
      lg: "size-[220px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const scoreValueVariants = tv({
  base: "font-mono-ui font-bold leading-none text-text-primary",
  variants: {
    size: {
      sm: "text-[38px]",
      md: "text-[48px]",
      lg: "text-[56px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const scoreMaxVariants = tv({
  base: "font-mono-ui leading-none text-text-tertiary",
  variants: {
    size: {
      sm: "text-[14px]",
      md: "text-[16px]",
      lg: "text-[18px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ScoreRingProps = ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof scoreRingVariants> & {
    maxScore?: number;
    score: number;
  };

export function ScoreRing({
  className,
  maxScore = 10,
  score,
  size,
  ...props
}: ScoreRingProps) {
  const safeMaxScore = maxScore <= 0 ? 10 : maxScore;
  const clampedScore = Math.min(Math.max(score, 0), safeMaxScore);
  const progress = clampedScore / safeMaxScore;
  const scoreText = Number.isInteger(clampedScore)
    ? clampedScore.toString()
    : clampedScore.toFixed(1);
  const gradientEnd = Math.max(progress * 360, 4);
  const warningPoint = Math.max(gradientEnd * 0.72, 2);
  const ringStyle = {
    background: `conic-gradient(from 90deg, #10b981 0deg, #f59e0b ${warningPoint}deg, transparent ${gradientEnd}deg, transparent 360deg)`,
    WebkitMask:
      "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))",
    mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))",
  } satisfies CSSProperties;

  return (
    <div className={cn(scoreRingVariants({ size }), className)} {...props}>
      <div className="absolute inset-0 rounded-full border-4 border-border-subtle" />
      <div className="absolute inset-0 rounded-full" style={ringStyle} />
      <div className="relative flex items-center gap-0.5">
        <span className={scoreValueVariants({ size })}>{scoreText}</span>
        <span className={scoreMaxVariants({ size })}>/{safeMaxScore}</span>
      </div>
    </div>
  );
}

export { scoreMaxVariants, scoreRingVariants, scoreValueVariants };
