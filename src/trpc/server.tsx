import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";

import { createCallerFactory, createTRPCContext } from "@/trpc/init";
import { makeQueryClient } from "@/trpc/query-client";
import { appRouter } from "@/trpc/routers/_app";

export const getQueryClient = cache(makeQueryClient);

const getTRPCContext = cache(createTRPCContext);
const createCaller = createCallerFactory(appRouter);

export const trpc = createTRPCOptionsProxy({
  router: appRouter,
  ctx: getTRPCContext,
  queryClient: getQueryClient,
});

export const getCaller = cache(async () =>
  createCaller(await getTRPCContext()),
);

export function HydrateClient({ children }: { children: React.ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {children}
    </HydrationBoundary>
  );
}
