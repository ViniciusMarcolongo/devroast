import { Suspense } from "react";

import {
  LeaderboardTable,
  LeaderboardTableSkeleton,
} from "@/components/leaderboard-table";
import { getCaller } from "@/trpc/server";

export function HomeShameLeaderboard() {
  return (
    <Suspense fallback={<LeaderboardTableSkeleton />}>
      <HomeShameLeaderboardContent />
    </Suspense>
  );
}

async function HomeShameLeaderboardContent() {
  const caller = await getCaller();
  const data = await caller.home.shameLeaderboard(undefined);

  return (
    <LeaderboardTable
      ctaHref="/leaderboard"
      entries={data.entries}
      footerLabel="view full leaderboard ->"
      footerMetrics={[`avg score: ${data.avgScore.toFixed(1)}/10`]}
      totalRoasts={data.totalRoasts}
    />
  );
}
