import { requireUser } from "@/lib/auth";
import { CoachClient } from "@/app/coach/CoachClient";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  await requireUser();
  return <CoachClient />;
}
