import type { UserProfile } from "./types";
import { defaultProfile } from "./types";

const STORAGE_KEY = "clifton_profile";

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // storage full or unavailable
  }
}

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    // Merge with defaults so new fields added in future versions are populated
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
  } catch {
    return defaultProfile();
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

const SNAPSHOT_KEY = "clifton_snapshot";

interface TrialSnapshot {
  condition: string;
  nctIds: string[];
  searchedAt: string; // ISO date string
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
