/**
 * Ranking engine — takes a list of CTGStudy objects and a UserProfile,
 * returns RankedTrial[] sorted by composite score descending.
 *
 * Score breakdown (weights):
 *   Eligibility      40%  — age/sex match + comorbidity conflict detection
 *   Treatment access 20%  — phase, treatment probability, open-label bonus
 *   Preference match 40%  — travel, delivery, procedures, time, placebo
 */

import type {
  CTGStudy,
  RankedTrial,
  ScoreDimension,
  DealbreakersTriggered,
  UserProfile,
  PreferenceLevel,
  TrialPhase,
} from "./types";
import { extractTrialData } from "./eligibility";

const W_ELIGIBILITY = 0.4;
const W_TREATMENT = 0.2;
const W_PREFERENCE = 0.4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function penaltyForLevel(level: PreferenceLevel): number {
  if (level === "ok") return 0;
  if (level === "prefer_not") return 25;
  return 100; // dealbreaker — handled separately
}

// Simple keyword matching against criteria text
function textContainsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

// ─── 1. Eligibility score ─────────────────────────────────────────────────────

function scoreEligibility(
  profile: UserProfile,
  extracted: RankedTrial["extracted"]
): { score: number; dimension: ScoreDimension; dealbreakers: DealbreakersTriggered[] } {
  const dealbreakers: DealbreakersTriggered[] = [];
  let penalty = 0;
  const reasons: string[] = [];

  // Age check
  if (typeof profile.age === "number" && profile.age > 0) {
    if (extracted.minAgeYears !== null && profile.age < extracted.minAgeYears) {
      dealbreakers.push({
        category: "Eligibility",
        reason: `Minimum age is ${extracted.minAgeYears} years (patient is ${profile.age})`,
      });
      penalty += 100;
    } else if (extracted.maxAgeYears !== null && profile.age > extracted.maxAgeYears) {
      dealbreakers.push({
        category: "Eligibility",
        reason: `Maximum age is ${extracted.maxAgeYears} years (patient is ${profile.age})`,
      });
      penalty += 100;
    }
  }

  // Sex check
  if (profile.sex && profile.sex !== "other" && extracted.sexEligibility !== "ALL") {
    const trialSex = extracted.sexEligibility.toUpperCase();
    const profileSex = profile.sex.toUpperCase();
    if (trialSex !== "ALL" && trialSex !== profileSex) {
      dealbreakers.push({
        category: "Eligibility",
        reason: `Trial only accepts ${extracted.sexEligibility} participants`,
      });
      penalty += 100;
    }
  }

  // Comorbidity conflict — check exclusion criteria for mentions of patient's conditions
  const exclusionText = extracted.exclusionCriteria.join(" ").toLowerCase();
  const flaggedComorbidities: string[] = [];
  for (const comorbidity of profile.comorbidities) {
    const words = comorbidity.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => exclusionText.includes(w))) {
      flaggedComorbidities.push(comorbidity);
    }
  }
  if (flaggedComorbidities.length > 0) {
    penalty += 30 * flaggedComorbidities.length;
    reasons.push(
      `Possible conflict with exclusion criteria: ${flaggedComorbidities.join(", ")}`
    );
  }

  // Medication conflict check
  const flaggedMeds: string[] = [];
  for (const med of profile.currentMedications) {
    const words = med.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => exclusionText.includes(w))) {
      flaggedMeds.push(med);
    }
  }
  if (flaggedMeds.length > 0) {
    penalty += 20 * flaggedMeds.length;
    reasons.push(`Possible medication conflict: ${flaggedMeds.join(", ")}`);
  }

  const score = clamp(100 - penalty);
  const hasDealbreaker = dealbreakers.length > 0;
  const status =
    hasDealbreaker ? "fail" : score >= 70 ? "pass" : "warn";

  return {
    score,
    dealbreakers,
    dimension: {
      id: "eligibility",
      label: "Eligibility",
      score,
      status,
      reason: hasDealbreaker
        ? dealbreakers[0].reason
        : reasons[0] ?? (score >= 70 ? "Likely eligible" : "Possible eligibility concerns"),
    },
  };
}

