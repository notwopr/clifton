import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Brain,
  MapPin,
  Shield,
  Zap,
  ChevronRight,
  FlaskConical,
  Sliders,
  SortDesc,
  Share2,
  Bell,
  Heart,
  Coffee,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="pt-12 pb-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-10 sm:gap-16">
          {/* Logo */}
          <div className="shrink-0 rounded-3xl p-6 bg-transparent dark:bg-white">
            <img src="/logo.svg" alt="Clifton" className="h-96 sm:h-[32rem] w-auto" />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-5 text-center sm:text-left">
            <Badge variant="outline" className="text-sm px-3 py-1 self-center sm:self-start">
              Always free · Fully open source · No tracking
            </Badge>

            <div>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-1">
                Meet Clifton — the <strong className="text-foreground"><u>cli</u></strong>nical trial si<strong className="text-foreground"><u>ft</u></strong>ing walrus.
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                He finds the right trial.{" "}
                <span className="text-primary">Ranked for you, automatically.</span>
              </h1>
            </div>

            <p className="text-lg text-muted-foreground">
              Tell Clifton about the patient — age, history, preferences — and he&apos;ll sift
              through every recruiting trial on ClinicalTrials.gov and rank them by fit.
              No more hours of manual searching.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button render={<Link href="/search" />} nativeButton={false} size="lg" className="gap-2 text-base">
                <Search className="h-5 w-5" />
                Start Searching
              </Button>
              <Button render={<a href="#how-it-works" />} nativeButton={false} variant="outline" size="lg" className="text-base">
                How it works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-4 max-w-5xl mx-auto w-full scroll-mt-36">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Sliders className="h-6 w-6 text-primary" />,
              title: "1. Build your profile",
              desc: "Enter the patient's age, medical history, and what matters to you — distance limits, which procedures are dealbreakers, placebo tolerance, and more.",
            },
            {
              icon: <FlaskConical className="h-6 w-6 text-primary" />,
              title: "2. We search ClinicalTrials.gov",
              desc: "Every actively recruiting interventional trial for your condition is fetched in real time from ClinicalTrials.gov. No stale spreadsheets. Trials added today appear today.",
            },
            {
              icon: <SortDesc className="h-6 w-6 text-primary" />,
              title: "3. Get a ranked list",
              desc: "Trials are scored on eligibility, treatment odds, and your preferences. Dealbreakers are flagged but kept visible — so you can change your mind.",
            },
          ].map((step, i) => (
            <Card key={i} className="border-0 shadow-sm bg-muted/40">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            Everything you need — nothing you don&apos;t
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: "AI-powered matching",
                desc: "Gemini AI normalizes condition spelling, understands synonyms and abbreviations, semantically detects conflicts with your comorbidities and medications, and generates plain-English summaries for every trial.",
              },
              {
                icon: <Brain className="h-5 w-5" />,
                title: "Smart eligibility matching",
                desc: "Age, sex, comorbidities, and current medications are checked against exclusion criteria automatically.",
              },
              {
                icon: <MapPin className="h-5 w-5" />,
                title: "Distance-sorted trial sites",
                desc: "Every site is ranked by drive distance from your ZIP. Contacts shown right there — one click to call or email.",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Flexible dealbreakers",
                desc: "Mark delivery methods, procedures, or free-form conditions as dealbreakers. Excluded trials stay visible — so you can reconsider.",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Private and transparent",
                desc: "Your profile is saved only in your browser — no tracking, no emails, nothing stored on our servers. When you search, anonymized health data (no names) is sent to Google Gemini AI to improve matching. Clifton is fully open source so you can verify exactly what it does.",
              },
              {
                icon: <Share2 className="h-5 w-5" />,
                title: "Share with family & doctors",
                desc: "Star your top trials, then export a formatted action plan as a PDF, copy it to share via text or email, or download as a text file.",
              },
              {
                icon: <Bell className="h-5 w-5" />,
                title: "New trial alerts",
                desc: "Clifton remembers the last search results. Run it again any time — new trials that appeared since your last check are highlighted automatically.",
              },
            ].map((f, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-lg bg-background border">
                <div className="text-primary mt-0.5 shrink-0">{f.icon}</div>
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center space-y-5">
        <h2 className="text-2xl font-bold">Ready to find a trial?</h2>
        <p className="text-muted-foreground">
          Takes about 5 minutes to set up.
        </p>
        <Button render={<Link href="/search" />} nativeButton={false} size="lg" className="gap-2">
          Get started
          <ChevronRight className="h-4 w-4" />
        </Button>
      </section>

      {/* Support */}
      <section className="py-16 px-4 bg-muted/20 border-t">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-medium uppercase tracking-wide">Support the mission</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Clifton is completely free and always will be. If it has helped you or someone you
            love, consider supporting Alzheimer&apos;s research — or the ongoing development of this tool.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 pt-2 text-left">
            {/* Research donations */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Donate to Alzheimer&apos;s research
              </p>
              <a
                href="https://www.alz.org/help-support/i-want-to-help/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5 p-3 rounded-lg border bg-background hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <span className="text-sm font-medium group-hover:text-primary transition-colors">Alzheimer&apos;s Association →</span>
                <span className="text-xs text-muted-foreground">Largest funder of Alzheimer&apos;s research in the US</span>
              </a>
            </div>

            {/* Developer support */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Support the developer
              </p>
<a
                href="https://ko-fi.com/notwopr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border bg-background hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <Coffee className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">Ko-fi</span>
                  <p className="text-xs text-muted-foreground">Buy me a coffee</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 text-center text-xs text-muted-foreground space-y-2">
        <p>
          Clifton · Data sourced from{" "}
          <a href="https://clinicaltrials.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            ClinicalTrials.gov
          </a>
          {" "}· Not affiliated with the NIH, FDA, or any pharmaceutical company
        </p>
        <p className="text-muted-foreground/60">
          Not medical advice · Always consult a qualified healthcare provider before enrolling in any trial
        </p>
        <div className="flex items-center justify-center gap-4 pt-1 text-muted-foreground/50">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms &amp; Disclaimer</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <span>·</span>
          <a href="https://github.com/notwopr/clifton" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            Open source (MIT)
          </a>
        </div>
      </footer>
    </div>
  );
}
