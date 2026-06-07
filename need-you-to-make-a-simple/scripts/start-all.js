import { spawn } from "node:child_process";

const services = [
  ["course-service", "services/course-service.js"],
  ["user-service", "services/user-service.js"],
  ["enrollment-service", "services/enrollment-service.js"],
  ["api-gateway", "services/gateway.js"]
];

const children = services.map(([name, script]) => {
  const child = spawn(process.execPath, [script], { stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", (data) => process.stdout.write(`[${name}] ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`[${name}] ${data}`));
  return child;
});

function shutdown() {
  for (const child of children) {
    child.kill("SIGTERM");
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
