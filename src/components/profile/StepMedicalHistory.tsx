"use client";

import type { UserProfile } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

      {/* Medication stability */}
      <div className="space-y-4 pt-2 border-t">
        <div>
          <Label className="text-sm font-semibold">Medication stability</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Many trials require that any medication treating the target condition has been on a
            consistent, unchanged plan for a set period before enrollment.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Currently taking medication specifically for this condition</Label>
            <p className="text-xs text-muted-foreground">e.g. Aricept for Alzheimer's, not a general supplement</p>
          </div>
          <Switch
            checked={profile.onConditionMedication === true}
            onCheckedChange={(v) =>
              onChange({
                onConditionMedication: v,
                conditionMedicationStable: v ? profile.conditionMedicationStable : null,
                conditionMedicationStableDuration: v ? profile.conditionMedicationStableDuration : null,
              })
            }
          />
        </div>

        {profile.onConditionMedication && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Medication plan is stable — same drug, same dose, no recent changes</Label>
              </div>
              <Switch
                checked={profile.conditionMedicationStable === true}
                onCheckedChange={(v) =>
                  onChange({
                    conditionMedicationStable: v,
                    conditionMedicationStableDuration: v ? profile.conditionMedicationStableDuration : null,
                  })
                }
              />
            </div>

            {profile.conditionMedicationStable && (
              <div className="flex items-center justify-between gap-4">
                <Label>Stable for approximately</Label>
                <Select
                  value={profile.conditionMedicationStableDuration ?? ""}
                  onValueChange={(v) =>
                    onChange({ conditionMedicationStableDuration: v as UserProfile["conditionMedicationStableDuration"] })
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Select duration">
                      {({ lt1m: "< 1 month", "1to3m": "1–3 months", "3to6m": "3–6 months", "6plus": "6+ months" } as Record<string, string>)[profile.conditionMedicationStableDuration ?? ""] ?? null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lt1m">Less than 1 month</SelectItem>
                    <SelectItem value="1to3m">1–3 months</SelectItem>
                    <SelectItem value="3to6m">3–6 months</SelectItem>
                    <SelectItem value="6plus">6 months or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
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
