import Link from "next/link";

export const metadata = { title: "Terms of Service — Noelia" };

// Comprehensive terms tailored to Noelia (New Hampshire, USA; operations in
// Rome, Italy). Have counsel review and confirm the legal entity before launch.
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-prose space-y-5 pb-10 text-sm leading-relaxed text-ink-700">
      <div>
        <Link href="/" className="text-sm text-brand-500">← Home</Link>
        <h1 className="mt-1 text-2xl font-bold text-ink-900">Terms of Service</h1>
        <p className="text-xs text-ink-500">Last updated: October 9, 2026</p>
      </div>

      <p>
        These Terms of Service (“Terms”) are an agreement between you and Noelia (“Noelia”,
        “we”, “us”) — based in New Hampshire, United States, with operations in Rome, Italy —
        and govern your use of learnnoelia.com and our mobile apps (the “Service”). By creating an account or using the Service, you agree to
        these Terms and to our <Link href="/legal/privacy" className="text-brand-600 underline">Privacy Policy</Link>.
        If you do not agree, do not use the Service.
      </p>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">1. Eligibility &amp; accounts</h2>
        <p>
          You must be able to form a binding contract to use the Service. Children may use the
          Service only through a school or with verifiable parental consent, as described in the
          Privacy Policy. You are responsible for your account, for keeping your credentials
          secure, and for activity under your account. Provide accurate information and keep it
          up to date. Teachers and schools are responsible for having the authority and consents
          needed to create and manage student accounts and to upload student work.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">2. The Service</h2>
        <p>
          Noelia provides interactive courses, practice, assessments, AI-assisted feedback and
          grading, classroom and gradebook tools, and—where available—live instruction. We may
          add, change, or discontinue features. Course materials are original and are adapted
          from openly licensed sources (for example, content under Creative Commons licenses);
          each course cites its source.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>break the law, infringe others’ rights, or upload content you don’t have the right to share;</li>
          <li>upload another person’s work or data without authorization, or misuse student data;</li>
          <li>attempt to access accounts or data that aren’t yours, probe or disrupt the Service, or bypass security or usage limits;</li>
          <li>scrape, resell, or create competing datasets from the Service; or</li>
          <li>upload malware or unlawful, harmful, or harassing content.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">4. Your content</h2>
        <p>
          You retain ownership of the content you submit (such as assignments, projects, notes,
          and uploaded work). You grant Noelia a limited license to host, process, display, and
          transmit your content as needed to operate the Service for you and the people you share
          it with (such as your teacher, school, or linked guardian), including sending it to our
          AI provider to generate feedback, grades, or translations. You are responsible for your
          content and for having the rights and consents to submit it.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">5. AI-assisted feedback &amp; academic integrity</h2>
        <p>
          Feedback, scores, transcriptions, and grades generated with automated assistance are
          provided to help learning and teaching. They may be incomplete or wrong and are not a
          substitute for a teacher’s professional judgment; a teacher should review results that
          affect a grade. You are responsible for using the Service honestly and in line with
          your school’s academic-integrity rules.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">6. Subscriptions, payments &amp; tutoring</h2>
        <p>
          Some features require a paid subscription or per-session payment. Prices are shown
          before you buy. Payments are handled by our payment processor; by purchasing you
          authorize the applicable charges, including recurring charges for subscriptions until
          you cancel. You can cancel a subscription to stop future renewals; access continues
          through the end of the paid period. Tutoring sessions may be billed per minute and
          charged when the session ends. Except where required by law, payments are
          non-refundable. Purchases made on the web are governed by these Terms; where you access
          paid features through an app store, that store’s billing rules may also apply.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">7. Intellectual property</h2>
        <p>
          The Service, including its software, design, and original course content, is owned by
          Noelia or its licensors and is protected by intellectual-property laws. We grant you a
          limited, non-exclusive, non-transferable license to use the Service for your personal
          or your school’s educational use. You may not copy, modify, distribute, or create
          derivative works except as allowed by these Terms or the applicable open-source/open-
          content license of specific materials.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">8. Third-party services</h2>
        <p>
          The Service relies on third parties (for hosting, payments, live video, AI processing,
          email, and notifications) and may link to third-party sites. We are not responsible for
          third-party services, and your use of them may be subject to their own terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">9. Disclaimers</h2>
        <p>
          The Service is provided “as is” and “as available,” without warranties of any kind to
          the fullest extent permitted by law. We do not warrant that the Service will be
          uninterrupted, error-free, or secure, or that content, feedback, or grades will be
          accurate. Noelia is an educational tool and does not guarantee any academic,
          certification, or other outcome.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">10. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Noelia and its suppliers will not be liable for
          indirect, incidental, special, consequential, or punitive damages, or for lost profits
          or data. Our total liability for any claim relating to the Service will not exceed the
          greater of the amount you paid us in the 12 months before the claim or USD 100. Some
          jurisdictions do not allow certain limitations, so some of the above may not apply to
          you.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">11. Indemnification</h2>
        <p>
          You agree to indemnify and hold Noelia harmless from claims and expenses arising out of
          your content, your use of the Service, or your violation of these Terms or others’
          rights.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">12. Suspension &amp; termination</h2>
        <p>
          You may stop using the Service and delete your account at any time. We may suspend or
          terminate access if you violate these Terms or to protect the Service or others. On
          termination, your right to use the Service ends; sections that by their nature should
          survive (such as ownership, disclaimers, and limitation of liability) will survive.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">13. Governing law &amp; disputes</h2>
        <p>
          These Terms are governed by the laws of the State of New Hampshire, United States,
          without regard to conflict-of-laws rules, and disputes will be resolved in the state
          or federal courts located in New Hampshire, unless applicable law provides otherwise.
          If you are a consumer located in the European Union (including Italy) or elsewhere, you
          keep the mandatory protections of the law of your country of residence, and nothing in
          these Terms deprives you of those rights.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">14. Changes</h2>
        <p>
          We may update these Terms. We will update the “Last updated” date and, for material
          changes, give more prominent notice. Continued use after changes take effect means you
          accept the updated Terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink-900">15. Contact</h2>
        <p>
          Questions: <a href="mailto:support@learnnoelia.com" className="text-brand-600 underline">support@learnnoelia.com</a>.
        </p>
      </section>

      <p className="text-xs text-ink-400">
        See also our <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </article>
  );
}
