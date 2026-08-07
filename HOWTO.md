# How This Was Built

A from-scratch account of building the Validation Study Designer, written **as
it was built**, in order, including the wrong turns. The goal is not a polished
retrospective — it is something you could follow to re-derive the whole thing
and understand *why* each decision went the way it did.

The repo is the source of truth for exact code. This file is the reasoning
around it, weighted toward the numerical and statistical decisions, since the
general React/Vite tooling is already covered in `cycling-sim/HOWTO.md`.

---

## Milestone 0: Golden fixtures, before a line of TypeScript

### Why this comes first

The whole project rests on one uncomfortable fact: **hand-rolled special
functions are subtly wrong by default.** Not obviously wrong — subtly. They
return plausible numbers that are off in the fourth decimal, or that fall apart
only in the tails. A chart built on those looks completely fine and is
worthless, and nobody ever finds out.

So before any implementation: `tools/generate_fixtures.py` runs SciPy across a
grid of inputs for every distribution the app needs, and dumps the answers to
JSON. Those fixtures are committed. Every TypeScript function is then graded
against SciPy's output rather than against a second hand calculation that could
share the same misunderstanding.

CI regenerates the fixtures from SciPy and fails if they differ from the
committed copies. That job exists for exactly one failure mode: a future
developer (or a future me) hitting a failing test and "fixing" it by nudging the
expected value. The fixture is the oracle; it does not get to move.

### Designing the grid

The grid is not uniform, and that is deliberate:

- **Degrees of freedom** cover 1 and 2 (pathological — Cauchy-like, undefined
  variance), the realistic study range, and 500 (does it converge to the normal
  limit, or drift?).
- **Probabilities** are dense in the tails. Every confidence interval in this
  app evaluates a quantile at 0.975 or beyond, so uniform sampling on [0,1]
  would test mostly the region nobody reads.
- **Module worked examples** are included as their own fixtures — the numbers
  the source notebooks actually *printed*. Matching those verifies the port
  against something the code had no way to derive on its own, which is far
  stronger than matching a formula I also wrote.

### Relative error, not `toBeCloseTo`

`expect(x).toBeCloseTo(y, 10)` is an **absolute** check. For a tail probability
of 1e-12 it passes for essentially any implementation that returns something
small — precisely the region where a hand-rolled distribution is most likely
broken. `checkGrid` in `src/stats/testing/fixtures.ts` uses relative error, and
takes an optional absolute tolerance only where an algorithm genuinely cannot
deliver relative accuracy (see Milestone 2, non-central t).

It also returns *every* failure rather than throwing on the first. When porting
a distribution, "83 of 2160 cases fail, all at df=1" localises the bug
instantly; "the first case failed" says almost nothing.

### Try it yourself

```sh
npm run fixtures     # needs Python + SciPy
git diff src/stats/__fixtures__     # should be empty
```

---

## Milestone 1: Scaffold

Mostly conventional; three things worth recording.

### The Vite template moved

`npm create vite@latest -- --template react-ts` now ships **oxlint** rather than
ESLint, and no longer sets `"strict": true` in `tsconfig.app.json`. Both were
changed back: ESLint + Prettier to match the existing conventions, and `strict`
plus `noUncheckedIndexedAccess` added deliberately. The second earns its keep
here specifically because the stats core and its fixture-driven tests index into
arrays constantly (`curve[i]`, `fixture.ppf[j]`), and without it TypeScript
hands back a non-optional type for an access that can very much be out of range.

### Reading a CVE instead of obeying it

`npm audit` flagged react-router 7.12–8.2: an RSC-mode CSRF bypass. This app is
a static SPA with `HashRouter` and no server actions, so the advisory cannot
apply. Tempting to leave it, and equally tempting to make the warning go away.

I downgraded to the unaffected 7.11.0 — and that was **wrong**. It traded one
inapplicable advisory for *fourteen* real ones, including open-redirect XSS in
`<Link>` and `useNavigate`, which this app does use. Reverted to 7.18.2.

The lesson generalises past this package: "clean `npm audit`" is not the goal.
Reading which advisories reach your actual threat model is, and sometimes the
version with a scary-looking warning is the safer one.

### The React rule I kept tripping over

`react-hooks/set-state-in-effect` fired three separate times across the build
(theme, timeline hook, timeline fallback). Every time, the rule was right and my
instinct was wrong. The pattern in each case:

