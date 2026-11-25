import type { Complaint } from "./data";

export type ThemeKey = "fraud" | "frozen" | "fees" | "support" | "other";
export type Theme = {
  key: ThemeKey | string;
  name: { en: string; ka: string };
  idea: { en: string; ka: string };
  reasoning: { en: string; ka: string };
  ids: string[];
  count: number;
  pct: number;
  frustration: number;
  severity: "High" | "Medium";
  quotes: { id: string; text: string }[];
};
export type Analysis = { themes: Theme[]; total: number; source: "heuristic" | "ai"; complaints: Complaint[] };

const DEFS: Record<Exclude<ThemeKey, "other">, { kw: RegExp; name: Theme["name"]; idea: Theme["idea"]; reasoning: Theme["reasoning"] }> = {
  fraud: {
    kw: /fraud|unauthori[sz]ed|scam|stolen|dispute|identity theft|in my name/i,
    name: { en: "Fraud & unauthorized transactions", ka: "თაღლითობა და არაავტორიზებული ტრანზაქციები" },
    idea: { en: "A real-time dispute co-pilot that auto-files evidence and tracks provisional credits for consumers.", ka: "რეალურ დროში მომუშავე დავის ასისტენტი, რომელიც ავტომატურად აგროვებს მტკიცებულებებს და აკონტროლებს დროებით კრედიტებს." },
    reasoning: { en: "Grouped because each complaint describes money leaving the account without consent and a stalled dispute process.", ka: "დაჯგუფებულია, რადგან თითოეული საჩივარი აღწერს თანხის თანხმობის გარეშე ჩამოჭრას და შეფერხებულ დავის პროცესს." },
  },
  frozen: {
    kw: /frozen|freeze|locked|closed my account|holding my funds|verification/i,
    name: { en: "Account freezes & locked funds", ka: "ანგარიშის დაბლოკვა და გაყინული თანხები" },
    idea: { en: "A compliance-transparency layer that tells users exactly why funds are held and when they'll be released.", ka: "გამჭვირვალობის სერვისი, რომელიც მომხმარებელს ზუსტად ეუბნება, რატომ არის თანხა დაკავებული და როდის გათავისუფლდება." },
    reasoning: { en: "Grouped because users lost access to their own money with no notice, reason or timeline.", ka: "დაჯგუფებულია, რადგან მომხმარებლებმა დაკარგეს წვდომა საკუთარ თანხაზე გაფრთხილების, მიზეზის ან ვადის გარეშე." },
  },
  fees: {
    kw: /fee|charge[ds]?|markup|price|refund/i,
    name: { en: "Hidden fees & surprise charges", ka: "ფარული საკომისიოები და მოულოდნელი გადასახადები" },
    idea: { en: "A fee-watchdog app that scans statements and auto-requests refunds for undisclosed charges.", ka: "საკომისიოების მონიტორინგის აპი, რომელიც ამოწმებს ამონაწერებს და ავტომატურად ითხოვს დაუფარავი თანხების დაბრუნებას." },
    reasoning: { en: "Grouped because every complaint cites a charge that was not clearly disclosed before it was applied.", ka: "დაჯგუფებულია, რადგან ყველა საჩივარი ეხება გადასახადს, რომელიც წინასწარ მკაფიოდ არ იყო გამჟღავნებული." },
  },
  support: {
    kw: /support|hold|agent|chat ?bot|hung up|unanswered|respond|help center|follow/i,
    name: { en: "Unresponsive customer support", ka: "უპასუხო მომხმარებელთა მხარდაჭერა" },
    idea: { en: "An AI escalation agent that guarantees a human response SLA and keeps a shared case timeline.", ka: "AI ესკალაციის აგენტი, რომელიც უზრუნველყოფს ადამიანის პასუხს დროულად და ინახავს საქმის საერთო ისტორიას." },
    reasoning: { en: "Grouped because users describe long waits, bot loops and no human follow-up.", ka: "დაჯგუფებულია, რადგან მომხმარებლები აღწერენ ხანგრძლივ ლოდინს, ბოტის ციკლებს და ადამიანის პასუხის არარსებობას." },
  },
};

