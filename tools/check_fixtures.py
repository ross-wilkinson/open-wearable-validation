"""Verify the committed golden fixtures still match what SciPy produces.

Why this is not `git diff --exit-code`
--------------------------------------
It was, and that was wrong. Every fixture carries a `_meta` block recording the
SciPy, NumPy and Python versions that produced it. A byte comparison therefore
fails whenever CI's interpreter is a different patch release from the machine
that generated the fixtures — a difference with no numerical content whatsoever.
The first CI run after publishing failed for exactly that reason.

The guard exists to catch one specific thing: an expected value quietly edited
to make a failing test pass. That is a claim about *numbers*, so this compares
numbers, and reports which ones moved and by how much rather than emitting an
unreadable diff of a 400 KB JSON file.

Two things are reported and never fatal, because neither is a claim about this
repo's numbers:

  - Version drift in `_meta`. If SciPy genuinely changes an answer, the numeric
    comparison catches it on its own merits.
  - Grid points where `want` is null on one side. That marks a case SciPy itself
    refused — its non-central t routine gives up in the extreme tail — and
    exactly where it gives up depends on the platform's math library. There is
    no golden value on either side to compare.

The second one is a hole a determined person could crawl through: setting a
`want` to null silences grading for that point. It is not a hole the threat
model cares much about, since a null in a fixture diff is conspicuous in a way
that a plausible-looking float is not, and the TypeScript still asserts those
points stay finite and in [0, 1].

Tolerances are per-array and mirror the test that consumes each array, rather
than demanding bit-identical values. Comparing at zero was the third thing this
job got wrong: across two operating systems, ~1466 values differ in the last
bit or two, and not one of them could change a test outcome. See
TOLERANCE_RATIONALE below, or run with --explain.

Run:  python tools/check_fixtures.py
      python tools/check_fixtures.py --explain
Exit: 0 if every value matches, 1 otherwise.
"""

from __future__ import annotations

import argparse
import json
import math
import pathlib
import re
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
COMMITTED = HERE.parent / "src" / "stats" / "__fixtures__"

# Per-array (relative, absolute) tolerances, mirroring the test that consumes
# each array. See TOLERANCE_RATIONALE below — these are not free parameters, and
# changing one without changing the corresponding test is always a mistake.
DEFAULT_TOLERANCE = (1e-12, 0.0)

TOLERANCES: dict[str, tuple[float, float]] = {
    # special.test.ts
    "special.logGamma": (1e-14, 0.0),
    "special.logBeta_exact": (1e-14, 0.0),
    "special.logBeta": (1e-12, 0.0),
    "special.incompleteBeta": (1e-13, 0.0),
    "special.incompleteGammaLower": (1e-12, 1e-300),
    "special.incompleteGammaUpper": (1e-12, 1e-300),
    # normal.test.ts
    "normal.pdf": (1e-14, 0.0),
    "normal.cdf": (1e-14, 0.0),
    "normal.cdf_tail": (1e-12, 0.0),
    "normal.ppf": (1e-13, 0.0),
    # studentT.test.ts
    "studentT.pdf": (1e-13, 0.0),
    "studentT.cdf": (1e-13, 0.0),
    "studentT.ppf": (1e-10, 0.0),
    "studentT.ppf_975": (1e-11, 0.0),
    # halfNormal.test.ts
    "halfNormal.pdf": (1e-14, 0.0),
    "halfNormal.cdf": (1e-13, 0.0),
    "halfNormal.ppf": (1e-13, 0.0),
    "halfNormal.pdf_at_ppf": (1e-13, 0.0),
    # poisson.test.ts
    "poisson.pmf": (1e-12, 0.0),
    "poisson.cdf": (1e-12, 0.0),
    # nonCentralT.test.ts. The absolute arm is the important one: AS 243 builds
    # its answer by repeatedly subtracting O(1) quantities, so SciPy's own result
    # has a roundoff floor around 1e-16 regardless of how small the true value
    # is. Below that floor its digits are noise, and noise does not reproduce
    # across platforms — hence entries like 3.4e-46 against 2.8e-45, a relative
    # error of 7 and an absolute difference of 2e-45.
    "nonCentralT.cdf": (1e-9, 1e-13),
    "nonCentralT.ppf": (1e-7, 0.0),
    "nonCentralT.reduces_to_central_t": (1e-10, 0.0),
    # module-level worked examples
    "modules.loa_precision": (1e-13, 0.0),
    "modules.cohens_d": (1e-6, 0.0),
    "modules.precision_curve": (1e-11, 0.0),
    "modules.loa_parameterised": (1e-11, 0.0),
    "modules.percentile_parameterised": (1e-11, 0.0),
    "modules.replicates": (1e-14, 0.0),
}