- If it's **derived from props/state** → compute it during render, or `useMemo`.
- If it's **external state** (a media query, an OS preference) →
  `useSyncExternalStore`.
- If it's **pushing state out** to the DOM or `localStorage` → that is what an
  effect is legitimately for.

An effect that reads state and sets other state is almost always a second copy
of an answer that can go stale.

---

## Milestone 2: The stats core — where the real work was

`src/stats/` has zero dependency on React or the DOM. That is what lets every
function be verified in isolation against SciPy. Four bugs came out of this
milestone and all four are instructive.

### Bug 1: the "double-precision normal CDF" that isn't, in the tails

Hart's (1968) rational approximation is what circulates as *the*
double-precision normal CDF, and its central branch genuinely is. Its **tail**
branch is a fixed five-level continued fraction — and five levels are nowhere
near converged around |x| = 7. Measured: ~1e-9 relative accuracy, against the
1e-15 the central branch delivers.

The fixture grid caught it immediately, because it includes tail points graded
on relative error.

The fix removed code rather than adding it. There is an exact identity:

```
Phi(-|x|) = 0.5 * erfc(|x|/sqrt(2)) = 0.5 * Q(1/2, x^2/2)
```

where `Q` is the regularized upper incomplete gamma already implemented in
`special.ts` — and that routine already runs a properly convergent Lentz
continued fraction. Building the normal CDF on it inherits ~1e-15 relative
accuracy all the way out to Phi(-30) ≈ 5e-198, and deletes a block of magic
constants. **One fewer approximation in the codebase is worth more than a
faster one.**

### Bug 2: wrong by exactly a factor of two

Every Student t quantile came back at exactly half SciPy's answer. A clean
factor of two across the entire grid looks like an algebra slip — a missing `2`
somewhere in a formula.

It was a **convergence failure**. My root finder took a false-position step
whenever it landed inside the bracket, on the reasoning that it is "bisection
but faster". It is not. For a *convex* function — which every CDF is on one side
of its median — false position converges from one side only: the same endpoint
is replaced every iteration and the other never moves. The bracket width never
approaches zero, the `hi - lo <= tol` termination never fires, the loop runs its
full budget, and falls through to `0.5 * (lo + hi)` with `lo` still at its
initial value of 0.

Half the root. Every time.

The fix is the **Illinois** modification, three lines: when the same endpoint is
retained twice running, halve its stored function value, biasing the next
interpolation toward the stagnant side. Superlinear convergence, bracket
guarantee intact.

> **Worth internalising:** "wrong by a constant factor" does not imply the
> mistake was in a formula. `rootFind.test.ts` now contains a regression test on
> a deliberately convex function, plus an iteration-count test — because a "fix"
> that merely raised `maxIterations` would pass the first test while doing
> enormously more work.

### Bug 3: catastrophic cancellation, and where to bother fixing it

`logBeta(a, b) = logGamma(a) + logGamma(b) - logGamma(a+b)` is the textbook
form, and it is fine when `a` and `b` are comparable. When one dominates it
quietly loses three significant digits: at df = 500 the Student t PDF needs
`logBeta(250, 0.5)`, where `logGamma(250) = 1176.6` and
`logGamma(250.5) = 1177.7` agree to four digits and their *difference* is the
answer. Relative error of 1e-16 on inputs that size lands as ~1e-13 on the
result, and `exp` carries it straight through.

The fingerprint is distinctive: the failures appeared **only** at df = 199 and
500, never at small df. A wrong formula fails everywhere; cancellation fails
only where the arguments are lopsided.

Fixed with a `log1p`-based Stirling difference, plus an exact recurrence
(`D(x) = D(x+1) - log1p(delta/x)`) to walk small arguments up into the range
where Stirling is valid — so there is no threshold at which the accuracy story
changes, and no seam where a chart could kink.

**And then I did *not* fix the same bug elsewhere.** The Poisson PMF and the
incomplete gamma both evaluate `exp(-x + a*log(x) - logGamma(a))`, which cancels
identically for large `a`, at ~1.7e-13. Loader's saddle-point form (`bd0` /
`stirlerr`, what R and SciPy use) would fix it. I skipped it deliberately and
documented why: `logBeta` sits underneath the Student t, which sits underneath
every confidence interval in the app, so error there propagates everywhere. The
Poisson PMF is only read to draw a phase-duration histogram, where 1e-13 is
eleven digits past anything that renders.

