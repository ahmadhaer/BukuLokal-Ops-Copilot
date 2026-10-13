// Explicit local test composition. Never imported by production routes/composition.
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../../", import.meta.url));
const vite = await createServer({ root, configFile: false, appType: "custom", server: { host: "127.0.0.1", port: 4173, strictPort: true, watch: { ignored: ["**/.next/**", "**/docs/evidence/**"] } },
  resolve: { alias: { "server-only": path.join(root, "tests/helpers/server-only.ts") } },
  ssr: { noExternal: ["server-only"] },
});
const { buildTestApplication } = await vite.ssrLoadModule("/tests/integration/application/helpers.ts");
const { application } = buildTestApplication();
const methods = new Set(["health", "openDemoWorkspace", "getDashboard", "getIssueDetail", "analyzeIssue", "createSuggestedAction", "reviewAction", "getActivity", "getSession", "previewImport", "checkImport", "saveValidData"]);
vite.middlewares.use(async (req, res, next) => {
  if (req.url?.split("?")[0] === "/__test/application" && req.method === "POST") {
    try {
      let body = ""; for await (const chunk of req) { body += chunk.toString(); if (body.length > 8_000_000) throw new Error("Request too large"); }
      const { method, args = [] } = JSON.parse(body);
      if (!methods.has(method) || !Array.isArray(args)) throw new Error("Invalid test request");
      if (["previewImport", "checkImport", "saveValidData"].includes(method)) args[0] = { name: args[0].name, bytes: Uint8Array.from(Object.values(args[0].bytes)) };
      const result = await application[method](...args);
      res.setHeader("content-type", "application/json"); res.end(JSON.stringify(result));
    } catch { res.statusCode = 400; res.end(JSON.stringify({ ok: false, code: "TEST_REQUEST_INVALID", message: "Test request failed." })); }
    return;
  }
  if (req.url?.split("?")[0] === "/") {
    const html = await vite.transformIndexHtml(req.url, '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>WU-08 explicit browser test harness</title></head><body><script>globalThis.process={env:{NODE_ENV:"development"}};</script><div id="root"></div><script type="module" src="/tests/browser/client.tsx"></script></body></html>');
    res.setHeader("content-type", "text/html"); res.end(html); return;
  }
  next();
});
await vite.listen();
process.stdout.write("Explicit WU-08 test application at http://127.0.0.1:4173\n");