// ─── 2. Treatment access score ────────────────────────────────────────────────

function phaseKey(phaseStr: string): TrialPhase {
  if (phaseStr.includes("1")) return "phase1";
  if (phaseStr.includes("2")) return "phase2";
  if (phaseStr.includes("3")) return "phase3";
  if (phaseStr.includes("4")) return "phase4";
  return "na";
}

function scoreTreatmentAccess(
  profile: UserProfile,
  extracted: RankedTrial["extracted"]
): { score: number; dimension: ScoreDimension; dealbreakers: DealbreakersTriggered[] } {
  let score = 70; // baseline
  const reasons: string[] = [];
  const dealbreakers: DealbreakersTriggered[] = [];

  // Phase scoring via user preferences
  const key = phaseKey(extracted.phase);
  const phaseLevel = profile.preferences.phasePreferences?.[key] ?? "ok";
  if (phaseLevel === "dealbreaker") {
    dealbreakers.push({
      category: "Trial Phase",
      reason: `${extracted.phase} trial (you marked this phase as a dealbreaker)`,
    });
    score = 0;
  } else if (phaseLevel === "prefer_not") {
    score -= 25;
    reasons.push(`${extracted.phase} — you prefer to avoid this phase`);
  } else {
    // Default scoring: phase 3 best, phase 1 worst
    if (key === "phase3") { score += 20; reasons.push("Phase 3 — large confirmatory trial"); }
    else if (key === "phase2") { score += 10; reasons.push("Phase 2"); }
    else if (key === "phase1") { score -= 20; reasons.push("Phase 1 — early stage, small safety study"); }
    else if (key === "phase4") { score += 15; reasons.push("Phase 4 — drug already approved"); }
  }

  // Treatment probability: what share of participants get the actual drug?
  if (extracted.treatmentProbabilityPct !== null) {
    if (extracted.treatmentProbabilityPct >= 75) {
      score += 15;
      reasons.push(`~${extracted.treatmentProbabilityPct}% of participants receive the drug`);
    } else if (extracted.treatmentProbabilityPct <= 33) {
      score -= 15;
      reasons.push(`Only ~${extracted.treatmentProbabilityPct}% of participants receive the drug`);
    }
  }

  // Open label bonus
  if (extracted.isOpenLabel) {
    score += 10;
    reasons.push("Open-label — everyone receives the treatment");
  }

  const clamped = clamp(score);
  return {
    score: clamped,
    dealbreakers,
    dimension: {
      id: "treatment_access",
      label: "Treatment Access",
      score: clamped,
      status: clamped >= 70 ? "pass" : clamped >= 40 ? "warn" : "fail",
      reason: reasons[0] ?? "Standard randomized trial",
    },
  };
}

// ─── 3. Preference match score ────────────────────────────────────────────────