> Knowing which precision problems are worth fixing is the skill. Fixing all of
> them uniformly is not.

### Bug 4: the reference was the broken one — twice

**`scipy.special.betaln`.** After the `logBeta` fix, tests still disagreed with
the fixture — and the disagreement got *worse* with argument size. That is the
wrong shape for a bug in a well-tested port.

SciPy's `betaln` is the naive cancelling form. Measured against the exact closed
form `B(a, 1/2) = (a-1)! a! 4^a / (2a)!` computed over exact integers in 60-digit
Decimal:

| a | this implementation | SciPy |
|---|---|---|
| 5 | 2.9e-15 | 1.4e-16 |
| 250 | **0.0** | 4.3e-14 |
| 500 | 4.4e-16 | 3.3e-13 |
| 1000 | 8.9e-16 | **7.7e-13** |

So the fixture for that function was replaced with exact arithmetic, and the
SciPy grid demoted to a loose coverage net explicitly graded at SciPy's own
accuracy.

**`scipy.stats.nct.cdf`.** Returns `NaN` in the deep tail — e.g. `df=199,
nc=21, t=-6`, roughly a 27-sigma event whose true value underflows to zero
(`nct.sf` there returns exactly 1.0). Its Cephes routine gives up. Those 84 grid
points are excluded from the graded grid and listed separately, where the only
assertion is that this implementation stays finite and in [0,1] — i.e. degrades
more gracefully than the reference.

> **The general lesson:** a golden-value test is only as good as its oracle.
> When a well-tested port disagrees with its reference in a way that gets worse
> with argument size, or only in a region where the reference is known to
> struggle — suspect the reference before patching the port.

### The non-central t, and honest tolerances

AS 243 (Lenth 1989) builds the CDF as a Poisson-weighted mixture of incomplete
beta terms, advancing two series together with the betas updated by recurrence,
so the whole sum costs one `incompleteBeta` call regardless of term count.

It has a real limitation: it builds its answer by repeatedly subtracting O(1)
quantities, so it carries a roundoff floor around 1e-15 **in absolute terms**,
no matter how small the true answer. Where the true probability is 1e-77 that is
a relative error of 1e62.

Rather than pad the tolerance until it passed, the test states which region is
graded how, and why:

- **1e-9 relative OR 1e-13 absolute** across the full grid.
- A **second test** restricted to probabilities above 1e-4 removes the absolute
  escape hatch entirely and demands full relative accuracy — that being the
  range any caller actually reads.

Where to put the second cutoff falls straight out of the arithmetic: achievable
relative error is roughly `atol / want`, so a floor of ~3e-15 supports a 1e-9
claim only for `want > 3e-6`. Measured, cases at exactly 1e-6 failed at 1e-9 to
3.4e-9 — the arithmetic, confirmed. The cutoff sits at 1e-4 for margin.

> An absolute tolerance is a documented statement about what an algorithm can
> deliver. It is not a way to make a failing test go quiet, and the difference
> should be visible in the test file.

### Try it yourself

```sh
npm test -- src/stats
```

Break something on purpose: change one AS 241 coefficient in `normal.ts` and
watch which grid points fail first. They will be in the tails.

---

## Milestone 3: The flagship module — and a bug no test could catch

### Two corrections to the source method

**The `1.71` constant.** The notebook multiplies the bias margin by 1.71 to get
the limits-of-agreement margin. That constant is `sqrt(1 + 1.96²/2) = 1.70901`
rounded — which also reconciles it with the `sqrt(3)` used elsewhere in the
notebooks (`3` being `2.92` rounded *up*). Both are the `σ²(1/n + k²/(2n))`
form. Bland & Altman's actual result uses `2(n-1)`, because `Var(s)` carries the
sample SD's own degrees of freedom.

Corrected, the margin is **7.9% larger at n=5** and 2.9% at n=12, converging
away by n=150. Understating a margin of error is the dangerous direction for a
sample-size tool, and the approximation is worst exactly where such a tool gets
consulted most carefully.

**Two parameters that were one.** `1.71` silently embeds `k = 1.96`, so it is
only correct at 95%. The confidence level of the *interval* and the multiplier
defining the *limits* are different things, and asking for a 90% interval around
95% limits is an ordinary request. They are now separate inputs.

**A naming correction.** The notebook calls the percentile variance "Greenwood".
Greenwood's formula proper is the variance of a Kaplan–Meier survival estimate;
this is the standard asymptotic variance of a sample quantile (Serfling 1980,
§2.3.3). The name came across from the KM context the method was first read in.
Same arithmetic, accurate label, origin noted in the source.

