// Learning motivations offered during onboarding; profile renders the same
// list, so labels/icons stay in sync.
export const GOALS = [
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "family", label: "Family / partner", icon: "👨‍👩‍👧" },
  { id: "school", label: "School / exams", icon: "🎓" },
  { id: "media", label: "Films & shows", icon: "🎬" },
  { id: "dating", label: "Dating", icon: "💛" },
] as const;

export function goalLabel(id: string) {
  const g = GOALS.find((g) => g.id === id);
  return g ? `${g.icon} ${g.label}` : id;
}
