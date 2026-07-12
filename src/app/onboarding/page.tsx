import { requireUser } from "@/lib/auth";
import { OnboardingClient } from "./OnboardingClient";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  // Google sign-ins carry the user's name — prefill so they just confirm.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const defaultName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  return <OnboardingClient defaultName={defaultName} />;
}
