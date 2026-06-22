import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowStep = {
  icon: LucideIcon;
  title: string;
  body: string;
};

type ConnectedFlowStepsProps = {
  steps: FlowStep[];
  className?: string;
};

export function ConnectedFlowSteps({ steps, className }: ConnectedFlowStepsProps) {
  return (
    <ol className={cn("grid gap-6 sm:grid-cols-3", className)} role="list">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <li key={step.title} className="relative flex flex-col items-center text-center sm:px-2" role="listitem">
            {index < steps.length - 1 ? (
              <span
                className="absolute left-[calc(50%+2rem)] top-5 hidden h-0.5 w-[calc(100%-4rem)] bg-cyan-100 sm:block"
                aria-hidden="true"
              />
            ) : null}

            <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary ring-1 ring-primary/10">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-base font-extrabold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-primary/75">{step.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
