// ─── User Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string; // unique identifier
  label: string; // e.g. "Mom - Alzheimer's"

  // Step 1 – Condition
  condition: string; // free-text, e.g. "Alzheimer's disease"
  conditionKeywords: string[]; // extra search terms

  // Step 2 – Demographics
  age: number | "";
  sex: "male" | "female" | "other" | "";
  zipCode: string;
  country: string;

  // Step 3 – Medical history
  comorbidities: string[]; // free-text entries
  currentMedications: string[]; // free-text entries
  recentProcedures: string[]; // e.g. "brain surgery 6 months ago"
  notes: string; // disease stage, functional scores, mobility limitations, etc.

  // Starred trials — keyed by condition (lowercase) so stars don't bleed across different searches
  starredTrials: Record<string, string[]>;

  // Medication stability for the target condition
  onConditionMedication: boolean | null; // taking meds specifically for the searched condition
  conditionMedicationStable: boolean | null; // dose/plan unchanged
  conditionMedicationStableDuration: "lt1m" | "1to3m" | "3to6m" | "6plus" | null;

  // Step 4 – Preferences
  preferences: UserPreferences;
}

export interface UserPreferences {
  // Travel
  maxDistanceMiles: number | "";
  willingToFly: boolean;
  usOnly: boolean; // restrict to US sites only
  telehealthAcceptable: boolean;
  maxVisitsPerMonth: number | "";

  // Phase preferences
  phasePreferences: Record<TrialPhase, PreferenceLevel>;

  // Treatment delivery – for each method: "ok" | "prefer_not" | "dealbreaker"
  deliveryPreferences: Record<DeliveryMethod, PreferenceLevel>;

  // Procedures / testing burden
  procedurePreferences: Record<ProcedureType, PreferenceLevel>;

  // Placebo
  placeboAcceptable: "yes" | "prefer_not" | "dealbreaker";
  // What is the minimum share of participants receiving the actual drug?
  // e.g. in a 2:1 trial, 67% get the drug. Set to 50 to exclude 1:1 trials if desired.
  minActiveTreatmentSharePct: number;

  // Time commitment
  maxTrialDurationMonths: number | "";
  maxVisitHours: number | "";

  // Free-form
  mustHave: string; // critical requirements not covered above
  niceToHave: string; // soft positives
  dealbreakers: string; // additional hard noes not covered above
}

export type TrialPhase = "phase1" | "phase2" | "phase3" | "phase4" | "na";

export const PHASE_LABELS: Record<TrialPhase, string> = {
  phase1: "Phase 1 — First in humans, small safety study",
  phase2: "Phase 2 — Efficacy + safety, medium-sized",
  phase3: "Phase 3 — Large confirmatory trial, closest to approval",
  phase4: "Phase 4 — Post-market study, drug already approved",
  na: "Phase N/A — Expanded access or unlisted phase",
};

export type PreferenceLevel = "ok" | "prefer_not" | "dealbreaker";

export type DeliveryMethod =
  | "oral"
  | "iv_infusion"
  | "subcutaneous_injection"
  | "im_injection"
  | "nasal"
  | "implant"
  | "device"
  | "topical"
  | "transdermal";

export type ProcedureType =
  | "blood_draw"
  | "mri"
  | "pet_scan"
  | "lumbar_puncture"
  | "cognitive_testing"
  | "genetic_testing"
  | "biopsy"
  | "ecg"
  | "urine_sample"
  | "eye_exam";

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  oral: "Oral (pill/tablet/liquid)",
  iv_infusion: "IV infusion",
  subcutaneous_injection: "Subcutaneous injection (under skin)",
  im_injection: "Intramuscular injection",
  nasal: "Nasal spray / intranasal",
  implant: "Implant",
  device: "Medical device / wearable",
  topical: "Topical (cream/patch)",
  transdermal: "Transdermal patch",
};

