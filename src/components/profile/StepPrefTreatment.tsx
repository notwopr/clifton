"use client";

import type { UserPreferences, DeliveryMethod, ProcedureType, PreferenceLevel } from "@/lib/types";
import { DELIVERY_METHOD_LABELS, PROCEDURE_LABELS } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PrefCard, TriToggle } from "./pref-utils";

interface Props {
  prefs: UserPreferences;
  onChange: (updates: Partial<UserPreferences>) => void;
}

export function StepPrefTreatment({ prefs, onChange }: Props) {
  function updateDelivery(method: DeliveryMethod, level: PreferenceLevel) {
    onChange({ deliveryPreferences: { ...prefs.deliveryPreferences, [method]: level } });
  }
  function updateProcedure(proc: ProcedureType, level: PreferenceLevel) {
    onChange({ procedurePreferences: { ...prefs.procedurePreferences, [proc]: level } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Procedures & Dealbreakers</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mark anything you want to avoid. <span className="text-red-600 font-medium">Dealbreakers</span> score the trial zero but keep it visible so you can reconsider.
        </p>
      </div>

      <PrefCard
        title="Treatment Delivery"
        description="How are you OK with the drug or therapy being administered?"
      >
        <div className="space-y-2">
          {(Object.entries(DELIVERY_METHOD_LABELS) as [DeliveryMethod, string][]).map(([method, label]) => (
            <div key={method} className="flex items-center justify-between gap-4">
              <span className="text-sm">{label}</span>
              <TriToggle
                value={prefs.deliveryPreferences[method] ?? "ok"}
                onChange={(v) => updateDelivery(method, v)}
              />
            </div>
          ))}
        </div>
      </PrefCard>

      <PrefCard
        title="Procedures & Testing Burden"
        description="Mark any procedures you want to avoid."
      >
        <div className="space-y-2">
          {(Object.entries(PROCEDURE_LABELS) as [ProcedureType, string][]).map(([proc, label]) => (
            <div key={proc} className="flex items-center justify-between gap-4">
              <span className="text-sm">{label}</span>
              <TriToggle
                value={prefs.procedurePreferences[proc] ?? "ok"}
                onChange={(v) => updateProcedure(proc, v)}
              />
            </div>
          ))}
        </div>
      </PrefCard>

      <PrefCard title="Anything Else">
        <div className="space-y-2">
          <Label htmlFor="mustHave">Must have (critical requirements)</Label>
          <Textarea
            id="mustHave"
            value={prefs.mustHave}
            onChange={(e) => onChange({ mustHave: e.target.value })}
            placeholder="e.g. Must allow concurrent Aricept use, must have a site in New York"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Trials that don&apos;t mention these will be penalised in the ranking.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="niceToHave">Nice to have (soft preferences)</Label>
          <Textarea
            id="niceToHave"
            value={prefs.niceToHave}
            onChange={(e) => onChange({ niceToHave: e.target.value })}
            placeholder="e.g. Prefer morning visits, prefer academic medical centers"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dealbreakers">Additional dealbreakers</Label>
          <Textarea
            id="dealbreakers"
            value={prefs.dealbreakers}
            onChange={(e) => onChange({ dealbreakers: e.target.value })}
            placeholder="e.g. No overnight stays, no fasting required, no caregiver questionnaires"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Comma or newline separated. Trials mentioning these keywords will score zero.
          </p>
        </div>
      </PrefCard>
    </div>
  );
}
