import { requireUser } from "@/lib/auth";
import { OnboardingClient } from "./OnboardingClient";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  await requireUser();
  return <OnboardingClient />;
}
