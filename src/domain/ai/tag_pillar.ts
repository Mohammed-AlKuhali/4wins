import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { anthropic } from "../../lib/anthropic.js";
import { fallbackHeuristic } from "./fallback_heuristic.js";
import { logger } from "../../lib/logger.js";

type Pillar = "mental" | "physical" | "spiritual" | "financial";

export interface TagResult {
  pillar: Pillar;
  confidence: number;
  reasoning: string;
  fallback: boolean;
}

const __dir = dirname(fileURLToPath(import.meta.url));
const systemPrompt = readFileSync(
  join(__dir, "prompts/tag_pillar.system.md"),
  "utf8"
);

interface LRUEntry {
  result: TagResult;
  expiresAt: number;
}
const cache = new Map<string, LRUEntry>();
const CACHE_MAX = 1000;
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(text: string): TagResult | null {
  const entry = cache.get(text);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(text);
    return null;
  }
  return entry.result;
}

function setCached(text: string, result: TagResult) {
  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(text, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

const VALID_PILLARS = new Set(["mental", "physical", "spiritual", "financial"]);

export async function tagPillar(text: string): Promise<TagResult> {
  const cached = getCached(text);
  if (cached) return cached;

  if (!anthropic) {
    const result = { ...fallbackHeuristic(text), fallback: true };
    setCached(text, result);
    return result;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await anthropic.messages.create(
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: systemPrompt,
        tools: [
          {
            name: "classify_pillar",
            description: "Classify text into a 4Wins pillar",
            input_schema: {
              type: "object" as const,
              properties: {
                pillar: { type: "string", enum: ["mental", "physical", "spiritual", "financial"] },
                confidence: { type: "number" },
                reasoning: { type: "string" },
              },
              required: ["pillar", "confidence", "reasoning"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "classify_pillar" },
        messages: [{ role: "user", content: text }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") throw new Error("No tool use");

    const parsed = toolUse.input as { pillar: string; confidence: number; reasoning: string };
    if (!VALID_PILLARS.has(parsed.pillar)) throw new Error("Invalid pillar");

    const result: TagResult = {
      pillar: parsed.pillar as Pillar,
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      reasoning: parsed.reasoning,
      fallback: false,
    };

    setCached(text, result);
    logger.debug({ pillar: result.pillar, confidence: result.confidence }, "AI tag result");
    return result;
  } catch (err) {
    logger.warn({ err: err instanceof Error ? err.message : String(err) }, "AI tag failed, using fallback");
    const result = { ...fallbackHeuristic(text), fallback: true };
    setCached(text, result);
    return result;
  }
}
