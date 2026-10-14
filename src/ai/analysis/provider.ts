import type { IssueAnalysisInput } from "./input";

export type IssueAnalysisGenerationRequest = {
  model: string; input: IssueAnalysisInput; promptVersion: string; systemInstruction: string;
  responseJsonSchema: unknown; retry: boolean;
};
export interface IssueAnalysisProvider {
  generate(request: IssueAnalysisGenerationRequest): Promise<string>;
}