TOLERANCE_RATIONALE = """
Why these are not zero, and why matching the tests is the right rule:

A guard should be exactly as strict as the thing it guards. To silence a failing
test by editing a fixture, the edit has to move the value by MORE than that
test's tolerance — otherwise the test was already passing and there was nothing
to silence. So any edit that could achieve the thing this job exists to prevent
is caught by comparing at the consuming test's tolerance.

Being stricter than the test does not catch more cheating. It only reports
differences that cannot change any outcome, and across two operating systems
there are thousands of those: a one-bit difference in the last place of a double
is a relative error of ~2e-16, and at tolerance 0 every one of them is a
failure. The first version of this used 0 and reported 1466 mismatches, none of
which could have flipped a single assertion.

Every value here is at least ~45x the ulp noise floor and at most equal to its
test's tolerance, so the window catches real edits and ignores platform noise.
"""


class Mismatch:
    __slots__ = ("path", "want", "got", "error")

    def __init__(self, path: str, want, got, error: float) -> None:
        self.path = path
        self.want = want
        self.got = got
        self.error = error


_ARRAY_KEY = re.compile(r"^([A-Za-z_]\w*\.\w+)")


def tolerance_for(path: str, override: float | None) -> tuple[float, float]:
    """(relative, absolute) tolerance for a leaf, from the array it belongs to."""
    if override is not None:
        return (override, 0.0)
    match = _ARRAY_KEY.match(path)
    if match and match.group(1) in TOLERANCES:
        return TOLERANCES[match.group(1)]
    return DEFAULT_TOLERANCE


def relative_error(want: float, got: float) -> float:
    """Relative error, falling back to absolute when the reference is zero."""
    if want == got:
        return 0.0
    if math.isnan(want) and math.isnan(got):
        return 0.0
    denominator = abs(want)
    if denominator == 0.0:
        return abs(got)
    return abs(want - got) / denominator


