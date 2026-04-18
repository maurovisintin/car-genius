import { Progress } from "@/components/ui/progress";

type Props = {
  step: number;
  estimatedTotal: number;
};

export function ProgressBar({ step, estimatedTotal }: Props) {
  const pct = Math.min(100, Math.round((step / Math.max(estimatedTotal, 1)) * 100));
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {step + 1}</span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
