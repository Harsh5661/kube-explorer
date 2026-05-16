import { spawn } from "node:child_process";
import http from "node:http";
import process from "node:process";

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL ?? "http://127.0.0.1:5173";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const electronCommand =
  process.platform === "win32"
    ? "node_modules\\.bin\\electron.cmd"
    : "node_modules/.bin/electron";

let viteProcess = null;
let electronProcess = null;
let disposed = false;

const serverIsReady = await waitForServer(DEV_SERVER_URL, 1200);

if (!serverIsReady) {
  viteProcess = spawn(npmCommand, ["run", "dev"], {
    stdio: "inherit",
    env: process.env,
  });
}

const ready = await waitForServer(DEV_SERVER_URL, 30000);

if (!ready) {
  shutdown(1);
} else {
  electronProcess = spawn(electronCommand, ["."], {
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: DEV_SERVER_URL,
    },
  });

  electronProcess.on("exit", (code) => {
    shutdown(code ?? 0);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const reachable = await ping(url);

    if (reachable) {
      return true;
    }

    await sleep(350);
  }

  return false;
}

function ping(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode ? response.statusCode < 500 : true);
    });

    request.on("error", () => resolve(false));
    request.setTimeout(1500, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shutdown(code) {
  if (disposed) {
    return;
  }

  disposed = true;

  if (electronProcess && !electronProcess.killed) {
    electronProcess.kill();
  }

  if (viteProcess && !viteProcess.killed) {
    viteProcess.kill();
  }

  process.exit(code);
}
