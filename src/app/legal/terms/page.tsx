import Link from "next/link";

export const metadata = { title: "Terms of Service — Noelia" };

// NOTE: starter terms. Have a lawyer review before public launch.
export default function TermsPage() {
  return (
    <article className="prose-sm mx-auto max-w-prose space-y-4 pb-8">
      <Link href="/" className="text-sm text-brand-500">← Home</Link>
      <h1 className="text-2xl font-bold">Terms of Service</h1>
      <p className="text-xs text-ink-500">Last updated: July 2026</p>

      <section className="space-y-2 text-sm leading-relaxed">
        <h2 className="font-semibold">The service</h2>
        <p>
          Noelia is a learning platform: lessons, practice, coaching, and
          classroom tools. Accounts are personal; keep your sign-in link private.
        </p>
        <h2 className="font-semibold">Acceptable use</h2>
        <p>
          Don't abuse the platform: no harassment in classrooms, no attempts to
          break or overload the service, no submitting others' work as your own.
        </p>
        <h2 className="font-semibold">Content</h2>
        <p>
          Teachers own the courses they author and grant Noelia a license to
          host and display them to enrolled students. Your submissions remain
          yours.
        </p>
        <h2 className="font-semibold">Coaching and grading</h2>
        <p>
          Automated feedback (grades, scores, coaching) is assistive and can be
          wrong; teachers review and make final calls in classroom settings.
        </p>
        <h2 className="font-semibold">Termination</h2>
        <p>
          You can delete your account at any time from Settings. We may suspend
          accounts that violate these terms.
        </p>
      </section>
    </article>
  );
}