def compare(
    want,
    got,
    tolerance: float | None,
    path: str,
    out: list[Mismatch],
    declined: list[str],
) -> None:
    """Walk two loaded fixtures in parallel, collecting every numeric mismatch."""
    if isinstance(want, dict):
        if not isinstance(got, dict):
            out.append(Mismatch(path, type(want).__name__, type(got).__name__, math.inf))
            return

        # `want: null` means SciPy itself declined to produce a value — its
        # non-central t routine gives up in the extreme tail. Exactly where it
        # gives up differs between platforms, so a point can be answered on
        # Linux and refused on Windows. That is a disagreement between two
        # builds of the *reference*, not evidence that this repo's numbers are
        # wrong, and there is no golden value to compare in either direction.
        # Recorded and reported, never fatal.
        if "want" in want and "want" in got and (want["want"] is None or got["want"] is None):
            if (want["want"] is None) != (got["want"] is None):
                side = "committed" if want["want"] is None else "regenerated"
                declined.append(f"{path} (declined by SciPy on the {side} side only)")
            # The identifying coordinates must still line up exactly; if those
            # drift, the grids are misaligned and everything else is noise.
            for key in sorted((set(want) | set(got)) - {"want", "want_approx"}):
                if key not in want or key not in got:
                    out.append(
                        Mismatch(f"{path}.{key}", key in want, key in got, math.inf)
                    )
                    continue
                compare(want[key], got[key], tolerance, f"{path}.{key}", out, declined)
            return

        # `_meta` is provenance, not data under test — see the module docstring.
        keys = (set(want) | set(got)) - {"_meta"}
        for key in sorted(keys):
            if key not in want or key not in got:
                out.append(Mismatch(f"{path}.{key}", key in want, key in got, math.inf))
                continue
            compare(want[key], got[key], tolerance, f"{path}.{key}", out, declined)
        return

    if isinstance(want, list):
        if not isinstance(got, list) or len(want) != len(got):
            length = len(got) if isinstance(got, list) else type(got).__name__
            out.append(Mismatch(f"{path} (length)", len(want), length, math.inf))
            return
        for index, (a, b) in enumerate(zip(want, got)):
            compare(a, b, tolerance, f"{path}[{index}]", out, declined)
        return

    if isinstance(want, bool) or want is None or isinstance(want, str):
        if want != got:
            out.append(Mismatch(path, want, got, math.inf))
        return

    if isinstance(want, (int, float)) and isinstance(got, (int, float)):
        rtol, atol = tolerance_for(path, tolerance)
        error = relative_error(float(want), float(got))
        within_absolute = atol > 0 and abs(float(want) - float(got)) <= atol
        # Either bound suffices — the numpy.allclose convention, and the same
        # one checkGrid uses on the TypeScript side.
        if error > rtol and not within_absolute:
            out.append(Mismatch(path, want, got, error))
        return

    if want != got:
        out.append(Mismatch(path, want, got, math.inf))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--tolerance",
        type=float,
        default=None,
        help="override every per-array tolerance with this single relative "
             "value. Diagnostic only — the defaults in TOLERANCES mirror the "
             "test that consumes each array, which is the property that makes "
             "this guard meaningful. Pass --explain to see the reasoning.",
    )
    parser.add_argument(
        "--explain",
        action="store_true",
        help="print why the tolerances are what they are, and exit.",
    )
    parser.add_argument(
        "--max-report",
        type=int,
        default=20,
        help="how many mismatches to print before truncating (default 20).",
    )
    args = parser.parse_args()

    if args.explain:
        print(TOLERANCE_RATIONALE)
        width = max(len(k) for k in TOLERANCES)
        for key, (rtol, atol) in TOLERANCES.items():
            absolute = f"  or abs <= {atol:g}" if atol else ""
            print(f"  {key:{width}s}  rel <= {rtol:g}{absolute}")
        print(f"  {'(anything else)':{width}s}  rel <= {DEFAULT_TOLERANCE[0]:g}")
        return 0

    if not COMMITTED.is_dir():
        print(f"error: no committed fixtures at {COMMITTED}", file=sys.stderr)
        return 1

    with tempfile.TemporaryDirectory() as tmp:
        fresh_dir = pathlib.Path(tmp)
        result = subprocess.run(
            [sys.executable, str(HERE / "generate_fixtures.py"), "--out", str(fresh_dir)],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print("error: the generator itself failed\n", file=sys.stderr)
            print(result.stdout, file=sys.stderr)
            print(result.stderr, file=sys.stderr)
            return 1

        committed_files = sorted(p.name for p in COMMITTED.glob("*.json"))
        fresh_files = sorted(p.name for p in fresh_dir.glob("*.json"))
        if committed_files != fresh_files:
            print("error: the set of fixture files changed.", file=sys.stderr)
            print(f"  committed: {committed_files}", file=sys.stderr)
            print(f"  generated: {fresh_files}", file=sys.stderr)
            return 1

        mismatches: list[Mismatch] = []
        declined: list[str] = []
        versions: dict[str, dict] = {}

        for name in committed_files:
            want = json.loads((COMMITTED / name).read_text(encoding="utf-8"))
            got = json.loads((fresh_dir / name).read_text(encoding="utf-8"))
            versions[name] = {
                "committed": want.get("_meta", {}),
                "generated": got.get("_meta", {}),
            }
            compare(
                want, got, args.tolerance, name.removesuffix(".json"), mismatches, declined
            )

    # Provenance, reported but never fatal.
    sample = next(iter(versions.values()), None)
    if sample:
        old = sample["committed"]
        new = sample["generated"]
        fields = ("python", "numpy", "scipy")
        drifted = [f for f in fields if old.get(f) != new.get(f)]
        label = "differs" if drifted else "matches"
        print(f"Environment {label} the one that generated the committed fixtures:")
        for field in fields:
            marker = "  <-- differs" if field in drifted else ""
            print(f"  {field:8s} committed={old.get(field)!s:12s} "
                  f"here={new.get(field)!s:12s}{marker}")
        if drifted:
            print("  (not an error in itself — the values are compared below)")
        print()

    if declined:
        print(
            f"{len(declined)} grid point(s) where SciPy produced a value on one "
            f"platform and refused on the other:"
        )
        for entry in declined[: args.max_report]:
            print(f"  {entry}")
        if len(declined) > args.max_report:
            print(f"  ... and {len(declined) - args.max_report} more.")
        print(
            "  These are extreme-tail cases where SciPy's own routine gives up. Which\n"
            "  side gives up is a property of the platform's math library, not of this\n"
            "  repo, and there is no golden value on either side to compare. Not fatal.\n"
        )

    scope = (
        f"the overridden tolerance {args.tolerance:g}"
        if args.tolerance is not None
        else "each array's tolerance (matching the test that consumes it)"
    )

    if not mismatches:
        print(f"All fixture values match at {scope}.")
        return 0

    mismatches.sort(key=lambda m: m.error, reverse=True)
    # Without this the provenance block above, on stdout, lands after the report
    # below, on stderr — the two streams are buffered independently and CI
    # interleaves them by flush order, not by call order.
    sys.stdout.flush()
    print(
        f"{len(mismatches)} fixture value(s) differ at tolerance "
        f"{args.tolerance:g}, worst first:\n",
        file=sys.stderr,
    )
    for m in mismatches[: args.max_report]:
        rtol, atol = tolerance_for(m.path, args.tolerance)
        limit = f"rel {rtol:g}" + (f" or abs {atol:g}" if atol else "")
        print(f"  {m.path}   (allowed: {limit})", file=sys.stderr)
        print(f"    committed: {m.want!r}", file=sys.stderr)
        print(f"    SciPy now: {m.got!r}", file=sys.stderr)
        print(f"    rel error: {m.error:.3e}", file=sys.stderr)
    if len(mismatches) > args.max_report:
        print(f"  ... and {len(mismatches) - args.max_report} more.", file=sys.stderr)

    print(
        "\nA committed fixture no longer matches SciPy. Before regenerating, work "
        "out which of these it is:\n"
        "  - someone edited an expected value to silence a failing test. Revert it; "
        "the TypeScript is what is wrong.\n"
        "  - SciPy changed an answer between versions. Check the release notes, "
        "then regenerate deliberately and say so in the commit message.\n"
        "  - the last-ulp difference between two platforms' math libraries. Real, "
        "but it means the fixtures and CI disagree about what 'exact' means.\n",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
