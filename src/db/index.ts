import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to initialize the database client.",
  );
}

function readDockerComposePort() {
  try {
    const composeFile = readFileSync(
      resolve(process.cwd(), "docker-compose.yml"),
      "utf8",
    );
    const portMatch = composeFile.match(/-\s*"(\d+):5432"/);

    return portMatch ? Number(portMatch[1]) : undefined;
  } catch {
    return undefined;
  }
}

function normalizeDatabaseUrl(url: string) {
  const normalizedUrl = new URL(url);
  const dockerPort = readDockerComposePort();
  const isLocalHost =
    normalizedUrl.hostname === "localhost" ||
    normalizedUrl.hostname === "127.0.0.1";

  if (isLocalHost && dockerPort && normalizedUrl.port !== String(dockerPort)) {
    normalizedUrl.hostname = "127.0.0.1";
    normalizedUrl.port = String(dockerPort);
  }

  return normalizedUrl.toString();
}

const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);

export const sqlClient = postgres(normalizedDatabaseUrl, {
  prepare: false,
});

export const db = drizzle(sqlClient, {
  schema,
  casing: "snake_case",
});

export type Database = typeof db;
