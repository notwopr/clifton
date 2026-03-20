import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Clifton",
  description: "Privacy policy for Clifton — what data is and isn't collected.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-12 space-y-8 text-sm leading-relaxed">
      <div>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Clifton
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-1">Privacy Policy</h1>
        <p className="text-muted-foreground text-xs">Last updated: March 2026</p>
      </div>

      <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 text-green-900 dark:text-green-200 font-medium">
        Short version: <strong>Clifton does not collect or store your data.</strong> Your
        profile is saved only in your own browser and is never sent to us. When you run a
        search, anonymized health information (condition, age, medical history) is sent to
        Google Gemini AI to improve matching quality. No names or identifying information
        are included. See details below.
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">What we collect</h2>
        <p className="text-muted-foreground">
          Clifton has no database, no user accounts, and no server that stores your
          information. There are no analytics trackers, no advertising cookies, and no
          third-party tracking scripts of any kind. However, when you run a search,
          portions of your profile are transmitted to Google Gemini AI (see below).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Where your profile is stored</h2>
        <p className="text-muted-foreground">
          The profile you build — including condition, age, sex, medical history, medications,
          and preferences — is saved only in your browser&apos;s{" "}
          <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">localStorage</code>.
          It never leaves your device unless you explicitly export it. Clearing your browser
          data will delete it.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Third-party services contacted</h2>
        <p className="text-muted-foreground">
          When you run a search, Clifton makes external requests on your behalf:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
          <li>
            <strong>Google Gemini AI</strong> — to improve search quality and generate trial
            summaries, the following profile fields are sent to Google&apos;s Gemini API:
            condition, age, sex, comorbidities, current medications, recent procedures, free-text
            notes, and preferences (dealbreakers / must-haves). <strong>No name, contact
            information, or other identifying details are included.</strong> You use this feature
            at your own risk. Do not enter information that could identify you (full name, address,
            insurance ID, etc.). Google may process and retain this data in accordance with their
            own terms.{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google Privacy Policy →
            </a>
          </li>
          <li>
            <strong>ClinicalTrials.gov</strong> — your condition name and any additional keywords
            are sent as a search query. No other profile information is included. This is the
            same search you would perform manually on clinicaltrials.gov.{" "}
            <a
              href="https://www.nlm.nih.gov/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              NLM Privacy Policy →
            </a>
          </li>
          <li>
            <strong>Zippopotam.us</strong> — if you enter a ZIP code, it is sent to this free
            geocoding service to calculate distances to trial sites. No other information is
            included.{" "}
            <a
              href="https://www.zippopotam.us"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Zippopotam.us →
            </a>
          </li>
        </ul>
        <p className="text-muted-foreground">
          All requests are proxied through a Vercel edge function to allow caching and to avoid
          exposing raw API URLs client-side. Vercel may log request metadata (IP address,
          timestamp) in accordance with their own privacy policy.{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Vercel Privacy Policy →
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Cookies</h2>
        <p className="text-muted-foreground">
          Clifton does not set any cookies. Your theme preference (light/dark) and trial
          search snapshots are stored in{" "}
          <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">localStorage</code>,
          not cookies.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Open source verification</h2>
        <p className="text-muted-foreground">
          You don&apos;t have to take our word for it. Clifton is fully open source. You can
          review exactly what the code does — including all network requests — on{" "}
          <a
            href="https://github.com/notwopr/clifton"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            GitHub
          </a>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Changes to this policy</h2>
        <p className="text-muted-foreground">
          If we ever change how data is handled, we will update this page and note the date.
          Given the zero-collection architecture, changes are unlikely.
        </p>
      </section>

      <div className="pt-4 border-t text-xs text-muted-foreground">
        Questions? Open an issue on{" "}
        <a
          href="https://github.com/notwopr/clifton"
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
