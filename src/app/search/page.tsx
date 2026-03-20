"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserProfile, RankedTrial } from "@/lib/types";
import {
  loadActiveProfile,
  loadAllProfiles,
  saveProfile,
  saveActiveProfileId,
  deleteProfile,
  saveTrialSnapshot,
  loadTrialSnapshot,
} from "@/lib/storage";
import { rankTrials } from "@/lib/ranking";
import { resolveZip } from "@/lib/eligibility";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { Card, CardContent } from "@/components/ui/card";

type View = "wizard" | "results";

const AUTO_CHECK_HOURS = 24 * 7;

export default function SearchPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<View>("wizard");
  const [trials, setTrials] = useState<RankedTrial[]>([]);
  const [totalFromApi, setTotalFromApi] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [newNctIds, setNewNctIds] = useState<Set<string>>(new Set());
  const [lastSearchedAt, setLastSearchedAt] = useState<string | null>(null);
  const [currentSearchedAt, setCurrentSearchedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoChecked = useRef(false);
  const profileRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    const all = loadAllProfiles();
    const active = loadActiveProfile();
    setProfiles(all.length > 0 ? all : [active]);
    profileRef.current = active;
    setProfile(active);
  }, []);

  function updateProfile(p: UserProfile) {
    profileRef.current = p;
    setProfile(p);
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    saveProfile(p);
    setSavedFlash(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleSwitch(p: UserProfile) {
    profileRef.current = p;
    setProfile(p);
    saveActiveProfileId(p.id);
    setView("wizard");
    setTrials([]);
    autoChecked.current = false;
  }

  function handleSwitchAndSearch(p: UserProfile) {
    setProfile(p);
    saveActiveProfileId(p.id);
    setTrials([]);
    autoChecked.current = false;
    handleSearch(p);
  }

  function handleCreate(p: UserProfile) {
    saveProfile(p);
    saveActiveProfileId(p.id);
    setProfiles((prev) => [...prev, p]);
    profileRef.current = p;
    setProfile(p);
    setView("wizard");
    setTrials([]);
    autoChecked.current = false;
  }

  function handleDelete(id: string) {
    const next = deleteProfile(id);
    const all = loadAllProfiles();
    setProfiles(all);
    profileRef.current = next;
    setProfile(next);
    setView("wizard");
    setTrials([]);
    autoChecked.current = false;
  }

  const handleSearch = useCallback(async (overrideProfile?: UserProfile) => {
    const p = overrideProfile ?? profileRef.current;
if (!p) return;
    setIsLoading(true);
    setError(null);

    try {
      let userCoords: { lat: number; lon: number } | null = null;
      if (p.zipCode && p.country) {
        userCoords = await resolveZip(
          p.zipCode,
          p.country === "other" ? "us" : p.country.toLowerCase()
        );
      }

      const condition = p.condition?.trim() ?? "";
      if (!condition) {
        setError("Please enter a condition to search for.");
        setIsLoading(false);
        return;
      }

      const keywords = p.conditionKeywords ?? [];
      const keywordsStr = keywords.join(", ");
      const builtQuery = keywordsStr ? `${condition}, ${keywordsStr}` : condition;
      setSearchQuery(builtQuery);

      const params = new URLSearchParams({
        condition,
        keywords: keywords.join(","),
        maxResults: "200",
      });
      const res = await fetch(`/api/trials?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch trials");
      }
      const data = await res.json();

      const ranked = await rankTrials(data.studies ?? [], p, userCoords);
      const allCurrentIds = ranked.map((t) => t.extracted.nctId);
      const prevSnapshot = loadTrialSnapshot(p.condition);
      if (prevSnapshot) {
        const prevIds = new Set(prevSnapshot.nctIds);
        setNewNctIds(new Set(allCurrentIds.filter((id) => !prevIds.has(id))));
        setLastSearchedAt(prevSnapshot.searchedAt);
      } else {
        setNewNctIds(new Set());
        setLastSearchedAt(null);
      }
      saveTrialSnapshot(p.condition, allCurrentIds);
      setCurrentSearchedAt(new Date().toISOString());
      setTrials(ranked);
      setTotalFromApi(data.totalCount ?? ranked.length);
      setView("results");
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!profile?.condition || autoChecked.current) return;
    const snap = loadTrialSnapshot(profile.condition);
    if (!snap) return;
    const hoursSince = (Date.now() - new Date(snap.searchedAt).getTime()) / 1000 / 3600;
    if (hoursSince >= AUTO_CHECK_HOURS) {
      autoChecked.current = true;
      handleSearch();
    }
  }, [profile, handleSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {view === "wizard" ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-5 flex items-center justify-end">
            {savedFlash && (
              <span className="text-xs text-muted-foreground animate-in fade-in">✓ Saved</span>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              <ProfileWizard
                profiles={profiles}
                profile={profile}
                onChange={updateProfile}
                onSwitch={handleSwitch}
                onCreate={handleCreate}
                onDelete={handleDelete}
                onSearch={handleSearch}
                onSwitchAndSearch={handleSwitchAndSearch}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              {error}
            </div>
          )}
        </div>
      ) : (
        <ResultsPanel
          trials={trials}
          totalFromApi={totalFromApi}
          conditionLabel={profile.condition}
          searchQuery={searchQuery}
          newNctIds={newNctIds}
          lastSearchedAt={lastSearchedAt}
          currentSearchedAt={currentSearchedAt}
          starredNctIds={profile.starredTrials?.[profile.condition.toLowerCase().trim()] ?? []}
          onToggleStar={(nctId) => {
            const conditionKey = profile.condition.toLowerCase().trim();
            const current = profile.starredTrials?.[conditionKey] ?? [];
            const next = current.includes(nctId)
              ? current.filter((id) => id !== nctId)
              : [...current, nctId];
            updateProfile({ ...profile, starredTrials: { ...profile.starredTrials, [conditionKey]: next } });
          }}
          onRefine={() => setView("wizard")}
        />
      )}
    </div>
  );
}
