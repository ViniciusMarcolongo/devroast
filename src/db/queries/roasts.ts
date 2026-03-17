import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
} from "drizzle-orm";

import { db } from "@/db";
import type {
  AnalysisMode,
  DiffLineKind,
  FindingKind,
  FindingTone,
  ResultVisibility,
} from "@/db/schema";
import {
  roastDiffLines,
  roastFindings,
  roastResults,
  roastSubmissions,
} from "@/db/schema";

export type CreateRoastSubmissionInput = {
  publicId: string;
  rawCode: string;
  lineCount: number;
  charCount: number;
  analysisMode: AnalysisMode;
  activeLanguage?: string | null;
  detectedLanguage?: string | null;
  selectedLanguage?: string | null;
  sourceKind?: string;
  sourceLabel?: string | null;
};

export type RoastFindingInput = {
  position: number;
  kind: FindingKind;
  tone: FindingTone;
  title: string;
  description: string;
  startLine?: number | null;
  endLine?: number | null;
};

export type RoastDiffLineInput = {
  position: number;
  kind: DiffLineKind;
  content: string;
  oldLineNumber?: number | null;
  newLineNumber?: number | null;
};

export type CompleteRoastSubmissionInput = {
  submissionId: string;
  result: {
    score: string;
    verdict: string;
    verdictTone?: FindingTone | null;
    headline: string;
    summary?: string | null;
    improvedCode?: string | null;
    visibility?: ResultVisibility;
    shareSlug?: string | null;
    isFeatured?: boolean;
    publishedAt?: Date | null;
  };
  findings?: RoastFindingInput[];
  diffLines?: RoastDiffLineInput[];
};

export type LeaderboardEntry = {
  submissionId: string;
  submissionPublicId: string;
  resultId: string;
  shareSlug: string | null;
  score: string;
  verdict: string;
  headline: string;
  activeLanguage: string | null;
  lineCount: number;
  sourceLabel: string | null;
  createdAt: Date;
  publishedAt: Date | null;
};

export type RoastWithDetails = {
  submission: typeof roastSubmissions.$inferSelect;
  result: typeof roastResults.$inferSelect;
  findings: Array<typeof roastFindings.$inferSelect>;
  diffLines: Array<typeof roastDiffLines.$inferSelect>;
};

export async function createRoastSubmission(input: CreateRoastSubmissionInput) {
  const [submission] = await db
    .insert(roastSubmissions)
    .values({
      publicId: input.publicId,
      rawCode: input.rawCode,
      lineCount: input.lineCount,
      charCount: input.charCount,
      analysisMode: input.analysisMode,
      activeLanguage: input.activeLanguage ?? null,
      detectedLanguage: input.detectedLanguage ?? null,
      selectedLanguage: input.selectedLanguage ?? null,
      sourceKind: input.sourceKind ?? "paste",
      sourceLabel: input.sourceLabel ?? null,
    })
    .returning();

  return submission;
}

export async function markSubmissionProcessing(submissionId: string) {
  const [submission] = await db
    .update(roastSubmissions)
    .set({
      status: "processing",
      errorMessage: null,
      updatedAt: new Date(),
    })
    .where(eq(roastSubmissions.id, submissionId))
    .returning();

  return submission ?? null;
}

export async function markSubmissionFailed(
  submissionId: string,
  errorMessage: string,
) {
  const [submission] = await db
    .update(roastSubmissions)
    .set({
      status: "failed",
      errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(roastSubmissions.id, submissionId))
    .returning();

  return submission ?? null;
}

export async function completeRoastSubmissionWithResult(
  input: CompleteRoastSubmissionInput,
) {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .insert(roastResults)
      .values({
        submissionId: input.submissionId,
        score: input.result.score,
        verdict: input.result.verdict,
        verdictTone: input.result.verdictTone ?? null,
        headline: input.result.headline,
        summary: input.result.summary ?? null,
        improvedCode: input.result.improvedCode ?? null,
        visibility: input.result.visibility ?? "private",
        shareSlug: input.result.shareSlug ?? null,
        isFeatured: input.result.isFeatured ?? false,
        publishedAt: input.result.publishedAt ?? null,
      })
      .returning();

    if (input.findings && input.findings.length > 0) {
      await tx.insert(roastFindings).values(
        input.findings.map((finding) => ({
          resultId: result.id,
          position: finding.position,
          kind: finding.kind,
          tone: finding.tone,
          title: finding.title,
          description: finding.description,
          startLine: finding.startLine ?? null,
          endLine: finding.endLine ?? null,
        })),
      );
    }

    if (input.diffLines && input.diffLines.length > 0) {
      await tx.insert(roastDiffLines).values(
        input.diffLines.map((diffLine) => ({
          resultId: result.id,
          position: diffLine.position,
          kind: diffLine.kind,
          content: diffLine.content,
          oldLineNumber: diffLine.oldLineNumber ?? null,
          newLineNumber: diffLine.newLineNumber ?? null,
        })),
      );
    }

    const [submission] = await tx
      .update(roastSubmissions)
      .set({
        status: "completed",
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(roastSubmissions.id, input.submissionId))
      .returning();

    return {
      submission,
      result,
    };
  });
}

