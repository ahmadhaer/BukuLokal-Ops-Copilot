import "server-only";
import { EntityIdSchema } from "../../domain/common/schema";
import { analyzeIssue, type AnalysisResult } from "../../ai/analysis/analyze-issue";
import { buildIssueAnalysisInput, type IssueAnalysisInput } from "../../ai/analysis/input";
import type { IssueAnalysisProvider } from "../../ai/analysis/provider";
import { createVertexProvider, readVertexConfig } from "../../ai/client/google-genai";
import { buildDemoWorkspace } from "./workspace";

export type DemoAnalysisResponse = { status: "success"; result: Omit<Extract<AnalysisResult, { ok: true }>, "attempts"> & { attempts?: number }; input: IssueAnalysisInput }
  | { status: "unconfigured" | "unavailable" | "invalid"; message: string };
export function isAiConfigured(): boolean {
  try { readVertexConfig(); return true; } catch { return false; }
}
export async function analyzeDemoIssue(issueId: unknown, createdAt: string,
  runtime: () => { provider: IssueAnalysisProvider; config: { model: string } } = () => createVertexProvider()): Promise<DemoAnalysisResponse> {
  if (!EntityIdSchema.safeParse(issueId).success) return { status: "invalid", message: "Choose an issue from the demo workspace." };
  const workspace = buildDemoWorkspace();
  const request = { organization: workspace.dataset.organization, issueId: issueId as string, detection: workspace.detection };
  let input: IssueAnalysisInput;
  try { input = buildIssueAnalysisInput(request); } catch { return { status: "invalid", message: "This issue is not available in the demo workspace." }; }
  let configured;
  try { configured = runtime(); } catch { return { status: "unconfigured", message: "AI analysis is not configured in this environment. The operational issue and evidence remain available." }; }
  const result = await analyzeIssue(request, configured.provider, { model: configured.config.model, createdAt });
  if (!result.ok) return { status: "unavailable", message: "AI analysis is temporarily unavailable. The operational issue and evidence remain available." };
  return { status: "success", result, input };
}
