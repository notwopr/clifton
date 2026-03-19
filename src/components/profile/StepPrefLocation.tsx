"use client";

import type { UserPreferences } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PrefCard } from "./pref-utils";

interface Props {
  prefs: UserPreferences;
  onChange: (updates: Partial<UserPreferences>) => void;
}

export function StepPrefLocation({ prefs, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Location & Time</h2>
        <p className="text-sm text-muted-foreground mt-1">
          How far can you travel, and how much time can you commit?
        </p>
      </div>

      <PrefCard title="Travel & Location">
        <div className="space-y-2">
          <Label>
            How far are you willing to drive to a trial site? (one-way miles)
            {typeof prefs.maxDistanceMiles === "number" && prefs.maxDistanceMiles > 0 && (
              <span className="text-muted-foreground font-normal ml-2 text-xs">
                ≈ {Math.round((prefs.maxDistanceMiles / 55) * 10) / 10}h one-way · {prefs.maxDistanceMiles * 2} mi round trip
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
          <Label htmlFor="maxVisits">Maximum visits per month</Label>
          <p className="text-xs text-muted-foreground">
            Leave blank for no limit. How many trips per month is realistic regardless of distance.
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
    </div>
  );
}
