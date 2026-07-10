import Link from "next/link";

export const metadata = { title: "Privacy Policy — Noelia" };

// NOTE: starter policy. Have a lawyer review before public launch,
// especially for COPPA/FERPA if minors will use the product.
export default function PrivacyPage() {
  return (
    <article className="prose-sm mx-auto max-w-prose space-y-4 pb-8">
      <Link href="/" className="text-sm text-brand-500">← Home</Link>
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="text-xs text-ink-500">Last updated: July 2026</p>

      <section className="space-y-2 text-sm leading-relaxed">
        <h2 className="font-semibold">What we collect</h2>
        <p>
          Account email, display name, learning preferences (language, level,
          goals), and your learning activity: lessons completed, review
          ratings, pronunciation attempt scores, assignment submissions, and
          messages you send to the coach.
        </p>
        <h2 className="font-semibold">How we use it</h2>
        <p>
          To run the product: scheduling your reviews, scoring practice,
          showing progress to you — and, where you join a classroom or link a
          guardian, to your teacher or parent. We do not sell personal data.
        </p>
        <h2 className="font-semibold">Voice</h2>
        <p>
          Speech recognition for pronunciation practice runs in your browser.
          Audio you attach to assignments is stored privately and is visible
          only to you and your teacher.
        </p>
        <h2 className="font-semibold">Your rights</h2>
        <p>
          You can export or correct your data from Settings, and delete your
          account entirely — deletion removes your profile and all learning
          history permanently.
        </p>
        <h2 className="font-semibold">Contact</h2>
        <p>Questions: reply to any email from us or contact the account owner of your school.</p>
      </section>
    </article>
  );
}
