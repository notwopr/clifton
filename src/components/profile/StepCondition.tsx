"use client";

import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "./TagInput";

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
        <p className="text-xs text-muted-foreground">
          Spell it as it appears on ClinicalTrials.gov — e.g. "Alzheimer Disease" (no apostrophe-s) is the
          official term used there. If unsure, use common synonyms in the keywords field below.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Synonyms & related terms (optional but recommended)</Label>
        <TagInput
          values={profile.conditionKeywords}
          onChange={(v) => onChange({ conditionKeywords: v })}
          placeholder="e.g. AD, dementia, amyloid, tau, MCI, mild cognitive impairment"
          label="Add abbreviations, alternate spellings, and subtypes — broadens the search and catches trials you'd otherwise miss"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Profile name</Label>
        <Input
          id="label"
          value={profile.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. Mom - Alzheimer's"
        />
        <p className="text-xs text-muted-foreground">
          Saved locally in your browser so your profile reloads automatically next visit.
        </p>
      </div>
    </div>
  );
}
