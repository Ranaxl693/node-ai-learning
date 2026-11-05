import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const server = createApp().listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT }, "Server listening");
});
server.on("error", () => {
  logger.fatal("Server failed to start");
  process.exitCode = 1;
});
let stopping = false;
function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  logger.info({ signal }, "Shutting down");
  const timeout = setTimeout(() => {
    logger.error("Shutdown timed out");
    process.exit(1);
  }, 10_000);
  timeout.unref();
  server.close((error) => {
    clearTimeout(timeout);
    process.exitCode = error ? 1 : 0;
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
