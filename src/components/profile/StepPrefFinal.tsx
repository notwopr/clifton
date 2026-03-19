"use client";

import type { UserPreferences, TrialPhase, PreferenceLevel } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrefCard, TriToggle } from "./pref-utils";

interface Props {
  prefs: UserPreferences;
  onChange: (updates: Partial<UserPreferences>) => void;
}

export function StepPrefFinal({ prefs, onChange }: Props) {
  function updatePhase(phase: TrialPhase, level: PreferenceLevel) {
    onChange({ phasePreferences: { ...prefs.phasePreferences, [phase]: level } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Trial Terms</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The big-picture questions — placebo tolerance, how experimental a trial you&apos;re open to, and treatment odds.
        </p>
      </div>

      <PrefCard title="Placebo & Treatment Odds">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">Willing to be in a placebo arm</span>
          <Select
            value={prefs.placeboAcceptable}
            onValueChange={(v) =>
              v && onChange({ placeboAcceptable: v as UserPreferences["placeboAcceptable"] })
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue>
                {prefs.placeboAcceptable === "yes" ? "Yes, open to it" : prefs.placeboAcceptable === "prefer_not" ? "Prefer not, but OK" : prefs.placeboAcceptable === "dealbreaker" ? "No — dealbreaker" : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes, I&apos;m open to it</SelectItem>
              <SelectItem value="prefer_not">Prefer not, but OK</SelectItem>
              <SelectItem value="dealbreaker">No — dealbreaker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            Minimum share of participants who get the actual drug:{" "}
            <span className="font-semibold">{prefs.minActiveTreatmentSharePct}%</span>
          </Label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[prefs.minActiveTreatmentSharePct]}
            onValueChange={(v) => onChange({ minActiveTreatmentSharePct: Array.isArray(v) ? v[0] : v })}
          />
          <p className="text-xs text-muted-foreground">
            Leave at 0% to show all trials. A 1:1 randomized trial = 50% get the drug. A 2:1 trial = 67%. Open-label = 100%.
          </p>
        </div>
      </PrefCard>

      <PrefCard
        title="Trial Phase"
        description="Later phases are generally safer and closer to real-world use; earlier phases may test more novel approaches."
      >
        <div className="space-y-2">
          {(Object.entries(PHASE_LABELS) as [TrialPhase, string][]).map(([phase, label]) => (
            <div key={phase} className="flex items-center justify-between gap-4">
              <span className="text-sm">{label}</span>
              <TriToggle
                value={prefs.phasePreferences?.[phase] ?? "ok"}
                onChange={(v) => updatePhase(phase, v)}
              />
            </div>
          ))}
        </div>
      </PrefCard>
    </div>
  );
}
