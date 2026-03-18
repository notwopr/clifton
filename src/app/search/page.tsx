"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserProfile, RankedTrial } from "@/lib/types";
import { loadProfile, saveProfile, saveTrialSnapshot, loadTrialSnapshot } from "@/lib/storage";
import { rankTrials } from "@/lib/ranking";
import { resolveZip } from "@/lib/eligibility";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { Card, CardContent } from "@/components/ui/card";

type View = "wizard" | "results";

const AUTO_CHECK_HOURS = 24 * 7; // 1 week — clinical trials don't update that frequently

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function SearchPage() {
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
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoChecked = useRef(false);

  // Load profile from localStorage on mount, and read last check time
  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    if (p.condition) {
      const snap = loadTrialSnapshot(p.condition);
      if (snap) setLastCheckTime(snap.searchedAt);
    }
  }, []);

  // Persist profile changes and flash "Saved" indicator
  function updateProfile(p: UserProfile) {
    setProfile(p);
    saveProfile(p);
    setSavedFlash(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSavedFlash(false), 2000);
  }

  const handleSearch = useCallback(async () => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);

    try {
      // Resolve zip to coordinates for distance calculation
      let userCoords: { lat: number; lon: number } | null = null;
      if (profile.zipCode && profile.country) {
        userCoords = await resolveZip(
          profile.zipCode,
          profile.country === "other" ? "us" : profile.country.toLowerCase()
        );
      }

      // Fetch trials from our API route (which proxies ClinicalTrials.gov)
      const keywordsStr = profile.conditionKeywords.join(", ");
      const builtQuery = keywordsStr
        ? `${profile.condition}, ${keywordsStr}`
        : profile.condition;
      setSearchQuery(builtQuery);

      const params = new URLSearchParams({
        condition: profile.condition,
        keywords: profile.conditionKeywords.join(","),
        maxResults: "200",
      });
      const res = await fetch(`/api/trials?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch trials");
      }
      const data = await res.json();

      // Rank results
      const ranked = await rankTrials(data.studies ?? [], profile, userCoords);

      // Compare to previous snapshot to detect new trials
      const allCurrentIds = ranked.map((t) => t.extracted.nctId);
      const prevSnapshot = loadTrialSnapshot(profile.condition);
      if (prevSnapshot) {
        const prevIds = new Set(prevSnapshot.nctIds);
        const newIds = new Set(allCurrentIds.filter((id) => !prevIds.has(id)));
        setNewNctIds(newIds);
        setLastSearchedAt(prevSnapshot.searchedAt);
      } else {
        setNewNctIds(new Set());
        setLastSearchedAt(null);
      }
      // Save the new snapshot
      saveTrialSnapshot(profile.condition, allCurrentIds);
      const now = new Date().toISOString();
      setCurrentSearchedAt(now);
      setLastCheckTime(now);

      setTrials(ranked);
      setTotalFromApi(data.totalCount ?? ranked.length);
      setView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  // Auto-check on load if last snapshot is stale (runs after handleSearch is defined)
  useEffect(() => {
    if (!profile?.condition || autoChecked.current) return;
    const snap = loadTrialSnapshot(profile.condition);
    if (!snap) return;
    const hoursSince = (Date.now() - new Date(snap.searchedAt).getTime()) / 1000 / 3600;
    if (hoursSince >= AUTO_CHECK_HOURS) {
      autoChecked.current = true;
      handleSearch();
    }
  }, [profile, handleSearch]);

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
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-2 h-5">
            {lastCheckTime && !savedFlash && (
              <span className="text-xs text-muted-foreground">
                Last checked: {timeAgo(lastCheckTime)}
              </span>
            )}
            {savedFlash && (
              <span className="text-xs text-muted-foreground animate-in fade-in">
                ✓ Profile auto-saved to your browser
              </span>
            )}
            {!lastCheckTime && !savedFlash && <span />}
          </div>
          <Card>
            <CardContent className="pt-6">
              <ProfileWizard
                profile={profile}
                onChange={updateProfile}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
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
          onRefine={() => setView("wizard")}
        />
      )}
    </div>
  );
}
