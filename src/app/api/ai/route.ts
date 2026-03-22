import { NextRequest, NextResponse } from "next/server";
import type { AITrialScore } from "@/lib/types";

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// ── Action: enrich-query ──────────────────────────────────────────────────────
// Input:  { action: "enrich-query", condition: string }
// Output: { normalizedCondition: string, searchSynonyms: string[] }

async function enrichQuery(condition: string) {
  const prompt = `You are a medical terminology expert helping find clinical trials on ClinicalTrials.gov.

The user entered this condition: "${condition}"

Return a JSON object with exactly these two fields:
- "normalizedCondition": the correct standard medical term for this condition. Fix spelling errors, expand abbreviations, and use the terminology that ClinicalTrials.gov would use (e.g. "alzheimers" → "Alzheimer's disease", "ALS" → "Amyotrophic lateral sclerosis", "crohns" → "Crohn's disease").
- "searchSynonyms": an array of 3-6 alternative terms, abbreviations, or closely related conditions that clinical trials commonly use for this condition. These will be used as additional search keywords to improve recall.

Respond with only valid JSON, no markdown code blocks.`;

  const text = await callGemini(prompt);
  return JSON.parse(text);
}

// ── Action: score-trials ──────────────────────────────────────────────────────
// Input:  { action: "score-trials", profile: {...}, trials: [...] }
// Output: AITrialScore[]

interface TrialPayload {
  nctId: string;
  title: string;
  conditions: string[];
  summary: string;
  inclusion: string[];
  exclusion: string[];
}

interface ProfilePayload {
  condition: string;
  age: number | "" | null;
  sex: string;
  comorbidities: string[];
  currentMedications: string[];
  recentProcedures: string[];
  notes: string;
  dealbreakers: string;
  mustHave: string;
}

async function scoreTrials(profile: ProfilePayload, trials: TrialPayload[]): Promise<AITrialScore[]> {
  const profileLines = [
    `Condition being searched: ${profile.condition}`,
    profile.age ? `Age: ${profile.age}` : null,
    profile.sex ? `Sex: ${profile.sex}` : null,
    profile.comorbidities.length ? `Comorbidities: ${profile.comorbidities.join(", ")}` : null,
    profile.currentMedications.length ? `Current medications: ${profile.currentMedications.join(", ")}` : null,
    profile.recentProcedures.length ? `Recent procedures: ${profile.recentProcedures.join(", ")}` : null,
    profile.notes ? `Additional patient notes: ${profile.notes}` : null,
    profile.dealbreakers ? `Dealbreakers (patient refuses these): ${profile.dealbreakers}` : null,
    profile.mustHave ? `Must-haves (patient requires these): ${profile.mustHave}` : null,
  ].filter(Boolean).join("\n");

  const prompt = `You are a clinical trial matching expert. Analyze each trial against the patient profile below and return structured matching data.

PATIENT PROFILE:
${profileLines}

TRIALS TO ANALYZE (${trials.length} total):
${JSON.stringify(trials)}

For EACH trial, return a JSON array where each object contains:
- "nctId": string (copy exactly from input)
- "relevanceScore": number 0.0 to 1.0
    1.0 = trial directly targets the patient's exact condition
    0.7 = closely related condition or subtype
    0.4 = tangentially related (same organ system, comorbidity treatment, etc.)
    0.0 = unrelated to patient's condition
- "comorbidityConflicts": string array — list which of the patient's comorbidities appear to conflict with the trial's exclusion criteria. Use the exact comorbidity name from the profile. Be precise: only flag clear conflicts, not speculative ones. Empty array if none.
- "medicationConflicts": string array — list which of the patient's medications appear to conflict with the trial's exclusion criteria. Use exact medication names. Empty array if none.
- "dealbreakersFound": string array — describe any dealbreaker issues found semantically in the trial. Match by meaning, not just exact words (e.g. if patient said "no needles" and trial requires injections, flag it; if patient said "no lumbar puncture" and exclusion criteria mentions CSF collection, flag it). Each item should be a brief human-readable description. Empty array if none.
- "mustHavesFound": string array — list which of the patient's must-have requirements ARE actually present in the trial. Empty array if none found.
- "plainSummary": string — 1-2 sentence plain-English description of what this trial is actually testing, written for a patient or caregiver. Avoid jargon. Focus on what the treatment is and who it's for.
- "hypothesis": string — 1-2 sentences explaining why this treatment might help. You may draw on your broader medical knowledge beyond the trial description: prior trials of this drug or mechanism, published research, known pharmacology, or established scientific rationale. Stick strictly to what is known or well-supported — do not speculate or fabricate. If prior evidence exists (e.g. a Phase 2 result, an approved use in another indication, a known mechanism), briefly mention it. If genuinely nothing meaningful is known, return empty string.
- "visitSchedule": string — brief description of how often patients need to come in and what happens during visits, extracted or inferred from the trial description (e.g. "Monthly IV infusions at clinic, cognitive assessments every 6 months"). If not determinable, return empty string.

Return only the JSON array. No markdown, no explanation, no code blocks.`;

  const text = await callGemini(prompt);
  return JSON.parse(text);
}

// ── Route handler ─────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://clifton-topaz.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

export async function POST(req: NextRequest) {
  // Block requests not originating from the app itself
  const origin = req.headers.get("origin") ?? "";
  const referer = req.headers.get("referer") ?? "";
  const isAllowed = ALLOWED_ORIGINS.some(
    (o) => origin.startsWith(o) || referer.startsWith(o)
  );
  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "enrich-query") {
      const result = await enrichQuery(body.condition);
      return NextResponse.json(result);
    }

    if (action === "score-trials") {
      const result = await scoreTrials(body.profile, body.trials);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[/api/ai]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 }
    );
  }
}
