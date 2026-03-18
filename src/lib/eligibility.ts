/**
 * Parses ClinicalTrials.gov eligibility criteria text and extracts
 * structured information for the ranking engine.
 *
 * Criteria text is typically formatted as:
 *   "Inclusion Criteria:\n\n* criterion 1\n* criterion 2\n\nExclusion Criteria:\n\n* criterion A"
 */

import type {
  CTGStudy,
  DeliveryMethod,
  ExtractedTrialData,
  ExtractedContact,
  ExtractedLocation,
  ProcedureType,
} from "./types";

// ─── Parse age string from CTG (e.g. "50 Years", "18 Months") ────────────────

export function parseAgeToYears(ageStr: string | undefined): number | null {
  if (!ageStr) return null;
  const m = ageStr.match(/(\d+(?:\.\d+)?)\s*(year|month|week|day)/i);
  if (!m) return null;
  const val = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith("year")) return val;
  if (unit.startsWith("month")) return val / 12;
  if (unit.startsWith("week")) return val / 52;
  if (unit.startsWith("day")) return val / 365;
  return null;
}

// ─── Split criteria text into inclusion / exclusion lists ─────────────────────

export function splitCriteria(text: string): {
  inclusion: string[];
  exclusion: string[];
} {
  const inclusion: string[] = [];
  const exclusion: string[] = [];

  // Normalise
  const norm = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const inclMatch = norm.match(/inclusion criteria[:\s]*([\s\S]*?)(?:exclusion criteria|$)/i);
  const exclMatch = norm.match(/exclusion criteria[:\s]*([\s\S]*?)$/i);

  const parse = (block: string): string[] =>
    block
      .split(/\n/)
      .map((l) => l.replace(/^[\s\-\*\d\.]+/, "").trim())
      .filter((l) => l.length > 10);

  if (inclMatch) inclusion.push(...parse(inclMatch[1]));
  if (exclMatch) exclusion.push(...parse(exclMatch[1]));

  return { inclusion, exclusion };
}

// ─── Delivery method detection ────────────────────────────────────────────────

const DELIVERY_PATTERNS: Array<[DeliveryMethod, RegExp]> = [
  ["oral", /\b(oral|tablet|capsule|pill|drink|swallow|by mouth|po\b)/i],
  ["iv_infusion", /\b(intravenous|iv infusion|iv admin|infusion)\b/i],
  [
    "subcutaneous_injection",
    /\b(subcutaneous|sub-?cutaneous|subq|sc injection|under.{0,10}skin)\b/i,
  ],
  ["im_injection", /\b(intramuscular|im injection|im dose)\b/i],
  ["nasal", /\b(intranasal|nasal spray|nasal administration|nasal drop)\b/i],
  ["implant", /\b(implant|implantable|surgically inserted)\b/i],
  ["device", /\b(device|wearable|transcranial|tDCS|TMS|ultrasound treatment)\b/i],
  ["topical", /\b(topical|cream|gel|ointment|lotion applied)\b/i],
  ["transdermal", /\b(transdermal|patch|skin patch)\b/i],
];

export function detectDeliveryMethods(text: string): DeliveryMethod[] {
  const found = new Set<DeliveryMethod>();
  for (const [method, re] of DELIVERY_PATTERNS) {
    if (re.test(text)) found.add(method);
  }
  return Array.from(found);
}

// ─── Procedure detection ──────────────────────────────────────────────────────

const PROCEDURE_PATTERNS: Array<[ProcedureType, RegExp]> = [
  ["blood_draw", /\b(blood draw|blood sample|venipuncture|phlebotomy|blood collect)\b/i],
  ["mri", /\b(MRI|magnetic resonance imaging|brain scan)\b/i],
  ["pet_scan", /\b(PET scan|positron emission|amyloid PET|tau PET|FDG.PET)\b/i],
  [
    "lumbar_puncture",
    /\b(lumbar puncture|spinal tap|cerebrospinal fluid|CSF collect|CSF sample)\b/i,
  ],
  [
    "cognitive_testing",
    /\b(neuropsych|cognitive test|MMSE|MOCA|ADAS.cog|cognitive assessment|neurological test)\b/i,
  ],
  ["genetic_testing", /\b(genetic test|genotyp|APOE|DNA sample|genetic screening)\b/i],
  ["biopsy", /\b(biopsy|tissue sample|skin punch|bone marrow)\b/i],
  ["ecg", /\b(ECG|EKG|electrocardiogram|cardiac monitor)\b/i],
  ["urine_sample", /\b(urine sample|urinalysis|urine collect)\b/i],
  [
    "eye_exam",
    /\b(eye exam|ophthalmol|retinal|optical coherence|OCT scan|vision test)\b/i,
  ],
];

