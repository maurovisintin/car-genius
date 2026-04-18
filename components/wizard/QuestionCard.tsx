"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AnswerValue, Option, Question } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

type Props = {
  question: Question;
  initial?: AnswerValue;
  canGoBack: boolean;
  onSubmit: (value: AnswerValue) => void;
  onBack: () => void;
};

export function QuestionCard({ question, initial, canGoBack, onSubmit, onBack }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{question.prompt}</CardTitle>
        {question.subtitle && <CardDescription>{question.subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        <Body question={question} initial={initial} onSubmit={onSubmit} onBack={onBack} canGoBack={canGoBack} />
      </CardContent>
    </Card>
  );
}

function Body({ question, initial, onSubmit, onBack, canGoBack }: Omit<Props, "onSubmit"> & { onSubmit: (v: AnswerValue) => void }) {
  switch (question.kind) {
    case "single":
      return (
        <SingleChoice
          options={question.options}
          initial={typeof initial === "string" ? initial : undefined}
          onSubmit={onSubmit}
          onBack={onBack}
          canGoBack={canGoBack}
        />
      );
    case "multi":
      return (
        <MultiChoice
          options={question.options}
          maxSelections={question.maxSelections}
          optional={question.optional}
          initial={Array.isArray(initial) ? (initial as string[]) : []}
          onSubmit={onSubmit}
          onBack={onBack}
          canGoBack={canGoBack}
        />
      );
    case "range":
      return (
        <RangeInput
          min={question.min}
          max={question.max}
          step={question.step}
          format={question.format}
          initial={
            Array.isArray(initial) && initial.length === 2
              ? (initial as [number, number])
              : [question.min, Math.round((question.min + question.max) / 2)]
          }
          onSubmit={onSubmit}
          onBack={onBack}
          canGoBack={canGoBack}
        />
      );
    case "text":
      return (
        <TextInput
          placeholder={question.placeholder}
          optional={question.optional}
          initial={typeof initial === "string" ? initial : ""}
          onSubmit={onSubmit}
          onBack={onBack}
          canGoBack={canGoBack}
        />
      );
    case "number":
      return null;
  }
}

type ControlProps = {
  onBack: () => void;
  canGoBack: boolean;
};

function Actions({
  onBack,
  canGoBack,
  onNext,
  disabled,
  nextLabel = "Next",
}: ControlProps & { onNext: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <Button type="button" variant="ghost" onClick={onBack} disabled={!canGoBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>
      <Button type="button" onClick={onNext} disabled={disabled} size="lg">
        {nextLabel}
      </Button>
    </div>
  );
}

function SingleChoice({
  options,
  initial,
  onSubmit,
  onBack,
  canGoBack,
}: ControlProps & { options: Option[]; initial?: string; onSubmit: (v: AnswerValue) => void }) {
  const [value, setValue] = useState<string | undefined>(initial);

  return (
    <>
      <RadioGroup
        value={value ?? ""}
        onValueChange={(v) => setValue(v as string)}
        className="grid gap-2"
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            htmlFor={`opt-${opt.value}`}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-input p-3 transition hover:bg-accent has-[[data-checked]]:border-primary has-[[data-checked]]:bg-accent"
          >
            <RadioGroupItem id={`opt-${opt.value}`} value={opt.value} className="mt-1" />
            <div className="space-y-1">
              <div className="font-medium leading-none">{opt.label}</div>
              {opt.description && (
                <div className="text-sm text-muted-foreground">{opt.description}</div>
              )}
            </div>
          </label>
        ))}
      </RadioGroup>
      <Actions
        onBack={onBack}
        canGoBack={canGoBack}
        onNext={() => value && onSubmit(value)}
        disabled={!value}
      />
    </>
  );
}

function MultiChoice({
  options,
  maxSelections,
  optional,
  initial,
  onSubmit,
  onBack,
  canGoBack,
}: ControlProps & {
  options: Option[];
  maxSelections?: number;
  optional?: boolean;
  initial: string[];
  onSubmit: (v: AnswerValue) => void;
}) {
  const [values, setValues] = useState<string[]>(initial);

  const toggle = (v: string) => {
    setValues((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      if (maxSelections && prev.length >= maxSelections) return prev;
      return [...prev, v];
    });
  };

  const canSubmit = optional ? true : values.length > 0;

  return (
    <>
      {maxSelections && (
        <div className="text-sm text-muted-foreground">
          {values.length}/{maxSelections} selected
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const checked = values.includes(opt.value);
          const atMax = !!maxSelections && !checked && values.length >= maxSelections;
          return (
            <label
              key={opt.value}
              htmlFor={`opt-${opt.value}`}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                checked ? "border-primary bg-accent" : "border-input hover:bg-accent"
              } ${atMax ? "opacity-50" : ""}`}
            >
              <Checkbox
                id={`opt-${opt.value}`}
                checked={checked}
                onCheckedChange={() => !atMax && toggle(opt.value)}
                disabled={atMax}
                className="mt-1"
              />
              <div className="space-y-1">
                <div className="font-medium leading-none">{opt.label}</div>
                {opt.description && (
                  <div className="text-sm text-muted-foreground">{opt.description}</div>
                )}
              </div>
            </label>
          );
        })}
      </div>
      <Actions
        onBack={onBack}
        canGoBack={canGoBack}
        onNext={() => onSubmit(values)}
        disabled={!canSubmit}
      />
    </>
  );
}

function RangeInput({
  min,
  max,
  step,
  format,
  initial,
  onSubmit,
  onBack,
  canGoBack,
}: ControlProps & {
  min: number;
  max: number;
  step: number;
  format?: (n: number) => string;
  initial: [number, number];
  onSubmit: (v: AnswerValue) => void;
}) {
  const [range, setRange] = useState<[number, number]>(initial);
  const fmt = format ?? ((n: number) => String(n));

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between text-lg font-medium">
          <span>{fmt(range[0])}</span>
          <span className="text-muted-foreground">to</span>
          <span>{fmt(range[1])}</span>
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={range}
          onValueChange={(v) => {
            if (Array.isArray(v) && v.length === 2) {
              setRange([v[0], v[1]] as [number, number]);
            }
          }}
        />
      </div>
      <Actions onBack={onBack} canGoBack={canGoBack} onNext={() => onSubmit(range)} />
    </>
  );
}

function TextInput({
  placeholder,
  optional,
  initial,
  onSubmit,
  onBack,
  canGoBack,
}: ControlProps & {
  placeholder?: string;
  optional?: boolean;
  initial: string;
  onSubmit: (v: AnswerValue) => void;
}) {
  const [text, setText] = useState(initial);

  const canSubmit = optional ? true : text.trim().length > 0;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="text-answer">Your answer {optional && <span className="text-muted-foreground">(optional)</span>}</Label>
        <Textarea
          id="text-answer"
          value={text}
          placeholder={placeholder}
          rows={4}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <Actions
        onBack={onBack}
        canGoBack={canGoBack}
        onNext={() => onSubmit(text.trim())}
        disabled={!canSubmit}
        nextLabel={optional && text.trim().length === 0 ? "Skip" : "Next"}
      />
    </>
  );
}
