"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const COLLAPSE_LINE_THRESHOLD = 4;

type HomeShameLeaderboardRowProps = {
  children: React.ReactNode;
  fileName?: string | null;
  label: string;
  language: string;
  lineCount: number;
  rank: number;
  score: string;
};

export function HomeShameLeaderboardRow({
  children,
  fileName,
  label,
  language,
  lineCount,
  rank,
  score,
}: HomeShameLeaderboardRowProps) {
  const [open, setOpen] = useState(false);
  const isExpandable = lineCount > COLLAPSE_LINE_THRESHOLD;

  return (
    <Collapsible.Root
      className="border-b border-border-subtle last:border-b-0"
      disabled={!isExpandable}
      onOpenChange={setOpen}
      open={open}
    >
      <article>
        <div className="flex flex-col gap-3 px-4 py-3 md:grid md:grid-cols-[72px_96px_minmax(0,1fr)_120px] md:items-start md:gap-0">
          <div className="flex items-center justify-between gap-4 md:contents">
            <div className="flex items-center gap-4 md:contents">
              <span className="font-mono-ui text-[12px] text-text-tertiary md:text-[13px]">
                {rank}
              </span>
              <span className="font-mono-ui text-[12px] text-danger md:text-[13px]">
                {score}
              </span>
            </div>
            <span className="font-mono-ui text-[11px] text-text-secondary md:text-[12px]">
              {language}
            </span>
          </div>
          <div className="min-w-0 md:pr-4">
            <p className="truncate font-mono-body text-[11px] leading-5 text-text-primary md:text-[12px]">
              {label}
            </p>
            <p className="mt-0.5 font-mono-body text-[10px] text-text-tertiary md:text-[11px]">
              {lineCount} lines
              {fileName && fileName !== label ? (
                <>
                  <span aria-hidden="true"> . </span>
                  <span className="break-all md:truncate">{fileName}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="relative overflow-hidden border border-border-subtle bg-surface-primary">
            <div
              className={cn(
                "transition-[max-height] duration-300 ease-out",
                isExpandable && !open
                  ? "max-h-[220px] overflow-hidden"
                  : "max-h-[1600px]",
              )}
            >
              {children}
            </div>
            {isExpandable && !open ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-primary to-transparent" />
            ) : null}
          </div>

          {isExpandable ? (
            <div className="border-x border-b border-border-subtle bg-surface-muted">
              <Collapsible.Trigger className="flex w-full items-center justify-center gap-2 px-4 py-3 font-mono-ui text-[11px] text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/60">
                <span>{open ? "collapse snippet" : "show full snippet"}</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    open && "rotate-180",
                  )}
                />
              </Collapsible.Trigger>
            </div>
          ) : null}
        </div>
      </article>
    </Collapsible.Root>
  );
}
