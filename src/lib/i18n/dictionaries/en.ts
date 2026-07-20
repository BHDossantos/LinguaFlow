// English is the source dictionary. Its shape (`Dictionary`) is the contract
// every other locale must satisfy — keep keys identical across files.

// NOTE: intentionally no `as const` — leaf types must widen to `string` so
// other locales (with different text) are assignable to `Dictionary`.
const en = {
  nav: {
    how: "How it works",
    pricing: "Pricing",
    signIn: "Sign in",
    language: "Language",
  },
  hero: {
    eyebrow: "Languages · Math · Science · Technology · Business",
    titleLine1: "Learn anything.",
    titleLine2: "Out loud.",
    subtitle:
      "Noelia began with languages you actually speak from day one — and it's now a full learning platform. Master a language, or go deep in math, science, technology, and business. One place, one path.",
    ctaPrimary: "Start learning free",
    ctaSecondary: "How it works",
  },
  stats: {
    courses: "140+",
    coursesLabel: "courses",
    languages: "6",
    languagesLabel: "world languages",
    schools: "5",
    schoolsLabel: "subject schools",
  },
  how: {
    title: "How Noelia works",
    step1Title: "Pick your path",
    step1Body:
      "A language to speak, or a subject to master — from Spanish to Calculus to System Design. Every path is a clear sequence, level by level.",
    step2Title: "Learn by doing",
    step2Body:
      "Every lesson is active: say it out loud and get scored word-by-word, solve the problem, answer the quiz — then review it right before you'd forget.",
    step3Title: "Go further with humans",
    step3Body:
      "Connect to a live instructor by the minute, or learn inside a real classroom with teacher feedback and family visibility.",
  },
  schools: {
    title: "Five schools, one platform",
    subtitle: "Start anywhere. Everything is built on the same active, review-driven method.",
    languagesTitle: "Languages",
    languagesBody: "Spanish, French, Italian, Portuguese, English & German — A1 to C1, plus business tracks.",
    mathTitle: "Mathematics",
    mathBody: "Arithmetic through Calculus, Linear Algebra, and Differential Equations.",
    scienceTitle: "Science",
    scienceBody: "Biology, Chemistry, Physics, Psychology, and dozens more.",
    technologyTitle: "Technology",
    technologyBody: "Coding, data, cloud, security, and a full backend-developer track.",
    businessTitle: "Business",
    businessBody: "Finance, marketing, management, law, and product.",
  },
  features: {
    title: "Everything in one app",
    selfStudy: "Self-study",
    selfStudyBody: "Adaptive lessons + spaced repetition.",
    speak: "Speak from day one",
    speakBody: "Pronunciation scored word-by-word.",
    academic: "Academic depth",
    academicBody: "Math, science, tech & business.",
    instructor: "Live instructor",
    instructorBody: "Per-minute, instant connect.",
    translate: "Real-time translate",
    translateBody: "Voice, text, and on the go.",
  },
  audience: {
    title: "Made for how you learn",
    selfTitle: "Self-learners",
    selfBody: "Ten minutes a day. Your queue always knows what's next.",
    classTitle: "Classrooms",
    classBody: "Teachers assign, the system grades in seconds, teachers review.",
    familyTitle: "Families",
    familyBody: "Parents follow progress, grades, and attendance — no nagging.",
  },
  cta: {
    title: "Your first lesson is 30 seconds away.",
    subtitle: "Free to start. No credit card. Works on any phone.",
    button: "Start learning free",
    pricing: "Pricing",
    privacy: "Privacy",
    terms: "Terms",
  },
};

export type Dictionary = typeof en;
export default en;
