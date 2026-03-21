"use client";

import React, { useState } from "react";
import type { RankedTrial } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CompositeScore, ScoreBar } from "./ScoreBar";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  AlertTriangle,
  Pill,
  FlaskConical,
  Calendar,
  Star,
  Sparkles,
  Syringe,
  Activity,
  Lightbulb,
  Users,
  Shuffle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatCtgDate(dateStr: string): string {
  if (/^[A-Za-z]/.test(dateStr)) return dateStr;
  const full = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (full) {
    const d = new Date(Number(full[1]), Number(full[2]) - 1, Number(full[3]));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const ym = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (ym) {
    const d = new Date(Number(ym[1]), Number(ym[2]) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  return dateStr;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim().toLowerCase();
  const result: (string | React.ReactElement)[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const idx = remaining.toLowerCase().indexOf(q);
    if (idx === -1) { result.push(remaining); break; }
    if (idx > 0) result.push(remaining.slice(0, idx));
    result.push(
      <span key={key++} style={{ backgroundColor: "#fef08a", color: "inherit", borderRadius: "2px", padding: "0 2px" }}>
        {remaining.slice(idx, idx + q.length)}
      </span>
    );
    remaining = remaining.slice(idx + q.length);
  }
  return <>{result}</>;
}

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return <>{parts.map((part, i) =>
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{part}</a>
      : part
  )}</>;
}

function ContactChip({ name, phone, email, role }: { name: string; phone: string; email: string; role: string }) {
  const isUrl = /^https?:\/\//.test(phone);
  const hasUrl = /https?:\/\//.test(phone);
  return (
    <div className="text-xs space-y-0.5 p-2 rounded-md bg-muted/50">
      <p className="font-medium">{name ? linkify(name) : "Study Contact"} {role && <span className="text-muted-foreground font-normal">· {linkify(role)}</span>}</p>
      {phone && (
        isUrl ? (
          <a href={phone} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline break-all">
            <ExternalLink className="h-3 w-3 shrink-0" /> {phone}
          </a>
        ) : hasUrl ? (
          <p className="flex items-center gap-1 break-all"><ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" /> {linkify(phone)}</p>
        ) : (
          <a href={`tel:${phone}`} className="flex items-center gap-1 text-primary hover:underline">
            <Phone className="h-3 w-3" /> {phone}
          </a>
        )
      )}
      {email && (
        <a href={`mailto:${email}`} className="flex items-center gap-1 text-primary hover:underline">
          <Mail className="h-3 w-3" /> {email}
        </a>
      )}
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function ScoreChip({ score, label }: { score: number; label: string }) {
  const color =
    score >= 70 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900"
    : score >= 40 ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900"
    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900";
  return (
    <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs", color)}>
      <span className="font-bold">{score}</span>
      <span className="font-normal opacity-80">{label}</span>
    </div>
  );
}

function phaseColor(phase: string): string {
  if (phase.includes("4")) return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300";
  if (phase.includes("3")) return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300";
  if (phase.includes("2")) return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
  if (phase.includes("1")) return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300";
  return "bg-muted text-muted-foreground border-border"; // N/A or unknown — always readable
}

function phaseDesc(phase: string): string {
  if (phase.includes("4")) return "post-market";
  if (phase.includes("3")) return "large confirmatory";
  if (phase.includes("1") && phase.includes("2")) return "safety + efficacy";
  if (phase.includes("2")) return "efficacy + safety";
  if (phase.includes("1")) return "early safety";
  return "";
}

const PROCEDURE_LABELS: Record<string, string> = {
  blood_draw: "Blood draws",
  mri: "MRI scans",
  pet_scan: "PET scans",
  lumbar_puncture: "Lumbar puncture",
  cognitive_testing: "Cognitive testing",
  genetic_testing: "Genetic testing",
  biopsy: "Biopsy",
  ecg: "ECG/EKG",
  urine_sample: "Urine samples",
  eye_exam: "Eye / retinal exam",
};

const DELIVERY_LABELS: Record<string, string> = {
  oral: "Oral (pill/tablet)",
  iv_infusion: "IV infusion",
  subcutaneous_injection: "Subcutaneous injection",
  im_injection: "Intramuscular injection",
  nasal: "Nasal spray",
  implant: "Implant",
  device: "Medical device",
  topical: "Topical (cream/gel)",
  transdermal: "Transdermal patch",
};

// Procedures that warrant a warning color
const HIGH_BURDEN_PROCEDURES = new Set(["lumbar_puncture", "biopsy", "pet_scan"]);

interface Props {
  trial: RankedTrial;
  rank: number;
  isFavorited?: boolean;
  onToggleFavorite?: (nctId: string) => void;
  isNew?: boolean;
  searchQuery?: string;
}

export function TrialCard({ trial, rank, isFavorited, onToggleFavorite, isNew, searchQuery = "" }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { extracted, scores, dimensions, dealbreakersTriggered } = trial;
  const isDQ = dealbreakersTriggered.length > 0;

  // Placebo/treatment probability display
  const placeboLine = (() => {
    if (extracted.isOpenLabel) return { text: "Everyone gets treatment", warning: false };
    if (extracted.treatmentProbabilityPct !== null) {
      const pct = extracted.treatmentProbabilityPct;
      const ratio = extracted.randomizationRatio;
      const label = ratio ? `${ratio} ratio` : "";
      return {
        text: `~${pct}% chance of receiving drug${label ? ` (${label})` : ""}`,
        warning: pct < 50,
      };
    }
    return null;
  })();

  // Nearest recruiting site
  const nearestSite = extracted.locations
    .filter(l => l.isRecruiting)
    .sort((a, b) => (a.distanceMiles ?? 99999) - (b.distanceMiles ?? 99999))[0]
    ?? extracted.locations.sort((a, b) => (a.distanceMiles ?? 99999) - (b.distanceMiles ?? 99999))[0];

  const recruitingSiteCount = extracted.locations.filter(l => l.isRecruiting).length;

  return (
    <Card
      className={cn(
        "transition-shadow",
        isDQ ? "opacity-60 border-dashed" : "hover:shadow-md",
        !isDQ && scores.composite >= 70 && "border-green-200 dark:border-green-900",
        isNew && !isDQ && "border-l-4 border-l-blue-500"
      )}
    >
      {/* ── Collapsed header ─────────────────────────────────────────────────── */}
      <CardHeader className="pb-3 cursor-pointer select-none" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start gap-3">

          {/* Rank + composite score + eligibility status */}
          <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5 w-12">
            <span className="text-xs text-muted-foreground font-medium">#{rank}</span>
            <CompositeScore score={scores.composite} size="sm" />
            {isDQ ? (
              <span className="text-[10px] font-semibold text-rose-600 text-center leading-tight">Excluded</span>
            ) : scores.eligibility >= 70 ? (
              <span className="text-[10px] font-semibold text-green-600 text-center leading-tight">Likely<br/>eligible</span>
            ) : scores.eligibility >= 40 ? (
              <span className="text-[10px] font-semibold text-yellow-600 text-center leading-tight">Review<br/>carefully</span>
            ) : (
              <span className="text-[10px] font-semibold text-orange-600 text-center leading-tight">Low<br/>eligibility</span>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-1.5">

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1">
              <Badge variant="outline" className={cn("text-xs", phaseColor(extracted.phase))}>
                {extracted.phase}{phaseDesc(extracted.phase) ? ` · ${phaseDesc(extracted.phase)}` : ""}
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                {extracted.status.replace(/_/g, " ")}
              </Badge>
              {extracted.isOpenLabel && (
                <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300">
                  Open-label
                </Badge>
              )}
              {isNew && (
                <Badge className="text-xs bg-blue-600 text-white border-0 animate-pulse">NEW</Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-sm leading-snug line-clamp-2">
              <Highlight text={extracted.briefTitle} query={searchQuery} />
            </h3>

            {/* Search hit snippet — shown for any non-title match (title may be line-clamped) */}
            {searchQuery.trim() && (() => {
              const q = searchQuery.trim().toLowerCase();
              const fields = [
                { label: "condition", text: extracted.conditions.join(" · ") },
                { label: "summary", text: extracted.summary },
                { label: "AI summary", text: extracted.aiSummary ?? "" },
                ...extracted.inclusionCriteria.map(t => ({ label: "inclusion criteria", text: t })),
                ...extracted.exclusionCriteria.map(t => ({ label: "exclusion criteria", text: t })),
                ...extracted.interventionNames.map(t => ({ label: "treatment", text: t })),
              ];
              const hit = fields.find(f => f.text.toLowerCase().includes(q));
              if (!hit) return null;
              const idx = hit.text.toLowerCase().indexOf(q);
              const start = Math.max(0, idx - 40);
              const end = Math.min(hit.text.length, idx + q.length + 60);
              const snippet = (start > 0 ? "…" : "") + hit.text.slice(start, end) + (end < hit.text.length ? "…" : "");
              return (
                <p className="text-xs text-muted-foreground/70 italic">
                  Match in {hit.label}: <Highlight text={snippet} query={searchQuery} />
                </p>
              );
            })()}

            {/* AI plain summary */}
            {extracted.aiSummary && (
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-primary/60" />
                <span>{extracted.aiSummary}</span>
              </p>
            )}

            {/* Key at-a-glance row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
              {extracted.interventionNames.length > 0 && (
                <span className="flex items-center gap-1">
                  <Pill className="h-3 w-3 shrink-0" />
                  <span className="font-medium text-foreground">
                    {extracted.interventionNames.slice(0, 3).join(", ")}
                    {extracted.interventionNames.length > 3 && " +more"}
                  </span>
                </span>
              )}
              {/* Placebo second — often a dealbreaker, needs to be seen immediately */}
              {placeboLine && (
                <span className={cn(
                  "flex items-center gap-1 font-medium",
                  extracted.isOpenLabel
                    ? "text-teal-700 dark:text-teal-400"
                    : placeboLine.warning
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-foreground"
                )}>
                  <Shuffle className="h-3 w-3 shrink-0" />
                  {placeboLine.text}
                </span>
              )}
              {nearestSite && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {nearestSite.distanceMiles !== null
                    ? `${nearestSite.distanceMiles} mi away`
                    : [nearestSite.city, nearestSite.state].filter(Boolean).join(", ")}
                  {recruitingSiteCount > 1 && ` · ${recruitingSiteCount} sites`}
                </span>
              )}
              {extracted.estimatedDurationMonths && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  {extracted.estimatedDurationMonths} months
                </span>
              )}
            </div>

            {/* Score chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <ScoreChip score={scores.eligibility} label="Eligible" />
              <ScoreChip score={scores.preferenceMatch} label="Preference" />
              <ScoreChip score={scores.treatmentAccess} label="Treatment Access" />
            </div>

          </div>

          {/* Star + expand */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(extracted.nctId); }}
                className={cn("h-7 px-2", isFavorited ? "text-yellow-500" : "text-muted-foreground")}
                title={isFavorited ? "Remove from shortlist" : "Add to shortlist"}
              >
                <Star className={cn("h-4 w-4", isFavorited && "fill-yellow-400")} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setExpanded(ex => !ex); }}
              className="h-7 px-2"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Dealbreaker alerts */}
        {isDQ && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dealbreakersTriggered.map((db, i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2 py-1 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span><span className="font-medium">{db.category}:</span> {db.reason}</span>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      {/* ── Expanded detail ───────────────────────────────────────────────────── */}
      {expanded && (
        <>
          <Separator />
          <CardContent className="pt-5 space-y-6 text-sm">

            {/* ── 1. Treatment ──────────────────────────────────────────────── */}
            <div>
              <SectionHeader icon={<Pill className="h-3.5 w-3.5" />} label="Treatment" />
              <div className="space-y-3">

                {/* Drug/intervention names */}
                {extracted.interventionNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.interventionNames.map((name, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300">
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Delivery methods */}
                {extracted.deliveryMethods.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Syringe className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Administration: </span>
                      <span className="text-xs">{extracted.deliveryMethods.map(m => DELIVERY_LABELS[m] ?? m).join(" · ")}</span>
                    </div>
                  </div>
                )}

                {/* Placebo / treatment probability */}
                <div className="flex items-start gap-2">
                  <Shuffle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Randomization: </span>
                    {extracted.isOpenLabel ? (
                      <span className="text-xs text-teal-700 dark:text-teal-400">Open-label — all participants receive the treatment</span>
                    ) : extracted.treatmentProbabilityPct !== null ? (
                      <span className={cn("text-xs", extracted.treatmentProbabilityPct < 50 && "text-yellow-700 dark:text-yellow-400")}>
                        ~{extracted.treatmentProbabilityPct}% chance of receiving active treatment
                        {extracted.randomizationRatio && ` (${extracted.randomizationRatio} randomization ratio)`}
                        {extracted.placeboArmCount > 0 && ` · ${extracted.placeboArmCount} placebo arm${extracted.placeboArmCount > 1 ? "s" : ""}`}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Randomization details not available</span>
                    )}
                  </div>
                </div>

                {/* AI hypothesis */}
                {extracted.aiHypothesis && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-primary/5 border border-primary/10">
                    <Lightbulb className="h-3.5 w-3.5 text-primary/70 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Why it might work: </span>
                      <span className="text-xs">{extracted.aiHypothesis}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* ── 2. Study Schedule ─────────────────────────────────────────── */}
            <div>
              <SectionHeader icon={<Calendar className="h-3.5 w-3.5" />} label="Study Schedule" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Phase</p>
                  <p className="text-sm font-medium">{extracted.phase}</p>
                </div>
                {extracted.estimatedDurationMonths && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">~{extracted.estimatedDurationMonths} months</p>
                  </div>
                )}
                {extracted.enrollmentDeadline && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Enrollment closes</p>
                    <p className="text-sm font-medium">{formatCtgDate(extracted.enrollmentDeadline)}</p>
                  </div>
                )}
                {extracted.totalEnrollment && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Total enrollment</p>
                    <p className="text-sm font-medium">{extracted.totalEnrollment.toLocaleString()} participants</p>
                  </div>
                )}
                {extracted.sponsor && (
                  <div className="space-y-0.5 col-span-2">
                    <p className="text-xs text-muted-foreground">Sponsor</p>
                    <p className="text-sm font-medium">{extracted.sponsor}</p>
                  </div>
                )}
              </div>
              {extracted.aiVisitSchedule && (
                <div className="flex items-start gap-2 mt-3 p-3 rounded-md bg-muted/40">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Visit schedule: </span>
                    <span className="text-xs">{extracted.aiVisitSchedule}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* ── 3. Diagnostics & Procedures ──────────────────────────────── */}
            {extracted.procedures.length > 0 && (
              <>
                <div>
                  <SectionHeader icon={<FlaskConical className="h-3.5 w-3.5" />} label="Diagnostics & Procedures" />
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.procedures.map((proc) => (
                      <Badge
                        key={proc}
                        variant="outline"
                        className={cn(
                          "text-xs",
                          HIGH_BURDEN_PROCEDURES.has(proc)
                            ? "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300"
                            : "bg-muted/50"
                        )}
                      >
                        {PROCEDURE_LABELS[proc] ?? proc.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                  {extracted.procedures.some(p => HIGH_BURDEN_PROCEDURES.has(p)) && (
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      Orange badges indicate higher-burden procedures.
                    </p>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* ── 4. How well it matches ────────────────────────────────────── */}
            <div>
              <SectionHeader icon={<Activity className="h-3.5 w-3.5" />} label="How Well It Matches You" />
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <ScoreBar score={scores.eligibility} label="Eligibility" />
                  <ScoreBar score={scores.treatmentAccess} label="Treatment Access" />
                  <ScoreBar score={scores.preferenceMatch} label="Preference Match" />
                </div>
                <div className="space-y-1.5">
                  {dimensions.map((dim) => (
                    <div key={dim.id} className="flex items-start gap-2 text-xs">
                      <span className={cn(
                        "shrink-0 mt-0.5 h-1.5 w-1.5 rounded-full",
                        dim.status === "pass" ? "bg-green-500"
                        : dim.status === "warn" ? "bg-yellow-500"
                        : "bg-red-500"
                      )} />
                      <span>
                        <span className="font-medium">{dim.label}:</span>{" "}
                        <span className="text-muted-foreground">{dim.reason}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* ── 5. Nearest Sites ─────────────────────────────────────────── */}
            {extracted.locations.length > 0 && (
              <>
                <div>
                  <SectionHeader icon={<MapPin className="h-3.5 w-3.5" />} label={`Trial Sites (${extracted.locations.length})`} />
                  <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                    {extracted.locations
                      .sort((a, b) => (a.distanceMiles ?? 99999) - (b.distanceMiles ?? 99999))
                      .map((loc, i) => (
                        <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-muted/40">
                          <div className="min-w-0">
                            <span className="font-medium truncate block">{loc.facility}</span>
                            <span className="text-muted-foreground">
                              {[loc.city, loc.state, loc.country].filter(Boolean).join(", ")}
                              {!loc.isRecruiting && <span className="ml-1 text-yellow-600">(not recruiting)</span>}
                            </span>
                          </div>
                          {loc.distanceMiles !== null && (
                            <span className="text-muted-foreground ml-3 shrink-0 font-medium">{loc.distanceMiles} mi</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* ── 6. Contact ───────────────────────────────────────────────── */}
            {extracted.contacts.length > 0 && (
              <>
                <div>
                  <SectionHeader icon={<Phone className="h-3.5 w-3.5" />} label="Contact Information" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extracted.contacts.map((c, i) => <ContactChip key={i} {...c} />)}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* ── 7. AI Summary + Full CTG Summary ─────────────────────────── */}
            {(extracted.aiSummary || extracted.summary) && (
              <>
                <div className="space-y-3">
                  {extracted.aiSummary && (
                    <div>
                      <SectionHeader icon={<Sparkles className="h-3.5 w-3.5" />} label="AI Summary" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                      <Highlight text={extracted.aiSummary!} query={searchQuery} />
                    </p>
                    </div>
                  )}
                  {extracted.summary && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Official Study Description</p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
                        <Highlight text={extracted.summary} query={searchQuery} />
                      </p>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* ── 8. Eligibility Criteria ──────────────────────────────────── */}
            {(extracted.inclusionCriteria.length > 0 || extracted.exclusionCriteria.length > 0) && (
              <>
                <div>
                  <SectionHeader icon={<Users className="h-3.5 w-3.5" />} label="Eligibility Criteria" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    {extracted.inclusionCriteria.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1.5">Who can join (Inclusion)</p>
                        <ul className="space-y-1">
                          {extracted.inclusionCriteria.slice(0, 8).map((c, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                              <span className="text-green-500 shrink-0 font-bold">+</span>
                              <Highlight text={c} query={searchQuery} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {extracted.exclusionCriteria.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1.5">Who cannot join (Exclusion)</p>
                        <ul className="space-y-1">
                          {extracted.exclusionCriteria.slice(0, 8).map((c, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                              <span className="text-red-400 shrink-0 font-bold">−</span>
                              <Highlight text={c} query={searchQuery} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* ── 9. External link ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-muted-foreground font-mono">{extracted.nctId}</span>
              <a
                href={extracted.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Full details on ClinicalTrials.gov
              </a>
            </div>

          </CardContent>
        </>
      )}
    </Card>
  );
}
