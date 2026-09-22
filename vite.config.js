import { copyFile } from "node:fs/promises";
import { defineConfig, loadEnv } from "vite";
import chatHandler from "./api/chat.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "OPENROUTER_");
  for (const [key, value] of Object.entries(env)) process.env[key] = value;
  return {
    base: "./",
    plugins: [
      {
        name: "portfolio-server",
        configureServer(server) {
          server.middlewares.use("/api/chat", (req, res) =>
            chatHandler(req, res),
          );
        },
        async closeBundle() {
          await copyFile("resume.pdf", "dist/resume.pdf");
        },
      },
    ],
  };
});
