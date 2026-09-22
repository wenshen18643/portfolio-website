import { copyFile } from "node:fs/promises";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "copy-resume",
      async closeBundle() {
        await copyFile("resume.pdf", "dist/resume.pdf");
      },
    },
  ],
});
