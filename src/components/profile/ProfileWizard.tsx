"use client";

import { useState } from "react";
import type { UserProfile, UserPreferences } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepProfile } from "./StepProfile";
import { StepCondition } from "./StepCondition";
import { StepDemographics } from "./StepDemographics";
import { StepMedicalHistory } from "./StepMedicalHistory";
import { StepPrefLocation } from "./StepPrefLocation";
import { StepPrefFinal } from "./StepPrefFinal";
import { StepPrefTreatment } from "./StepPrefTreatment";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const STEPS = [
  { title: "Profile",     description: "Select or create a profile" },
  { title: "Condition",   description: "What are you searching for?" },
  { title: "Demographics", description: "Age, sex & location" },
  { title: "History",     description: "Comorbidities & medications" },
  { title: "Location",    description: "Travel & time limits" },
  { title: "Trial Terms", description: "Placebo tolerance, phase & odds" },
  { title: "Procedures",  description: "Delivery, procedures & notes" },
];

interface Props {
  profiles: UserProfile[];
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  onSwitch: (profile: UserProfile) => void;
  onCreate: (profile: UserProfile) => void;
  onDelete: (id: string) => void;
  onSearch: () => void;
  onSwitchAndSearch: (profile: UserProfile) => void;
  isLoading: boolean;
}

export function ProfileWizard({ profiles, profile, onChange, onSwitch, onCreate, onDelete, onSearch, onSwitchAndSearch, isLoading }: Props) {
  const [step, setStep] = useState(0);

  function update(updates: Partial<UserProfile>) {
    onChange({ ...profile, ...updates });
  }

  function updatePrefs(updates: Partial<UserPreferences>) {
    onChange({ ...profile, preferences: { ...profile.preferences, ...updates } });
  }

  const canProceed = step === 1 ? profile.condition.trim().length > 0 : true;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step + 1} of {STEPS.length}: {STEPS[step].title}
          </span>
          <span className="text-muted-foreground">{STEPS[step].description}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />

        {/* Step pills */}
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`flex-1 text-xs py-1 px-1 rounded transition-colors text-center truncate ${
                i === step
                  ? "bg-primary text-primary-foreground font-medium"
                  : i < step
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">
        {step === 0 && (
          <StepProfile
            profiles={profiles}
            profile={profile}
            onSwitch={(p) => { onSwitch(p); setStep(0); }}
            onCreate={(p) => { onCreate(p); setStep(1); }}
            onDelete={onDelete}
            onChange={update}
            onSwitchAndSearch={onSwitchAndSearch}
            isLoading={isLoading}
          />
        )}
        {step === 1 && <StepCondition profile={profile} onChange={update} />}
        {step === 2 && <StepDemographics profile={profile} onChange={update} />}
        {step === 3 && <StepMedicalHistory profile={profile} onChange={update} />}
        {step === 4 && <StepPrefLocation prefs={profile.preferences} onChange={updatePrefs} />}
        {step === 5 && <StepPrefFinal prefs={profile.preferences} onChange={updatePrefs} />}
        {step === 6 && <StepPrefTreatment prefs={profile.preferences} onChange={updatePrefs} />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <div className="flex items-center gap-2">
            {step === 0 && (
              <Button variant="ghost" onClick={() => setStep(1)}>
                Skip
              </Button>
            )}
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => onSearch()}
            disabled={isLoading || !profile.condition.trim()}
            size="lg"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Searching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find Trials
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
