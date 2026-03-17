import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { analysisModeEnum, submissionStatusEnum } from "@/db/schema/enums";

export const roastSubmissions = pgTable("roast_submissions", {
  id: uuid().primaryKey().defaultRandom(),
  publicId: text().notNull().unique(),
  sourceKind: text().notNull().default("paste"),
  sourceLabel: text(),
  rawCode: text().notNull(),
  detectedLanguage: text(),
  selectedLanguage: text(),
  activeLanguage: text(),
  lineCount: integer().notNull(),
  charCount: integer().notNull(),
  analysisMode: analysisModeEnum().notNull(),
  status: submissionStatusEnum().notNull().default("pending"),
  errorMessage: text(),
  createdAt: timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type RoastSubmission = InferSelectModel<typeof roastSubmissions>;
export type NewRoastSubmission = InferInsertModel<typeof roastSubmissions>;
