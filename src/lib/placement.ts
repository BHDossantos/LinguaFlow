import type { LanguageCode } from "@/lib/languages";

// Placement test: 8 questions per language, ordered easy → hard (2 each at
// A1/A2/B1/B2). Self-reported levels skew optimistic or modest; a 2-minute
// measured check calibrates the path better ("Step 2 — Assessment" in the
// product spec). Scoring is total-correct → CEFR (see scorePlacement).
export type PlacementQuestion = {
  prompt: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
};

export const PLACEMENT: Record<LanguageCode, PlacementQuestion[]> = {
  es: [
    { prompt: "“Hola, ¿cómo ___?” — greeting a friend", options: ["estás", "eres", "tienes", "vas"], answer: 0 },
    { prompt: "“Yo ___ de Brasil.”", options: ["estoy", "soy", "tengo", "hago"], answer: 1 },
    { prompt: "“Ayer ___ al cine con mis amigos.”", options: ["voy", "iba", "fui", "iré"], answer: 2 },
    { prompt: "Pick the correct sentence:", options: ["Me gusta los perros", "Me gustan los perros", "Me gusto los perros", "Yo gustan los perros"], answer: 1 },
    { prompt: "“Cuando era niño, ___ en la playa todos los veranos.”", options: ["jugué", "jugaba", "juego", "jugaré"], answer: 1 },
    { prompt: "“No creo que ___ razón.”", options: ["tienes", "tiene", "tengas", "tener"], answer: 2 },
    { prompt: "“Si tuviera más tiempo, ___ otro idioma.”", options: ["aprendo", "aprendería", "aprenderé", "aprendía"], answer: 1 },
    { prompt: "“Para cuando llegues, ya ___ de cenar.”", options: ["habremos terminado", "terminamos", "hemos terminado", "terminaremos"], answer: 0 },
  ],
  fr: [
    { prompt: "“Bonjour, comment ça ___ ?”", options: ["va", "vas", "allez", "est"], answer: 0 },
    { prompt: "“Je ___ américain.”", options: ["ai", "es", "suis", "vais"], answer: 2 },
    { prompt: "“Hier, nous ___ au restaurant.”", options: ["allons", "sommes allés", "irons", "allions"], answer: 1 },
    { prompt: "Pick the correct sentence:", options: ["J'ai 25 ans", "Je suis 25 ans", "J'ai 25 années vieux", "Je fais 25 ans"], answer: 0 },
    { prompt: "“Quand j'étais petit, je ___ au foot le dimanche.”", options: ["jouais", "ai joué", "joue", "jouerai"], answer: 0 },
    { prompt: "“Il faut que tu ___ plus tôt.”", options: ["viens", "viennes", "venir", "viendras"], answer: 1 },
    { prompt: "“Si j'avais le temps, je ___ plus souvent.”", options: ["voyage", "voyagerais", "voyagerai", "voyageais"], answer: 1 },
    { prompt: "“C'est le projet ___ je suis le plus fier.”", options: ["que", "dont", "qui", "lequel"], answer: 1 },
  ],
  it: [
    { prompt: "“Ciao, come ___?”", options: ["stai", "sei", "hai", "vai"], answer: 0 },
    { prompt: "“Io ___ di Roma.”", options: ["sto", "sono", "ho", "faccio"], answer: 1 },
    { prompt: "“Ieri ___ una pizza buonissima.”", options: ["mangio", "mangiavo", "ho mangiato", "mangerò"], answer: 2 },
    { prompt: "Pick the correct sentence:", options: ["Mi piace i libri", "Mi piacciono i libri", "Io piaccio i libri", "Mi piaco i libri"], answer: 1 },
    { prompt: "“Da bambino ___ sempre al mare d'estate.”", options: ["sono andato", "andavo", "vado", "andrò"], answer: 1 },
    { prompt: "“Penso che lui ___ ragione.”", options: ["ha", "abbia", "avere", "avrà"], answer: 1 },
    { prompt: "“Se avessi più tempo, ___ un altro corso.”", options: ["seguo", "seguirei", "seguirò", "seguivo"], answer: 1 },
    { prompt: "“Entro domani il lavoro ___ finito.”", options: ["sarà stato", "è", "era", "sarebbe"], answer: 0 },
  ],
  pt: [
    { prompt: "“Oi, tudo ___?”", options: ["bem", "bom", "boa", "vai"], answer: 0 },
    { prompt: "“Eu ___ dos Estados Unidos.”", options: ["estou", "sou", "tenho", "faço"], answer: 1 },
    { prompt: "“Ontem eu ___ ao mercado.”", options: ["vou", "ia", "fui", "irei"], answer: 2 },
    { prompt: "Pick the correct sentence:", options: ["Eu gosto de viajar", "Eu gosto viajar", "Eu gosta de viajar", "Me gosta viajar"], answer: 0 },
    { prompt: "“Quando era criança, eu ___ na rua todos os dias.”", options: ["brinquei", "brincava", "brinco", "brincarei"], answer: 1 },
    { prompt: "“Espero que você ___ amanhã.”", options: ["vem", "venha", "vir", "virá"], answer: 1 },
    { prompt: "“Se eu tivesse dinheiro, ___ o mundo.”", options: ["viajo", "viajaria", "viajarei", "viajava"], answer: 1 },
    { prompt: "“Quando você chegar, eu já ___ saído.”", options: ["terei", "tenho", "tinha", "teria"], answer: 0 },
  ],
  en: [
    { prompt: "“Hi! How ___ you?”", options: ["are", "is", "am", "be"], answer: 0 },
    { prompt: "“She ___ from Japan.”", options: ["are", "is", "am", "be"], answer: 1 },
    { prompt: "“Yesterday I ___ to the store.”", options: ["go", "goed", "went", "gone"], answer: 2 },
    { prompt: "Pick the correct sentence:", options: ["He don't like coffee", "He doesn't likes coffee", "He doesn't like coffee", "He not like coffee"], answer: 2 },
    { prompt: "“I ___ TV when the phone rang.”", options: ["watched", "was watching", "watch", "have watched"], answer: 1 },
    { prompt: "“I've lived here ___ 2019.”", options: ["for", "since", "from", "during"], answer: 1 },
    { prompt: "“If I ___ more time, I would travel.”", options: ["have", "had", "would have", "having"], answer: 1 },
    { prompt: "“By next year, she ___ her degree.”", options: ["will have finished", "finishes", "has finished", "will finishing"], answer: 0 },
  ],
};

export function scorePlacement(correct: number): "A1" | "A2" | "B1" | "B2" | "C1" {
  if (correct <= 2) return "A1";
  if (correct <= 4) return "A2";
  if (correct <= 6) return "B1";
  if (correct === 7) return "B2";
  return "C1";
}
