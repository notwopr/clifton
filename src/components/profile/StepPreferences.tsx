"use client";

import type { UserPreferences, DeliveryMethod, ProcedureType, TrialPhase, PreferenceLevel } from "@/lib/types";
import { DELIVERY_METHOD_LABELS, PROCEDURE_LABELS, PHASE_LABELS } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  prefs: UserPreferences;
  onChange: (updates: Partial<UserPreferences>) => void;
}

type TriLevel = "ok" | "prefer_not" | "dealbreaker";

function TriToggle({
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

function PrefCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

export function StepPreferences({ prefs, onChange }: Props) {
  function updateDelivery(method: DeliveryMethod, level: PreferenceLevel) {
    onChange({ deliveryPreferences: { ...prefs.deliveryPreferences, [method]: level } });
  }
  function updateProcedure(proc: ProcedureType, level: PreferenceLevel) {
    onChange({ procedurePreferences: { ...prefs.procedurePreferences, [proc]: level } });
  }
  function updatePhase(phase: TrialPhase, level: PreferenceLevel) {
    onChange({ phasePreferences: { ...prefs.phasePreferences, [phase]: level } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Your preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">
          These shape the ranking. Trials that trigger a <span className="text-red-600 font-medium">dealbreaker</span> score
          zero but remain visible — so you can still see them and reconsider.
        </p>
      </div>

      {/* ── Travel & Location ── */}
      <PrefCard title="Travel & Location">
        <div className="space-y-2">
          <Label>
            How far are you willing to drive to a trial site? (one-way miles)
            {typeof prefs.maxDistanceMiles === "number" && prefs.maxDistanceMiles > 0 && (
              <span className="text-muted-foreground font-normal ml-2 text-xs">
                ≈ {Math.round(prefs.maxDistanceMiles / 55 * 10) / 10}h one-way · {prefs.maxDistanceMiles * 2} mi total round trip
              </span>
            )}
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              min={0}
              max={500}
              step={10}
              value={[typeof prefs.maxDistanceMiles === "number" ? prefs.maxDistanceMiles : 100]}
              onValueChange={(v) => onChange({ maxDistanceMiles: Array.isArray(v) ? v[0] : v })}
              className="flex-1"
            />
            <span className="w-16 text-sm text-right font-medium">
              {typeof prefs.maxDistanceMiles === "number" ? `${prefs.maxDistanceMiles} mi` : "Any"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Willing to fly for trials beyond driving distance</Label>
            <p className="text-xs text-muted-foreground">
              Trials over your driving limit will still show, scored slightly lower
            </p>
          </div>
          <Switch
            checked={prefs.willingToFly}
            onCheckedChange={(v) => onChange({ willingToFly: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>US sites only</Label>
            <p className="text-xs text-muted-foreground">Filter out trials with no US locations</p>
          </div>
          <Switch
            checked={prefs.usOnly}
            onCheckedChange={(v) => onChange({ usOnly: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Telehealth / remote visits acceptable</Label>
            <p className="text-xs text-muted-foreground">
              Counts as zero-distance if trial allows remote participation
            </p>
          </div>
          <Switch
            checked={prefs.telehealthAcceptable}
            onCheckedChange={(v) => onChange({ telehealthAcceptable: v })}
          />
        </div>
      </PrefCard>

      {/* ── Time Commitment ── */}
      <PrefCard title="Time Commitment">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxDuration">Max trial duration (months)</Label>
            <Input
              id="maxDuration"
              type="number"
              min={1}
              value={prefs.maxTrialDurationMonths === "" ? "" : String(prefs.maxTrialDurationMonths)}
              onChange={(e) =>
                onChange({ maxTrialDurationMonths: e.target.value === "" ? "" : parseInt(e.target.value, 10) })
              }
              placeholder="No limit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxVisitHours">Max hours per visit</Label>
            <Input
              id="maxVisitHours"
              type="number"
              min={0.5}
              step={0.5}
              value={prefs.maxVisitHours === "" ? "" : String(prefs.maxVisitHours)}
              onChange={(e) =>
                onChange({ maxVisitHours: e.target.value === "" ? "" : parseFloat(e.target.value) })
              }
              placeholder="No limit"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="maxVisits">Maximum visits per month you can commit to</Label>
          <p className="text-xs text-muted-foreground">
            Leave blank for no limit. How many trips to a trial site per month is realistic for you.
          </p>
          <Input
            id="maxVisits"
            type="number"
            min={0}
            value={prefs.maxVisitsPerMonth === "" ? "" : String(prefs.maxVisitsPerMonth)}
            onChange={(e) =>
              onChange({ maxVisitsPerMonth: e.target.value === "" ? "" : parseInt(e.target.value, 10) })
            }
            placeholder="No limit"
            className="w-32"
          />
        </div>
      </PrefCard>

      {/* ── Placebo & Treatment Odds ── */}
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes, no problem</SelectItem>
              <SelectItem value="prefer_not">Prefer not (lower score)</SelectItem>
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
            Leave at 0% to show all trials. A 1:1 randomized trial = 50% get the drug.
            A 2:1 trial = 67%. Open-label = 100% (everyone gets the treatment).
          </p>
        </div>
      </PrefCard>

      {/* ── Trial Phase ── */}
      <PrefCard
        title="Trial Phase"
        description="Later phases are generally safer and closer to real-world use, but earlier phases may test more novel approaches."
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

      {/* ── Treatment Delivery ── */}
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

      {/* ── Procedures ── */}
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

      {/* ── Free-form ── */}
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
