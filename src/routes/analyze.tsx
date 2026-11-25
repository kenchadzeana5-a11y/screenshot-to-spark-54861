import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Copy, Check, Download, FileText, Sparkles, Search, Loader2, Cpu } from "lucide-react";
import { CFPB_SAMPLE, SAMPLE_CSV, parseCustom, type Complaint } from "@/lib/data";
import { aiAnalyze, heuristicAnalyze, dateRange, type Analysis, type Theme } from "@/lib/engine";
import { useApp } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze complaints — Startup Signal" },
      { name: "description", content: "Run the 2-step agent to cluster complaints, extract evidence and find startup ideas." },
      { property: "og:title", content: "Analyze complaints — Startup Signal" },
      { property: "og:description", content: "Run the 2-step agent to cluster complaints, extract evidence and find startup ideas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analyze,
});

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

function Analyze() {
  const { t, lang, api, company } = useApp();
  const a = t.analyze;
  const [tab, setTab] = useState<"sample" | "custom">("sample");
  const [custom, setCustom] = useState("");
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [result, setResult] = useState<Analysis | null>(null);
  const [warn, setWarn] = useState("");

  const run = async () => {
    const data: Complaint[] = tab === "sample" ? CFPB_SAMPLE : parseCustom(custom);
    if (!data.length) return;
    setWarn(""); setResult(null); setPhase(1);
    let res: Analysis;
    if (api) {
      try { res = await aiAnalyze(data, api); } catch { res = heuristicAnalyze(data); setWarn(a.aiFail); }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      res = heuristicAnalyze(data);
    }
    setPhase(2); await new Promise((r) => setTimeout(r, 450));
    setResult(res); setPhase(0);
  };

  const exportMd = () => {
    if (!result) return;
    const md = [`# Startup Signal Report${company ? ` — ${company.name}` : ""}`, ``, `Complaints analyzed: ${result.total}`, ``,
      ...result.themes.flatMap((th) => [`## ${th.name[lang]} (${th.count}, ${th.pct}%)`, `- Severity: ${th.severity}`, `- Frustration: ${th.frustration}%`, `- Startup idea: ${th.idea[lang]}`, `- Reasoning: ${th.reasoning[lang]}`, ...th.quotes.map((q) => `> "${q.text}" — ${q.id}`), ``])].join("\n");
    download("startup-signal-report.md", md, "text/markdown");
  };

  const top = result?.themes.reduce<Theme | null>((m, x) => (!m || x.frustration > m.frustration ? x : m), null);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-semibold tracking-tight">{a.title}</h1><p className="mt-1 text-sm text-muted-foreground">{a.sub}</p></div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Cpu className="h-3.5 w-3.5" /> {api ? `${a.engineAi} · ${api.provider === "openai" ? "OpenAI" : "Gemini"}` : a.engineHeur}
        </span>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
            {(["sample", "custom"] as const).map((k) => (
              <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-3 py-1.5 font-medium", tab === k ? "bg-card shadow-sm" : "text-muted-foreground")}>{k === "sample" ? a.tabSample : a.tabCustom}</button>
            ))}
          </div>
          {tab === "custom" && (
            <button onClick={() => download("sample-complaints.csv", SAMPLE_CSV, "text/csv")} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><Download className="h-4 w-4" />{a.download}</button>
          )}
        </div>
        {tab === "sample" ? (
          <div className="mt-4 max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {CFPB_SAMPLE.map((c) => (
              <div key={c.id} className="flex gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{c.id}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{c.date}</span>
                <span className="truncate">{c.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <textarea value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={a.customPh} rows={7} className="mt-4 w-full rounded-md border border-input bg-background p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring" />
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button onClick={run} disabled={phase !== 0 || (tab === "custom" && !custom.trim())} className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant disabled:opacity-50">
            {phase ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {phase ? a.running : a.run}
          </button>
          {phase !== 0 && (
            <div className="flex gap-4 text-xs">
              <span className={phase >= 1 ? "text-primary" : "text-muted-foreground"}>{phase > 1 ? "✓" : "●"} {a.step1}</span>
              <span className={phase >= 2 ? "text-primary" : "text-muted-foreground"}>● {a.step2}</span>
            </div>
          )}
        </div>
        {warn && <p className="mt-3 text-xs text-warning-foreground">{warn}</p>}
      </section>

      {!result ? (
        phase === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <Kpi label={a.kpiTotal} value={String(result.total)} />
            <Kpi label={a.kpiThemes} value={String(result.themes.length)} />
            <Kpi label={a.kpiTop} value={top ? `${top.frustration}%` : "—"} sub={top?.name[lang]} />
          </section>

          <section className="mt-6 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{a.chart}</h2>
              <button onClick={exportMd} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"><FileText className="h-3.5 w-3.5" />{a.export}</button>
            </div>
            <div className="mt-4 space-y-3">
              {result.themes.map((th, i) => (
                <div key={th.key}>
                  <div className="flex justify-between text-sm"><span>{th.name[lang]}</span><span className="font-mono text-xs text-muted-foreground">{th.count} · {th.pct}%</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${th.pct}%`, background: `var(--chart-${(i % 5) + 1})` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 space-y-3">{result.themes.map((th, i) => <ThemeCard key={th.key} th={th} defaultOpen={i === 0} />)}</section>
          <AskBox result={result} />
        </>
      )}
    </main>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 truncate text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function ThemeCard({ th, defaultOpen }: { th: Theme; defaultOpen: boolean }) {
  const { t, lang } = useApp();
  const a = t.analyze;
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const ticket = `[${th.severity}] ${th.name.en}\n\nProblem: ${th.count} complaints (${th.pct}%), frustration ${th.frustration}%.\nOpportunity: ${th.idea.en}\nEvidence:\n${th.quotes.map((q) => `- ${q.id}: "${q.text}"`).join("\n")}\nAffected IDs: ${th.ids.join(", ")}`;
    await navigator.clipboard.writeText(ticket); setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-xl border border-border bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-5 text-left">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", th.severity === "High" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning-foreground")}>{th.severity === "High" ? a.high : a.medium}</span>
        <span className="flex-1 font-medium">{th.name[lang]}</span>
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{th.count} {a.complaints} · {a.frustration} {th.frustration}%</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-border p-5 text-sm">
          <div className="rounded-lg bg-accent p-3 text-accent-foreground"><span className="font-medium">{a.idea}: </span>{th.idea[lang]}</div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{a.evidence}</div>
            <div className="space-y-2">{th.quotes.map((q) => (
              <blockquote key={q.id} lang="en" className="border-l-2 border-primary pl-3 italic">"{q.text}" <span className="not-italic font-mono text-xs text-muted-foreground">— {q.id}</span></blockquote>
            ))}</div>
          </div>
          <p className="text-muted-foreground"><span className="font-medium text-foreground">{a.reasoning}: </span>{th.reasoning[lang]}</p>
          <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />} {copied ? a.copied : a.copy}
          </button>
        </div>
      )}
    </div>
  );
}

const KW: Record<string, RegExp> = { fraud: /fraud|scam|unauthori|თაღლით/i, frozen: /frozen|freeze|lock|block|დაბლოკ|გაყინ/i, fees: /fee|charge|price|საკომისიო|გადასახად/i, support: /support|service|agent|help|მხარდაჭერ/i };

function AskBox({ result }: { result: Analysis }) {
  const { t, lang } = useApp();
  const a = t.analyze;
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string[] | null>(null);
  const ask = (idx: number | null, text = "") => {
    const th = result.themes;
    if (idx === 0) { const m = [...th].sort((x, y) => y.frustration - x.frustration)[0]; return setAnswer(m ? [t.qa.highest(m.name[lang], m.frustration, m.ids.join(", "))] : []); }
    if (idx === 1) { const r = dateRange(result.complaints); return setAnswer([r ? t.qa.when(r.from, r.to, result.total) : t.qa.whenNone]); }
    if (idx === 2) return setAnswer([t.qa.each, ...th.map((x) => t.qa.match(x.name[lang], x.count, x.ids.join(", ")))]);
    const hits = th.filter((x) => (KW[x.key] ?? /$^/).test(text) || text.toLowerCase().split(/\s+/).some((w) => w.length > 3 && x.name[lang].toLowerCase().includes(w)));
    if (/highest|most|worst|მაღალ|ყველაზე/i.test(text)) return ask(0);
    if (/when|date|როდის|თარიღ|პერიოდ/i.test(text)) return ask(1);
    if (/how many|count|რამდენ/i.test(text) && !hits.length) return ask(2);
    setAnswer(hits.length ? hits.map((x) => t.qa.match(x.name[lang], x.count, x.ids.join(", "))) : [a.noMatch]);
  };
  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold">{a.ask}</h2>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(null, q.slice(0, 200)); }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={200} placeholder={a.askPh} className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button className="rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">{a.askBtn}</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">{a.chips.map((c, i) => (
        <button key={c} onClick={() => { setQ(c); ask(i); }} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">{c}</button>
      ))}</div>
      {answer && <div className="mt-4 space-y-1 rounded-lg bg-muted p-4 text-sm">{answer.map((l) => <p key={l}>{l}</p>)}</div>}
    </section>
  );
}
