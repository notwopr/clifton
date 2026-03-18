"use client";

import { useState } from "react";
import type { RankedTrial } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CompositeScore, DimensionBadges, ScoreBar } from "./ScoreBar";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Formats CTG date strings (e.g. "2025-06-15", "2025-06", "June 2025") as
 * "Jun 15, 2025" or "Jun 2025". Month always comes first.
 */
function formatCtgDate(dateStr: string): string {
  // Already human-readable like "June 2025"
  if (/^[A-Za-z]/.test(dateStr)) return dateStr;
  // YYYY-MM-DD
  const full = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (full) {
    const d = new Date(Number(full[1]), Number(full[2]) - 1, Number(full[3]));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  // YYYY-MM
  const ym = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (ym) {
    const d = new Date(Number(ym[1]), Number(ym[2]) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  return dateStr;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const lq = query.trim().toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lq ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-700 rounded-sm px-0.5 text-inherit">
            {part}
          </span>
        ) : part
      )}
    </>
  );
}

interface Props {
  trial: RankedTrial;
  rank: number;
  isFavorited?: boolean;
  onToggleFavorite?: (nctId: string) => void;
  isNew?: boolean;
  searchQuery?: string;
}

function ContactChip({ name, phone, email, role }: { name: string; phone: string; email: string; role: string }) {
  return (
    <div className="text-xs space-y-0.5 p-2 rounded bg-muted/50">
      <p className="font-medium">{name || "Study Contact"} {role && <span className="text-muted-foreground font-normal">· {role}</span>}</p>
      {phone && (
        <a href={`tel:${phone}`} className="flex items-center gap-1 text-primary hover:underline">
          <Phone className="h-3 w-3" /> {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="flex items-center gap-1 text-primary hover:underline">
          <Mail className="h-3 w-3" /> {email}
        </a>
      )}
    </div>
  );
}

export function TrialCard({ trial, rank, isFavorited, onToggleFavorite, isNew, searchQuery = "" }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { extracted, scores, dimensions, dealbreakersTriggered } = trial;
  const isDQ = dealbreakersTriggered.length > 0;

  const phaseColor: Record<string, string> = {
    "Phase 1": "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    "Phase 2": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "Phase 3": "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    "Phase 4": "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  };

  return (
    <Card
      className={cn(
        "transition-shadow",
        isDQ ? "opacity-60 border-dashed" : "hover:shadow-md",
        !isDQ && scores.composite >= 70 && "border-green-200 dark:border-green-900",
        isNew && !isDQ && "border-l-4 border-l-blue-500"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Rank + Score */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">#{rank}</span>
            <CompositeScore score={scores.composite} size="sm" />
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge
                variant="outline"
                className={cn("text-xs", phaseColor[extracted.phase] ?? "bg-gray-100")}
              >
                {extracted.phase}
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {extracted.status.replace(/_/g, " ")}
              </Badge>
              {extracted.isOpenLabel && (
                <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                  Open-label
                </Badge>
              )}
              {isNew && (
                <Badge className="text-xs bg-blue-600 text-white border-0 animate-pulse">
                  NEW
                </Badge>
              )}
              {extracted.randomizationRatio && (
                <Badge variant="outline" className="text-xs">
                  Ratio {extracted.randomizationRatio}
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-sm leading-snug line-clamp-2">
              <Highlight text={extracted.briefTitle} query={searchQuery} />
            </h3>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="font-mono">{extracted.nctId}</span>
              {extracted.sponsor && <span>· {extracted.sponsor}</span>}
              {extracted.closestLocationMiles !== null && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {extracted.closestLocationMiles} mi one-way
                  {extracted.closestLocationDrivingHours !== null && (
                    <> (~{extracted.closestLocationDrivingHours}h drive · {extracted.closestLocationMiles * 2} mi round trip)</>
                  )}
                </span>
              )}
              {extracted.estimatedDurationMonths && (
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  ~{extracted.estimatedDurationMonths} months
                </span>
              )}
              {extracted.enrollmentDeadline && (
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-3 w-3" />
                  Ends {formatCtgDate(extracted.enrollmentDeadline)}
                </span>
              )}
            </div>
          </div>

          {/* Favorite + Expand */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(extracted.nctId)}
                className={cn("h-7 px-2", isFavorited ? "text-yellow-500" : "text-muted-foreground")}
                title={isFavorited ? "Remove from shortlist" : "Add to shortlist"}
              >
                <Star className={cn("h-4 w-4", isFavorited && "fill-yellow-400")} />
              </Button>
            )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((e) => !e)}
            className="shrink-0 h-7 px-2"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          </div>
        </div>

        {/* Dimension badges */}
        <DimensionBadges dimensions={dimensions} compact />

        {/* Dealbreaker alert */}
        {isDQ && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dealbreakersTriggered.map((db, i) => (
              <div
                key={i}
                className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2 py-1 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900"
              >
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>
                  <span className="font-medium">{db.category}:</span> {db.reason}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      {expanded && (
        <>
          <Separator />
          <CardContent className="pt-4 space-y-5 text-sm">
            {/* Score breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Score Breakdown
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <ScoreBar score={scores.eligibility} label="Eligibility" />
                <ScoreBar score={scores.treatmentAccess} label="Treatment Access" />
                <ScoreBar score={scores.preferenceMatch} label="Preference Match" />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {dimensions.map((dim) => (
                  <div key={dim.id} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{dim.label}:</span>{" "}
                    {dim.reason}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Summary */}
            {extracted.summary && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Study Summary
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">
                  {extracted.summary}
                </p>
              </div>
            )}

            {/* Delivery & Procedures */}
            <div className="grid grid-cols-2 gap-4">
              {extracted.deliveryMethods.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Pill className="h-3 w-3" /> Treatment Delivery
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {extracted.deliveryMethods.map((m) => (
                      <Badge key={m} variant="outline" className="text-xs">
                        {m.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {extracted.procedures.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <FlaskConical className="h-3 w-3" /> Procedures Required
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {extracted.procedures.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {p.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Locations */}
            {extracted.locations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Trial Sites
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {extracted.locations
                    .sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999))
                    .map((loc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/40"
                      >
                        <div>
                          <span className="font-medium">{loc.facility}</span>{" "}
                          <span className="text-muted-foreground">
                            {[loc.city, loc.state, loc.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                        {loc.distanceMiles !== null && (
                          <span className="text-muted-foreground ml-2 shrink-0">
                            {loc.distanceMiles} mi
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Contacts */}
            {extracted.contacts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extracted.contacts.map((c, i) => (
                    <ContactChip key={i} {...c} />
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility criteria */}
            {(extracted.inclusionCriteria.length > 0 || extracted.exclusionCriteria.length > 0) && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Eligibility Criteria
                </p>
                {extracted.inclusionCriteria.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-1">Inclusion</p>
                    <ul className="space-y-1">
                      {extracted.inclusionCriteria.slice(0, 8).map((c, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                          <span className="text-green-500 shrink-0">+</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {extracted.exclusionCriteria.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">Exclusion</p>
                    <ul className="space-y-1">
                      {extracted.exclusionCriteria.slice(0, 8).map((c, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                          <span className="text-red-400 shrink-0">−</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* External link */}
            <div className="pt-1">
              <a
                href={extracted.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View full details on ClinicalTrials.gov
              </a>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