const ANGER = /unacceptable|never|no explanation|nobody|useless|twice|weeks|refused|denied|locked|totally|hours|without (any )?notice/gi;

export function classify(text: string): ThemeKey {
  // Order matters: fraud > frozen > fees > support
  for (const k of ["fraud", "frozen", "fees", "support"] as const) if (DEFS[k].kw.test(text)) return k;
  return "other";
}

function frustrationOf(texts: string[]) {
  const hits = texts.reduce((s, t) => s + (t.match(ANGER)?.length ?? 0), 0);
  return Math.min(96, Math.round(55 + (hits / Math.max(1, texts.length)) * 14));
}

export function heuristicAnalyze(complaints: Complaint[]): Analysis {
  const groups = new Map<ThemeKey, Complaint[]>();
  for (const c of complaints) {
    const k = classify(c.text);
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  const total = complaints.length;
  const themes: Theme[] = [...groups.entries()]
    .filter(([k]) => k !== "other")
    .map(([k, cs]) => {
      const d = DEFS[k as Exclude<ThemeKey, "other">];
      const frustration = frustrationOf(cs.map((c) => c.text));
      const pct = Math.round((cs.length / total) * 100);
      const ranked = [...cs].sort((a, b) => (b.text.match(ANGER)?.length ?? 0) - (a.text.match(ANGER)?.length ?? 0));
      return {
        key: k, name: d.name, idea: d.idea, reasoning: d.reasoning,
        ids: cs.map((c) => c.id), count: cs.length, pct, frustration,
        severity: (pct >= 30 || frustration >= 80 ? "High" : "Medium") as Theme["severity"],
        quotes: ranked.slice(0, 2).map((c) => ({ id: c.id, text: c.text })),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  return { themes, total, source: "heuristic", complaints };
}

export type ApiConfig = { provider: "openai" | "gemini"; key: string };

export async function aiAnalyze(complaints: Complaint[], cfg: ApiConfig): Promise<Analysis> {
  const prompt = `You are a startup analyst. Group these customer complaints into 3-4 themes. Return ONLY JSON: {"themes":[{"name":"","idea":"one sentence startup idea","reasoning":"one sentence","ids":["..."],"frustration":0-100,"quotes":[{"id":"","text":"verbatim"}]}]}. Quotes must be exact text from 2 complaints.\n\n${complaints.map((c) => `[${c.id}] ${c.text}`).join("\n")}`;
  let raw = "";
  if (cfg.provider === "openai") {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}` },
      body: JSON.stringify({ model: "gpt-4o-mini", response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt + "\nRespond in json." }] }),
    });
    if (!r.ok) throw new Error(`OpenAI ${r.status}`);
    raw = (await r.json()).choices[0].message.content;
  } else {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(cfg.key)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }),
    });
    if (!r.ok) throw new Error(`Gemini ${r.status}`);
    raw = (await r.json()).candidates[0].content.parts[0].text;
  }
  const parsed = JSON.parse(raw) as { themes: { name: string; idea: string; reasoning: string; ids: string[]; frustration: number; quotes: { id: string; text: string }[] }[] };
  const total = complaints.length;
  const themes: Theme[] = parsed.themes.slice(0, 4).map((t, i) => {
    const pct = Math.round((t.ids.length / total) * 100);
    const frustration = Math.round(t.frustration);
    return {
      key: `ai-${i}`, name: { en: t.name, ka: t.name }, idea: { en: t.idea, ka: t.idea }, reasoning: { en: t.reasoning, ka: t.reasoning },
      ids: t.ids, count: t.ids.length, pct, frustration,
      severity: (pct >= 30 || frustration >= 80 ? "High" : "Medium") as Theme["severity"],
      quotes: t.quotes.slice(0, 2),
    };
  }).sort((a, b) => b.count - a.count);
  return { themes, total, source: "ai", complaints };
}

export function dateRange(cs: Complaint[]) {
  const ds = cs.map((c) => c.date).filter((d) => /^\d{4}-/.test(d)).sort();
  return ds.length ? { from: ds[0]!, to: ds[ds.length - 1]! } : null;
}
