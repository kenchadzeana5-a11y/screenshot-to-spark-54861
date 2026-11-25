import { createFileRoute } from "@tanstack/react-router";
import { Check, X, AlertTriangle } from "lucide-react";
import { EVAL_LABELS } from "@/lib/data";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/evaluation")({
  head: () => ({
    meta: [
      { title: "Evaluation — Startup Signal" },
      { name: "description", content: "How the Startup Signal agent compares with human labels on CFPB complaints." },
      { property: "og:title", content: "Evaluation — Startup Signal" },
      { property: "og:description", content: "How the Startup Signal agent compares with human labels on CFPB complaints." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Evaluation,
});

function Evaluation() {
  const { t } = useApp();
  const e = t.evalp;
  const correct = EVAL_LABELS.filter((r) => r.human === r.ai).length;
  const acc = Math.round((correct / EVAL_LABELS.length) * 100);
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <div><h1 className="text-2xl font-semibold tracking-tight">{e.title}</h1><p className="mt-1 text-sm text-muted-foreground">{e.sub}</p></div>
        <div className="rounded-xl border border-border bg-card px-5 py-3 text-right shadow-sm">
          <div className="text-xs text-muted-foreground">{e.accuracy}</div>
          <div className="font-mono text-2xl font-semibold text-primary">{acc}%</div>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-2.5 font-medium">{e.id}</th><th className="px-4 py-2.5 font-medium">{e.human}</th><th className="px-4 py-2.5 font-medium">{e.ai}</th><th className="px-4 py-2.5 text-right font-medium">{e.match}</th></tr>
          </thead>
          <tbody>
            {EVAL_LABELS.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-2.5">{t.labels[r.human]}</td>
                <td className="px-4 py-2.5">{t.labels[r.ai]}</td>
                <td className="px-4 py-2.5 text-right">{r.human === r.ai ? <Check className="ml-auto h-4 w-4 text-success" /> : <X className="ml-auto h-4 w-4 text-destructive" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-warning" /> {e.limits}</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">{e.limitList.map((l) => <li key={l}>{l}</li>)}</ul>
      </div>
      <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        {e.source} <a className="text-primary underline-offset-2 hover:underline" href="https://www.consumerfinance.gov/data-research/consumer-complaints/" target="_blank" rel="noreferrer">consumerfinance.gov</a>
      </footer>
    </main>
  );
}
