import Link from "next/link";

const VARIANTS = [
  {
    href: "/one-page",
    code: "A",
    title: "Single long page",
    pitch:
      "Everything visible. Scroll once, fill, place order. Johnny's pick for fewest clicks.",
    when: "Returning users · simple cart · low edit friction once submitted.",
  },
  {
    href: "/hybrid",
    code: "B",
    title: "Accordion",
    pitch:
      "Stacked sections with a preview of what was entered. Click any block to edit in place.",
    when: "Default recommendation · Dafne's pick · best for mid-flow edits.",
  },
  {
    href: "/one-page-sticky",
    code: "A+",
    title: "Variant A with sticky mobile summary (mockup)",
    pitch:
      "Same as variant A, but the order summary follows you on mobile as a compact pill at the top. Tap to expand the full breakdown.",
    when: "Mockup for Dafne/Johnny to pick. Mobile only — desktop unchanged.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="glass-dim border-b border-white/30">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display text-lg font-semibold tracking-tight text-slate-900">
            Wizlo
          </span>
          <span className="text-xs text-slate-600">Checkout prototypes</span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12 max-w-2xl">
          <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight bg-gradient-to-br from-slate-900 via-brand-ink to-savings-ink bg-clip-text text-transparent">
            Checkout, reimagined.
          </h1>
          <p className="mt-4 text-base text-slate-700 leading-relaxed">
            Two variants for stakeholder selection. Built mobile-first with
            glass-morphic surfaces, multi-placement Affirm messaging, and
            shipping pre-filled from intake.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {VARIANTS.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="group glass rounded-2xl p-6 hover:shadow-cardLift hover:-translate-y-1 transition-all shadow-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-brand to-savings text-white flex items-center justify-center text-sm font-semibold shadow-card">
                  {v.code}
                </span>
                <h2 className="font-display text-xl font-semibold text-slate-900 group-hover:text-brand-ink">
                  {v.title}
                </h2>
              </div>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                {v.pitch}
              </p>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Best when:</strong> {v.when}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10 glass rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">
            About this session
          </h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-brand-ink mt-1">→</span>
              <span>
                Each visit gets a session ID stored in sessionStorage. Events
                land in <code className="bg-white/50 px-1.5 py-0.5 rounded">localStorage</code> for static deploys.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-ink mt-1">→</span>
              <span>
                <Link
                  href="/analytics"
                  className="text-brand-ink font-medium hover:underline"
                >
                  Open the analytics dashboard
                </Link>{" "}
                to see funnel events and per-field drop-off in real time.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-ink mt-1">→</span>
              <span>
                Shipping address is captured upfront in the intake form (per
                Pratik). Checkout pre-fills from intake so the page stays
                short.
              </span>
            </li>
          </ul>
        </div>

        <footer className="mt-16 text-xs text-slate-600">
          Wizlo prototype · Glass UI · Schema-driven · Mock payment + Affirm
        </footer>
      </main>
    </div>
  );
}
