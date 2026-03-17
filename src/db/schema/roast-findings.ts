import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { findingKindEnum, findingToneEnum } from "@/db/schema/enums";
import { roastResults } from "@/db/schema/roast-results";

export const roastFindings = pgTable(
  "roast_findings",
  {
    id: uuid().primaryKey().defaultRandom(),
    resultId: uuid()
      .notNull()
      .references(() => roastResults.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    kind: findingKindEnum().notNull(),
    tone: findingToneEnum().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    startLine: integer(),
    endLine: integer(),
    createdAt: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("roast_findings_result_id_position_unique").on(
      table.resultId,
      table.position,
    ),
  ],
);

export type RoastFinding = InferSelectModel<typeof roastFindings>;
export type NewRoastFinding = InferInsertModel<typeof roastFindings>;
