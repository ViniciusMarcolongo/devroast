import { faker } from "@faker-js/faker";

import { db, sqlClient } from "./index";
import type {
  AnalysisMode,
  FindingKind,
  FindingTone,
  ResultVisibility,
} from "./schema";
import {
  roastDiffLines,
  roastFindings,
  roastResults,
  roastSubmissions,
} from "./schema";

type RoastSeedRecord = {
  diffLines: (typeof roastDiffLines.$inferInsert)[];
  findings: (typeof roastFindings.$inferInsert)[];
  result: typeof roastResults.$inferInsert;
  submission: typeof roastSubmissions.$inferInsert;
};

type LanguagePreset = {
  extension: string;
  generateCode: (subject: string) => string;
  improvedCode: (subject: string) => string;
  language: string;
};

const languagePresets: LanguagePreset[] = [
  {
    language: "typescript",
    extension: "ts",
    generateCode: (subject) =>
      [
        `export function ${subject}Handler(items: any[]) {`,
        "  var total = 0;",
        "",
        "  for (var i = 0; i < items.length; i++) {",
        "    total = total + items[i].price;",
        "  }",
        "",
        "  return total;",
        "}",
      ].join("\n"),
    improvedCode: (subject) =>
      [
        `export function ${subject}Handler(items: Array<{ price: number }>) {`,
        "  return items.reduce((sum, item) => sum + item.price, 0);",
        "}",
      ].join("\n"),
  },
  {
    language: "javascript",
    extension: "js",
    generateCode: (subject) =>
      [
        `function ${subject}Flow(input) {`,
        "  if (input == null) return false;",
        "  if (input.enabled == true) return true;",
        "  return false;",
        "}",
      ].join("\n"),
    improvedCode: (subject) =>
      [
        `function ${subject}Flow(input) {`,
        "  return Boolean(input?.enabled);",
        "}",
      ].join("\n"),
  },
  {
    language: "python",
    extension: "py",
    generateCode: (subject) =>
      [
        `def ${subject}_job(items):`,
        "    total = 0",
        "    for item in items:",
        "        total = total + item['value']",
        "    return total",
      ].join("\n"),
    improvedCode: (subject) =>
      [
        `def ${subject}_job(items):`,
        "    return sum(item['value'] for item in items)",
      ].join("\n"),
  },
  {
    language: "sql",
    extension: "sql",
    generateCode: (subject) =>
      [
        "SELECT *",
        `FROM ${subject}_events`,
        "WHERE 1 = 1",
        "ORDER BY created_at;",
      ].join("\n"),
    improvedCode: (subject) =>
      [
        "SELECT id, status, created_at",
        `FROM ${subject}_events`,
        "WHERE status = 'active'",
        "ORDER BY created_at DESC;",
      ].join("\n"),
  },
  {
    language: "go",
    extension: "go",
    generateCode: (subject) =>
      [
        `func ${subject}Worker(items []Item) int {`,
        "\ttotal := 0",
        "\tfor i := 0; i < len(items); i++ {",
        "\t\ttotal = total + items[i].Value",
        "\t}",
        "\treturn total",
        "}",
      ].join("\n"),
    improvedCode: (subject) =>
      [
        `func ${subject}Worker(items []Item) int {`,
        "\ttotal := 0",
        "\tfor _, item := range items {",
        "\t\ttotal += item.Value",
        "\t}",
        "\treturn total",
        "}",
      ].join("\n"),
  },
  {
    language: "java",
    extension: "java",
    generateCode: (subject) =>
      [
        `public int ${subject}Score(List<Item> items) {`,
        "    int total = 0;",
        "    for (int i = 0; i < items.size(); i++) {",
        "        total = total + items.get(i).value();",
        "    }",
        "    return total;",
        "}",
      ].join("\n"),
    improvedCode: (subject) =>
      [
        `public int ${subject}Score(List<Item> items) {`,
        "    return items.stream().mapToInt(Item::value).sum();",
        "}",
      ].join("\n"),
  },
];

const verdicts = [
  "needs_serious_help",
  "mostly_cursed",
  "chaotic_but_fixable",
  "surprisingly_salvageable",
  "cleaner_than_expected",
] as const;

const criticalFindingTitles = [
  "state mutation leaks intent",
  "control flow hides the happy path",
  "legacy syntax invites accidental bugs",
  "naming makes review slower than needed",
] as const;

