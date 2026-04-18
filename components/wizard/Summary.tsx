"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Answers } from "@/lib/types";
import { QUESTIONS } from "@/lib/questions";
import { ArrowLeft, Pencil, Sparkles } from "lucide-react";

type Props = {
  answers: Answers;
  history: string[];
  onEdit: (questionId: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export function Summary({ answers, history, onEdit, onBack, onSubmit }: Props) {
  const entries = history.filter((id) => id in answers);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Review your answers</CardTitle>
        <CardDescription>
          Make sure everything looks right, then we&apos;ll find the best cars for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-y rounded-md border">
          {entries.map((qid) => {
            const q = QUESTIONS[qid];
            if (!q) return null;
            return (
              <li key={qid} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-sm text-muted-foreground">{q.prompt}</div>
                  <div className="font-medium">{renderAnswer(qid, answers[qid])}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(qid)}
                  aria-label={`Edit ${q.prompt}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button size="lg" onClick={onSubmit}>
            <Sparkles className="mr-2 h-4 w-4" /> Get my recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function renderAnswer(qid: string, value: unknown) {
  const q = QUESTIONS[qid];
  if (!q) return String(value);

  if (q.kind === "range" && Array.isArray(value)) {
    const [lo, hi] = value as [number, number];
    const fmt = q.format ?? ((n: number) => String(n));
    return `${fmt(lo)} – ${fmt(hi)}`;
  }
  if ((q.kind === "single" || q.kind === "multi") && "options" in q) {
    const arr = Array.isArray(value) ? value : value != null ? [value] : [];
    if (arr.length === 0) return <span className="text-muted-foreground">(skipped)</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {arr.map((v) => {
          const label = q.options.find((o) => o.value === v)?.label ?? String(v);
          return (
            <Badge key={String(v)} variant="secondary">
              {label}
            </Badge>
          );
        })}
      </div>
    );
  }
  if (q.kind === "text") {
    const s = String(value ?? "").trim();
    return s.length > 0 ? s : <span className="text-muted-foreground">(skipped)</span>;
  }
  return String(value);
}
