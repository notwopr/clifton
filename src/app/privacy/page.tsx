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
        Short version: <strong>Clifton does not collect, store, or transmit your personal
        data.</strong> Your profile stays in your own browser and is never sent to us.
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">What we collect</h2>
        <p className="text-muted-foreground">
          Nothing. Clifton has no database, no user accounts, and no server that stores
          personal information. There are no analytics trackers, no advertising cookies, and no
          third-party tracking scripts of any kind.
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
          When you run a search, Clifton makes two external requests on your behalf:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
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
          Both requests are proxied through a Vercel edge function to allow caching and to avoid
          exposing the raw API URLs client-side. Vercel may log request metadata (IP address,
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
        <h2 className="font-semibold text-base">Children&apos;s privacy</h2>
        <p className="text-muted-foreground">
          Clifton is intended for use by adults, typically caregivers or patients seeking
          information about clinical trials. We do not knowingly collect information from anyone
          under 13 years of age.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-base">Open source verification</h2>
        <p className="text-muted-foreground">
          You don&apos;t have to take our word for it. Clifton is fully open source. You can
          review exactly what the code does — including all network requests — on{" "}
          <a
            href="https://github.com/notwopr/clinicalsift"
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
