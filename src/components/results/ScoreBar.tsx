"use client";

import type { ScoreDimension } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  pass: "bg-green-500 dark:bg-green-500",
  warn: "bg-amber-400 dark:bg-amber-500",
  fail: "bg-rose-400 dark:bg-rose-500",
};

const STATUS_BADGE = {
  pass: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  warn: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  fail: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

interface ScoreBarProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreBar({ score, label, size = "md" }: ScoreBarProps) {
  const color =
    score >= 70 ? "bg-green-500 dark:bg-green-500" : score >= 40 ? "bg-amber-400 dark:bg-amber-500" : "bg-rose-400 dark:bg-rose-500";

  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-medium tabular-nums">{score}</span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface DimensionBadgesProps {
  dimensions: ScoreDimension[];
  compact?: boolean;
}

export function DimensionBadges({ dimensions, compact = false }: DimensionBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {dimensions.map((dim) => (
        <div
          key={dim.id}
          title={dim.reason}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            STATUS_BADGE[dim.status]
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", STATUS_COLORS[dim.status])}
          />
          {compact ? dim.label.split(" ")[0] : dim.label}
          {!compact && <span className="opacity-60 ml-0.5">·{dim.score}</span>}
        </div>
      ))}
    </div>
  );
}

interface CompositeScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function CompositeScore({ score, size = "md" }: CompositeScoreProps) {
  const color =
    score >= 70
      ? "text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800"
      : score >= 40
      ? "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800"
      : "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-900/20 dark:border-rose-800";

  const sizes = {
    sm: "text-lg w-10 h-10",
    md: "text-2xl w-14 h-14",
    lg: "text-3xl w-16 h-16",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 font-bold tabular-nums",
        color,
        sizes[size]
      )}
    >
      {score}
    </div>
  );
}