export const PROCEDURE_LABELS: Record<ProcedureType, string> = {
  blood_draw: "Blood draws",
  mri: "MRI scans",
  pet_scan: "PET scans",
  lumbar_puncture: "Lumbar puncture (spinal tap / CSF)",
  cognitive_testing: "Cognitive / neuropsych testing",
  genetic_testing: "Genetic testing",
  biopsy: "Tissue biopsy",
  ecg: "ECG / EKG (heart monitor)",
  urine_sample: "Urine samples",
  eye_exam: "Eye / retinal exams",
};

// ─── ClinicalTrials.gov API types ─────────────────────────────────────────────

export interface CTGStudy {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle: string;
      officialTitle?: string;
      organization?: { fullName?: string };
    };
    statusModule: {
      overallStatus: string;
      startDateStruct?: { date: string };
      primaryCompletionDateStruct?: { date: string };
      studyFirstSubmitDate?: string;
    };
    descriptionModule?: {
      briefSummary?: string;
      detailedDescription?: string;
    };
    conditionsModule?: {
      conditions?: string[];
      keywords?: string[];
    };
    designModule?: {
      studyType?: string;
      phases?: string[];
      enrollmentInfo?: { count?: number; type?: string };
      designInfo?: {
        allocation?: string; // "RANDOMIZED" | "NON_RANDOMIZED"
        interventionModel?: string;
        primaryPurpose?: string;
        maskingInfo?: { masking?: string }; // "NONE" (open label) | "SINGLE" | "DOUBLE" etc.
      };
    };
    armsInterventionsModule?: {
      armGroups?: Array<{
        label: string;
        type?: string; // "EXPERIMENTAL" | "PLACEBO_COMPARATOR" | "ACTIVE_COMPARATOR"
        interventionNames?: string[];
      }>;
      interventions?: Array<{
        type?: string;
        name?: string;
        description?: string;
        otherNames?: string[];
      }>;
    };
    eligibilityModule?: {
      eligibilityCriteria?: string; // free-text inclusion/exclusion
      healthyVolunteers?: boolean;
      sex?: string; // "ALL" | "MALE" | "FEMALE"
      minimumAge?: string; // e.g. "50 Years"
      maximumAge?: string;
      stdAges?: string[];
    };
    contactsLocationsModule?: {
      centralContacts?: Array<{
        name?: string;
        role?: string;
        phone?: string;
        phoneExt?: string;
        email?: string;
      }>;
      overallOfficials?: Array<{
        name?: string;
        affiliation?: string;
        role?: string;
      }>;
      locations?: Array<{
        facility?: string;
        status?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        geoPoint?: { lat: number; lon: number };
        contacts?: Array<{
          name?: string;
          role?: string;
          phone?: string;
          email?: string;
        }>;
      }>;
    };
    referencesModule?: {
      references?: Array<{ pmid?: string; type?: string; citation?: string }>;
    };
    sponsorCollaboratorsModule?: {
      leadSponsor?: { name?: string; class?: string };
    };
  };
  derivedSection?: {
    miscInfoModule?: { versionHolder?: string };
  };
}

// ─── Ranked Trial (our enriched model) ───────────────────────────────────────

export interface RankedTrial {
  study: CTGStudy;

  // Computed scores (0–100, or null if not determinable)
  scores: {
    eligibility: number; // how likely patient qualifies
    treatmentAccess: number; // odds of getting active treatment
    preferenceMatch: number; // how well it matches preferences
    composite: number; // weighted final score
  };

  // Per-dimension breakdown for display
  dimensions: ScoreDimension[];

  // Which dealbreakers fired (if any)
  dealbreakersTriggered: DealbreakersTriggered[];

  // Convenience extractions
  extracted: ExtractedTrialData;
}

export interface ScoreDimension {
  id: string;
  label: string;
  score: number; // 0–100
  status: "pass" | "warn" | "fail"; // green / yellow / red
  reason?: string; // human-readable explanation
}

export interface DealbreakersTriggered {
  category: string;
  reason: string;
}

// ─── AI scoring output ────────────────────────────────────────────────────────

