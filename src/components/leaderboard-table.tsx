import Link from "next/link";
import type { BundledLanguage } from "shiki";

import { HomeShameLeaderboardRow } from "@/components/home-shame-leaderboard-row";
import { buttonVariants, CodeBlock, CodeBlockHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

const skeletonRows = ["row-1", "row-2", "row-3"] as const;

export type LeaderboardEntry = {
  code: string;
  fileName?: string | null;
  id: string;
  label: string;
  language: string;
  lang: BundledLanguage;
  lineCount: number;
  rank: number;
  score: string;
};

type LeaderboardTableProps = {
  ctaHref?: string;
  ctaLabel?: string;
  entries: readonly LeaderboardEntry[];
  footerMetrics?: readonly string[];
  footerHref?: string;
  footerLabel?: string;
  totalRoasts?: number;
  showFooter?: boolean;
  title?: string;
  subtitle?: string;
};

export function LeaderboardTable({
  ctaHref,
  ctaLabel = "view all ->",
  entries,
  footerMetrics = [],
  footerHref = "/leaderboard",
  footerLabel,
  showFooter = true,
  subtitle = "// we roast based on bad structure, vibes, and shame",
  totalRoasts,
  title = "// shame_leaderboard",
}: LeaderboardTableProps) {
  const showFooterSeparator =
    typeof totalRoasts === "number" && footerMetrics.length > 0;

  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-mono-ui text-[12px] text-accent-green">{title}</p>
          <p className="font-mono-body text-[11px] text-text-secondary">
            {subtitle}
          </p>
        </div>
        {ctaHref ? (
          <Link
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            href={ctaHref}
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>

      <div className="overflow-hidden border border-border-subtle bg-surface-primary">
        <div className="hidden grid-cols-[72px_96px_minmax(0,1fr)_120px] border-b border-border-subtle px-4 py-3 font-mono-ui text-[11px] uppercase tracking-[0.18em] text-text-tertiary md:grid">
          <span>#</span>
          <span>score</span>
          <span>code</span>
          <span>lang</span>
        </div>
        {entries.map((entry) => (
          <HomeShameLeaderboardRow
            fileName={entry.fileName}
            key={entry.id}
            label={entry.label}
            language={entry.language}
            lineCount={entry.lineCount}
            rank={entry.rank}
            score={entry.score}
          >
            <CodeBlockHeader fileName={entry.fileName ?? undefined} />
            <CodeBlock
              className="w-full max-w-none"
              code={entry.code}
              lang={entry.lang}
            />
          </HomeShameLeaderboardRow>
        ))}
      </div>

      {showFooter ? (
        <div className="flex flex-col gap-2 pt-2 font-mono-body text-[10px] text-text-tertiary md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            {typeof totalRoasts === "number" ? (
              <span>{`showing worst ${entries.length} of ${totalRoasts.toLocaleString()} roasts`}</span>
            ) : null}
            {showFooterSeparator ? <span aria-hidden="true">.</span> : null}
            {footerMetrics.map((metric) => (
              <span key={metric}>{metric}</span>
            ))}
          </div>
          <Link
            className="text-center transition-colors hover:text-text-primary md:text-right"
            href={footerHref}
          >
            {footerLabel ?? "view full leaderboard ->"}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function LeaderboardTableSkeleton() {
  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="h-4 w-[172px] animate-pulse bg-surface-primary" />
          <div className="h-4 w-[264px] animate-pulse bg-surface-primary" />
        </div>
        <div className="h-9 w-[108px] animate-pulse border border-border-subtle bg-surface-primary" />
      </div>

      <div className="overflow-hidden border border-border-subtle bg-surface-primary">
        <div className="hidden grid-cols-[72px_96px_minmax(0,1fr)_120px] border-b border-border-subtle px-4 py-3 md:grid">
          <div className="h-3 w-4 animate-pulse bg-app-bg" />
          <div className="h-3 w-10 animate-pulse bg-app-bg" />
          <div className="h-3 w-10 animate-pulse bg-app-bg" />
          <div className="h-3 w-10 animate-pulse bg-app-bg" />
        </div>
        {skeletonRows.map((rowId) => (
          <div
            className="flex flex-col gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 md:grid md:grid-cols-[72px_96px_minmax(0,1fr)_120px] md:items-start md:gap-0"
            key={rowId}
          >
            <div className="flex items-center justify-between gap-4 md:contents">
              <div className="flex items-center gap-4 md:contents">
                <div className="h-4 w-4 animate-pulse bg-app-bg" />
                <div className="h-4 w-10 animate-pulse bg-app-bg" />
              </div>
              <div className="h-4 w-12 animate-pulse bg-app-bg md:hidden" />
            </div>
            <div className="h-10 w-[80%] animate-pulse bg-app-bg" />
            <div className="h-32 w-full animate-pulse border border-border-subtle bg-app-bg" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
          <div className="h-4 w-[176px] animate-pulse bg-surface-primary" />
          <div className="h-4 w-[112px] animate-pulse bg-surface-primary" />
        </div>
        <div className="h-4 w-[132px] animate-pulse self-center bg-surface-primary md:self-auto" />
      </div>
    </section>
  );
}
