import type { BundledLanguage } from "shiki";
import { z } from "zod";

import {
  getHomepageMetrics,
  getHomepageShameLeaderboardEntries,
} from "@/db/queries/roasts";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

function getEntryLabel(sourceLabel: string | null, rawCode: string) {
  const firstLine = rawCode.split("\n")[0]?.trim();

  return sourceLabel || firstLine || "untitled-snippet";
}

function getShikiLanguage(language: string | null): BundledLanguage {
  if (!language || language === "plaintext") {
    return "txt" as BundledLanguage;
  }

  return language as BundledLanguage;
}

export const homeRouter = createTRPCRouter({
  metrics: publicProcedure.input(z.void()).query(async () => {
    return getHomepageMetrics();
  }),
  shameLeaderboard: publicProcedure.input(z.void()).query(async () => {
    const [metrics, entries] = await Promise.all([
      getHomepageMetrics(),
      getHomepageShameLeaderboardEntries(3),
    ]);

    return {
      avgScore: metrics.avgScore,
      entries: entries.map((entry, index) => ({
        code: entry.rawCode,
        fileName: entry.sourceLabel,
        id: entry.submissionPublicId,
        label: getEntryLabel(entry.sourceLabel, entry.rawCode),
        language: entry.activeLanguage ?? "plaintext",
        lineCount: entry.lineCount,
        lang: getShikiLanguage(entry.activeLanguage),
        rank: index + 1,
        score: entry.score,
      })),
      totalRoasts: metrics.roastedCodesCount,
    };
  }),
});
