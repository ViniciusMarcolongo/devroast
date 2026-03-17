import { Suspense } from "react";

import { HomeHeroMetricsClient } from "@/components/home-hero-metrics-client";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export function HomeHeroMetrics() {
  return (
    <Suspense fallback={<HomeHeroMetricsSkeleton />}>
      <HomeHeroMetricsContent />
    </Suspense>
  );
}

async function HomeHeroMetricsContent() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(trpc.home.metrics.queryOptions(undefined));

  return (
    <HydrateClient>
      <HomeHeroMetricsClient />
    </HydrateClient>
  );
}

export function HomeHeroMetricsSkeleton() {
  return (
    <div className="flex items-center gap-5 font-mono-body text-[11px] text-text-tertiary">
      <div className="h-4 w-[128px] animate-pulse bg-surface-primary" />
      <div className="h-4 w-[108px] animate-pulse bg-surface-primary" />
    </div>
  );
}
