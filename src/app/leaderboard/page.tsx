import {
  LeaderboardTable,
  leaderboardEntries,
} from "@/components/leaderboard-table";

const extendedEntries = [
  ...leaderboardEntries,
  {
    rank: "6",
    score: "3.4",
    name: "payments_controller_rewritten_new_v2.php",
    tag: "php",
  },
  {
    rank: "7",
    score: "3.9",
    name: "mega_utils_do_not_touch.py",
    tag: "python",
  },
  {
    rank: "8",
    score: "4.1",
    name: "user-service-copy-final-fixed.go",
    tag: "go",
  },
] as const;

export default function LeaderboardPage() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-app-bg px-6 py-14 md:px-10 md:py-20">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8">
        <section className="space-y-3 text-center">
          <p className="font-mono-ui text-[12px] text-accent-green">
            {"// leaderboard"}
          </p>
          <h1 className="font-mono-ui text-[28px] font-medium tracking-[-0.04em] text-text-primary md:text-[40px]">
            worst code on the internet, ranked by shame.
          </h1>
          <p className="mx-auto max-w-[620px] font-mono-body text-[12px] text-text-secondary md:text-[13px]">
            Static preview for now. No API yet, just the same visual language
            and a working route.
          </p>
        </section>

        <LeaderboardTable
          entries={extendedEntries}
          showFooter={false}
          subtitle="// all entries are static until the first API pass lands"
          title="// global_shame_index"
        />
      </div>
    </main>
  );
}
