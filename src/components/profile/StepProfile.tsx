"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/lib/types";
import { defaultProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { loadTrialSnapshot } from "@/lib/storage";
import { UserCircle, Plus, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  profiles: UserProfile[];
  profile: UserProfile;
  onSwitch: (profile: UserProfile) => void;
  onCreate: (profile: UserProfile) => void;
  onDelete: (id: string) => void;
  onChange: (updates: Partial<UserProfile>) => void;
  onSwitchAndSearch: (profile: UserProfile) => void;
  isLoading: boolean;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function StepProfile({ profiles, profile, onSwitch, onCreate, onDelete, onChange, onSwitchAndSearch, isLoading }: Props) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [profilesWithResults, setProfilesWithResults] = useState<Set<string>>(new Set());
  const [lastCheckedTimes, setLastCheckedTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const withResults = new Set<string>();
    const times: Record<string, string> = {};
    for (const p of profiles) {
      if (p.condition) {
        const snap = loadTrialSnapshot(p.condition);
        if (snap) {
          withResults.add(p.id);
          times[p.id] = snap.searchedAt;
        }
      }
    }
    setProfilesWithResults(withResults);
    setLastCheckedTimes(times);
  }, [profiles]);

  function handleCreate() {
    onCreate(defaultProfile());
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Who are we searching for?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Completely optional — no account, no sign-up, nothing leaves your browser.
          Naming a profile just makes it easier to pick up where you left off if you search for more than one person.
          You can skip straight to the search if you prefer.
        </p>
      </div>

      {/* Existing profiles */}
      {profiles.length > 0 && (
        <div className="space-y-2">
          <Label>Saved profiles</Label>
          <div className="flex flex-col gap-2">
            {profiles.map((p) => {
              const hasPriorResults = profilesWithResults.has(p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
                    p.id === profile.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSwitch(p)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <UserCircle className={cn("h-5 w-5 shrink-0", p.id === profile.id ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-sm truncate", p.id === profile.id ? "text-foreground" : "text-muted-foreground")}>
                        {p.label || p.condition || "Unnamed profile"}
                      </p>
                      {p.condition && p.label && (
                        <p className="text-xs text-muted-foreground truncate">{p.condition}</p>
                      )}
                    </div>
                    {p.id === profile.id && (
                      <span className="text-xs text-primary font-medium shrink-0">Active</span>
                    )}
                  </button>
                  {hasPriorResults && (
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-7"
                        disabled={isLoading}
                        onClick={() => onSwitchAndSearch(p)}
                      >
                        {isLoading && p.id === profile.id ? (
                          <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Search className="h-3 w-3" />
                        )}
                        Get updated results
                      </Button>
                      {lastCheckedTimes[p.id] && (
                        <span className="text-[10px] text-muted-foreground/70">
                          Last checked {timeAgo(lastCheckedTimes[p.id])}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCreate}>
          <Plus className="h-3.5 w-3.5" />
          New profile
        </Button>
        {profiles.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete active
          </Button>
        )}
      </div>

      {/* Name the active profile */}
      <div className="space-y-2 pt-2 border-t">
        <Label htmlFor="label">Profile nickname <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          id="label"
          value={profile.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. Mom, Dad, Myself…"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Only used to tell profiles apart in your browser. Never stored anywhere else.
        </p>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>&ldquo;{profile.label || profile.condition || "This profile"}&rdquo;</strong> will be permanently deleted —
              including all settings, search preferences, and starred trials saved to it.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(profile.id)}
            >
              Yes, delete it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
