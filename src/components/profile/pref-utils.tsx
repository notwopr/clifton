"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TriLevel = "ok" | "prefer_not" | "dealbreaker";

export function TriToggle({
  value,
  onChange,
}: {
  value: TriLevel;
  onChange: (v: TriLevel) => void;
}) {
  const options: TriLevel[] = ["ok", "prefer_not", "dealbreaker"];
  const labels: Record<TriLevel, string> = {
    ok: "OK",
    prefer_not: "Prefer not",
    dealbreaker: "Dealbreaker",
  };
  const colors: Record<TriLevel, string> = {
    ok: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    prefer_not: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    dealbreaker: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-900",
  };

  return (
    <div className="flex rounded-md border overflow-hidden text-xs font-medium">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-2 py-1 transition-colors border-r last:border-r-0",
            value === opt
              ? colors[opt]
              : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
          )}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export function PrefCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
