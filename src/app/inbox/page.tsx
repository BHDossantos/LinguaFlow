import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { NotificationRow } from "./NotificationRow";
import { MarkAllReadButton } from "./MarkAllReadButton";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const user = await requireUser();
  const supabase = supabaseServer();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id,kind,title,body,link,read_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = notifications ?? [];
  const unread = rows.filter((n) => n.read_at == null).length;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-sm text-ink-500">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        <MarkAllReadButton disabled={unread === 0} />
      </header>

      {rows.length === 0 ? (
        <p className="card text-sm text-ink-500">
          No notifications yet. You'll hear here when a grade is returned, an
          announcement is posted in one of your classrooms, or a guardian sees
          an attendance update.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((n) => (
            <li key={n.id}>
              <NotificationRow
                id={n.id}
                kind={n.kind}
                title={n.title}
                body={n.body}
                link={n.link}
                read={n.read_at != null}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
