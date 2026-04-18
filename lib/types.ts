export type AnswerValue = string | string[] | number | [number, number];

export type Answers = Record<string, AnswerValue>;

export type Option = {
  value: string;
  label: string;
  description?: string;
};

type BaseQuestion = {
  id: string;
  prompt: string;
  subtitle?: string;
  optional?: boolean;
  next: (answers: Answers) => string | null;
};

export type SingleChoiceQuestion = BaseQuestion & {
  kind: "single";
  options: Option[];
};

export type MultiChoiceQuestion = BaseQuestion & {
  kind: "multi";
  options: Option[];
  maxSelections?: number;
};

export type RangeQuestion = BaseQuestion & {
  kind: "range";
  min: number;
  max: number;
  step: number;
  format?: (n: number) => string;
};

export type NumberQuestion = BaseQuestion & {
  kind: "number";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export type TextQuestion = BaseQuestion & {
  kind: "text";
  placeholder?: string;
};

export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | RangeQuestion
  | NumberQuestion
  | TextQuestion;

export type Recommendation = {
  make: string;
  model: string;
  yearRange: string;
  priceRange: string;
  whyItFits: string;
  pros: string[];
  cons: string[];
  bestFor: string;
};