export function detectProcedures(text: string): ProcedureType[] {
  const found = new Set<ProcedureType>();
  for (const [proc, re] of PROCEDURE_PATTERNS) {
    if (re.test(text)) found.add(proc);
  }
  return Array.from(found);
}

// ─── Placebo / randomization parsing ─────────────────────────────────────────

/**
 * Returns treatment probability 0-100 based on arm structure.
 * e.g., 2 treatment arms vs 1 placebo → ~67%
 */
export function calcTreatmentProbability(study: CTGStudy): number | null {
  const arms = study.protocolSection?.armsInterventionsModule?.armGroups ?? [];
  if (arms.length === 0) return null;

  const treatmentArms = arms.filter(
    (a) =>
      a.type === "EXPERIMENTAL" ||
      a.type === "ACTIVE_COMPARATOR" ||
      a.type === "OTHER" // some compassionate/open-label use this
  ).length;
  const placeboArms = arms.filter(
    (a) => a.type === "PLACEBO_COMPARATOR" || a.type === "SHAM_COMPARATOR"
  ).length;

  const total = arms.length;
  if (total === 0) return null;

  // Simple equal-weight assumption; refined below if ratio hint found
  const basePct = Math.round((treatmentArms / total) * 100);
  return basePct;
}

export function parseRandomizationRatio(study: CTGStudy): string | null {
  // Try to find ratio hints in brief summary or descriptions
  const text = [
    study.protocolSection?.descriptionModule?.briefSummary ?? "",
    study.protocolSection?.descriptionModule?.detailedDescription ?? "",
  ].join(" ");

  const m = text.match(/\b(\d+)\s*[:/]\s*(\d+)\s*(random|ratio|allocat|assign)/i);
  if (m) return `${m[1]}:${m[2]}`;

  // fallback: derive from arm counts
  const arms = study.protocolSection?.armsInterventionsModule?.armGroups ?? [];
  const tx = arms.filter(
    (a) => a.type === "EXPERIMENTAL" || a.type === "ACTIVE_COMPARATOR"
  ).length;
  const pl = arms.filter(
    (a) => a.type === "PLACEBO_COMPARATOR" || a.type === "SHAM_COMPARATOR"
  ).length;
  if (tx > 0 && pl > 0) return `${tx}:${pl}`;
  return null;
}

// ─── Duration estimation ──────────────────────────────────────────────────────

export function estimateDurationMonths(study: CTGStudy): number | null {
  const start = study.protocolSection?.statusModule?.startDateStruct?.date;
  const end = study.protocolSection?.statusModule?.primaryCompletionDateStruct?.date;
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return months > 0 ? months : null;
}

// ─── Contact extraction ───────────────────────────────────────────────────────

export function extractContacts(study: CTGStudy): ExtractedContact[] {
  const contacts: ExtractedContact[] = [];
  const module = study.protocolSection?.contactsLocationsModule;
  if (!module) return contacts;

  for (const c of module.centralContacts ?? []) {
    contacts.push({
      name: c.name ?? "",
      role: c.role ?? "Contact",
      phone: [c.phone, c.phoneExt].filter(Boolean).join(" ext "),
      email: c.email ?? "",
    });
  }
  return contacts;
}

// ─── Location extraction + distance ──────────────────────────────────────────

// Simple zip → lat/lon lookup using zippopotam.us (free, no key)
const zipCache = new Map<string, { lat: number; lon: number } | null>();

export async function resolveZip(
  zip: string,
  country = "us"
): Promise<{ lat: number; lon: number } | null> {
  const key = `${country}:${zip}`;
  if (zipCache.has(key)) return zipCache.get(key)!;
  try {
    const res = await fetch(`https://api.zippopotam.us/${country}/${zip}`);
    if (!res.ok) { zipCache.set(key, null); return null; }
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) { zipCache.set(key, null); return null; }
    const result = { lat: parseFloat(place.latitude), lon: parseFloat(place.longitude) };
    zipCache.set(key, result);
    return result;
  } catch {
    zipCache.set(key, null);
    return null;
  }
}

