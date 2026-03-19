"use client";

import { useState, useCallback } from "react";
import type { RankedTrial } from "@/lib/types";
import { TrialCard } from "./TrialCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Search, Download, ExternalLink, Printer, Clipboard, ClipboardCheck, Bell, X, Star, Sparkles } from "lucide-react";

interface Props {
  trials: RankedTrial[];
  totalFromApi: number;
  conditionLabel: string;
  searchQuery: string;
  newNctIds: Set<string>;
  lastSearchedAt: string | null;
  currentSearchedAt: string | null;
  starredNctIds: string[];
  onToggleStar: (nctId: string) => void;
  onRefine: () => void;
}

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

function buildPrintHtml(favTrials: RankedTrial[], conditionLabel: string): string {
  const trialBlocks = favTrials.map((t, i) => {
    const e = t.extracted;
    const closestSites = e.locations
      .filter((l) => l.isRecruiting)
      .sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999))
      .slice(0, 3);

    const rows: string[] = [];
    if (e.sponsor) rows.push(`<tr><td>Sponsor</td><td>${e.sponsor}</td></tr>`);
    if (e.totalEnrollment) rows.push(`<tr><td>Enrollment</td><td>${e.totalEnrollment} participants</td></tr>`);
    if (e.enrollmentDeadline) rows.push(`<tr><td>Primary completion</td><td>${formatCtgDate(e.enrollmentDeadline)}</td></tr>`);
    if (e.closestLocationMiles !== null) rows.push(`<tr><td>Closest site</td><td>${e.closestLocationMiles} mi one-way${e.closestLocationDrivingHours !== null ? ` (~${e.closestLocationDrivingHours}h drive)` : ""} &bull; ${e.closestLocationMiles * 2} mi round trip</td></tr>`);
    if (e.randomizationRatio) rows.push(`<tr><td>Randomization</td><td>${e.randomizationRatio} (treatment:placebo)</td></tr>`);
    if (e.treatmentProbabilityPct !== null) rows.push(`<tr><td>Drug probability</td><td>~${e.treatmentProbabilityPct}% of participants receive treatment</td></tr>`);
    if (e.isOpenLabel) rows.push(`<tr><td>Open-label</td><td>Everyone receives the treatment</td></tr>`);
    if (e.deliveryMethods.length > 0) rows.push(`<tr><td>Delivery</td><td>${e.deliveryMethods.map(m => m.replace(/_/g, " ")).join(", ")}</td></tr>`);

    const contactRows = e.contacts.map((c) => {
      const parts = [c.name ? `<strong>${c.name}</strong>${c.role ? ` (${c.role})` : ""}` : ""];
      if (c.phone) parts.push(`📞 ${c.phone}`);
      if (c.email) parts.push(`✉ <a href="mailto:${c.email}">${c.email}</a>`);
      return `<p class="contact-line">${parts.filter(Boolean).join(" &nbsp;&bull;&nbsp; ")}</p>`;
    }).join("");

    const siteRows = closestSites.map((s) => {
      const dist = s.distanceMiles !== null ? ` — ${s.distanceMiles} mi one-way` : "";
      const siteContacts = s.contacts
        .filter((c) => c.phone || c.email)
        .map((c) => `${c.phone ? `📞 ${c.phone}` : ""} ${c.email ? `✉ <a href="mailto:${c.email}">${c.email}</a>` : ""}`.trim())
        .join(" &nbsp;&bull;&nbsp; ");
      return `<p class="site-line"><strong>${s.facility || `${s.city}, ${s.state}`}</strong>, ${s.city}, ${s.state}${dist}${siteContacts ? `<br><span class="site-contact">${siteContacts}</span>` : ""}</p>`;
    }).join("");

    const phaseStr = e.phase.replace("Phase ", "Ph.");

    return `
      <div class="trial">
        <div class="trial-num">Trial ${i + 1} of ${favTrials.length}</div>
        <h2>${e.briefTitle}</h2>
        <div class="meta-line">
          <span class="pill">${phaseStr}</span>
          <span class="pill">${e.status.replace(/_/g, " ")}</span>
          ${e.isOpenLabel ? '<span class="pill green">Open-label</span>' : ""}
          <span class="score-pill">${t.scores.composite}/100</span>
          &nbsp;&bull;&nbsp; <a href="${e.url}">${e.nctId}</a>
        </div>
        ${rows.length > 0 ? `<table class="info-table">${rows.join("")}</table>` : ""}
        ${e.summary ? `<p class="summary">${e.summary.length > 600 ? e.summary.slice(0, 600) + "…" : e.summary}</p>` : ""}
        ${contactRows ? `<p class="section-label">Central Contact</p>${contactRows}` : ""}
        ${siteRows ? `<p class="section-label">Closest Recruiting Sites</p>${siteRows}` : ""}
      </div>`;
  }).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
    <title>Clinical Trial Action Plan — ${conditionLabel}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, Helvetica Neue, Arial, sans-serif; }
      body { font-size: 13px; color: #1a1a1a; padding: 36px 48px; max-width: 800px; line-height: 1.6; }
      h1 { font-size: 22px; font-weight: 700; margin-bottom: 3px; }
      .subtitle { color: #666; font-size: 12px; margin-bottom: 32px; }
      .trial { margin-bottom: 36px; padding-bottom: 36px; border-bottom: 1.5px solid #ddd; }
      .trial:last-child { border-bottom: none; }
      .trial-num { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: #999; margin-bottom: 6px; }
      h2 { font-size: 16px; font-weight: 600; line-height: 1.3; margin-bottom: 8px; color: #111; }
      .meta-line { font-size: 11px; color: #555; margin-bottom: 12px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
      .pill { background: #f0f0f0; border-radius: 3px; padding: 1px 6px; color: #444; }
      .pill.green { background: #e8f5ee; color: #1a6b33; }
      .score-pill { background: #1a4a8a; color: white; border-radius: 3px; padding: 1px 8px; font-weight: 600; }
      .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 12px; }
      .info-table td { padding: 3px 0; vertical-align: top; }
      .info-table td:first-child { width: 150px; color: #888; padding-right: 12px; }
      .info-table td:last-child { color: #222; }
      .summary { font-size: 12.5px; color: #444; line-height: 1.65; margin-bottom: 12px; }
      .section-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #999; margin: 12px 0 5px; }
      .contact-line, .site-line { font-size: 12px; color: #333; margin-bottom: 4px; }
      .site-contact { color: #666; font-size: 11px; }
      a { color: #1a4a8a; text-decoration: none; }
      a:hover { text-decoration: underline; }
      @media print { body { padding: 0; } .trial { page-break-inside: avoid; } }
    </style></head><body>
    <h1>Clinical Trial Action Plan</h1>
    <div class="subtitle">${conditionLabel} &nbsp;&bull;&nbsp; ${favTrials.length} shortlisted trial${favTrials.length !== 1 ? "s" : ""} &nbsp;&bull;&nbsp; Generated ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &nbsp;&bull;&nbsp; Clifton</div>
    ${trialBlocks}
  </body></html>`;
}

export function ResultsPanel({ trials, totalFromApi, conditionLabel, searchQuery, newNctIds, lastSearchedAt, currentSearchedAt, starredNctIds, onToggleStar, onRefine }: Props) {
  const [showExcluded, setShowExcluded] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [copied, setCopied] = useState(false);

  const favorites = new Set(starredNctIds);

  // Shared: build the action plan as a list of text lines
  const buildActionPlanLines = useCallback((): string[] => {
    const favTrials = trials.filter((t) => starredNctIds.includes(t.extracted.nctId));
    const lines: string[] = [
      `Clinical Trial Action Plan — ${conditionLabel}`,
      `Generated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      ``,
    ];
    favTrials.forEach((t, i) => {
      const e = t.extracted;
      lines.push(`━━━ Trial ${i + 1} of ${favTrials.length} ━━━`);
      lines.push(`${e.briefTitle}`);
      lines.push(`NCT ID: ${e.nctId}  |  ${e.url}`);
      lines.push(`Phase: ${e.phase}  |  Status: ${e.status}  |  Score: ${t.scores.composite}/100`);
      if (e.sponsor) lines.push(`Sponsor: ${e.sponsor}`);
      if (e.totalEnrollment) lines.push(`Total enrollment: ${e.totalEnrollment} participants`);
      if (e.closestLocationMiles !== null)
        lines.push(`Closest site: ${e.closestLocationMiles} mi one-way${e.closestLocationDrivingHours !== null ? ` (~${e.closestLocationDrivingHours}h drive)` : ""} · ${e.closestLocationMiles * 2} mi round trip`);
      if (e.enrollmentDeadline) lines.push(`Primary completion: ${formatCtgDate(e.enrollmentDeadline)}`);
      if (e.randomizationRatio) lines.push(`Randomization: ${e.randomizationRatio} (treatment:placebo)`);
      if (e.treatmentProbabilityPct !== null)
        lines.push(`Estimated chance of receiving drug: ~${e.treatmentProbabilityPct}%`);
      if (e.isOpenLabel) lines.push(`Open-label: everyone receives the treatment`);
      if (e.deliveryMethods.length > 0)
        lines.push(`Delivery: ${e.deliveryMethods.map(m => m.replace(/_/g, " ")).join(", ")}`);
      if (e.summary) {
        lines.push(``);
        lines.push(`Summary:`);
        lines.push(e.summary.length > 400 ? e.summary.slice(0, 400) + "…" : e.summary);
      }
      if (e.contacts.length > 0) {
        lines.push(``);
        lines.push(`Central Contact:`);
        e.contacts.forEach((c) => {
          if (c.name) lines.push(`  ${c.name}${c.role ? ` (${c.role})` : ""}`);
          if (c.phone) lines.push(`  Phone: ${c.phone}`);
          if (c.email) lines.push(`  Email: ${c.email}`);
        });
      }
      const closestSites = e.locations
        .filter((l) => l.isRecruiting)
        .sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999))
        .slice(0, 3);
      if (closestSites.length > 0) {
        lines.push(``);
        lines.push(`Closest recruiting sites:`);
        closestSites.forEach((s) => {
          const dist = s.distanceMiles !== null ? ` — ${s.distanceMiles} mi` : "";
          lines.push(`  ${s.facility}, ${s.city}, ${s.state}${dist}`);
          s.contacts.forEach((c) => {
            if (c.phone) lines.push(`    Phone: ${c.phone}`);
            if (c.email) lines.push(`    Email: ${c.email}`);
          });
        });
      }
      lines.push(``);
    });
    return lines;
  }, [trials, starredNctIds, conditionLabel]);

  function exportTxt() {
    const lines = buildActionPlanLines();
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trial-action-plan-${conditionLabel.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    const lines = buildActionPlanLines();
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function printActionPlan() {
    const favTrials = trials.filter((t) => starredNctIds.includes(t.extracted.nctId));
    if (favTrials.length === 0) return;
    const html = buildPrintHtml(favTrials, conditionLabel);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  const qualified = trials.filter((t) => t.dealbreakersTriggered.length === 0);
  const disqualified = trials.filter((t) => t.dealbreakersTriggered.length > 0);

  function matchesSearch(t: RankedTrial) {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const e = t.extracted;
    return (
      e.briefTitle.toLowerCase().includes(q) ||
      e.nctId.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.sponsor.toLowerCase().includes(q) ||
      e.conditions.some((c) => c.toLowerCase().includes(q)) ||
      e.locations.some(
        (l) =>
          l.facility.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q)
      ) ||
      e.deliveryMethods.some((m) => m.replace(/_/g, " ").toLowerCase().includes(q)) ||
      e.procedures.some((p) => p.replace(/_/g, " ").toLowerCase().includes(q)) ||
      e.inclusionCriteria.some((c) => c.toLowerCase().includes(q)) ||
      e.exclusionCriteria.some((c) => c.toLowerCase().includes(q))
    );
  }

  function matchesPhase(t: RankedTrial) {
    if (phaseFilter === "all") return true;
    return t.extracted.phase.toLowerCase().includes(phaseFilter.toLowerCase());
  }

  const filteredQ = qualified.filter((t) => matchesSearch(t) && matchesPhase(t) && (!showStarredOnly || favorites.has(t.extracted.nctId)) && (!showNewOnly || newNctIds.has(t.extracted.nctId)));
  const filteredDQ = disqualified.filter((t) => matchesSearch(t) && matchesPhase(t) && (!showStarredOnly || favorites.has(t.extracted.nctId)) && (!showNewOnly || newNctIds.has(t.extracted.nctId)));
  // Auto-expand excluded when a search query is active and has matches there
  const effectiveShowExcluded = showExcluded || (search.trim().length > 0 && filteredDQ.length > 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Results for{" "}
            <span className="text-primary">{conditionLabel}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {trials.length} trials ranked · {qualified.length} meet your criteria ·{" "}
            {disqualified.length} excluded{totalFromApi > trials.length ? ` · ${totalFromApi} total on CTG` : ""}
          </p>
          {currentSearchedAt && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Checked {timeAgo(currentSearchedAt)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {favorites.size > 0 && (
            <>
              <Button size="sm" variant="outline" onClick={exportTxt} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                .txt
              </Button>
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-1.5">
                {copied ? <ClipboardCheck className="h-3.5 w-3.5 text-green-600" /> : <Clipboard className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button size="sm" onClick={printActionPlan} className="gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                Print / PDF ({favorites.size})
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={onRefine}>
            Refine Profile
          </Button>
        </div>
      </div>

      {/* Transparency note */}
      <div className="text-xs text-muted-foreground/80 flex flex-wrap items-center gap-x-2 gap-y-1 pb-1 border-b">
        <span>
          Searched ClinicalTrials.gov for recruiting interventional trials matching{" "}
          <span className="font-medium text-foreground">&ldquo;{searchQuery}&rdquo;</span>.
          {" "}Fetched {trials.length} recruiting trials{totalFromApi > trials.length ? ` of ${totalFromApi} total on CTG — showing ranked top ${trials.length}` : ""} · all shown below, ranked by fit.
        </span>
        <a
          href={`https://clinicaltrials.gov/search?query=${encodeURIComponent(searchQuery)}&aggFilters=studyType:int,status:rec`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline whitespace-nowrap"
        >
          Verify on ClinicalTrials.gov
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {newNctIds.size > 0 && lastSearchedAt && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-800 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-200">
          <Bell className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
          <span>
            <strong>{newNctIds.size} new trial{newNctIds.size !== 1 ? "s" : ""}</strong> appeared since your last check on{" "}
            {new Date(lastSearchedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}.
            Look for the <span className="font-semibold text-blue-700">NEW</span> badge below.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title, NCT ID, location, procedures…"
            className="pl-8 pr-8 h-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={phaseFilter} onValueChange={(v) => v && setPhaseFilter(v)}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All phases</SelectItem>
            <SelectItem value="1">Phase 1</SelectItem>
            <SelectItem value="2">Phase 2</SelectItem>
            <SelectItem value="3">Phase 3</SelectItem>
            <SelectItem value="4">Phase 4</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showStarredOnly ? "default" : "outline"}
          size="sm"
          className="h-9 gap-1.5 shrink-0"
          onClick={() => setShowStarredOnly((s) => !s)}
        >
          <Star className={`h-3.5 w-3.5 ${showStarredOnly ? "fill-current" : ""}`} />
          Starred{favorites.size > 0 ? ` (${favorites.size})` : ""}
        </Button>
        {newNctIds.size > 0 && (
          <Button
            variant={showNewOnly ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1.5 shrink-0"
            onClick={() => setShowNewOnly((s) => !s)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            New ({newNctIds.size})
          </Button>
        )}
      </div>

      {/* Qualified results */}
      {filteredQ.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            {filteredQ.length} trials matching your criteria
          </div>
          {filteredQ.map((trial, i) => (
            <TrialCard key={trial.extracted.nctId} trial={trial} rank={i + 1}
              isFavorited={favorites.has(trial.extracted.nctId)}
              onToggleFavorite={onToggleStar}
              isNew={newNctIds.has(trial.extracted.nctId)}
              searchQuery={search} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
          {showStarredOnly && favorites.size === 0 ? (
            <>
              <p className="font-medium">No starred trials yet</p>
              <p className="text-sm mt-1">Click the star on any trial to save it here.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowStarredOnly(false)}>
                Show all trials
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium">No trials match your current filters</p>
              <p className="text-sm mt-1">
                {showStarredOnly ? "None of your starred trials match these filters." : "Try relaxing some dealbreakers or expanding your search radius."}
              </p>
              <Button variant="outline" className="mt-4" onClick={showStarredOnly ? () => setShowStarredOnly(false) : onRefine}>
                {showStarredOnly ? "Show all trials" : "Adjust Preferences"}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Excluded results */}
      {filteredDQ.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <button
            type="button"
            onClick={() => setShowExcluded((s) => !s)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            {effectiveShowExcluded ? "Hide" : "Show"} {filteredDQ.length} excluded trials
            <Badge variant="outline" className="ml-1 text-xs">
              Change your mind? They&apos;re here.
            </Badge>
          </button>

          {effectiveShowExcluded && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                These trials were removed from your ranked list due to one or more dealbreakers.
                Expand any card to see full details and reconsider.
              </p>
              {filteredDQ.map((trial, i) => (
                <TrialCard
                  key={trial.extracted.nctId}
                  trial={trial}
                  rank={qualified.length + i + 1}
                  isFavorited={favorites.has(trial.extracted.nctId)}
                  onToggleFavorite={onToggleStar}
                  isNew={newNctIds.has(trial.extracted.nctId)}
                  searchQuery={search}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
