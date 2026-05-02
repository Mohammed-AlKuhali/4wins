type Pillar = "mental" | "physical" | "spiritual" | "financial";

const KEYWORDS: Record<Pillar, string[]> = {
  mental: [
    "learn", "study", "read", "book", "course", "lesson", "focus",
    "problem", "think", "write", "code", "research", "aprender", "leer",
    "تعلم", "قرأ", "كتاب",
  ],
  physical: [
    "run", "walk", "gym", "workout", "eat", "sleep", "water", "exercise",
    "yoga", "stretch", "swim", "bike", "correr", "caminar", "ejercicio",
    "ركض", "نام", "تمرين",
  ],
  spiritual: [
    "pray", "prayed", "meditate", "reflect", "grateful", "gratitude",
    "purpose", "faith", "peace", "mindful", "rezar", "meditar", "gracias",
    "صلى", "تأمل", "شكر",
  ],
  financial: [
    "save", "saved", "spend", "budget", "money", "invest", "dollar",
    "expense", "income", "debt", "ahorrar", "dinero", "presupuesto",
    "وفر", "مال", "استثمر",
  ],
};

export function fallbackHeuristic(text: string): {
  pillar: Pillar;
  confidence: number;
  reasoning: string;
} {
  const lower = text.toLowerCase();
  const counts: Record<Pillar, number> = { mental: 0, physical: 0, spiritual: 0, financial: 0 };

  for (const [pillar, words] of Object.entries(KEYWORDS) as [Pillar, string[]][]) {
    for (const word of words) {
      if (lower.includes(word)) counts[pillar]++;
    }
  }

  const best = (Object.entries(counts) as [Pillar, number][]).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["mental" as Pillar, 0]
  );

  return {
    pillar: best[1] > 0 ? best[0] : "mental",
    confidence: 0.3,
    reasoning: "Keyword-based heuristic fallback",
  };
}
