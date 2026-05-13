import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createCourse } from "@/app/teach/actions";
import { LANGUAGES, LANGUAGE_CODES } from "@/lib/languages";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  await requireUser();
  return (
    <div className="space-y-4">
      <Link href="/teach" className="text-sm text-brand-500">← Teach</Link>
      <h1 className="text-2xl font-bold">New course</h1>

      <form action={createCourse} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input name="title" required minLength={2} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea name="description" rows={3} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2" />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-sm font-medium">Subject area</span>
            <select name="kind" required className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2">
              <option value="language">Language</option>
              <option value="math">Math</option>
              <option value="science">Science</option>
              <option value="humanities">Humanities</option>
              <option value="arts">Arts</option>
              <option value="life_skills">Life skills</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Subject (free text)</span>
            <input name="subject" placeholder="e.g. AP Biology" className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-sm font-medium">Instruction language</span>
            <select name="language" required className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2">
              {LANGUAGE_CODES.map((c) => (
                <option key={c} value={c}>{LANGUAGES[c].flag} {LANGUAGES[c].label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">CEFR (if language course)</span>
            <select name="cefr_level" className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2">
              <option value="">—</option>
              {["A1","A2","B1","B2","C1","C2"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>

        <button type="submit" className="btn-primary w-full">Create course</button>
      </form>
    </div>
  );
}
