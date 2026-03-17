import { createTRPCRouter } from "@/trpc/init";
import { homeRouter } from "@/trpc/routers/home";

export const appRouter = createTRPCRouter({
  home: homeRouter,
});

export type AppRouter = typeof appRouter;
