import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Disclaimer — Clifton",
  description: "Terms of use and disclaimer for Clifton.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-12 space-y-8 text-sm leading-relaxed">
      <div>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Clifton
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-1">Terms & Disclaimer</h1>
        <p className="text-muted-foreground text-xs">Last updated: March 2026</p>
      </div>

      <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 font-medium">
        Clifton is a research and discovery tool. It is <strong>not a medical service</strong> and
        does not provide medical advice, diagnosis, or treatment recommendations.
        Always consult a qualified healthcare provider before making any healthcare decision.
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">What Clifton does</h2>
        <p className="text-muted-foreground">
          Clifton fetches publicly available clinical trial data from ClinicalTrials.gov and
          applies a scoring algorithm to sort and rank trials based on the profile information you
          enter. It is a convenience tool — the same information is freely available at{" "}
          <a href="https://clinicaltrials.gov" target="_blank" rel="noopener noreferrer" className="underline">
            clinicaltrials.gov
          </a>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Not medical advice</h2>
        <p className="text-muted-foreground">
          Nothing on Clifton — including trial rankings, eligibility estimates, scoring, or
          any other output — constitutes medical advice. The eligibility scoring is a heuristic
          based on keyword matching and simplified rules; it will not catch every inclusion or
          exclusion criterion in a trial protocol. Only a qualified physician or clinical
          investigator can determine whether a specific patient is eligible for a specific trial.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Data accuracy</h2>
        <p className="text-muted-foreground">
          Trial data is sourced from ClinicalTrials.gov, which is maintained by the U.S. National
          Library of Medicine. Clifton does not independently verify this data. Trial
          status, eligibility criteria, contact information, and site availability may be
          out of date. Always verify directly with the trial sponsor or investigator.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">No affiliation</h2>
        <p className="text-muted-foreground">
          Clifton is an independent project. It is not affiliated with, endorsed by, or
          connected to ClinicalTrials.gov, the U.S. National Library of Medicine, the National
          Institutes of Health, the U.S. Food and Drug Administration, any hospital, any
          pharmaceutical company, or any clinical research organization.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Limitation of liability</h2>
        <p className="text-muted-foreground">
          Clifton is provided "as is" without warranty of any kind, express or implied.
          To the maximum extent permitted by applicable law, the creator of Clifton shall
          not be liable for any direct, indirect, incidental, special, or consequential damages
          arising from your use of — or inability to use — this tool, including but not limited
          to decisions made on the basis of trial rankings or eligibility estimates.
        </p>
        <p className="text-muted-foreground">
          You use Clifton at your own risk. You are solely responsible for any decisions
          you make based on information obtained through this tool.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Open source</h2>
        <p className="text-muted-foreground">
          Clifton is open source software released under the{" "}
          <a
            href="https://github.com/notwopr/clinicalsift/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            MIT License
          </a>
          . You are free to use, copy, modify, and distribute the code in accordance with that
          license.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Changes to these terms</h2>
        <p className="text-muted-foreground">
          These terms may be updated at any time. Continued use of Clifton after changes
          are posted constitutes acceptance of the updated terms.
        </p>
      </section>

      <div className="pt-4 border-t text-xs text-muted-foreground">
        Questions? Open an issue on{" "}
        <a
          href="https://github.com/notwopr/clinicalsift"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          GitHub
        </a>.
      </div>
    </div>
  );
}
