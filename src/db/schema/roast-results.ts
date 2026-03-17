import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { findingToneEnum, resultVisibilityEnum } from "@/db/schema/enums";
import { roastSubmissions } from "@/db/schema/roast-submissions";

export const roastResults = pgTable(
  "roast_results",
  {
    id: uuid().primaryKey().defaultRandom(),
    submissionId: uuid()
      .notNull()
      .references(() => roastSubmissions.id, { onDelete: "cascade" }),
    score: numeric({ precision: 3, scale: 1 }).notNull(),
    verdict: text().notNull(),
    verdictTone: findingToneEnum(),
    headline: text().notNull(),
    summary: text(),
    improvedCode: text(),
    visibility: resultVisibilityEnum().notNull().default("private"),
    shareSlug: text(),
    isFeatured: boolean().notNull().default(false),
    publishedAt: timestamp({ mode: "date", withTimezone: true }),
    createdAt: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("roast_results_submission_id_unique").on(table.submissionId),
    unique("roast_results_share_slug_unique").on(table.shareSlug),
    index("roast_results_leaderboard_idx").on(
      table.visibility,
      table.score,
      table.publishedAt,
    ),
  ],
);

export type RoastResult = InferSelectModel<typeof roastResults>;
export type NewRoastResult = InferInsertModel<typeof roastResults>;