export async function getRoastByShareSlug(
  shareSlug: string,
): Promise<RoastWithDetails | null> {
  const [row] = await db
    .select({
      submission: getTableColumns(roastSubmissions),
      result: getTableColumns(roastResults),
    })
    .from(roastResults)
    .innerJoin(
      roastSubmissions,
      eq(roastSubmissions.id, roastResults.submissionId),
    )
    .where(eq(roastResults.shareSlug, shareSlug))
    .limit(1);

  if (!row) {
    return null;
  }

  const [findings, diffLines] = await Promise.all([
    db
      .select()
      .from(roastFindings)
      .where(eq(roastFindings.resultId, row.result.id))
      .orderBy(asc(roastFindings.position)),
    db
      .select()
      .from(roastDiffLines)
      .where(eq(roastDiffLines.resultId, row.result.id))
      .orderBy(asc(roastDiffLines.position)),
  ]);

  return {
    submission: row.submission,
    result: row.result,
    findings,
    diffLines,
  };
}

export async function getRoastBySubmissionPublicId(
  publicId: string,
): Promise<RoastWithDetails | null> {
  const [row] = await db
    .select({
      submission: getTableColumns(roastSubmissions),
      result: getTableColumns(roastResults),
    })
    .from(roastSubmissions)
    .innerJoin(roastResults, eq(roastResults.submissionId, roastSubmissions.id))
    .where(eq(roastSubmissions.publicId, publicId))
    .limit(1);

  if (!row) {
    return null;
  }

  const [findings, diffLines] = await Promise.all([
    db
      .select()
      .from(roastFindings)
      .where(eq(roastFindings.resultId, row.result.id))
      .orderBy(asc(roastFindings.position)),
    db
      .select()
      .from(roastDiffLines)
      .where(eq(roastDiffLines.resultId, row.result.id))
      .orderBy(asc(roastDiffLines.position)),
  ]);

  return {
    submission: row.submission,
    result: row.result,
    findings,
    diffLines,
  };
}

export async function getLeaderboardPage({
  limit,
  offset = 0,
}: {
  limit: number;
  offset?: number;
}) {
  const [entries, totalRow] = await Promise.all([
    db
      .select({
        submissionId: roastSubmissions.id,
        submissionPublicId: roastSubmissions.publicId,
        resultId: roastResults.id,
        shareSlug: roastResults.shareSlug,
        score: roastResults.score,
        verdict: roastResults.verdict,
        headline: roastResults.headline,
        activeLanguage: roastSubmissions.activeLanguage,
        lineCount: roastSubmissions.lineCount,
        sourceLabel: roastSubmissions.sourceLabel,
        createdAt: roastResults.createdAt,
        publishedAt: roastResults.publishedAt,
      })
      .from(roastResults)
      .innerJoin(
        roastSubmissions,
        eq(roastSubmissions.id, roastResults.submissionId),
      )
      .where(
        and(
          eq(roastResults.visibility, "public"),
          eq(roastSubmissions.status, "completed"),
        ),
      )
      .orderBy(
        asc(roastResults.score),
        asc(roastResults.publishedAt),
        desc(roastResults.createdAt),
      )
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(roastResults)
      .innerJoin(
        roastSubmissions,
        eq(roastSubmissions.id, roastResults.submissionId),
      )
      .where(
        and(
          eq(roastResults.visibility, "public"),
          eq(roastSubmissions.status, "completed"),
        ),
      )
      .then((rows) => rows[0]?.total ?? 0),
  ]);

  return {
    entries: entries satisfies LeaderboardEntry[],
    total: totalRow,
  };
}

export async function getRoastsBySubmissionIds(submissionIds: string[]) {
  if (submissionIds.length === 0) {
    return [];
  }

  return db
    .select({
      submission: getTableColumns(roastSubmissions),
      result: getTableColumns(roastResults),
    })
    .from(roastSubmissions)
    .innerJoin(roastResults, eq(roastResults.submissionId, roastSubmissions.id))
    .where(inArray(roastSubmissions.id, submissionIds));
}