function scorePreferences(
  profile: UserProfile,
  extracted: RankedTrial["extracted"]
): { score: number; dimensions: ScoreDimension[]; dealbreakers: DealbreakersTriggered[] } {
  const prefs = profile.preferences;
  const dealbreakers: DealbreakersTriggered[] = [];
  const dimensions: ScoreDimension[] = [];

  // ── US-only filter ──
  if (prefs.usOnly) {
    const hasNonUSOnly = extracted.locations.length > 0 &&
      extracted.locations.every(l => l.country && l.country !== "United States");
    if (hasNonUSOnly) {
      dealbreakers.push({
        category: "Travel",
        reason: "No US trial sites (you selected US sites only)",
      });
    }
  }

  // ── Travel ──
  let travelScore = 100;
  let travelReason = "";
  if (
    typeof prefs.maxDistanceMiles === "number" &&
    extracted.closestLocationMiles !== null
  ) {
    const dist = extracted.closestLocationMiles;
    const hrs = extracted.closestLocationDrivingHours;
    const withinDrive = dist <= prefs.maxDistanceMiles;
    const withinFly = prefs.willingToFly && dist > prefs.maxDistanceMiles;

    if (!withinDrive && !withinFly) {
      dealbreakers.push({
        category: "Travel",
        reason: `Closest site is ${dist} mi away (${hrs !== null ? `~${hrs}h drive, ` : ""}your max: ${prefs.maxDistanceMiles} mi, flying: not willing)`,
      });
      travelScore = 0;
      travelReason = `${dist} mi — exceeds your limit`;
    } else if (withinFly) {
      travelScore = 55; // doable but a burden
      travelReason = `${dist} mi — requires flying (one-way)`;
    } else {
      travelScore = Math.max(30, 100 - Math.round((dist / prefs.maxDistanceMiles) * 30));
      travelReason = hrs !== null
        ? `${dist} mi one-way (~${hrs}h drive)`
        : `${dist} mi away`;
    }
  } else if (extracted.closestLocationMiles === null) {
    travelScore = 60;
    travelReason = "Distance unknown";
  }
  dimensions.push({
    id: "travel",
    label: "Travel",
    score: travelScore,
    status: travelScore >= 70 ? "pass" : travelScore > 0 ? "warn" : "fail",
    reason: travelReason || "Within range",
  });

  // ── Delivery method ──
  let deliveryScore = 100;
  let deliveryReason = "";
  const methodsInTrial = extracted.deliveryMethods;
  if (methodsInTrial.length > 0) {
    let worstPenalty = 0;
    let worstMethod = "";
    for (const method of methodsInTrial) {
      const level = prefs.deliveryPreferences[method] ?? "ok";
      const p = penaltyForLevel(level);
      if (p > worstPenalty) {
        worstPenalty = p;
        worstMethod = method;
      }
      if (level === "dealbreaker") {
        const label = method.replace(/_/g, " ");
        dealbreakers.push({
          category: "Treatment Delivery",
          reason: `Requires ${label} (marked as dealbreaker)`,
        });
      }
    }
    deliveryScore = clamp(100 - worstPenalty);
    deliveryReason = worstMethod
      ? `Involves ${worstMethod.replace(/_/g, " ")}`
      : "Delivery method acceptable";
  } else {
    deliveryScore = 70;
    deliveryReason = "Delivery method not specified";
  }
  dimensions.push({
    id: "delivery",
    label: "Treatment Delivery",
    score: deliveryScore,
    status: deliveryScore >= 70 ? "pass" : deliveryScore > 0 ? "warn" : "fail",
    reason: deliveryReason,
  });

  // ── Procedures ──
  let procedureScore = 100;
  let procedureReason = "";
  const procsInTrial = extracted.procedures;
  if (procsInTrial.length > 0) {
    let worstPenalty = 0;
    let worstProc = "";
    for (const proc of procsInTrial) {
      const level = prefs.procedurePreferences[proc] ?? "ok";
      const p = penaltyForLevel(level);
      if (p > worstPenalty) {
        worstPenalty = p;
        worstProc = proc;
      }
      if (level === "dealbreaker") {
        const label = proc.replace(/_/g, " ");
        dealbreakers.push({
          category: "Procedures & Testing",
          reason: `Requires ${label} (marked as dealbreaker)`,
        });
      }
    }
    procedureScore = clamp(100 - worstPenalty);
    procedureReason = worstProc
      ? `Involves ${worstProc.replace(/_/g, " ")}`
      : "Testing burden acceptable";
  } else {
    procedureScore = 80;
    procedureReason = "Procedures not fully specified";
  }
  dimensions.push({
    id: "procedures",
    label: "Procedures & Testing",
    score: procedureScore,
    status: procedureScore >= 70 ? "pass" : procedureScore > 0 ? "warn" : "fail",
    reason: procedureReason,
  });

  // ── Placebo ──
  let placeboScore = 100;
  let placeboReason = "";
  const hasPlacebo = extracted.placeboArmCount > 0;
  if (hasPlacebo) {
    if (prefs.placeboAcceptable === "dealbreaker") {
      dealbreakers.push({
        category: "Placebo Risk",
        reason: "Trial has a placebo arm (you marked this as a dealbreaker)",
      });
      placeboScore = 0;
      placeboReason = "Placebo arm present — dealbreaker";
    } else if (prefs.placeboAcceptable === "prefer_not") {
      placeboScore = 50;
      placeboReason = "Placebo arm present";
    } else {
      placeboScore = 85;
      placeboReason = "Placebo arm acceptable";
    }
  } else if (extracted.isOpenLabel) {
    placeboScore = 100;
    placeboReason = "Open-label — no placebo";
  } else {
    placeboScore = 80;
    placeboReason = "Placebo status unclear";
  }

  // Minimum active treatment share check
  if (
    prefs.minActiveTreatmentSharePct > 0 &&
    extracted.treatmentProbabilityPct !== null &&
    extracted.treatmentProbabilityPct < prefs.minActiveTreatmentSharePct
  ) {
    dealbreakers.push({
      category: "Placebo Risk",
      reason: `Only ~${extracted.treatmentProbabilityPct}% of participants get the drug (your minimum: ${prefs.minActiveTreatmentSharePct}%)`,
    });
    placeboScore = 0;
    placeboReason = `${extracted.treatmentProbabilityPct}% receive drug — below your minimum`;
  }

  dimensions.push({
    id: "placebo",
    label: "Placebo Risk",
    score: placeboScore,
    status: placeboScore >= 70 ? "pass" : placeboScore > 0 ? "warn" : "fail",
    reason: placeboReason || "Randomization details not available",
  });

  // ── Time commitment ──
  let timeScore = 100;
  let timeReason = "";
  if (
    typeof prefs.maxTrialDurationMonths === "number" &&
    extracted.estimatedDurationMonths !== null &&
    extracted.estimatedDurationMonths > prefs.maxTrialDurationMonths
  ) {
    const over = extracted.estimatedDurationMonths - prefs.maxTrialDurationMonths;
    if (over > 12) {
      dealbreakers.push({
        category: "Time Commitment",
        reason: `Trial duration ~${extracted.estimatedDurationMonths} months (your max: ${prefs.maxTrialDurationMonths} months)`,
      });
      timeScore = 0;
    } else {
      timeScore = clamp(100 - over * 8);
    }
    timeReason = `~${extracted.estimatedDurationMonths} month duration`;
  } else if (extracted.estimatedDurationMonths !== null) {
    timeReason = `~${extracted.estimatedDurationMonths} month duration`;
    timeScore = 90;
  } else {
    timeReason = "Duration not specified";
    timeScore = 70;
  }
  dimensions.push({
    id: "time",
    label: "Time Commitment",
    score: timeScore,
    status: timeScore >= 70 ? "pass" : timeScore > 0 ? "warn" : "fail",
    reason: timeReason,
  });

  // ── Free-form dealbreakers keyword match ──
  if (prefs.dealbreakers.trim()) {
    const userDealbreakers = prefs.dealbreakers
      .split(/[,;\n]+/)
      .map((d) => d.trim())
      .filter(Boolean);
    const trialFullText = [
      extracted.summary,
      extracted.inclusionCriteria.join(" "),
      extracted.exclusionCriteria.join(" "),
    ].join(" ");
    for (const kw of userDealbreakers) {
      if (textContainsAny(trialFullText, [kw])) {
        dealbreakers.push({
          category: "Custom Dealbreaker",
          reason: `Mentions "${kw}" (your custom dealbreaker)`,
        });
      }
    }
  }

  // ── Free-form must-have keyword match (penalise if absent) ──
  let mustHaveScore = 100;
  if (prefs.mustHave.trim()) {
    const mustHaves = prefs.mustHave
      .split(/[,;\n]+/)
      .map((d) => d.trim())
      .filter(Boolean);
    const trialFullText = [
      extracted.summary,
      extracted.inclusionCriteria.join(" "),
    ].join(" ");
    const missingCount = mustHaves.filter(
      (kw) => !textContainsAny(trialFullText, [kw])
    ).length;
    mustHaveScore = clamp(100 - missingCount * 30);
  }

  // Weighted preference score from dimensions
  const rawPrefScore =
    (travelScore * 0.25 +
      deliveryScore * 0.2 +
      procedureScore * 0.2 +
      placeboScore * 0.2 +
      timeScore * 0.15) *
    (mustHaveScore / 100);

  return {
    score: clamp(rawPrefScore),
    dimensions,
    dealbreakers,
  };
}

