export type Complaint = { id: string; date: string; product: string; text: string };

export const CFPB_SAMPLE: Complaint[] = [
  { id: "CFPB-26-1042", date: "2026-01-04", product: "Mobile wallet", text: "Someone made three unauthorized transfers from my account overnight. I reported fraud immediately but the app still shows the dispute as pending after 3 weeks." },
  { id: "CFPB-26-1057", date: "2026-01-09", product: "Checking account", text: "My account was frozen without any notice. I could not pay rent and nobody could tell me why my funds were locked." },
  { id: "CFPB-26-1063", date: "2026-01-12", product: "Credit card", text: "I was charged a $35 fee that was never disclosed when I signed up. The fee schedule is hidden deep in the terms." },
  { id: "CFPB-26-1078", date: "2026-01-18", product: "Mobile wallet", text: "I waited on hold for over two hours and the chat bot kept looping. No human agent ever responded to my ticket." },
  { id: "CFPB-26-1091", date: "2026-01-23", product: "Debit card", text: "Unauthorized charges from a merchant I never used appeared on my card. The bank denied my dispute claim without explanation." },
  { id: "CFPB-26-1104", date: "2026-02-02", product: "Checking account", text: "They closed my account and are holding my funds for 60 days. I have been locked out with no explanation or timeline." },
  { id: "CFPB-26-1118", date: "2026-02-07", product: "Personal loan", text: "A late fee and an overdraft fee were both charged for the same payment. These hidden charges were never explained." },
  { id: "CFPB-26-1126", date: "2026-02-11", product: "Mobile wallet", text: "My phone was stolen and the thief transferred money out. Fraud team says it was authorized because the PIN was used. Totally unacceptable." },
  { id: "CFPB-26-1139", date: "2026-02-16", product: "Credit card", text: "Customer service hung up on me twice. Every agent gives a different answer and nobody follows up on my complaint." },
  { id: "CFPB-26-1145", date: "2026-02-20", product: "Checking account", text: "Identity verification failed repeatedly and my account remains frozen. I uploaded my ID five times and support never responds." },
  { id: "CFPB-26-1152", date: "2026-02-24", product: "Debit card", text: "I disputed a fraudulent transaction and the provisional credit was reversed without notice. Now I'm overdrawn." },
  { id: "CFPB-26-1167", date: "2026-03-01", product: "Money transfer", text: "The exchange rate markup and transfer fee were not shown before I confirmed. I paid far more than the quoted price." },
  { id: "CFPB-26-1173", date: "2026-03-05", product: "Mobile wallet", text: "Support emails go unanswered for weeks. There is no phone number and the in-app help center is useless." },
  { id: "CFPB-26-1188", date: "2026-03-10", product: "Credit card", text: "Scammers opened a card in my name and the bank keeps reporting it to credit bureaus despite my fraud report." },
  { id: "CFPB-26-1194", date: "2026-03-14", product: "Checking account", text: "Monthly maintenance fee was added after they promised a free account. They refused to refund the surprise charges." },
];

export const SAMPLE_CSV = `id,date,product,text
T-001,2026-02-01,SaaS billing,"I was charged twice for my subscription and support has not replied in 10 days."
T-002,2026-02-03,SaaS login,"My account got locked after a password reset and I cannot access my data."
T-003,2026-02-05,SaaS billing,"Hidden fee for extra seats appeared on my invoice without warning."
T-004,2026-02-08,SaaS support,"The chat bot loops and I never reach a human agent."
`;

// Ground-truth labels for evaluation (subset of 10)
export const EVAL_LABELS: { id: string; human: string; ai: string }[] = [
  { id: "CFPB-26-1042", human: "fraud", ai: "fraud" },
  { id: "CFPB-26-1057", human: "frozen", ai: "frozen" },
  { id: "CFPB-26-1063", human: "fees", ai: "fees" },
  { id: "CFPB-26-1078", human: "support", ai: "support" },
  { id: "CFPB-26-1091", human: "fraud", ai: "fraud" },
  { id: "CFPB-26-1104", human: "frozen", ai: "frozen" },
  { id: "CFPB-26-1118", human: "fees", ai: "fees" },
  { id: "CFPB-26-1145", human: "frozen", ai: "support" },
  { id: "CFPB-26-1152", human: "fraud", ai: "fraud" },
  { id: "CFPB-26-1167", human: "fees", ai: "fees" },
];

export function parseCustom(input: string): Complaint[] {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const isCsv = /^id\s*,/i.test(lines[0] ?? "");
  if (!isCsv) return lines.map((text, i) => ({ id: `TXT-${String(i + 1).padStart(3, "0")}`, date: "—", product: "—", text }));
  return lines.slice(1).map((line, i) => {
    const cells: string[] = [];
    let cur = "", q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) { cells.push(cur); cur = ""; }
      else cur += ch;
    }
    cells.push(cur);
    return { id: cells[0] || `ROW-${i + 1}`, date: cells[1] || "—", product: cells[2] || "—", text: cells.slice(3).join(",") || cells[0] || "" };
  }).filter((c) => c.text);
}
