import type { CTGStudy } from "./types";

const CTG_BASE = "https://clinicaltrials.gov/api/v2/studies";

// Fields we actually need — keeps response payload small
const FIELDS = [
  "protocolSection.identificationModule",
  "protocolSection.statusModule",
  "protocolSection.descriptionModule",
  "protocolSection.conditionsModule",
  "protocolSection.designModule",
  "protocolSection.armsInterventionsModule",
  "protocolSection.eligibilityModule",
  "protocolSection.contactsLocationsModule",
  "protocolSection.sponsorCollaboratorsModule",
].join(",");

export interface FetchTrialsOptions {
  condition: string;
  keywords?: string[];
  maxResults?: number;
}

export interface FetchTrialsResult {
  studies: CTGStudy[];
  totalCount: number;
  nextPageToken?: string;
}

export async function fetchTrials(
  opts: FetchTrialsOptions,
  signal?: AbortSignal
): Promise<FetchTrialsResult> {
  const params = new URLSearchParams();

  // Build condition query — combine condition + optional keywords
  const queryTerms = [opts.condition, ...(opts.keywords ?? [])].filter(Boolean);
  params.set("query.cond", queryTerms.join(" OR "));

  // Only recruiting studies
  params.set("filter.overallStatus", "RECRUITING");

  // Interventional only — we're looking for therapy trials, not observational studies
  // Note: aggFilters uses short codes: int=Interventional, obs=Observational, exp=Expanded Access
  params.set("aggFilters", "studyType:int");

  params.set("fields", FIELDS);
  params.set("pageSize", String(Math.min(opts.maxResults ?? 100, 1000)));
  params.set("format", "json");

  const url = `${CTG_BASE}?${params.toString()}`;

  const res = await fetch(url, { signal, next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`ClinicalTrials.gov API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    studies: (data.studies as CTGStudy[]) ?? [],
    totalCount: data.totalCount ?? 0,
    nextPageToken: data.nextPageToken,
  };
}

// Fetch a single study by NCT ID
export async function fetchStudy(nctId: string): Promise<CTGStudy | null> {
  const url = `${CTG_BASE}/${nctId}?fields=${FIELDS}&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return (data as CTGStudy) ?? null;
}
