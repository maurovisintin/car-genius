import { FIRST_QUESTION_ID, QUESTIONS } from "./questions";
import type { Answers, AnswerValue } from "./types";

export type Phase = "asking" | "summary" | "recommending";

export type WizardState = {
  phase: Phase;
  currentId: string | null;
  answers: Answers;
  history: string[];
};

export type WizardAction =
  | { type: "ANSWER"; id: string; value: AnswerValue }
  | { type: "BACK" }
  | { type: "JUMP_TO"; id: string }
  | { type: "GO_TO_SUMMARY" }
  | { type: "SUBMIT" }
  | { type: "RESET" };

export const initialState: WizardState = {
  phase: "asking",
  currentId: FIRST_QUESTION_ID,
  answers: {},
  history: [],
};

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "ANSWER": {
      const nextAnswers = { ...state.answers, [action.id]: action.value };
      const question = QUESTIONS[action.id];
      const nextId = question.next(nextAnswers);
      if (nextId === null) {
        return {
          ...state,
          answers: nextAnswers,
          history: [...state.history, action.id],
          currentId: null,
          phase: "summary",
        };
      }
      return {
        ...state,
        answers: nextAnswers,
        history: [...state.history, action.id],
        currentId: nextId,
        phase: "asking",
      };
    }

    case "BACK": {
      if (state.phase === "summary") {
        const last = state.history[state.history.length - 1];
        return {
          ...state,
          phase: "asking",
          currentId: last ?? FIRST_QUESTION_ID,
        };
      }
      if (state.history.length === 0) return state;
      const prevHistory = state.history.slice(0, -1);
      const prevId = state.history[state.history.length - 1];
      return {
        ...state,
        history: prevHistory,
        currentId: prevId,
        phase: "asking",
      };
    }

    case "JUMP_TO": {
      const idx = state.history.indexOf(action.id);
      const history = idx >= 0 ? state.history.slice(0, idx) : state.history;
      return {
        ...state,
        phase: "asking",
        currentId: action.id,
        history,
      };
    }

    case "GO_TO_SUMMARY":
      return { ...state, phase: "summary", currentId: null };

    case "SUBMIT":
      return { ...state, phase: "recommending" };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
