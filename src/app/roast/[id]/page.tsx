import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AnalysisCardBadge,
  AnalysisCardDescription,
  AnalysisCardRoot,
  AnalysisCardTitle,
  buttonVariants,
  CodeBlock,
  DiffLineCode,
  DiffLinePrefix,
  DiffLineRoot,
  ScoreRing,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type RoastResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Finding = {
  description: string;
  title: string;
  tone: "critical" | "good" | "warning";
};

type DiffLine = {
  code: string;
  kind: "add" | "context" | "remove";
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const roastResult = {
  code: [
    "function calculateTotal(items) {",
    "  var total = 0;",
    "",
    "  for (var i = 0; i < items.length; i++) {",
    "    total = total + items[i].price;",
    "  }",
    "",
    "  // TODO: handle null discounts",
    "  // maybe bundle shipping someday???",
    "",
    "  return total;",
    "}",
  ].join("\n"),
  diffLines: [
    { code: "function calculateTotal(items) {", kind: "context" },
    { code: "  var total = 0;", kind: "remove" },
    { code: "  for (var i = 0; i < items.length; i++) {", kind: "remove" },
    { code: "    total = total + items[i].price;", kind: "remove" },
    { code: "  }", kind: "remove" },
    { code: "  return total;", kind: "remove" },
    {
      code: "  return items.reduce((sum, item) => sum + item.price, 0);",
      kind: "add",
    },
    { code: "}", kind: "context" },
  ] as const satisfies readonly DiffLine[],
  findings: [
    {
      title: "using var instead of const/let",
      description:
        "`var` is function-scoped and leads to hoisting bugs. Use `const` by default and `let` only when reassignment is needed.",
      tone: "critical",
    },
    {
      title: "imperative loop pattern",
      description:
        "The manual loop works, but `.reduce()` makes the intent clearer and removes index bookkeeping noise.",
      tone: "warning",
    },
    {
      title: "clear naming conventions",
      description:
        "`calculateTotal` and `items` communicate intent well without needing extra explanation or comments.",
      tone: "good",
    },
    {
      title: "single responsibility",
      description:
        "The function stays focused on one job: calculating a total. No hidden side effects, no mixed concerns.",
      tone: "good",
    },
  ] as const satisfies readonly Finding[],
  headline:
    '"this code looks like it was written during a power outage... in 2005."',
  language: "javascript",
  linesLabel: "12 lines",
  score: 3.5,
  verdict: "verdict: needs_serious_help",
} as const;

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 font-mono-ui text-[14px] font-bold">
      <span className="text-accent-green">{"//"}</span>
      <span className="text-text-primary">{label}</span>
    </div>
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: RoastResultPageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isUuid(id)) {
    return {
      title: "Roast Not Found | devroast",
    };
  }

  return {
    title: `Roast ${id.slice(0, 8)} | devroast`,
    description:
      "Static SSR roast result preview with score breakdown, findings, submitted code, and suggested fix.",
  };
}

export default async function RoastResultPage({
  params,
}: RoastResultPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-app-bg px-6 py-10 md:px-10 md:py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 md:gap-12">
        <section className="flex w-full flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <ScoreRing score={roastResult.score} />

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <AnalysisCardBadge size="md" tone="critical">
              {roastResult.verdict}
            </AnalysisCardBadge>

            <h1 className="max-w-[780px] font-mono-body text-[18px] leading-[1.5] text-text-primary md:text-[20px]">
              {roastResult.headline}
            </h1>

            <div className="flex flex-wrap items-center gap-3 font-mono-ui text-[12px] text-text-tertiary">
              <span>{`lang: ${roastResult.language}`}</span>
              <span aria-hidden="true">.</span>
              <span>{roastResult.linesLabel}</span>
              <span aria-hidden="true">.</span>
              <span className="truncate">{id}</span>
            </div>

            <div>
              <Link
                className={cn(
                  buttonVariants({ size: "sm", variant: "secondary" }),
                )}
                href={`/roast/${id}`}
              >
                $ share_roast
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border-subtle" />

        <section className="flex w-full flex-col gap-4">
          <SectionTitle label="your_submission" />
          <CodeBlock
            className="w-full max-w-none border border-border-subtle"
            code={roastResult.code}
            lang="javascript"
          />
        </section>

        <div className="h-px w-full bg-border-subtle" />

        <section className="flex w-full flex-col gap-6">
          <SectionTitle label="detailed_analysis" />

          <div className="grid gap-5 md:grid-cols-2">
            {roastResult.findings.map((finding) => (
              <AnalysisCardRoot
                className="max-w-none bg-app-bg"
                key={finding.title}
              >
                <AnalysisCardBadge tone={finding.tone}>
                  {finding.tone}
                </AnalysisCardBadge>
                <AnalysisCardTitle>{finding.title}</AnalysisCardTitle>
                <AnalysisCardDescription>
                  {finding.description}
                </AnalysisCardDescription>
              </AnalysisCardRoot>
            ))}
          </div>
        </section>

        <div className="h-px w-full bg-border-subtle" />

        <section className="flex w-full flex-col gap-6">
          <SectionTitle label="suggested_fix" />

          <div className="overflow-hidden border border-border-subtle bg-surface-primary">
            <div className="border-b border-border-subtle px-4 py-3 font-mono-ui text-[12px] text-text-secondary">
              your_code.ts -&gt; improved_code.ts
            </div>

            <div className="bg-surface-primary py-1">
              {roastResult.diffLines.map((line) => (
                <DiffLineRoot
                  key={`${line.kind}-${line.code}`}
                  kind={line.kind}
                >
                  <DiffLinePrefix />
                  <DiffLineCode>{line.code}</DiffLineCode>
                </DiffLineRoot>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
