import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { recommendCars } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

const AnswerValueSchema: z.ZodType<string | string[] | number | [number, number]> = z.union([
  z.string(),
  z.array(z.string()),
  z.number(),
  z.tuple([z.number(), z.number()]),
]);

const RequestSchema = z.object({
  answers: z.record(z.string(), AnswerValueSchema),
});

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request shape.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await recommendCars(parsed.data.answers);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests right now. Please try again shortly." },
        { status: 429 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Model service error (${err.status}). Try again.` },
        { status: 502 },
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
