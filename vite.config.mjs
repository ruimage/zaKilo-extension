import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { merge } from "lodash-es";

export default defineConfig(({ mode }) => {
  const target = mode;
  return {
    plugins: [
      webExtension({
        manifest: () => merge(require("./manifests/base.json"), require(`./manifests/${target}.json`)),
        additionalInputs: [
          "src/content/auchan.js",
          "src/content/delivery_club.js",
          "src/content/kuper.js",
          "src/content/magnit.js",
          "src/content/ozon.js",
          "src/content/perekrestok.js",
          "src/content/pyaterochka.js",
          "src/content/samokat.js",
        ],
        browser: target,
      }),
    ],
    build: {
      outDir: `dist/${target}`,
    },
  };
});
