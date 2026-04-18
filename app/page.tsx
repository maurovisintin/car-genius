"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wizard } from "@/components/wizard/Wizard";
import { Car, Sparkles } from "lucide-react";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:py-16">
      <header className="mb-8 flex items-center gap-2">
        <Car className="h-5 w-5 text-primary" />
        <span className="text-lg font-semibold tracking-tight">Car Genius</span>
      </header>

      {started ? (
        <Wizard />
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Find the car you actually need.
          </h1>
          <p className="mb-8 max-w-xl text-lg text-muted-foreground">
            Answer a few questions about your budget, lifestyle, and priorities. We&apos;ll
            recommend real cars that fit &mdash; honest pros, honest tradeoffs.
          </p>
          <Button size="lg" onClick={() => setStarted(true)}>
            <Sparkles className="mr-2 h-5 w-5" /> Find my car
          </Button>
          <p className="mt-6 text-xs text-muted-foreground">
            Takes about 2 minutes. No account, no spam.
          </p>
        </section>
      )}
    </main>
  );
}
