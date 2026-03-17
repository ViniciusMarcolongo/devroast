import { CodeEditorShell } from "@/components/code-editor-shell";
import { HomeHeroMetrics } from "@/components/home-hero-metrics";
import { LeaderboardTable } from "@/components/leaderboard-table";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-app-bg px-6 py-14 md:px-10 md:py-20">
      <div className="mx-auto flex w-full max-w-[960px] flex-col items-center">
        <section className="flex w-full flex-col items-center gap-8 text-center">
          <div className="flex max-w-[660px] flex-col items-center gap-3">
            <h1 className="font-mono-ui text-[28px] font-medium tracking-[-0.04em] text-text-primary md:text-[40px]">
              <span className="text-accent-green">$ </span>
              paste your code. get roasted.
            </h1>
            <p className="max-w-[620px] font-mono-body text-[12px] text-text-secondary md:text-[13px]">
              {
                "// drop your code below and we'll rate it - brutally honest or full roast mode"
              }
            </p>
          </div>

          <CodeEditorShell />

          <HomeHeroMetrics />
        </section>

        <div className="h-20" />

        <LeaderboardTable
          ctaHref="/leaderboard"
          footerLabel="view full leaderboard ->"
        />
      </div>
    </main>
  );
}