// ─── Main ranking function ────────────────────────────────────────────────────

export async function rankTrials(
  studies: CTGStudy[],
  profile: UserProfile,
  userCoords: { lat: number; lon: number } | null
): Promise<RankedTrial[]> {
  // Tag each study with the user's condition for relevance scoring
  const taggedStudies = studies.map((s) =>
    Object.assign(s, { _userCondition: profile.condition })
  );

  const ranked: RankedTrial[] = taggedStudies.map((study) => {
    const extracted = extractTrialData(study, userCoords);

    const eligResult = scoreEligibility(profile, extracted);
    const treatResult = scoreTreatmentAccess(profile, extracted);
    const prefResult = scorePreferences(profile, extracted);

    // Condition relevance: score 0 = condition not found in trial's conditions list OR title.
    // These are almost certainly off-topic (CTG matched on description only).
    // Move them to the excluded section so they don't pollute ranked results.
    // score 0.5 = found in title but not conditions list — warn, score down, keep visible.
    if (profile.condition.trim()) {
      const condName = extracted.conditions[0] ?? "a different condition";
      if (extracted.conditionRelevanceScore === 0) {
        prefResult.dealbreakers.push({
          category: "Condition Match",
          reason: `"${profile.condition}" not found in this trial's condition list or title — it may have appeared in the description only. Expand to verify.`,
        });
      } else if (extracted.conditionRelevanceScore < 0.75) {
        prefResult.dimensions.push({
          id: "condition_relevance",
          label: "Condition Match",
          score: 50,
          status: "warn",
          reason: `Primarily listed as "${condName}" — verify it's relevant to ${profile.condition}`,
        });
        eligResult.score = Math.round(eligResult.score * 0.8);
      }
    }

    const allDealbreakers = [
      ...eligResult.dealbreakers,
      ...treatResult.dealbreakers,
      ...prefResult.dealbreakers,
    ];

    const composite =
      allDealbreakers.length > 0
        ? 0
        : clamp(
            eligResult.score * W_ELIGIBILITY +
              treatResult.score * W_TREATMENT +
              prefResult.score * W_PREFERENCE
          );

    return {
      study,
      extracted,
      scores: {
        eligibility: eligResult.score,
        treatmentAccess: treatResult.score,
        preferenceMatch: prefResult.score,
        composite,
      },
      dimensions: [
        eligResult.dimension,
        treatResult.dimension,
        ...prefResult.dimensions,
      ],
      dealbreakersTriggered: allDealbreakers,
    };
  });

  // Sort: non-dealbreakers first (by composite desc), then dealbreakers (by eligibility desc)
  return ranked.sort((a, b) => {
    const aDQ = a.dealbreakersTriggered.length > 0;
    const bDQ = b.dealbreakersTriggered.length > 0;
    if (!aDQ && bDQ) return -1;
    if (aDQ && !bDQ) return 1;
    if (!aDQ && !bDQ) return b.scores.composite - a.scores.composite;
    // Both disqualified — sort by eligibility score so "close misses" appear first
    return b.scores.eligibility - a.scores.eligibility;
  });
}
