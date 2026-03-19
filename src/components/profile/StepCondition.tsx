"use client";

import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  profile: UserProfile;
  onChange: (updates: Partial<UserProfile>) => void;
}

export function StepCondition({ profile, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">What condition are you searching trials for?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Be as specific as you like — e.g. "Early-onset Alzheimer's disease" or just "Alzheimer's".
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Condition / disease *</Label>
        <Input
          id="condition"
          value={profile.condition}
          onChange={(e) => onChange({ condition: e.target.value })}
          placeholder="e.g. Alzheimer's disease"
          className="text-base"
          autoFocus
          spellCheck
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Searching for a different person or condition? Go back to the <strong>Profile</strong> step and create a new profile —
        each one keeps its own settings and starred trials separately.
      </p>
    </div>
  );
}
