import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Network, Quote, Lightbulb } from "lucide-react";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Startup Signal — Complaints into startup opportunities" },
      { name: "description", content: "AI clusters raw customer complaints into themes with verbatim evidence and startup ideas." },
      { property: "og:title", content: "Startup Signal — Complaints into startup opportunities" },
      { property: "og:description", content: "AI clusters raw customer complaints into themes with verbatim evidence and startup ideas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, setSetupOpen } = useApp();
  const h = t.hero;
  const features = [
    { icon: Network, title: h.f1t, desc: h.f1d },
    { icon: Quote, title: h.f2t, desc: h.f2d },
    { icon: Lightbulb, title: h.f3t, desc: h.f3d },
  ];
  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-obsidian text-obsidian-foreground">
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="pointer-events-none absolute inset-0 grid-fade" />
      <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-obsidian-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> {h.eyebrow}
        </span>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          {h.title1}{" "}
          <span className="bg-brand-gradient bg-clip-text text-transparent">{h.title2}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-obsidian-muted sm:text-lg">{h.sub}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button onClick={() => setSetupOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition hover:opacity-90">
            {h.register} <ArrowRight className="h-4 w-4" />
          </button>
          <Link to="/analyze" className="inline-flex items-center gap-2 rounded-lg border border-glass-border bg-glass px-5 py-2.5 text-sm font-medium transition hover:bg-obsidian-foreground/10">
            {h.demo}
          </Link>
        </div>
        <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 border-y border-glass-border py-6">
          {[["15", h.stat1], ["90%", h.stat2], ["<1s", h.stat3]].map(([v, l]) => (
            <div key={l}><div className="font-mono text-2xl font-medium">{v}</div><div className="mt-1 text-xs text-obsidian-muted">{l}</div></div>
          ))}
        </div>
      </section>
      <section className="relative mx-auto grid max-w-5xl gap-4 px-4 pb-24 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass-card rounded-2xl p-6 text-left">
            <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient"><Icon className="h-4 w-4 text-primary-foreground" /></div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-obsidian-muted">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