// Haversine distance in miles
export function haversineMiles(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function extractLocations(
  study: CTGStudy,
  userCoords: { lat: number; lon: number } | null
): ExtractedLocation[] {
  const rawLocs = study.protocolSection?.contactsLocationsModule?.locations ?? [];
  return rawLocs.map((loc) => {
    let distanceMiles: number | null = null;
    if (userCoords && loc.geoPoint) {
      distanceMiles = Math.round(
        haversineMiles(userCoords.lat, userCoords.lon, loc.geoPoint.lat, loc.geoPoint.lon)
      );
    }
    return {
      facility: loc.facility ?? "",
      city: loc.city ?? "",
      state: loc.state ?? "",
      country: loc.country ?? "",
      zip: loc.zip ?? "",
      distanceMiles,
      isRecruiting: loc.status === "RECRUITING" || !loc.status,
      contacts: (loc.contacts ?? []).map((c) => ({
        name: c.name ?? "",
        role: c.role ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
      })),
    };
  });
}

// ─── Full extraction ──────────────────────────────────────────────────────────

export function extractTrialData(
  study: CTGStudy,
  userCoords: { lat: number; lon: number } | null
): ExtractedTrialData {
  const id = study.protocolSection.identificationModule;
  const status = study.protocolSection.statusModule;
  const desc = study.protocolSection.descriptionModule;
  const design = study.protocolSection.designModule;
  const elig = study.protocolSection.eligibilityModule;
  const arms = study.protocolSection.armsInterventionsModule;
  const sponsor = study.protocolSection.sponsorCollaboratorsModule;

  const nctId = id.nctId;
  const allText = [
    desc?.briefSummary ?? "",
    desc?.detailedDescription ?? "",
    elig?.eligibilityCriteria ?? "",
    ...(arms?.interventions ?? []).map((i) => `${i.name ?? ""} ${i.description ?? ""}`),
  ].join(" ");

  const { inclusion, exclusion } = splitCriteria(elig?.eligibilityCriteria ?? "");

  const locations = extractLocations(study, userCoords);
  const distances = locations
    .map((l) => l.distanceMiles)
    .filter((d): d is number => d !== null);
  const closestLocationMiles = distances.length > 0 ? Math.min(...distances) : null;
  // Rough driving time: assume 55 mph average (accounts for highway + urban mix)
  const closestLocationDrivingHours =
    closestLocationMiles !== null ? Math.round((closestLocationMiles / 55) * 10) / 10 : null;

  const treatmentArms = (arms?.armGroups ?? []).filter(
    (a) => a.type === "EXPERIMENTAL" || a.type === "ACTIVE_COMPARATOR"
  ).length;
  const placeboArms = (arms?.armGroups ?? []).filter(
    (a) => a.type === "PLACEBO_COMPARATOR" || a.type === "SHAM_COMPARATOR"
  ).length;

  const phases = design?.phases ?? [];
  const phaseStr =
    phases.length > 0
      ? phases
          .map((p) => p.replace("PHASE", "Phase ").replace("_", "/"))
          .join(", ")
      : "N/A";

  // Condition relevance: does the trial primarily target what the user searched for?
  // Score 1.0 = direct match in conditions list, 0.5 = in title/summary only, 0.0 = not found
  const userConditionLower = (study as CTGStudy & { _userCondition?: string })._userCondition?.toLowerCase() ?? "";
  const trialConditions = (study.protocolSection.conditionsModule?.conditions ?? []).map(c => c.toLowerCase());
  let conditionRelevanceScore = 0;
  if (userConditionLower) {
    const condWords = userConditionLower.split(/\s+/).filter(w => w.length > 3);
    const conditionMatch = trialConditions.some(c => condWords.some(w => c.includes(w)));
    const titleMatch = condWords.some(w => id.briefTitle.toLowerCase().includes(w));
    conditionRelevanceScore = conditionMatch ? 1.0 : titleMatch ? 0.5 : 0.0;
  } else {
    conditionRelevanceScore = 1.0; // no filter if no condition set
  }

  return {
    nctId,
    url: `https://clinicaltrials.gov/study/${nctId}`,
    briefTitle: id.briefTitle,
    phase: phaseStr,
    status: status.overallStatus,
    conditions: study.protocolSection.conditionsModule?.conditions ?? [],
    summary: desc?.briefSummary ?? "",
    locations,
    closestLocationMiles,
    closestLocationDrivingHours,
    conditionRelevanceScore,
    contacts: extractContacts(study),
    deliveryMethods: detectDeliveryMethods(allText),
    procedures: detectProcedures(allText),
    randomizationRatio: parseRandomizationRatio(study),
    treatmentArmCount: treatmentArms,
    placeboArmCount: placeboArms,
    treatmentProbabilityPct: calcTreatmentProbability(study),
    isOpenLabel:
      design?.designInfo?.maskingInfo?.masking === "NONE" ||
      design?.designInfo?.allocation === "NON_RANDOMIZED",
    estimatedDurationMonths: estimateDurationMonths(study),
    enrollmentDeadline: status.primaryCompletionDateStruct?.date ?? null,
    totalEnrollment: design?.enrollmentInfo?.count ?? null,
    sponsor: sponsor?.leadSponsor?.name ?? "",
    inclusionCriteria: inclusion,
    exclusionCriteria: exclusion,
    minAgeYears: parseAgeToYears(elig?.minimumAge),
    maxAgeYears: parseAgeToYears(elig?.maximumAge),
    sexEligibility: elig?.sex ?? "ALL",
  };
}