const warningFindingTitles = [
  "could be simplified with native helpers",
  "missing guard clauses adds nesting",
  "the data flow is harder to scan than necessary",
  "edge cases deserve a clearer shape",
] as const;

const goodFindingTitles = [
  "the core intention is still visible",
  "the function stays focused on one task",
  "the output shape is easy to infer",
  "there is a reasonable path to clean this up",
] as const;

faker.seed(20260317);

function toScore() {
  return faker.number
    .float({ fractionDigits: 1, max: 9.8, min: 1.1 })
    .toFixed(1);
}

function toFindingTone(score: number): FindingTone {
  if (score <= 3.5) {
    return "critical";
  }

  if (score <= 6.5) {
    return "warning";
  }

  return "good";
}

function createSnippetBaseName() {
  return faker.helpers.slugify(
    `${faker.hacker.verb()} ${faker.hacker.noun()} ${faker.word.adjective()}`,
  );
}

function createSourceLabel(baseName: string, extension: string) {
  const suffix = faker.helpers.arrayElement([
    "",
    "_final",
    "_copy",
    "_new",
    "_v2",
    "_do_not_touch",
  ]);

  return `${baseName}${suffix}.${extension}`;
}

function createHeadline(verdict: string) {
  return faker.helpers.arrayElement([
    `this ${verdict} snippet still ships with confidence it did not earn.`,
    `somehow this works, but it clearly fought the reviewer on the way out.`,
    `the logic lands eventually, just not with any respect for the reader.`,
    `you can feel the deadline pressure in every branch and variable name.`,
  ]);
}

function createSummary() {
  return faker.helpers.arrayElement([
    "The snippet gets the job done, but it leans on imperative structure, loose checks, and names that make scanning harder than it should be.",
    "There is a usable core here, but the implementation burns clarity for speed and leaves obvious cleanup opportunities behind.",
    "Most of the pain comes from avoidable verbosity: nested control flow, broad state, and repeated work that built-ins can absorb.",
  ]);
}

function createFindings(resultId: string, lineCount: number, score: number) {
  const dominantTone = toFindingTone(score);
  const records: (typeof roastFindings.$inferInsert)[] = [];
  const totalFindings = faker.number.int({ max: 5, min: 3 });

  for (let index = 0; index < totalFindings; index += 1) {
    const tone =
      index === totalFindings - 1 && dominantTone !== "good"
        ? "good"
        : index === 0
          ? dominantTone
          : faker.helpers.arrayElement([dominantTone, "warning", "good"]);

    const kind: FindingKind = tone === "good" ? "strength" : "issue";
    const title =
      tone === "critical"
        ? faker.helpers.arrayElement(criticalFindingTitles)
        : tone === "warning"
          ? faker.helpers.arrayElement(warningFindingTitles)
          : faker.helpers.arrayElement(goodFindingTitles);

    const startLine = faker.number.int({
      max: Math.max(1, lineCount - 1),
      min: 1,
    });
    const endLine = Math.min(
      lineCount,
      startLine + faker.number.int({ max: 2, min: 0 }),
    );

    records.push({
      id: crypto.randomUUID(),
      resultId,
      position: index,
      kind,
      tone,
      title,
      description: faker.helpers.arrayElement([
        "A small refactor here would cut noise quickly and make the intent easier to trust during review.",
        "This part works, but it adds friction for future edits because the logic is broader than the output requires.",
        "You can keep the same behavior with less nesting and a narrower surface for mistakes.",
        "The code is readable enough to rescue, which is exactly why these cleanup wins are worth taking.",
      ]),
      startLine,
      endLine,
    });
  }

  return records;
}

