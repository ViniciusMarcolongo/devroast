import type { BundledLanguage } from "shiki";

import { CodeBlock } from "@/components/ui";

export type LeaderboardEntryCardProps = {
  code: string;
  language: string;
  lang: BundledLanguage;
  linesLabel: string;
  rank: string;
  score: string;
};

export async function LeaderboardEntryCard({
  code,
  language,
  lang,
  linesLabel,
  rank,
  score,
}: LeaderboardEntryCardProps) {
  return (
    <article className="overflow-hidden border border-border-subtle bg-surface-primary">
      <div className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 md:h-12 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5 font-mono-ui text-[12px] md:text-[13px]">
            <span className="text-text-tertiary">#</span>
            <span className="font-bold text-warning">{rank}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono-ui text-[12px] md:text-[13px]">
            <span className="text-text-tertiary">score:</span>
            <span className="font-bold text-danger">{score}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono-ui text-[12px]">
          <span className="text-text-secondary">{language}</span>
          <span className="text-text-tertiary">{linesLabel}</span>
        </div>
      </div>

      <CodeBlock className="w-full max-w-none" code={code} lang={lang} />
    </article>
  );
}
