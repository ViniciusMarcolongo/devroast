import Link from "next/link";

import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

export type LeaderboardEntry = {
  name: string;
  rank: string;
  score: string;
  tag: string;
};

export const leaderboardEntries = [
  {
    rank: "1",
    score: "1.2",
    name: "really_great_name (copy) (2).js",
    tag: "typescript",
  },
  {
    rank: "2",
    score: "1.8",
    name: "if (x == 'ok') return true; else return false.js",
    tag: "javascript",
  },
  {
    rank: "3",
    score: "2.1",
    name: "SELECT * FROM PROD WHERE 1=1.sql",
    tag: "sql",
  },
  {
    rank: "4",
    score: "2.7",
    name: "payment-handler-final-v14-really-final.ts",
    tag: "typescript",
  },
  {
    rank: "5",
    score: "3.0",
    name: "controller_with_11_nested_ifs.rb",
    tag: "ruby",
  },
] as const satisfies readonly LeaderboardEntry[];

type LeaderboardTableProps = {
  ctaHref?: string;
  ctaLabel?: string;
  entries?: readonly LeaderboardEntry[];
  footerHref?: string;
  footerLabel?: string;
  showFooter?: boolean;
  title?: string;
  subtitle?: string;
};

export function LeaderboardTable({
  ctaHref,
  ctaLabel = "view all ->",
  entries = leaderboardEntries,
  footerHref = "/leaderboard",
  footerLabel,
  showFooter = true,
  subtitle = "// we roast based on bad structure, vibes, and shame",
  title = "// shame_leaderboard",
}: LeaderboardTableProps) {
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
        <div className="grid grid-cols-[48px_72px_minmax(0,1fr)_110px] border-b border-border-subtle px-4 py-3 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-text-tertiary md:grid-cols-[72px_96px_minmax(0,1fr)_120px] md:text-[11px]">
          <span>#</span>
          <span>score</span>
          <span>code</span>
          <span>lang</span>
        </div>
        {entries.map((entry) => (
          <div
            className="grid grid-cols-[48px_72px_minmax(0,1fr)_110px] items-start gap-2 border-b border-border-subtle px-4 py-3 last:border-b-0 md:grid-cols-[72px_96px_minmax(0,1fr)_120px] md:gap-0"
            key={`${entry.rank}-${entry.name}`}
          >
            <span className="font-mono-ui text-[12px] text-text-tertiary md:text-[13px]">
              {entry.rank}
            </span>
            <span className="font-mono-ui text-[12px] text-danger md:text-[13px]">
              {entry.score}
            </span>
            <span className="font-mono-body text-[11px] leading-5 text-text-primary md:text-[12px]">
              {entry.name}
            </span>
            <span className="font-mono-ui text-[11px] text-text-secondary md:text-[12px]">
              {entry.tag}
            </span>
          </div>
        ))}
      </div>

      {showFooter ? (
        <div className="pt-2 text-center font-mono-body text-[10px] text-text-tertiary">
          <span>{`showing top ${entries.length} of 2,847 - `}</span>
          <Link
            className="transition-colors hover:text-text-primary"
            href={footerHref}
          >
            {footerLabel ?? "view full leaderboard ->"}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