### The bug that only a browser could find

This one is the counterpart to cycling-sim's esbuild/KaTeX saga, and the
strongest argument in this repo for actually looking at the rendered page.

Symptom: **only one of four lines drew.** The legend swatches for series 2–4
were invisible too.

Everything that could be checked programmatically said the chart was fine. The
SVG contained four `<path>` elements. Each had a complete `d` attribute with no
`NaN`. Each had the correct `stroke="var(--color-series-N)"`. Zero console
errors, zero failed requests. Every unit test passed.

The cause: **Tailwind v4 tree-shakes theme variables.** A `--color-*` declared
in `@theme` that no generated utility class references is dropped from the
output CSS entirely. Slot 1 survived because `text-series-1` and
`bg-series-1/10` appear in the page markup. Slots 2–8 are consumed only by
Recharts, as `var()` written onto an SVG attribute — completely invisible to
Tailwind's scanner. They were emitted *only* inside the two dark-mode blocks
(plain CSS, not scanned) and were undefined in light mode.

Three paths resolved to nothing, so they painted nothing.

Confirmed by counting occurrences in the built stylesheet:

```sh
grep -o -- '--color-series-[0-9]' dist/assets/*.css | sort | uniq -c
#   7 --color-series-1      <- referenced by utilities
#   2 --color-series-2      <- dark blocks only
#   ...
```

Fix: `@theme static`, which emits every declared variable regardless of usage.

jsdom loads no stylesheets and resolves no custom properties, so **no unit test
could have caught this and none did.** The regression test that exists now is a
source-level invariant — it reads `index.css` and asserts the `static` keyword
is still there — which is the best a non-browser test can do.

> When a chart looks wrong, check the rendered DOM/SVG attributes before
> debugging application logic. And when the SVG attributes are all *correct* and
> it still looks wrong, the problem is downstream of your code — in the CSS
> cascade, or the bundler.

### Try it yourself

```sh
npm run build && npm run preview
```

Change `@theme static` back to `@theme` in `src/index.css`, rebuild, and watch
three of the four lines vanish while every test still passes.

---

## Milestone 4: Two small modules, one surprising result

### A test that was wrong, not the code

Module 2 keeps both the exact Bland–Altman expression and the notebook's
`1.96*sqrt(3/n)` approximation, and plots both. I wrote a test asserting the
approximation always understates the required sample size — the dangerous
direction — and it failed.

The assumption was wrong. Two errors in that formula pull in **opposite**
directions:

- `sqrt(3) = 1.7321` replaces the true `1.7090`, inflating it;
- the normal quantile `1.96` replaces `t` at n−1 df, deflating it.

The `t` correction is large at small n and vanishes as n grows, so it wins early
and loses late. **The curves cross at n = 117.** Below that the notebook's
formula asks for too few subjects; above, too many.

And the notebook's own worked case (threshold 15/54) sits almost exactly on the
crossover — exact says 149, the approximation says 150. Genuinely lucky.

> A test that fails because your assumption about the system was wrong, rather
> than because the code is broken, is often the more valuable failure. It is the
> test doing its job.

### Guards the notebook did not have

- **Equivalence sample size** returns `null` when `|ε| ≥ δ`. The formula squares
  `(δ - |ε|)`, so a true difference outside the equivalence region yields a
  positive, finite, entirely meaningless n.
- **Segment planner** rejects fewer than 2 segments, which divides by zero and
  silently produces `Infinity`; and computes feasibility rather than handing
  back a plan whose rounded caps cannot reach the target — a case the notebook
  flags only in prose.

### An axis bug worth the paragraph

The agreement chart first rendered with `9440615655` as its top axis label. The
data was fine: the value at n=2 is `19.769194` **`40615655`** — the label was
that raw number, mid-truncated.

Two real problems behind it. `domain={[0, 2]}` in Recharts is a *hint*; the axis
still extends to fit the data unless told otherwise, so it silently became
`[0, 19.77]`. And n=2 (one degree of freedom, t = 12.7) produces a value twenty
times any other point, flattening the entire rest of the curve against the axis.

Fixed by starting the curve at n=5 — a Bland–Altman analysis on two subjects is
not a study — and formatting the ticks.

---

## Milestone 5: Monte Carlo, and an improvement over the source

