"use client";

import type { UserProfile } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "./TagInput";

interface Props {
  profile: UserProfile;
  onChange: (updates: Partial<UserProfile>) => void;
}

export function StepMedicalHistory({ profile, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Medical history</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This helps detect potential conflicts with exclusion criteria.
          More detail = more accurate eligibility estimates.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Comorbidities / other diagnoses</Label>
        <TagInput
          values={profile.comorbidities}
          onChange={(v) => onChange({ comorbidities: v })}
          placeholder="e.g. Type 2 diabetes, hypertension, atrial fibrillation"
          label="Enter each condition separately"
        />
      </div>

      <div className="space-y-2">
        <Label>Current medications</Label>
        <TagInput
          values={profile.currentMedications}
          onChange={(v) => onChange({ currentMedications: v })}
          placeholder="e.g. Aricept, metformin, lisinopril"
          label="Generic or brand names are both fine"
        />
      </div>

      <div className="space-y-2">
        <Label>Recent procedures or hospitalizations</Label>
        <TagInput
          values={profile.recentProcedures}
          onChange={(v) => onChange({ recentProcedures: v })}
          placeholder="e.g. hip replacement 3 months ago, cardiac stent 2023"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Any other relevant clinical details</Label>
        <Textarea
          id="notes"
          value={profile.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="e.g. disease stage/severity, relevant test scores, mobility limitations, caregiver availability, unable to fast before appointments…"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Include anything that might appear in inclusion/exclusion criteria — disease stage,
          functional scores, physical limitations, lab values, etc.
        </p>
      </div>
    </div>
  );
}
