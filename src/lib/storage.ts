import type { UserProfile } from "./types";
import { defaultProfile } from "./types";

const PROFILES_KEY = "clifton_profiles";
const ACTIVE_KEY = "clifton_active_profile";
const LEGACY_KEY = "clifton_profile";

// ─── Multi-profile storage ────────────────────────────────────────────────────

export function loadAllProfiles(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    // Migrate legacy single-profile format if needed
    const legacy = localStorage.getItem(LEGACY_KEY);
    const existing = localStorage.getItem(PROFILES_KEY);
    if (!existing && legacy) {
      const parsed = JSON.parse(legacy) as Partial<UserProfile>;
      const migrated = mergeWithDefaults({ id: "legacy", ...parsed });
      localStorage.setItem(PROFILES_KEY, JSON.stringify([migrated]));
      localStorage.setItem(ACTIVE_KEY, migrated.id);
      localStorage.removeItem(LEGACY_KEY);
      return [migrated];
    }
    if (!existing) return [];
    const parsed = JSON.parse(existing) as Partial<UserProfile>[];
    return parsed.map(mergeWithDefaults);
  } catch {
    return [];
  }
}

export function saveAllProfiles(profiles: UserProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {}
}

export function loadActiveProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveProfileId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
}

export function loadActiveProfile(): UserProfile {
  const all = loadAllProfiles();
  if (all.length === 0) {
    const fresh = defaultProfile();
    saveAllProfiles([fresh]);
    saveActiveProfileId(fresh.id);
    return fresh;
  }
  const activeId = loadActiveProfileId();
  const found = all.find((p) => p.id === activeId);
  return found ?? all[0];
}

export function saveProfile(profile: UserProfile): void {
  const all = loadAllProfiles();
  const idx = all.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    all[idx] = profile;
  } else {
    all.push(profile);
  }
  saveAllProfiles(all);
  saveActiveProfileId(profile.id);
}

export function deleteProfile(id: string): UserProfile | null {
  let all = loadAllProfiles();
  all = all.filter((p) => p.id !== id);
  if (all.length === 0) {
    const fresh = defaultProfile();
    all = [fresh];
  }
  saveAllProfiles(all);
  const activeId = loadActiveProfileId();
  if (activeId === id) {
    saveActiveProfileId(all[0].id);
  }
  return all.find((p) => p.id === loadActiveProfileId()) ?? all[0];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mergeWithDefaults(parsed: Partial<UserProfile>): UserProfile {
  const defaults = defaultProfile();
  return {
    ...defaults,
    ...parsed,
    preferences: {
      ...defaults.preferences,
      ...(parsed.preferences ?? {}),
      deliveryPreferences: {
        ...defaults.preferences.deliveryPreferences,
        ...(parsed.preferences?.deliveryPreferences ?? {}),
      },
      procedurePreferences: {
        ...defaults.preferences.procedurePreferences,
        ...(parsed.preferences?.procedurePreferences ?? {}),
      },
    },
  };
}

// ─── Legacy single-profile helpers (kept for compatibility) ──────────────────

export function loadProfile(): UserProfile {
  return loadActiveProfile();
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILES_KEY);
  localStorage.removeItem(ACTIVE_KEY);
}

// ─── Trial snapshots ──────────────────────────────────────────────────────────

const SNAPSHOT_KEY = "clifton_snapshot";

interface TrialSnapshot {
  condition: string;
  nctIds: string[];
  searchedAt: string;
}

export function saveTrialSnapshot(condition: string, nctIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadAllSnapshots();
    const conditionKey = condition.toLowerCase().trim();
    existing[conditionKey] = { condition, nctIds, searchedAt: new Date().toISOString() };
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(existing));
  } catch {}
}

export function loadTrialSnapshot(condition: string): TrialSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const all = loadAllSnapshots();
    return all[condition.toLowerCase().trim()] ?? null;
  } catch {
    return null;
  }
}

function loadAllSnapshots(): Record<string, TrialSnapshot> {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
