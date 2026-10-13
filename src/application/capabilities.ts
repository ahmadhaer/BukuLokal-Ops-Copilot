import "server-only";
import { readVertexConfig } from "../ai/client/google-genai";
import type { ApplicationHealth, RuntimeCapabilities } from "./contracts";
export function assessRuntimeCapabilities(env: Record<string, string | undefined> = process.env): RuntimeCapabilities {
  let ai: RuntimeCapabilities["ai"] = "unavailable";
  try { readVertexConfig(env); ai = "configured"; } catch { /* Presence assessment only; no live connectivity claim. */ }
  return { persistence: env.GOOGLE_CLOUD_PROJECT?.trim() ? "configured" : "unavailable", ai };
}
export function applicationHealth(capabilities: RuntimeCapabilities): ApplicationHealth {
  return { applicationReady: capabilities.persistence === "configured", goldenPathReady: capabilities.persistence === "configured" && capabilities.ai === "configured", capabilities };
}
