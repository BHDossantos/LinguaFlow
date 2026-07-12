// Career tracks: how a language level converts into work opportunities.
// Static v1 — curated, honest, and useful without any external service.
export type CareerTrack = {
  id: string;
  icon: string;
  title: string;
  description: string;
  minLevel: "A2" | "B1" | "B2";
  skills: string[];
  interviewScenario: string; // matches a /practice scenario title
};

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: "hospitality",
    icon: "🏨",
    title: "Hospitality & Tourism",
    description:
      "Hotels, restaurants, airlines, and tour operators hire multilingual staff first. Guest-facing roles start at conversational level.",
    minLevel: "A2",
    skills: ["Greeting guests", "Reservations & schedules", "Handling complaints", "Directions & recommendations"],
    interviewScenario: "Job interview",
  },
  {
    id: "business",
    icon: "💼",
    title: "Business & Sales",
    description:
      "Account managers and sales reps who speak the client's language close more deals. International teams pay a premium for it.",
    minLevel: "B1",
    skills: ["Small talk & rapport", "Presenting a product", "Negotiating politely", "Email & meeting etiquette"],
    interviewScenario: "Job interview",
  },
  {
    id: "healthcare",
    icon: "🩺",
    title: "Healthcare Support",
    description:
      "Clinics and hospitals in multilingual cities need staff who can take histories and explain instructions to patients.",
    minLevel: "B1",
    skills: ["Symptoms & history taking", "Explaining instructions", "Reassuring patients", "Pharmacy vocabulary"],
    interviewScenario: "Doctor visit",
  },
  {
    id: "education",
    icon: "🎓",
    title: "Teaching & Tutoring",
    description:
      "Reach B2 and you can tutor beginners — including right here on Noelia's instructor marketplace, billed per minute.",
    minLevel: "B2",
    skills: ["Explaining grammar simply", "Giving feedback kindly", "Lesson planning", "Assessment"],
    interviewScenario: "Job interview",
  },
  {
    id: "service",
    icon: "🛎️",
    title: "Customer Support",
    description:
      "Remote-friendly and always hiring: support teams route tickets by language, and bilingual agents earn more.",
    minLevel: "A2",
    skills: ["Understanding a problem", "Apologizing & de-escalating", "Explaining a fix step by step", "Written chat support"],
    interviewScenario: "Lost wallet",
  },
];

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function levelReached(current: string | null | undefined, needed: string) {
  if (!current) return false;
  return LEVEL_ORDER.indexOf(current) >= LEVEL_ORDER.indexOf(needed);
}
