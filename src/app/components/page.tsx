import {
  AnalysisCardBadge,
  AnalysisCardDescription,
  AnalysisCardRoot,
  AnalysisCardTitle,
  Button,
  CodeBlock,
  DiffLineCode,
  DiffLinePrefix,
  DiffLineRoot,
  ScoreRing,
  StatusBadgeDot,
  StatusBadgeLabel,
  StatusBadgeRoot,
  SwitchControl,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
} from "@/components/ui";

function Section({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="flex w-full flex-col gap-5 border border-border-subtle bg-surface-primary p-6">
      <div className="space-y-2">
        <h2 className="font-mono-ui text-lg text-text-primary">{title}</h2>
        <p className="max-w-2xl font-mono-body text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export default async function ComponentsPage() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-app-bg px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="space-y-4 border border-border-subtle bg-app-bg p-6 shadow-[12px_12px_0_0_rgba(16,185,129,0.07)] md:p-8">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-accent-green">
            UI Showcase
          </p>
          <div className="space-y-3">
            <h1 className="font-mono-ui text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl">
              Devroast component playground
            </h1>
            <p className="max-w-3xl font-mono-body text-sm leading-7 text-text-secondary md:text-base">
              A visual reference for the reusable primitives and composed UI
              APIs that power the homepage and leaderboard.
            </p>
          </div>
        </section>

        <Section
          description="Primary, outline, ghost, and secondary actions in the current terminal visual language."
          title="Button"
        >
          <div className="flex flex-wrap gap-3">
            <Button>$ roast_my_code</Button>
            <Button variant="secondary">$ share_roast</Button>
            <Button variant="outline">$ view_all -&gt;</Button>
            <Button variant="ghost">ghost action</Button>
          </div>
        </Section>

        <Section
          description="Composed badge API with explicit dot and label pieces."
          title="StatusBadge"
        >
          <div className="flex flex-wrap gap-6">
            <StatusBadgeRoot tone="critical">
              <StatusBadgeDot />
              <StatusBadgeLabel>critical</StatusBadgeLabel>
            </StatusBadgeRoot>
            <StatusBadgeRoot tone="warning">
              <StatusBadgeDot />
              <StatusBadgeLabel>warning</StatusBadgeLabel>
            </StatusBadgeRoot>
            <StatusBadgeRoot tone="good">
              <StatusBadgeDot />
              <StatusBadgeLabel>good</StatusBadgeLabel>
            </StatusBadgeRoot>
          </div>
        </Section>

        <Section
          description="Switch assembled from root, control, thumb, and label pieces."
          title="Switch"
        >
          <div className="flex flex-wrap gap-6">
            <SwitchRoot defaultChecked>
              <SwitchControl>
                <SwitchThumb />
              </SwitchControl>
              <SwitchLabel>roast mode</SwitchLabel>
            </SwitchRoot>
            <SwitchRoot>
              <SwitchControl>
                <SwitchThumb />
              </SwitchControl>
              <SwitchLabel>constructive mode</SwitchLabel>
            </SwitchRoot>
          </div>
        </Section>

        <Section
          description="Analysis cards now composed from dedicated title, description, and badge subcomponents."
          title="AnalysisCard"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <AnalysisCardRoot className="bg-app-bg">
              <AnalysisCardBadge tone="critical">critical</AnalysisCardBadge>
              <AnalysisCardTitle>
                using var instead of const/let
              </AnalysisCardTitle>
              <AnalysisCardDescription>
                Legacy mutation and broad scope make the snippet harder to trust
                during review.
              </AnalysisCardDescription>
            </AnalysisCardRoot>
            <AnalysisCardRoot className="bg-app-bg" size="lg">
              <AnalysisCardBadge tone="warning">warning</AnalysisCardBadge>
              <AnalysisCardTitle>
                branch readability can improve
              </AnalysisCardTitle>
              <AnalysisCardDescription>
                The logic works, but the structure still hides the happy path
                and slows down scanning.
              </AnalysisCardDescription>
            </AnalysisCardRoot>
          </div>
        </Section>

        <Section
          description="Diff rows assembled from root, prefix, and content pieces."
          title="DiffLine"
        >
          <div className="flex max-w-[640px] flex-col border border-border-subtle bg-app-bg">
            <DiffLineRoot kind="add">
              <DiffLinePrefix />
              <DiffLineCode>const total = items.reduce(...)</DiffLineCode>
            </DiffLineRoot>
            <DiffLineRoot kind="remove">
              <DiffLinePrefix />
              <DiffLineCode>var total = 0;</DiffLineCode>
            </DiffLineRoot>
            <DiffLineRoot kind="context">
              <DiffLinePrefix />
              <DiffLineCode>
                Prefer immutable accumulation and strict equality here.
              </DiffLineCode>
            </DiffLineRoot>
          </div>
        </Section>

        <Section
          description="Server-rendered syntax highlighting with the current terminal shell styling."
          title="CodeBlock"
        >
          <CodeBlock
            code={[
              "function calculateTotal(items) {",
              "  let total = 0;",
              "",
              "  for (const item of items) {",
              "    total += item.price;",
              "  }",
              "",
              "  return total;",
              "}",
            ].join("\n")}
            fileName="calculateTotal.ts"
            lang="typescript"
            size="lg"
          />
        </Section>

        <Section
          description="Score ring stays data-driven because score and max value are the core API."
          title="ScoreRing"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex min-h-[220px] items-center justify-center border border-border-subtle bg-app-bg p-6">
              <ScoreRing score={3.5} size="sm" />
            </div>
            <div className="flex min-h-[220px] items-center justify-center border border-border-subtle bg-app-bg p-6">
              <ScoreRing score={6.8} />
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
