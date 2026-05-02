export interface TagResult {
  pillar: "mental" | "physical" | "spiritual" | "financial";
  confidence: number;
  reasoning: string;
}

export async function tagPillar(_text: string): Promise<TagResult> {
  return { pillar: "mental", confidence: 0, reasoning: "stub" };
}
