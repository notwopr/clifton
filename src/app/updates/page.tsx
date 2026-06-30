import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Updates — Clifton",
  description: "What's new in Clifton — system changes, improvements, and announcements.",
};

const updates = [
  {
    date: "June 29, 2026",
    title: "AI model switched to DeepSeek V4 Flash",
    body: "The AI powering trial scoring and query enrichment has been switched from Google Gemini 2.5 Flash Lite to DeepSeek V4 Flash. Results and behavior should be equivalent. If you notice anything unexpected, please open an issue on GitHub.",
  },
];

export default function UpdatesPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-12 space-y-8 text-sm leading-relaxed">
      <div>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Clifton
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-1">Updates</h1>
        <p className="text-muted-foreground text-xs">System changes and announcements, newest first.</p>
      </div>

      <div className="space-y-6">
        {updates.map((u) => (
          <div key={u.date} className="border-l-2 border-primary pl-4 space-y-1">
            <p className="text-xs text-muted-foreground">{u.date}</p>
            <p className="font-semibold text-base">{u.title}</p>
            <p className="text-muted-foreground">{u.body}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t text-xs text-muted-foreground">
        Questions or feedback? Open an issue on{" "}
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
