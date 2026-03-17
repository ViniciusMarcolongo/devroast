import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import net from "node:net";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  const loaded = {};

  try {
    const content = readFileSync(filePath, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (key) {
        loaded[key] = value;
      }
    }
  } catch {
    return loaded;
  }

  return loaded;
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

function normalizeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return databaseUrl;
  }

  const normalizedUrl = new URL(databaseUrl);
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

function isPortFree(port) {
  return new Promise((resolvePort) => {
    const server = net.createServer();

    server.once("error", () => {
      resolvePort(false);
    });

    server.once("listening", () => {
      server.close(() => resolvePort(true));
    });

    server.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(startPort, attempts) {
  for (let offset = 0; offset < attempts; offset += 1) {
    const port = startPort + offset;

    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(
    `No available port found between ${startPort} and ${startPort + attempts - 1}.`,
  );
}

const envFromFile = loadEnvFile(resolve(process.cwd(), ".env"));

const childEnv = {
  ...process.env,
  ...envFromFile,
};

childEnv.DATABASE_URL = normalizeDatabaseUrl(childEnv.DATABASE_URL);

delete childEnv.PGHOST;
delete childEnv.PGPORT;
delete childEnv.PGUSER;
delete childEnv.PGPASSWORD;
delete childEnv.PGDATABASE;

const port = await findAvailablePort(4999, 20);
const command = `pnpm exec drizzle-kit studio --port ${port}`;
const child = spawn(command, {
  stdio: "inherit",
  env: childEnv,
  shell: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
