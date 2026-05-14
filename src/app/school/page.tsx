import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { SchoolClient } from "./SchoolClient";

export const dynamic = "force-dynamic";

export default async function SchoolPage() {
  const user = await requireUser();
  const supabase = supabaseServer();

  const { data: memberships } = await supabase
    .from("org_members")
    .select("role, org:organizations(id,name,type,country)")
    .eq("user_id", user.id);

  const orgs = (memberships ?? [])
    .map((m: any) => m.org && { ...m.org, role: m.role })
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">School</h1>
        <p className="text-sm text-ink-500">
          Organizations group teachers, students, courses, and classrooms under one roof.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Your organizations
        </h2>
        {orgs.length === 0 ? (
          <p className="card text-sm text-ink-500">You're not in any organization yet.</p>
        ) : (
          <ul className="space-y-2">
            {orgs.map((o: any) => (
              <li key={o.id}>
                <Link href={`/school/${o.id}`} className="card flex items-center justify-between">
                  <div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs capitalize text-ink-500">
                      {o.type.replace("_", " ")}{o.country ? ` · ${o.country}` : ""}
                    </p>
                  </div>
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold capitalize text-brand-700">
                    {o.role}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SchoolClient />
    </div>
  );
}
