import { requireOnboardedUser } from "@/lib/auth";
import { PlaygroundClient } from "./PlaygroundClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Code playground" };

// Interactive coding lab (spec §12): write JavaScript, run it in a sandboxed
// worker, and get checked instantly against hidden tests — learn by doing.
export default async function PlaygroundPage() {
  await requireOnboardedUser();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Code playground</h1>
        <p className="text-sm text-ink-500">
          Solve each challenge in JavaScript and run it — your code is checked instantly
          against hidden tests. Everything runs privately in your browser.
        </p>
      </header>
      <PlaygroundClient />
    </div>
  );
}
