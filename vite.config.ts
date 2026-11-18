import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

// Content-based across machines, including public images that keep the same name.
const releaseHash = createHash("sha256");
function hashSource(path: string) {
  const url = new URL(path, import.meta.url);
  if (path.endsWith("/")) {
    for (const entry of readdirSync(url, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
      hashSource(`${path}${entry.name}${entry.isDirectory() ? "/" : ""}`);
    }
  } else {
    releaseHash.update(path).update("\0").update(readFileSync(url)).update("\0");
  }
}
for (const path of ["app/", "components/", "lib/", "src/", "public/", "vendor/", "types/", "package.json", "index.html", "portfolio/index.html", "package-lock.json", "vite.config.ts", "postcss.config.mjs", "tsconfig.json"]) hashSource(path);
releaseHash.update(process.env.PAGES_BASE_PATH || "/skyray-website/");
const siteVersion = releaseHash.digest("hex");
export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/skyray-website/",
  define: { __SITE_VERSION__: JSON.stringify(siteVersion) },
  plugins: [react(), {
    name: "site-release",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ version: siteVersion }) });
    },
  }],
  build: {
    rolldownOptions: {
      input: {
        home: fileURLToPath(new URL("./index.html", import.meta.url)),
        portfolio: fileURLToPath(new URL("./portfolio/index.html", import.meta.url)),
      },
    },
  },
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
});
