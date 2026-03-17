import { pgEnum } from "drizzle-orm/pg-core";

export const analysisModeEnum = pgEnum("analysis_mode", [
  "constructive",
  "roast",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const resultVisibilityEnum = pgEnum("result_visibility", [
  "private",
  "unlisted",
  "public",
]);

export const findingKindEnum = pgEnum("finding_kind", ["issue", "strength"]);

export const findingToneEnum = pgEnum("finding_tone", [
  "critical",
  "warning",
  "good",
]);

export const diffLineKindEnum = pgEnum("diff_line_kind", [
  "context",
  "add",
  "remove",
]);

export type AnalysisMode = (typeof analysisModeEnum.enumValues)[number];
export type SubmissionStatus = (typeof submissionStatusEnum.enumValues)[number];
export type ResultVisibility = (typeof resultVisibilityEnum.enumValues)[number];
export type FindingKind = (typeof findingKindEnum.enumValues)[number];
export type FindingTone = (typeof findingToneEnum.enumValues)[number];
export type DiffLineKind = (typeof diffLineKindEnum.enumValues)[number];
