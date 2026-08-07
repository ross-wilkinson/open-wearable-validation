import { AUTHOR } from '../content/author.ts';

export default function AboutPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">About</h1>
      </header>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <p>
          G*Power and its clones cover classical power analysis — t-tests, ANOVA — and
          stop there. Validation work runs on <em>agreement</em> statistics: bias,
          limits of agreement, percentile error. There is no free tool for sizing a
          study around those, so it gets done in spreadsheets.
        </p>
        <p>
          This is that calculation, done properly. Everything runs in your browser;
          nothing is uploaded, stored, or sent anywhere.
        </p>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Who made it</h2>
        <p>{AUTHOR.shortBio}</p>
        <p>{AUTHOR.credentialLine}</p>
        <p>
          <a
            href={AUTHOR.scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="text-series-1 underline underline-offset-2"
          >
            Publications on Google Scholar
          </a>
        </p>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          How the numbers are checked
        </h2>
        <p>
          The browser has no SciPy, so every distribution here — normal, Student t,
          half-normal, Poisson, non-central t — is implemented from scratch in
          TypeScript. Hand-rolled special functions are subtly wrong by default, so each
          one is tested against golden values generated from SciPy across thousands of
          grid points, and those fixtures are regenerated in CI to catch any that get
          quietly edited.
        </p>
        <p>
          Where the source notebooks contained errors, they were fixed rather than
          ported, and each module says which. Where a published reference turned out to
          be the less accurate side — SciPy&rsquo;s own <code>betaln</code> is one — the
          code is graded against exact arithmetic instead, and says so.
        </p>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Caveats</h2>
        <p>
          Every module assumes measurement errors are normally distributed unless it
          says otherwise, and that observations are independent. Repeated measures on
          the same subject violate the second assumption, and the required sample sizes
          here will be optimistic if you have them.
        </p>
        <p>
          These are planning tools. They tell you what precision a design can deliver;
          they are not a substitute for a statistician on a regulatory submission.
        </p>
      </section>
    </article>
  );
}
