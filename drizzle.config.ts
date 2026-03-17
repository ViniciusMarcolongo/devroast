import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "drizzle-kit";

function readDatabaseUrlFromDotEnv() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    const databaseUrlLine = envFile
      .split(/\r?\n/)
      .find((line) => line.startsWith("DATABASE_URL="));

    if (!databaseUrlLine) {
      return undefined;
    }

    return databaseUrlLine.slice("DATABASE_URL=".length).trim();
  } catch {
    return undefined;
  }
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

function normalizeDatabaseUrl(databaseUrl: string) {
  const normalizedUrl = new URL(databaseUrl);
  const dockerPort = readDockerComposePort();
  const isLocalHost =
    normalizedUrl.hostname === "localhost" ||
    normalizedUrl.hostname === "127.0.0.1";

  if (isLocalHost && dockerPort && normalizedUrl.port !== String(dockerPort)) {
    normalizedUrl.hostname = "127.0.0.1";
    normalizedUrl.port = String(dockerPort);
  }

  return normalizedUrl;
}

const databaseUrl = readDatabaseUrlFromDotEnv() ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run Drizzle commands.");
}

const parsedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);
const databasePort = parsedDatabaseUrl.port
  ? Number(parsedDatabaseUrl.port)
  : 5432;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    host: parsedDatabaseUrl.hostname,
    port: databasePort,
    user: decodeURIComponent(parsedDatabaseUrl.username),
    password: decodeURIComponent(parsedDatabaseUrl.password),
    database: parsedDatabaseUrl.pathname.replace(/^\//, ""),
    ssl: false,
  },
  casing: "snake_case",
  strict: true,
  verbose: true,
});
