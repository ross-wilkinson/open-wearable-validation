"""Emit golden-value JSON fixtures from SciPy for the TypeScript stats core.

Why this exists
---------------
The browser has no SciPy. Every distribution in `src/stats/` is hand-implemented
in TypeScript, and hand-rolled special functions are *subtly* wrong by default —
they produce plausible numbers that are off in the fourth decimal, or that fall
apart only in the tails. A chart built on those looks perfectly fine and is
worthless.

So: SciPy computes the answers here, once, and they get committed as JSON.
Every TS function is then tested against SciPy's output rather than against
another hand calculation that could share the same misunderstanding.

Run:  python tools/generate_fixtures.py
Out:  src/stats/__fixtures__/*.json

Regenerate only when adding new grid points — never to "fix" a failing test.
A failing test means the TypeScript is wrong, not the fixture.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import platform

import numpy as np
import scipy
from scipy.stats import halfnorm, nct, norm, poisson, t

DEFAULT_OUT = (
    pathlib.Path(__file__).resolve().parent.parent / "src" / "stats" / "__fixtures__"
)
OUT = DEFAULT_OUT

# Degrees of freedom worth covering: 1 and 2 are pathological (Cauchy-ish,
# undefined variance), the middle is the realistic study-size range, and 500
# checks that we converge to the normal limit rather than drifting.
DFS = [1, 2, 3, 4, 5, 8, 10, 15, 20, 30, 44, 63, 100, 199, 500]

# Tail probabilities matter more than central ones — every confidence interval
# in this app evaluates a ppf at 0.975 or beyond, so the grid is deliberately
# dense out there rather than uniform on [0, 1].
PROBS = [
    0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5,
    0.6, 0.7, 0.8, 0.9, 0.95, 0.975, 0.99, 0.995, 0.999, 0.9999,
]

XS = [-8.0, -5.0, -3.0, -2.5, -1.96, -1.0, -0.5, -0.1, 0.0,
      0.1, 0.5, 1.0, 1.96, 2.5, 3.0, 5.0, 8.0]


def dump(name: str, payload: dict) -> None:
    payload["_meta"] = {
        "generated_by": "tools/generate_fixtures.py",
        "scipy": scipy.__version__,
        "numpy": np.__version__,
        "python": platform.python_version(),
        "note": "Golden values from SciPy. A test failing against these means "
                "the TypeScript is wrong. Do not regenerate to make it pass.",
    }
    path = OUT / f"{name}.json"
    # newline="\n" explicitly: the default would translate to CRLF on Windows,
    # which only stays invisible because git's autocrlf normalises it back on
    # commit. That is a per-developer setting, not a repo guarantee — someone
    # with autocrlf=false would commit CRLF and break the CI check for reasons
    # having nothing to do with the numbers.
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8", newline="\n")
    print(f"  {path.name:24s} {path.stat().st_size:>8,d} bytes")


def f(x) -> float:
    """Coerce to a JSON-safe float; SciPy hands back np.float64 and ±inf."""
    v = float(x)
    if np.isinf(v):
        return 1e308 if v > 0 else -1e308
    return v


# --------------------------------------------------------------------------
# Normal
# --------------------------------------------------------------------------
def gen_normal() -> None:
    dump("normal", {
        "pdf": [{"x": x, "want": f(norm.pdf(x))} for x in XS],
        "cdf": [{"x": x, "want": f(norm.cdf(x))} for x in XS],
        # The far tails are where a naive erf implementation loses all its
        # significant digits, so they are tested as relative-error cases.
        "cdf_tail": [{"x": x, "want": f(norm.cdf(x))}
                     for x in [-40, -30, -20, -10, -7, 7, 10, 20, 30, 40]],
        "ppf": [{"p": p, "want": f(norm.ppf(p))} for p in PROBS],
    })


# --------------------------------------------------------------------------
# Student t
# --------------------------------------------------------------------------
def gen_student_t() -> None:
    dump("studentT", {
        "pdf": [{"x": x, "df": df, "want": f(t.pdf(x, df))}
                for df in DFS for x in XS],
        "cdf": [{"x": x, "df": df, "want": f(t.cdf(x, df))}
                for df in DFS for x in XS],
        "ppf": [{"p": p, "df": df, "want": f(t.ppf(p, df))}
                for df in DFS for p in PROBS],
        # The single most-evaluated call in the whole app: the two-sided 95%
        # critical value across every sample size Module 1 plots.
        "ppf_975": [{"p": 0.975, "df": n - 1, "want": f(t.ppf(0.975, n - 1))}
                    for n in range(2, 201)],
    })


# --------------------------------------------------------------------------
# Half-normal  (distribution of |e| when e ~ N(0, 1) — i.e. absolute error)
# --------------------------------------------------------------------------
def gen_half_normal() -> None:
    dump("halfNormal", {
        "pdf": [{"x": x, "want": f(halfnorm.pdf(x))}
                for x in [0.0, 0.1, 0.25, 0.5, 0.6744897501960817, 1.0,
                          1.5, 1.96, 2.0, 2.5, 3.0, 4.0, 6.0]],
        "cdf": [{"x": x, "want": f(halfnorm.cdf(x))}
                for x in [0.0, 0.25, 0.5, 1.0, 1.96, 3.0, 5.0]],
        "ppf": [{"p": p, "want": f(halfnorm.ppf(p))}
                for p in [0.01, 0.05, 0.1, 0.25, 0.5, 0.6, 0.68, 0.75,
                          0.8, 0.9, 0.95, 0.975, 0.99, 0.995]],
        # f(x_p) evaluated at the p-th quantile — the exact composition
        # Greenwood's variance needs, worth pinning as one unit.
        "pdf_at_ppf": [{"p": p, "want": f(halfnorm.pdf(halfnorm.ppf(p)))}
                       for p in [0.05, 0.1, 0.25, 0.5, 0.68, 0.75, 0.9,
                                 0.95, 0.975, 0.99]],
    })


# --------------------------------------------------------------------------
# Poisson
# --------------------------------------------------------------------------
def gen_poisson() -> None:
    lams = [0.5, 1.0, 4.0, 10.0, 14.0, 28.0, 70.0]
    dump("poisson", {
        "pmf": [{"k": k, "lam": lam, "want": f(poisson.pmf(k, lam))}
                for lam in lams
                for k in range(0, int(lam + 5 * np.sqrt(lam)) + 2)],
        "cdf": [{"k": k, "lam": lam, "want": f(poisson.cdf(k, lam))}
                for lam in lams
                for k in range(0, int(lam + 5 * np.sqrt(lam)) + 2)],
        "ppf": [{"p": p, "lam": lam, "want": f(poisson.ppf(p, lam))}
                for lam in lams
                for p in [0.01, 0.05, 0.25, 0.5, 0.75, 0.95, 0.99]],
    })


# --------------------------------------------------------------------------
# Non-central t  — the hard one (Algorithm AS 243 / Lenth 1989)
# --------------------------------------------------------------------------
def gen_nct() -> None:
    # nc spans what a real Cohen's d CI produces: nc = d * sqrt(n), so
    # d in [0.1, 1.5] with n in [10, 200] lands roughly in [0.3, 21].
    ncs = [-8.0, -5.0, -3.31, -1.0, -0.5, 0.0, 0.5, 1.0, 2.0, 3.31,
           4.0, 6.0, 8.0, 12.0, 15.0, 21.0]
    nct_dfs = [1, 2, 3, 5, 9, 10, 19, 29, 43, 49, 99, 199]
    xs = [-6.0, -3.0, -1.0, 0.0, 0.5, 1.0, 2.0, 3.0, 4.0, 6.0, 9.0, 14.0, 25.0]

    # SciPy's own nct.cdf returns NaN in the extreme tail — e.g.
    # nct.cdf(-6, df=199, nc=21), where the true probability is an underflow to
    # zero (nct.sf there returns exactly 1.0). Its Cephes routine gives up
    # rather than returning 0. These are not targets to hit: they are cases
    # where the reference is the broken one. They are excluded from the graded
    # grid and listed separately, where the only assertion is that our
    # implementation stays finite and in [0, 1] — i.e. degrades better than
    # SciPy does.
    cdf_cases, cdf_scipy_nan = [], []
    for df in nct_dfs:
        for nc in ncs:
            for x in xs:
                want = nct.cdf(x, df, nc)
                if np.isfinite(want):
                    cdf_cases.append({"x": x, "df": df, "nc": nc, "want": f(want)})
                else:
                    sf = nct.sf(x, df, nc)
                    cdf_scipy_nan.append({
                        "x": x, "df": df, "nc": nc,
                        # sf == 1.0 means the cdf underflows; anything else
                        # gives us a usable complement.
                        "want_approx": f(1.0 - sf) if sf != 1.0 else 0.0,
                    })

    dump("nonCentralT", {
        "cdf": cdf_cases,
        "cdf_scipy_nan": cdf_scipy_nan,
        "ppf": [{"p": p, "df": df, "nc": nc, "want": f(nct.ppf(p, df, nc))}
                for df in nct_dfs for nc in ncs
                for p in [0.005, 0.025, 0.05, 0.1, 0.5, 0.9, 0.95, 0.975, 0.995]],
        # nc = 0 must degenerate exactly to the central t — a cheap, strong
        # invariant that catches whole classes of series-expansion errors.
        "reduces_to_central_t": [
            {"p": p, "df": df, "nc": 0.0, "want": f(t.ppf(p, df))}
            for df in nct_dfs for p in [0.025, 0.5, 0.975]
        ],
    })


# --------------------------------------------------------------------------
# Module-level worked examples
# --------------------------------------------------------------------------
def greenwood_variance(p: float, n: int) -> float:
    """Asymptotic variance of a sample quantile of the absolute error.

    NOTE ON THE NAME: the source notebook calls this "Greenwood", carried over
    from the Kaplan-Meier context it was first read in. It is really the
    standard asymptotic variance of a sample quantile,
    var = p(1-p) / (n * f(x_p)^2)  (Serfling 1980, §2.3.3) — Greenwood's
    formula proper is the variance of a KM survival estimate. Same arithmetic
    as the notebook; the label in the UI should be the accurate one.
    """
    f_p = halfnorm.pdf(halfnorm.ppf(p))
    return (p * (1 - p)) / (n * f_p ** 2)


def gen_modules() -> None:
    ci = 0.975

    # -- Module 1: precision vs sample size -------------------------------
    #    Reproduces the flagship chart's four series exactly.
    K_LOA = norm.ppf(0.975)  # 1.959963..., the multiplier defining 95% LoAs

    precision_curve = []
    for n in list(range(5, 200)):
        se = 1 / np.sqrt(n)
        z = t.ppf(ci, n - 1)
        precision_curve.append({
            "n": n,
            "bias": f(z * se),
            # What the notebook computes: a hard-coded 1.71 times the bias
            # margin. That constant is sqrt(1 + k^2/2) = 1.70901... rounded,
            # which is itself the sqrt(1/n + k^2/(2n)) approximation.
            "loa_notebook_1_71": f(1.71 * z * se),
            # Bland & Altman's actual result. Var(d_bar +/- k*s)
            #   = Var(d_bar) + k^2 * Var(s)
            #   = sigma^2/n + k^2 * sigma^2/(2(n-1))
            # The (n-1) is the point: Var(s) uses the sample SD's own degrees
            # of freedom. It matters most at small n, which is exactly where a
            # sample-size tool gets used.
            "loa_exact": f(z * np.sqrt(1 / n + K_LOA ** 2 / (2 * (n - 1)))),
            "p50": f(z * np.sqrt(greenwood_variance(0.5, n))),
            "p90": f(z * np.sqrt(greenwood_variance(0.9, n))),
        })

    # Same curve at other settings, so the implementation is pinned across the
    # parameters the UI exposes rather than only at the notebook's defaults.
    loa_parameterised = [
        {
            "n": n, "confidence": conf, "k": k,
            "want": f(
                t.ppf(1 - (1 - conf) / 2, n - 1)
                * np.sqrt(1 / n + k ** 2 / (2 * (n - 1)))
            ),
        }
        for conf in (0.90, 0.95, 0.99)
        for k in (1.645, K_LOA, 2.576)
        for n in (5, 12, 30, 64, 150)
    ]

    # The notebook's own printed worked example, n=64 — an independent check
    # that the port reproduces a number Ross published, not just itself.
    n = 64
    worked_n64 = {
        "n": n,
        "var_p50": f(greenwood_variance(0.5, n)),
        "var_p90": f(greenwood_variance(0.9, n)),
        "margin_p50": f(t.ppf(ci, n - 1) * np.sqrt(greenwood_variance(0.5, n))),
        "margin_p90": f(t.ppf(ci, n - 1) * np.sqrt(greenwood_variance(0.9, n))),
        "notebook_printed_margin_p50": 0.1965,
        "notebook_printed_margin_p90": 0.3633,
    }

    # -- Replicate measures (folds into Module 1) -------------------------
    #    The R notebook got this by Monte Carlo; it has a closed form.
    #    mean |z| for a mean of j replicates = sqrt(2/pi)/sqrt(j).
    replicates = [{"replicates": j, "mean_abs_z": f(np.sqrt(2 / np.pi) / np.sqrt(j))}
                  for j in range(1, 31)]

    # -- Module 2: agreement / equivalence --------------------------------
    loa_precision = [{"n": n, "precision": f(1.96 * np.sqrt(3 / n))}
                     for n in list(range(1, 51)) + [75, 100, 150, 200, 500, 999]]

    def n_for_threshold(thr: float) -> int:
        for n_ in range(1, 100000):
            if 1.96 * np.sqrt(3 / n_) < thr:
                return n_
        return -1

    threshold_cases = [
        # 15/54 is the notebook's own worked case; it prints n = 150.
        {"threshold": f(15 / 54), "want_n": n_for_threshold(15 / 54)},
        {"threshold": 0.1, "want_n": n_for_threshold(0.1)},
        {"threshold": 0.25, "want_n": n_for_threshold(0.25)},
        {"threshold": 0.5, "want_n": n_for_threshold(0.5)},
        {"threshold": 1.0, "want_n": n_for_threshold(1.0)},
    ]

    def sample_size_4_equivalence(alpha, power, sigma, delta, epsilon):
        z_a = norm.ppf(1 - alpha)
        z_b = norm.ppf(1 - ((1 - power) / 2))
        n_ = ((z_a + z_b) ** 2 * sigma ** 2) / (delta - abs(epsilon)) ** 2
        return float(np.ceil(n_))

    equivalence = [
        # The notebook's worked example: expects 14.
        {"alpha": 0.05, "power": 0.8, "sigma": 2.5, "delta": 4, "epsilon": 2,
         "want_n": sample_size_4_equivalence(0.05, 0.8, 2.5, 4, 2)},
        {"alpha": 0.05, "power": 0.8, "sigma": 0.1, "delta": 0.05, "epsilon": 0.0,
         "want_n": sample_size_4_equivalence(0.05, 0.8, 0.1, 0.05, 0.0)},
        {"alpha": 0.01, "power": 0.9, "sigma": 10, "delta": 5, "epsilon": 0.0,
         "want_n": sample_size_4_equivalence(0.01, 0.9, 10, 5, 0.0)},
        {"alpha": 0.05, "power": 0.95, "sigma": 1, "delta": 0.5, "epsilon": 0.1,
         "want_n": sample_size_4_equivalence(0.05, 0.95, 1, 0.5, 0.1)},
    ]

    # -- Module 3: demographic segments -----------------------------------
    def segments(n_sample: int, n_segments: int, perc_min: float) -> dict:
        perc_max = (1 - perc_min / 100) / (n_segments - 1)
        return {
            "n_sample": n_sample, "n_segments": n_segments, "perc_min": perc_min,
            "perc_max": f(perc_max * 100),
            "n_min": int(np.ceil(n_sample * perc_min / 100)),
            "n_max": int(n_sample * perc_max),
            "perc_max_display": int(np.ceil(perc_max * 100)),
        }

    demographic = [
        segments(65, 2, 40),   # Example 1: sex        -> 26 / 39, 40 / 60
        segments(65, 4, 10),   # Example 2: age        ->  7 / 19, 10 / 30
        segments(65, 3, 15),   # Example 3: Monk tone  -> 10 / 27, 15 / 43
        segments(50, 2, 40),   # the notebook's default form state
        segments(100, 5, 15),
    ]

    # -- Module 5: Cohen's d CI via non-central t --------------------------
    def cohens_d_ci_nct(d: float, n: int, alpha: float = 0.05) -> dict:
        df = n - 1
        nc = d * np.sqrt(n)
        lo_t, hi_t = nct.ppf([alpha / 2, 1 - alpha / 2], df=df, nc=nc)
        return {
            "d": d, "n": n, "alpha": alpha,
            # What the notebook printed — on the t scale, NOT the d scale.
            "t_scale_lo": f(lo_t), "t_scale_hi": f(hi_t),
            # The correct d-scale interval: d = t / sqrt(n) for a one-sample
            # or paired design, so the bounds rescale by the same factor.
            "lo": f(lo_t / np.sqrt(n)), "hi": f(hi_t / np.sqrt(n)),
        }

    cohens_d = [
        # The notebook's own case: it printed (1.34, 5.63) for d = 0.5, n = 44.
        cohens_d_ci_nct(0.5, 44),
        cohens_d_ci_nct(0.3, 44),
        cohens_d_ci_nct(0.0, 30),
        cohens_d_ci_nct(-0.5, 44),
        cohens_d_ci_nct(0.8, 20),
        cohens_d_ci_nct(1.2, 100),
        cohens_d_ci_nct(0.5, 44, alpha=0.01),
        cohens_d_ci_nct(0.5, 44, alpha=0.10),
        cohens_d_ci_nct(0.2, 200),
    ]

    # -- Explainer: Agreement vs ICC ---------------------------------------
    #    Two datasets with *identical* paired differences, ICC2 0.20 vs 0.99.
    #    Computed here from mean squares so the TS port has an exact target.
    def icc2(fitbit: list[float], truth: list[float]) -> dict:
        ratings = np.array([fitbit, truth], dtype=float)  # (k raters, n targets)
        k, n_ = ratings.shape
        grand = ratings.mean()
        target_means = ratings.mean(axis=0)
        rater_means = ratings.mean(axis=1)
        ss_b = k * np.sum((target_means - grand) ** 2)          # between targets
        ss_j = n_ * np.sum((rater_means - grand) ** 2)          # between raters
        ss_e = np.sum((ratings - rater_means[:, None]
                       - target_means[None, :] + grand) ** 2)   # residual
        msb = ss_b / (n_ - 1)
        msj = ss_j / (k - 1)
        mse = ss_e / ((n_ - 1) * (k - 1))
        return {
            "fitbit": fitbit, "truth": truth,
            "differences": [a - b for a, b in zip(fitbit, truth)],
            "msb": f(msb), "msj": f(msj), "mse": f(mse),
            "icc2": f((msb - mse) / (msb + (k - 1) * mse + k * (msj - mse) / n_)),
            "icc3": f((msb - mse) / (msb + (k - 1) * mse)),
            "bias": f(np.mean(np.array(fitbit) - np.array(truth))),
            "sd_diff": f(np.std(np.array(fitbit) - np.array(truth), ddof=1)),
        }

    icc_examples = [
        # pingouin reports ICC2 = 0.200000 for this one ...
        icc2([90, 95, 90, 95, 90], [95, 90, 90, 95, 90]),
        # ... and 0.988732 for this one, from the identical differences.
        icc2([120, 95, 80, 75, 70], [125, 90, 80, 75, 70]),
    ]

    # Percentile margins across the settings the UI exposes.
    percentile_parameterised = [
        {
            "n": n, "p": p, "confidence": conf,
            "want": f(
                t.ppf(1 - (1 - conf) / 2, n - 1)
                * np.sqrt(greenwood_variance(p, n))
            ),
        }
        for conf in (0.90, 0.95, 0.99)
        for p in (0.5, 0.68, 0.9, 0.95)
        for n in (5, 12, 30, 64, 150)
    ]

    dump("modules", {
        "precision_curve": precision_curve,
        "precision_worked_n64": worked_n64,
        "loa_parameterised": loa_parameterised,
        "percentile_parameterised": percentile_parameterised,
        "replicates": replicates,
        "loa_precision": loa_precision,
        "threshold_cases": threshold_cases,
        "equivalence": equivalence,
        "demographic": demographic,
        "cohens_d": cohens_d,
        "icc_examples": icc_examples,
    })


# --------------------------------------------------------------------------
# Special functions — tested directly, not only through the distributions
# --------------------------------------------------------------------------
def gen_special() -> None:
    from scipy.special import betainc, gammainc, gammaincc, gammaln, betaln

    gamma_args = [0.5, 1, 1.5, 2, 3, 5, 10, 24.5, 30, 50, 100, 250, 250.5,
                  500, 1000]

    # Deliberately lopsided pairs: this is where the naive
    # logGamma(a)+logGamma(b)-logGamma(a+b) form cancels and loses digits.
    beta_pairs = [(0.5, 0.5), (1, 1), (2, 3), (5, 0.5), (10, 0.5), (24.5, 0.5),
                  (30, 0.5), (50, 0.5), (99.5, 0.5), (250, 0.5), (500, 0.5),
                  (0.5, 250), (1000, 0.5), (100, 100), (3, 400)]

    # SciPy's own `betaln` is the naive gammaln(a)+gammaln(b)-gammaln(a+b), so
    # it cancels exactly the way our first implementation did — its absolute
    # error grows from 1.5e-16 at a=5 to 7.7e-13 at a=1000. It is therefore NOT
    # a usable golden reference in that regime.
    #
    # For positive integer a there is a closed form with no cancellation at all:
    #     B(a, 1/2) = (a-1)! * a! * 4^a / (2a)!
    # evaluated over exact integers and logged in 60-digit Decimal. That is a
    # true reference, and it is what the tight assertion grades against.
    from decimal import Decimal, getcontext
    import math as _math
    getcontext().prec = 60

    def exact_log_beta_half(a: int) -> float:
        numerator = (
            Decimal(_math.factorial(a - 1))
            * Decimal(_math.factorial(a))
            * (Decimal(4) ** a)
        )
        return float((numerator / Decimal(_math.factorial(2 * a))).ln())

    dump("special", {
        "logGamma": [{"x": x, "want": f(gammaln(x))} for x in gamma_args],
        "logBeta": [{"a": a, "b": b, "want": f(betaln(a, b))}
                    for a, b in beta_pairs],
        "logBeta_exact": [
            {"a": a, "b": 0.5, "want": exact_log_beta_half(a)}
            for a in [2, 3, 5, 10, 30, 50, 100, 250, 500, 1000]
        ],
        "incompleteBeta": [
            {"x": x, "a": a, "b": b, "want": f(betainc(a, b, x))}
            for a, b in [(0.5, 0.5), (2, 3), (24.5, 0.5), (0.5, 24.5),
                         (250, 0.5), (5, 100)]
            for x in [1e-8, 0.001, 0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99, 0.999]
        ],
        "incompleteGammaLower": [
            {"a": a, "x": x, "want": f(gammainc(a, x))}
            for a in [0.5, 1, 2.5, 5, 20, 70, 200]
            for x in [1e-6, 0.1, 0.5, 1, 2, 5, 10, 25, 70, 150, 400]
        ],
        "incompleteGammaUpper": [
            {"a": a, "x": x, "want": f(gammaincc(a, x))}
            for a in [0.5, 1, 2.5, 5, 20, 70, 200]
            for x in [1e-6, 0.1, 0.5, 1, 2, 5, 10, 25, 70, 150, 400]
        ],
    })


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        type=pathlib.Path,
        default=DEFAULT_OUT,
        help="directory to write the JSON fixtures into "
             "(default: src/stats/__fixtures__). tools/check_fixtures.py points "
             "this at a temp dir so it can compare without touching the repo.",
    )
    OUT = parser.parse_args().out
    OUT.mkdir(parents=True, exist_ok=True)

    print("Generating golden fixtures ->", OUT)
    gen_special()
    gen_normal()
    gen_student_t()
    gen_half_normal()
    gen_poisson()
    gen_nct()
    gen_modules()
    print("Done.")
