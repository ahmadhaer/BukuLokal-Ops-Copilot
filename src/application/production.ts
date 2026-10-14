import "server-only";
import { createVertexProvider } from "../ai/client/google-genai";
import { demoRepository } from "../features/persistence/runtime";
import { buildApplication, type Application } from "./application";
import { assessRuntimeCapabilities } from "./capabilities";
export function buildProductionApplication(): Application {
  let vertex: ReturnType<typeof createVertexProvider> | undefined;
  return buildApplication({ repository: demoRepository, capabilities: assessRuntimeCapabilities,
    ai() { if (assessRuntimeCapabilities().ai !== "configured") return null; vertex ??= createVertexProvider(); return { provider: vertex.provider, model: vertex.config.model }; },
    now: () => new Date().toISOString(),
  });
}
let application: Application | undefined;
export function getProductionApplication(): Application { return application ??= buildProductionApplication(); }
