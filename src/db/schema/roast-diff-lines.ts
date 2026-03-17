import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { diffLineKindEnum } from "@/db/schema/enums";
import { roastResults } from "@/db/schema/roast-results";

export const roastDiffLines = pgTable(
  "roast_diff_lines",
  {
    id: uuid().primaryKey().defaultRandom(),
    resultId: uuid()
      .notNull()
      .references(() => roastResults.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    kind: diffLineKindEnum().notNull(),
    content: text().notNull(),
    oldLineNumber: integer(),
    newLineNumber: integer(),
    createdAt: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("roast_diff_lines_result_id_position_unique").on(
      table.resultId,
      table.position,
    ),
  ],
);

export type RoastDiffLine = InferSelectModel<typeof roastDiffLines>;
export type NewRoastDiffLine = InferInsertModel<typeof roastDiffLines>;