### Why Poisson is the wrong model here

The notebook models every study phase as Poisson, which **forces variance to
equal the mean**. A 28-day IRB review therefore gets an SD of `sqrt(28)` = 5.3
days, implying about 95% of reviews land between 18 and 39 days. Nobody who has
submitted to an IRB believes that.

Poisson models counts of independent events. A duration governed by a
committee's calendar is not that, and using it here quietly encodes a confidence
nobody has. The distribution is now a per-phase choice — gamma and lognormal for
right-skewed waits with a long tail, PERT for the three-point estimate planners
already think in. Poisson stays available for comparison, with its *implied* SD
shown next to it so the constraint is visible rather than inferred.

### Seeded, because a Monte Carlo that moves is not a tool

`Math.random()` would make the answer change on every re-render. Two people
reading the same inputs must see the same distribution, and a screenshot has to
still be true tomorrow — so the seed is part of the input, surfaced in the UI.

It also makes the distributional tests deterministic. The tolerances in
`random.test.ts` are chosen for Monte Carlo error at the stated N, not padded to
stop intermittent failures.

### The PERT bug, caught by asserting a moment

`samplePert` used the PERT **mean** in the alpha/beta expressions where the
standard form uses the **mode**. Plausible-looking, and wrong: for (10, 20, 60)
it produced a sample mean of 28.3 against the correct 25.

With the mode form, `alpha + beta = lambda + 2` exactly, so the scaled mean
telescopes back to the PERT mean by construction — which is the tell that it is
right.

A histogram would have looked completely fine. Asserting the closed-form moment
is what caught it. **Test samplers against their moments, not against your
visual sense of the shape.**

### Web Worker, and stale-result rejection

At 200,000 iterations the gamma rejection loop blocks paint long enough that the
UI feels broken. The worker imports the same `simulateTimeline` the tests call —
no second copy to drift — and falls back to running inline where `Worker` is
unavailable (jsdom, locked-down browsers), which is also what makes the page
testable.

Workers do not guarantee response order, so each request carries an incrementing
id and out-of-order responses are discarded. Otherwise a slow early run lands
after a fast later one and the UI silently shows the answer to a question the
user has already moved on from.

Rejection happens through the state *updater* (`message.requestId <
current.completedId`) rather than a ref holding the live id, because reading a
ref written during render is what `react-hooks/refs` objects to — and comparing
against the last id actually accepted is the more direct statement of the rule
anyway: never move backwards.

---

## Milestone 6: The effect-size correction

This module exists to fix a specific error, confirmed at the start of the build.

The notebook computes the right quantiles and reports them on the **wrong
scale**:

```python
nc     = d * sqrt(n)
bounds = nct.ppf([alpha/2, 1 - alpha/2], df=n-1, nc=nc)
```

and prints `bounds` as "the 95% CI for Cohen's d". Those are on the *t* scale.
Since `d = t / sqrt(n)` for a one-sample or paired design, the d-scale interval
needs the same rescaling.

For the notebook's own case (d = 0.5, n = 44) it prints **(1.34, 5.63)** — an
interval for an effect size of 0.5 that does not contain 0.5. That is the tell,
and it is the fastest way to check any effect-size interval you are handed.
Divided by `sqrt(44)`: **(0.203, 0.849)**, which brackets the estimate and sits
within 0.02 of the Hedges–Olkin approximation.

The UI shows all three side by side with a "contains d?" column, because seeing
the failure is more convincing than being told about it.

The notebook's *other* function, `cohens_d_ci`, has an independent error: its
standard error `sqrt((1 - d²/(2·df))/df)` **shrinks** as |d| grows, where the
sampling variance of d increases with |d|. Sign inverted. Neither notebook
version is ported.

### Another wrong assumption

I asserted that a two-sample design with n per group gives a *tighter* interval
than one-sample with the same n — 88 people versus 44, after all. It failed.

The noncentrality is `d*sqrt(n/2)` against `d*sqrt(n)`: a between-subject
comparison pays for the between-subject variance that a within-subject one
differences away. That is the standard argument for paired designs, and here it
falls straight out of the scale factor.

---

## Milestone 7: Explainers

Both keep the notebooks' prose and make the figure interactive.

**Misled by RMSE and MAE.** A Student t and a normal with matched SD, so both
have the same RMSE by construction and any difference in coverage is purely
about shape. At df = 1.3: 97% of measurements inside the RMSE against 69% for
the normal, with MAE differing by 3.5× despite the matched RMSE.

