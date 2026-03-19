"use client";

import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  profile: UserProfile;
  onChange: (updates: Partial<UserProfile>) => void;
}

export function StepDemographics({ profile, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Patient demographics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Used to check age and sex eligibility criteria. Location helps sort trials by proximity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            value={profile.age === "" ? "" : String(profile.age)}
            onChange={(e) =>
              onChange({ age: e.target.value === "" ? "" : parseInt(e.target.value, 10) })
            }
            placeholder="e.g. 74"
          />
        </div>

        <div className="space-y-2">
          <Label>Sex</Label>
          <Select
            value={profile.sex}
            onValueChange={(v) => v && onChange({ sex: v as UserProfile["sex"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select…">
                {profile.sex === "female" ? "Female" : profile.sex === "male" ? "Male" : profile.sex === "other" ? "Other" : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="other">Other / prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP / postal code</Label>
          <Input
            id="zip"
            value={profile.zipCode}
            onChange={(e) => onChange({ zipCode: e.target.value })}
            placeholder="e.g. 90210"
          />
          <p className="text-xs text-muted-foreground">
            Used to calculate distance to trial sites. Never stored on a server.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Country</Label>
          <Select
            value={profile.country}
            onValueChange={(v) => v && onChange({ country: v })}
          >
            <SelectTrigger>
              <SelectValue>
                {{ US: "United States", CA: "Canada", GB: "United Kingdom", AU: "Australia", DE: "Germany", FR: "France", other: "Other" }[profile.country] ?? null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
