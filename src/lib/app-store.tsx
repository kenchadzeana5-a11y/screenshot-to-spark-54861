import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ApiConfig } from "./engine";
import { dict, type Lang } from "./i18n";

export type Company = { name: string; industry: "FinTech" | "SaaS" | "E-commerce" };

type Ctx = {
  lang: Lang; setLang: (l: Lang) => void; t: (typeof dict)["en"];
  company: Company | null; setCompany: (c: Company | null) => void;
  api: ApiConfig | null; setApi: (a: ApiConfig | null) => void;
  setupOpen: boolean; setSetupOpen: (b: boolean) => void;
  apiOpen: boolean; setApiOpen: (b: boolean) => void;
};
const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangS] = useState<Lang>("en");
  const [company, setCompanyS] = useState<Company | null>(null);
  const [api, setApiS] = useState<ApiConfig | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);

  useEffect(() => {
    try {
      const l = localStorage.getItem("ss.lang"); if (l === "ka" || l === "en") setLangS(l);
      const c = localStorage.getItem("ss.company"); if (c) setCompanyS(JSON.parse(c));
      const a = localStorage.getItem("ss.api"); if (a) setApiS(JSON.parse(a));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const persist = (k: string, v: unknown) => (v == null ? localStorage.removeItem(k) : localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)));
  return (
    <AppCtx.Provider value={{
      lang, t: dict[lang], setLang: (l) => { setLangS(l); persist("ss.lang", l); },
      company, setCompany: (c) => { setCompanyS(c); persist("ss.company", c); },
      api, setApi: (a) => { setApiS(a); persist("ss.api", a); },
      setupOpen, setSetupOpen, apiOpen, setApiOpen,
    }}>{children}</AppCtx.Provider>
  );
}
export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}
