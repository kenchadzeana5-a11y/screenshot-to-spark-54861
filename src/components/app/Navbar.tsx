import { Link } from "@tanstack/react-router";
import { KeyRound, Building2 } from "lucide-react";
import { Logo } from "./Logo";
import { useApp } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t, lang, setLang, company, setSetupOpen, setApiOpen, api } = useApp();
  const tab = "rounded-md px-3 py-1.5 text-sm font-medium text-obsidian-muted transition-colors hover:text-obsidian-foreground";
  return (
    <header className="sticky top-0 z-40 border-b border-glass-border bg-obsidian/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-obsidian-foreground">
          <Logo /> <span className="hidden sm:inline">Startup Signal</span>
        </Link>
        <nav className="flex items-center gap-1">
          {([["/", t.nav.home], ["/analyze", t.nav.analyze], ["/evaluation", t.nav.evaluation]] as const).map(([to, label]) => (
            <Link key={to} to={to} className={tab} activeOptions={{ exact: true }} activeProps={{ className: "bg-glass text-obsidian-foreground" }}>{label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setSetupOpen(true)} className="hidden items-center gap-1.5 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-obsidian-foreground md:flex">
            <Building2 className="h-3.5 w-3.5" />
            {company ? <>{company.name}<span className="text-obsidian-muted">· {company.industry}</span></> : <span className="text-obsidian-muted">{t.nav.noWorkspace}</span>}
          </button>
          <div className="flex rounded-md border border-glass-border p-0.5 text-xs">
            {(["en", "ka"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cn("rounded px-2 py-0.5 font-medium uppercase", lang === l ? "bg-obsidian-foreground text-obsidian" : "text-obsidian-muted")}>{l}</button>
            ))}
          </div>
          <button onClick={() => setApiOpen(true)} className="flex items-center gap-1.5 rounded-md border border-glass-border px-2.5 py-1 text-xs text-obsidian-foreground hover:bg-glass">
            <KeyRound className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t.nav.apiKey}</span>
            {api && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
          </button>
        </div>
      </div>
    </header>
  );
}