This goes one step past the notebook. For df ≤ 2 the **population variance of a
Student t does not exist**. At 1.3, RMSE is not a noisy estimate of something —
it is estimating an undefined quantity, and it grows without bound as the sample
grows. The 45.7 the notebook reports is an artefact of that particular draw. The
page says so whenever the slider is in that range, which is a stronger form of
the argument than the notebook makes.

**Agreement is not ICC.** The notebook's two datasets have byte-for-byte
identical differences, `[-5, +5, 0, 0, 0]`, and ICCs of 0.200 and 0.989. ICC is
computed here directly from mean squares — for two raters with no replication
the interaction term *is* the residual, which collapses the arithmetic to
something short enough to read — and reproduces pingouin to nine decimals
without a stats library.

The page shows both mean squares side by side: the residual is identical at 6.25
while the between-subject term goes 8.75 → 883.75. That is the entire
difference, and it is a property of the recruiting, not the device.

---

## Milestone 8: CI/CD

The deploy job is gated to pushes on `main` and depends on **both** the build
job and the fixture-regeneration job, so a numerical regression blocks
publication rather than shipping.

No `404.html` copy step is needed: `HashRouter` means a deep link is never sent
to the server as a real path. One architectural decision made early removes a
whole category of deploy configuration later.

### What is verified, and what is not

Verified locally: `npm ci` against the committed lockfile; the exact
lint/typecheck/test/build sequence CI runs; `npm run preview` against the real
production build at the real base path, with zero console errors and zero failed
requests; a hard reload on a deep link surviving correctly.

**Not** verified, because it needs things only the repo owner can do: an actual
push to a real remote, the one-time Settings → Pages → Source = "GitHub Actions"
step, and loading the live URL. Local preview with a correct `base` makes it
very likely to work first time, but "very likely" and "verified" are different
claims.

The repo must be named `validation-study-designer` to match `base` in
`vite.config.ts`, or that one line needs changing.

---

## Milestone 9: the first real CI run, which failed

The section above drew a careful line between "verified locally" and "very
likely to work". The first push settled it: `build` passed end to end — lint,
typecheck, all 192 tests, the production build, the artifact upload — and
`fixtures` failed, which skipped `deploy`.

Worth noting what the caution was and was not worth. The doubt was about `base`
and the Pages setting, and both of those were fine. The failure came from the
job that had been described as "the whole safety net", which had never once run
on a machine other than the one that wrote it.

### The bug

Every fixture file ends with a `_meta` block recording provenance:

```json
"_meta": { "scipy": "1.18.0", "numpy": "2.5.1", "python": "3.13.12" }
```

The check was `git diff --exit-code -- src/stats/__fixtures__`, and the workflow
installed `scipy>=1.14` on `python-version: '3.13'`. Both are ranges. CI resolved
them to different versions than the Windows box that generated the fixtures, the
regenerated `_meta` differed, and a byte comparison failed on three lines
containing no numerical content at all.

So the guard compared provenance metadata alongside the values it existed to
protect, and the metadata was guaranteed to drift.

### Ruling things out, in order

The environment was Windows, the runner Linux, so line endings were the obvious
first suspect. They were innocent, and the check is worth recording:

```
core.autocrlf = true          # local
git show HEAD:...normal.json  # committed blob: LF
head -c 400 ...normal.json    # working tree:   CRLF
```

Git was normalising CRLF on disk to LF in the blob. CI checks out LF, Linux
Python writes LF, so the two agree. Ruled out — but only because the *blob* was
inspected rather than the file on disk. Checking the working tree alone would
have found CRLF and produced a confident wrong answer.

Second: could the values themselves differ? Python's float `repr` is
shortest-round-trip and platform-independent, so formatting cannot vary; only
values could. Regenerating locally produced byte-identical output, which
established the fixtures were right *for that machine* and moved suspicion to
the environment — where `_meta` was sitting in plain sight.

The CI logs were not readable without a token, and there was no Docker or WSL to
reproduce Linux locally. Both dead ends, and neither turned out to matter: the
cause was reachable from the committed artefacts alone.

### The fix, and why not the easy one

Deleting `_meta` would have made CI green immediately. It is also the wrong
change — that block is the only record of which SciPy produced these numbers,
which is exactly what someone needs when a value is later disputed.