function createDiffLines(resultId: string, code: string, improvedCode: string) {
  const sourceLines = code.split("\n");
  const improvedLines = improvedCode.split("\n");
  const diffRecords: (typeof roastDiffLines.$inferInsert)[] = [];
  let position = 0;

  diffRecords.push({
    id: crypto.randomUUID(),
    resultId,
    position: position++,
    kind: "context",
    content: sourceLines[0] ?? "",
    oldLineNumber: 1,
    newLineNumber: 1,
  });

  if (sourceLines[1]) {
    diffRecords.push({
      id: crypto.randomUUID(),
      resultId,
      position: position++,
      kind: "remove",
      content: sourceLines[1],
      oldLineNumber: 2,
      newLineNumber: null,
    });
  }

  for (const [lineIndex, line] of improvedLines.slice(1, 3).entries()) {
    diffRecords.push({
      id: crypto.randomUUID(),
      resultId,
      position: position++,
      kind: "add",
      content: line,
      oldLineNumber: null,
      newLineNumber: lineIndex + 2,
    });
  }

  diffRecords.push({
    id: crypto.randomUUID(),
    resultId,
    position: position,
    kind: "context",
    content: improvedLines.at(-1) ?? sourceLines.at(-1) ?? "",
    oldLineNumber: sourceLines.length,
    newLineNumber: improvedLines.length,
  });

  return diffRecords;
}

function createRoastSeedRecord(index: number): RoastSeedRecord {
  const preset = faker.helpers.arrayElement(languagePresets);
  const baseName = createSnippetBaseName();
  const sourceLabel = createSourceLabel(baseName, preset.extension);
  const publicId = `roast_${faker.string.alphanumeric({ casing: "lower", length: 12 })}`;
  const analysisMode: AnalysisMode = faker.helpers.arrayElement([
    "constructive",
    "roast",
  ]);
  const visibility: ResultVisibility = faker.helpers.weightedArrayElement([
    { value: "public", weight: 7 },
    { value: "unlisted", weight: 2 },
    { value: "private", weight: 1 },
  ]);
  const subject = baseName.replace(/-/g, "_");
  const code = preset.generateCode(subject);
  const improvedCode = preset.improvedCode(subject);
  const lineCount = code.split("\n").length;
  const charCount = code.length;
  const scoreValue = toScore();
  const score = Number(scoreValue);
  const verdictTone = toFindingTone(score);
  const verdict = faker.helpers.arrayElement(verdicts);
  const createdAt = faker.date.recent({ days: 45 });
  const publishedAt = visibility === "private" ? null : createdAt;
  const submissionId = crypto.randomUUID();
  const resultId = crypto.randomUUID();
  const shareSlug =
    visibility === "private"
      ? null
      : `${baseName}-${faker.string.alphanumeric({ casing: "lower", length: 6 })}`;

  return {
    submission: {
      id: submissionId,
      publicId,
      sourceKind: "paste",
      sourceLabel,
      rawCode: code,
      detectedLanguage: preset.language,
      selectedLanguage: faker.helpers.maybe(() => preset.language, {
        probability: 0.35,
      }),
      activeLanguage: preset.language,
      lineCount,
      charCount,
      analysisMode,
      status: "completed",
      errorMessage: null,
      createdAt,
      updatedAt: createdAt,
    },
    result: {
      id: resultId,
      submissionId,
      score: scoreValue,
      verdict,
      verdictTone,
      headline: createHeadline(verdict),
      summary: createSummary(),
      improvedCode,
      visibility,
      shareSlug,
      isFeatured: index < 12,
      publishedAt,
      createdAt,
      updatedAt: createdAt,
    },
    findings: createFindings(resultId, lineCount, score),
    diffLines: createDiffLines(resultId, code, improvedCode),
  };
}

async function seed() {
  const records = Array.from({ length: 100 }, (_, index) =>
    createRoastSeedRecord(index),
  );

  const submissions = records.map((record) => record.submission);
  const results = records.map((record) => record.result);
  const findings = records.flatMap((record) => record.findings);
  const diffLines = records.flatMap((record) => record.diffLines);

  await db.transaction(async (tx) => {
    await tx.delete(roastDiffLines);
    await tx.delete(roastFindings);
    await tx.delete(roastResults);
    await tx.delete(roastSubmissions);

    await tx.insert(roastSubmissions).values(submissions);
    await tx.insert(roastResults).values(results);
    await tx.insert(roastFindings).values(findings);
    await tx.insert(roastDiffLines).values(diffLines);
  });

  const publicRoastCount = results.filter(
    (result) => result.visibility === "public",
  ).length;

  console.log(
    `Seed concluido: ${submissions.length} roasts, ${findings.length} findings, ${diffLines.length} diff lines, ${publicRoastCount} publicos.`,
  );
}

seed()
  .catch((error) => {
    console.error("Falha ao rodar seed do banco.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sqlClient.end({ timeout: 5 });
  });
