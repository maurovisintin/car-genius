"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, RotateCw, Check, X, Loader2 } from "lucide-react";
import type { Answers, Recommendation } from "@/lib/types";

type Props = {
  answers: Answers;
  onRestart: () => void;
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; recommendations: Recommendation[]; summary: string };

export function Recommendations({ answers, onRestart }: Props) {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "error", message: data.error ?? `Request failed (${res.status}).` });
          return;
        }
        setState({
          status: "ok",
          recommendations: data.recommendations ?? [],
          summary: data.summary ?? "",
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unexpected error";
        setState({ status: "error", message });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [answers]);

  if (state.status === "loading") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg font-medium">Consulting the garage&hellip;</div>
          <div className="text-sm text-muted-foreground">
            Matching your profile to the best real-world cars. This usually takes 20&ndash;40 seconds.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="text-lg font-medium">Something went wrong</div>
          <p className="max-w-md text-sm text-muted-foreground">{state.message}</p>
          <Button onClick={() => setState({ status: "loading" })} variant="outline">
            <RotateCw className="mr-2 h-4 w-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your matches</CardTitle>
          {state.summary && <CardDescription>{state.summary}</CardDescription>}
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {state.recommendations.map((rec, i) => (
          <RecCard key={`${rec.make}-${rec.model}-${i}`} rec={rec} rank={i + 1} />
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onRestart}>
          <RotateCw className="mr-2 h-4 w-4" /> Start over
        </Button>
      </div>
    </div>
  );
}

function RecCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardDescription className="text-xs uppercase tracking-wide">
              #{rank} &middot; {rec.bestFor}
            </CardDescription>
            <CardTitle className="text-xl">
              {rec.make} {rec.model}
            </CardTitle>
            <CardDescription>
              {rec.yearRange} &middot; {rec.priceRange}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm">{rec.whyItFits}</p>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pros
            </div>
            <ul className="space-y-1.5 text-sm">
              {rec.pros.map((pro, i) => (
                <li key={i} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tradeoffs
            </div>
            <ul className="space-y-1.5 text-sm">
              {rec.cons.map((con, i) => (
                <li key={i} className="flex gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