The real defect was comparing bytes to answer a question about numbers. The
guard exists to catch one thing: an expected value quietly edited to make a
failing test pass. That is a numerical claim. So `tools/check_fixtures.py`
regenerates into a temp directory, walks both structures in parallel, and
compares every value at a **relative tolerance of 0** — ignoring `_meta`, which
it reports as information instead.

Exact comparison is deliberate. A tolerance loose enough to absorb version drift
is loose enough to absorb a nudge, and a guard that tolerates the thing it
guards against is decoration. Version drift is handled at the source instead:
`numpy` and `scipy` are now pinned exactly, so the reference implementation
changes only in a commit that says it is changing.

It also fails legibly. `git diff --exit-code` on a 433 KB JSON file emits a wall
of unreadable output; the checker prints the worst offenders with committed
value, current value, and relative error, followed by the three explanations
worth considering — an edited fixture, a genuine SciPy change, or a cross-platform
ulp difference — because which one it is changes what should be done next.

### Testing the guard

A guard that has never failed is untested. Corrupting a value and confirming a
non-zero exit is the minimum bar, and the first attempt at it was a dud: the
chosen index was `ppf` at p = 0.5, whose value is `0.0`, so scaling it by
`1 + 1e-7` changed nothing and the test "passed" without exercising anything.
Retried against a non-zero entry, a nudge of one part in 10¹³ was caught — finer
than most of the suite's own tolerances.

The blunt version of that lesson: a test that cannot fail proves nothing, and
multiplicative corruption cannot perturb zero.

### One more latent bug, found on the way

The repo had no `.gitattributes`. The line-ending investigation came out clean
only because of a setting on one developer's machine — anyone cloning with
`core.autocrlf=false` would commit CRLF fixtures and fail CI for reasons
unrelated to the numbers. `* text=auto` now makes it a property of the repo, and
the generator passes `newline="\n"` explicitly rather than inheriting the
platform default. `git add --renormalize .` confirmed this rewrites nothing:
every blob was already LF.

**The lesson.** CI configuration is code, and it was the only code here with no
test and no second environment to run in. The numerical core was checked against
SciPy at roughly 7,000 grid points; the job checking it had been run zero times
anywhere but the machine that wrote it. Infrastructure that only ever executes
in the environment it was authored in is untested infrastructure, however
carefully it was written.

---

## Concepts index

**Numerical methods**
- Golden fixtures as the safety net, and why the oracle can be wrong (M0, M2).
- Relative vs absolute error, and when an absolute tolerance is honest rather
  than lazy (M0, M2 non-central t).
- Catastrophic cancellation: how to recognise it from the *pattern* of failures,
  and how to decide whether it is worth fixing (M2).
- Root-finding: why false position stagnates on convex functions, and why the
  symptom looked like an algebra error (M2).
- Testing samplers against closed-form moments rather than histograms (M5).

**Statistics**
- Bland & Altman's `2(n-1)`, and why understating a margin is the dangerous
  direction (M3).
- Separating a confidence level from an interval-width multiplier (M3).
- Two approximation errors that cancel at n = 117 (M4).
- Variance = mean is a modelling assumption, not a default (M5).
- The t-scale vs d-scale rescaling, and the one-line check for it (M6).
- ICC as a property of recruiting; RMSE as undefined for heavy tails (M7).

**Frontend**
- Tailwind v4 tree-shakes `@theme` variables — the bug no jsdom test can catch
  (M3). **Reread this one first** when something visual is "impossible".
- Controlled numeric inputs need a draft string, or clearing the field appends
  (M3).
- `useSyncExternalStore` for OS preferences; `useMemo` for derived values;
  effects only for pushing state outward (M1, M5).
- Web Worker stale-response rejection via the state updater (M5).

**Infrastructure**
- Comparing bytes to answer a question about numbers, and why provenance
  metadata must sit outside the comparison (M9).
- Pinning the reference implementation exactly, so it changes only in a commit
  that says so (M9).
- A guard that has never failed is untested — and multiplicative corruption
  cannot perturb zero (M9).
- Line endings as a repo contract rather than a local setting; inspect the blob,
  not the working tree (M9).

**A meta-lesson.** The hardest bugs here — the factor-of-two quantile, the
invisible chart lines, the `betaln` disagreement — were all resolved by looking
at actual state directly: a printed bracket, a `grep` of the built CSS, a
60-digit exact computation. When a symptom doesn't match any plausible cause,
stop reasoning and go measure something.
