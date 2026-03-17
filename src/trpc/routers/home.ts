import { z } from "zod";

import { getHomepageMetrics } from "@/db/queries/roasts";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

export const homeRouter = createTRPCRouter({
  metrics: publicProcedure.input(z.void()).query(async () => {
    return getHomepageMetrics();
  }),
});
