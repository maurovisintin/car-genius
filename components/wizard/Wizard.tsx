"use client";

import { useMemo, useReducer } from "react";
import { initialState, wizardReducer } from "@/lib/wizardReducer";
import { QUESTIONS } from "@/lib/questions";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { Summary } from "./Summary";
import { Recommendations } from "./Recommendations";

export function Wizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const currentQuestion = state.currentId ? QUESTIONS[state.currentId] : null;

  const estimatedTotal = useMemo(() => {
    return Math.max(Object.keys(QUESTIONS).length - 4, state.history.length + 1);
  }, [state.history.length]);

  if (state.phase === "recommending") {
    return (
      <Recommendations
        answers={state.answers}
        onRestart={() => dispatch({ type: "RESET" })}
      />
    );
  }

  if (state.phase === "summary") {
    return (
      <Summary
        answers={state.answers}
        history={state.history}
        onEdit={(id) => dispatch({ type: "JUMP_TO", id })}
        onBack={() => dispatch({ type: "BACK" })}
        onSubmit={() => dispatch({ type: "SUBMIT" })}
      />
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <ProgressBar step={state.history.length} estimatedTotal={estimatedTotal} />
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        initial={state.answers[currentQuestion.id]}
        canGoBack={state.history.length > 0}
        onSubmit={(value) => dispatch({ type: "ANSWER", id: currentQuestion.id, value })}
        onBack={() => dispatch({ type: "BACK" })}
      />
    </div>
  );
}
