import type { Metadata } from "next";

import {
  LeaderboardEntryCard,
  type LeaderboardEntryCardProps,
} from "@/components/leaderboard-entry-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard | devroast",
  description:
    "Static SSR leaderboard preview with the most roasted code snippets on devroast.",
};

const heroStats = ["2,847 submissions", "avg score: 4.2/10"] as const;

const leaderboardEntries: readonly LeaderboardEntryCardProps[] = [
  {
    code: [
      'eval(prompt("enter code"))',
      "document.write(response)",
      "// trust the user lol",
    ].join("\n"),
    lang: "javascript",
    rank: "1",
    score: "1.2",
    language: "javascript",
    linesLabel: "3 lines",
  },
  {
    code: [
      "if (x == true) { return true; }",
      "else if (x == false) { return false; }",
      "else { return !false; }",
    ].join("\n"),
    lang: "typescript",
    rank: "2",
    score: "1.8",
    language: "typescript",
    linesLabel: "3 lines",
  },
  {
    code: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"].join(
      "\n",
    ),
    lang: "sql",
    rank: "3",
    score: "2.1",
    language: "sql",
    linesLabel: "2 lines",
  },
  {
    code: ["catch (e) {", "  // ignore", "}"].join("\n"),
    lang: "java",
    rank: "4",
    score: "2.3",
    language: "java",
    linesLabel: "3 lines",
  },
  {
    code: [
      "const sleep = (ms) =>",
      "  new Date(Date.now() + ms)",
      "  while(new Date() < end) {}",
    ].join("\n"),
    lang: "javascript",
    rank: "5",
    score: "2.5",
    language: "javascript",
    linesLabel: "3 lines",
  },
] as const;

export default function LeaderboardPage() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-app-bg px-6 py-10 md:px-10 md:py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 md:gap-12">
        <section className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-3 font-mono-ui">
            <span className="text-[28px] font-bold text-accent-green md:text-[32px]">
              &gt;
            </span>
            <h1 className="text-[24px] font-bold tracking-[-0.04em] text-text-primary md:text-[28px]">
              shame_leaderboard
            </h1>
          </div>

          <p className="font-mono-body text-[14px] text-text-secondary">
            {"// the most roasted code on the internet"}
          </p>

          <div className="flex flex-wrap items-center gap-2 font-mono-body text-[12px] text-text-tertiary">
            <span>{heroStats[0]}</span>
            <span aria-hidden="true">.</span>
            <span>{heroStats[1]}</span>
          </div>
        </section>

        <section className="flex w-full flex-col gap-5">
          {leaderboardEntries.map((entry) => (
            <LeaderboardEntryCard key={entry.rank} {...entry} />
          ))}
        </section>
      </div>
    </main>
  );
}
