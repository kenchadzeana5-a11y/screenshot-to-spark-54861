import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp, type Company } from "@/lib/app-store";
import { cn } from "@/lib/utils";

const INDUSTRIES: Company["industry"][] = ["FinTech", "SaaS", "E-commerce"];

export function SetupModal() {
  const { t, setupOpen, setSetupOpen, company, setCompany } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<Company["industry"]>("FinTech");
  useEffect(() => { if (setupOpen && company) { setName(company.name); setIndustry(company.industry); } }, [setupOpen, company]);
  return (
    <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t.setup.title}</DialogTitle><DialogDescription>{t.setup.sub}</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault(); if (!name.trim()) return;
          setCompany({ name: name.trim().slice(0, 60), industry }); setSetupOpen(false); void nav({ to: "/analyze" });
        }}>
          <div className="space-y-1.5"><Label htmlFor="cn">{t.setup.company}</Label><Input id="cn" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder={t.setup.placeholder} /></div>
          <div className="space-y-1.5"><Label>{t.setup.industry}</Label>
            <div className="grid grid-cols-3 gap-2">{INDUSTRIES.map((i) => (
              <button type="button" key={i} onClick={() => setIndustry(i)} className={cn("rounded-md border px-3 py-2 text-sm", industry === i ? "border-primary bg-accent text-accent-foreground" : "border-border")}>{i}</button>
            ))}</div>
          </div>
          <Button type="submit" className="w-full">{t.setup.save}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeyModal() {
  const { t, apiOpen, setApiOpen, api, setApi } = useApp();
  const [provider, setProvider] = useState<"openai" | "gemini">("gemini");
  const [key, setKey] = useState("");
  useEffect(() => { if (apiOpen) { setProvider(api?.provider ?? "gemini"); setKey(api?.key ?? ""); } }, [apiOpen, api]);
  return (
    <Dialog open={apiOpen} onOpenChange={setApiOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t.api.title}</DialogTitle><DialogDescription>{t.api.sub}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">{(["gemini", "openai"] as const).map((p) => (
            <button key={p} onClick={() => setProvider(p)} className={cn("rounded-md border px-3 py-2 text-sm capitalize", provider === p ? "border-primary bg-accent text-accent-foreground" : "border-border")}>{p === "openai" ? "OpenAI" : "Gemini"}</button>
          ))}</div>
          <div className="space-y-1.5"><Label htmlFor="ak">{t.api.key}</Label><Input id="ak" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder={provider === "openai" ? "sk-…" : "AIza…"} /></div>
          <div className="flex gap-2">
            <Button className="flex-1" disabled={!key.trim()} onClick={() => { setApi({ provider, key: key.trim() }); setApiOpen(false); }}>{t.api.save}</Button>
            {api && <Button variant="outline" onClick={() => { setApi(null); setKey(""); }}>{t.api.clear}</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
