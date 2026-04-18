import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Answers } from "./types";
import { QUESTIONS } from "./questions";

export const RecommendationSchema = z.object({
  make: z.string().describe("Manufacturer, e.g. Toyota"),
  model: z.string().describe("Model name, e.g. RAV4 Hybrid"),
  yearRange: z.string().describe("Year or year range, e.g. '2023-2024' or '2022+'"),
  priceRange: z.string().describe("Estimated price range in USD, e.g. '$32,000 - $38,000'"),
  whyItFits: z.string().describe("1-2 sentence explanation tailored to the user's stated needs"),
  pros: z.array(z.string()).describe("3-5 key strengths relative to this user"),
  cons: z.array(z.string()).describe("1-3 honest tradeoffs the user should know about"),
  bestFor: z.string().describe("Short tag like 'Safety-first commuter' or 'Weekend adventurer'"),
});

export const RecommendationsResponseSchema = z.object({
  recommendations: z
    .array(RecommendationSchema)
    .min(3)
    .max(5)
    .describe("3 to 5 car recommendations, ranked best-fit first."),
  summary: z.string().describe("One short paragraph summarizing the user's profile."),
});

export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>;

const SYSTEM_PROMPT = `You are an expert automotive advisor with deep knowledge of real production cars sold in North America.

Your job: given a buyer's answers to a questionnaire, recommend 3 to 5 specific real-world cars (make + model + year range) that fit their needs.

Rules:
- Only recommend real cars that are actually available to buy (new or used, per the user's preference).
- Respect hard constraints: budget ceiling, seat count, fuel type, and any dealbreakers.
- Prefer model years 2021+ for "new" or "either". For "used", respect the user's max age.
- Diversify picks: don't recommend three trims of the same model.
- Be honest about cons. Every car has tradeoffs. Call them out.
- Keep prose tight. No fluff.
- Ground price ranges in realistic current US market pricing.`;

export function buildUserMessage(answers: Answers): string {
  const labeled = Object.entries(answers).map(([qid, raw]) => {
    const q = QUESTIONS[qid];
    const label = q?.prompt ?? qid;
    const value = formatValue(qid, raw);
    return `- ${label}\n  Answer: ${value}`;
  });
  return `Here are the buyer's answers:\n\n${labeled.join("\n")}\n\nReturn 3-5 recommendations ranked best-fit first.`;
}

function formatValue(qid: string, value: unknown): string {
  const q = QUESTIONS[qid];
  if (!q) return String(value);
  if (q.kind === "range" && Array.isArray(value)) {
    const [lo, hi] = value as [number, number];
    const fmt = q.format ?? ((n: number) => String(n));
    return `${fmt(lo)} to ${fmt(hi)}`;
  }
  if ((q.kind === "single" || q.kind === "multi") && "options" in q) {
    const arr = Array.isArray(value) ? value : [value];
    const labels = arr.map((v) => q.options.find((o) => o.value === v)?.label ?? String(v));
    return labels.join(", ");
  }
  if (q.kind === "text") {
    const s = String(value ?? "").trim();
    return s.length > 0 ? s : "(none)";
  }
  return String(value);
}

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (!cachedClient) cachedClient = new Anthropic();
  return cachedClient;
}

export async function recommendCars(answers: Answers): Promise<RecommendationsResponse> {
  const client = getClient();
  const userMessage = buildUserMessage(answers);

  const response = await client.messages.parse({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
    output_config: {
      format: zodOutputFormat(RecommendationsResponseSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Model did not return valid structured output.");
  }
  return response.parsed_output;
}