export interface AITrialScore {
  nctId: string;
  relevanceScore: number;          // 0-1: how relevant to the patient's condition
  comorbidityConflicts: string[];  // comorbidities that conflict with exclusion criteria
  medicationConflicts: string[];   // medications that conflict with exclusion criteria
  dealbreakersFound: string[];     // semantic dealbreaker issues found in trial
  mustHavesFound: string[];        // must-have features found in trial
  plainSummary: string;            // plain-English 1-2 sentence summary
  hypothesis?: string;             // why this treatment might work (1 sentence)
  visitSchedule?: string;          // e.g. "Monthly IV infusions, in-clinic visits every 4 weeks"
}

export interface ExtractedTrialData {
  phase: string;
  status: string;
  briefTitle: string;
  nctId: string;
  url: string;
  conditions: string[];
  summary: string;
  aiSummary?: string;              // AI-generated plain-English summary
  aiHypothesis?: string;           // AI-generated hypothesis for why treatment might work
  aiVisitSchedule?: string;        // AI-extracted visit schedule description
  interventionNames: string[];     // drug/device/treatment names being tested
  locations: ExtractedLocation[];
  closestLocationMiles: number | null;
  closestLocationDrivingHours: number | null; // estimated one-way drive time
  conditionRelevanceScore: number; // 0-1, how closely does the trial target the searched condition
  contacts: ExtractedContact[];
  deliveryMethods: DeliveryMethod[];
  procedures: ProcedureType[];
  randomizationRatio: string | null; // e.g. "1:1" or "2:1"
  treatmentArmCount: number;
  placeboArmCount: number;
  treatmentProbabilityPct: number | null;
  isOpenLabel: boolean;
  estimatedDurationMonths: number | null;
  enrollmentDeadline: string | null;
  totalEnrollment: number | null;
  sponsor: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  minAgeYears: number | null;
  maxAgeYears: number | null;
  sexEligibility: string;
}

export interface ExtractedLocation {
  facility: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  distanceMiles: number | null;
  isRecruiting: boolean;
  contacts: ExtractedContact[];
}

export interface ExtractedContact {
  name: string;
  role: string;
  phone: string;
  email: string;
}

// ─── Default profile ──────────────────────────────────────────────────────────

export function defaultPreferences(): UserPreferences {
  const deliveryPreferences = {} as Record<DeliveryMethod, PreferenceLevel>;
  (Object.keys(DELIVERY_METHOD_LABELS) as DeliveryMethod[]).forEach(
    (k) => (deliveryPreferences[k] = "ok")
  );

  const procedurePreferences = {} as Record<ProcedureType, PreferenceLevel>;
  (Object.keys(PROCEDURE_LABELS) as ProcedureType[]).forEach(
    (k) => (procedurePreferences[k] = "ok")
  );

  const phasePreferences = {} as Record<TrialPhase, PreferenceLevel>;
  (Object.keys(PHASE_LABELS) as TrialPhase[]).forEach(
    (k) => (phasePreferences[k] = "ok")
  );

  return {
    maxDistanceMiles: 100,
    willingToFly: false,
    usOnly: true,
    telehealthAcceptable: true,
    maxVisitsPerMonth: "",
    phasePreferences,
    deliveryPreferences,
    procedurePreferences,
    placeboAcceptable: "prefer_not",
    minActiveTreatmentSharePct: 0,
    maxTrialDurationMonths: "",
    maxVisitHours: "",
    mustHave: "",
    niceToHave: "",
    dealbreakers: "",
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function defaultProfile(): UserProfile {
  return {
    id: generateId(),
    label: "",
    condition: "",
    conditionKeywords: [],
    age: "",
    sex: "",
    zipCode: "",
    country: "US",
    comorbidities: [],
    currentMedications: [],
    recentProcedures: [],
    notes: "",
    starredTrials: {},
    onConditionMedication: null,
    conditionMedicationStable: null,
    conditionMedicationStableDuration: null,
    preferences: defaultPreferences(),
  };
}
