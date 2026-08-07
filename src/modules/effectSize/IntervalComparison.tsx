import type { EffectSizeResult } from './effectSizeModel.ts';

/**
 * How this interval compares with the two others a reader is likely to meet.
 *
 * This used to sit on the page at full weight, directly under the answer, which
 * meant someone who came for one interval was handed three and left to choose.
 * It belongs in "Method and sources", where it answers the question a reader
 * actually arrives with — *why does this differ from the number my other tool
 * gave me?* — rather than posing a question they did not ask.
 */
export default function IntervalComparison({ result }: { result: EffectSizeResult }) {
  const tScaleContainsD =
    result.tScaleLower <= result.d && result.tScaleUpper >= result.d;

  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Comparison of interval methods for Cohen&rsquo;s d
        </caption>
        <thead>
          <tr>
            {['Method', 'Interval', 'Contains d?'].map((header, index) => (
              <th
                key={header}
                scope="col"
                className={`border-b border-hairline px-4 py-2 font-medium text-ink-muted ${
                  index === 1 ? 'text-right' : 'text-left'
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-hairline">
            <td className="px-4 py-2 font-medium text-ink">
              Non-central t, rescaled
              <span className="ml-1.5 rounded bg-good/10 px-1.5 py-0.5 text-xs text-good">
                used here
              </span>
            </td>
            <td className="tabular px-4 py-2 text-right text-ink">
              [{result.lower.toFixed(3)}, {result.upper.toFixed(3)}]
            </td>
            <td className="px-4 py-2 text-good">yes</td>
          </tr>
          <tr className="border-b border-hairline">
            <td className="px-4 py-2">Hedges&ndash;Olkin normal approximation</td>
            <td className="tabular px-4 py-2 text-right">
              [{result.approxLower.toFixed(3)}, {result.approxUpper.toFixed(3)}]
            </td>
            <td className="px-4 py-2">yes</td>
          </tr>
          <tr>
            <td className="px-4 py-2">
              Non-central t, <em>not</em> rescaled
              <span className="ml-1.5 text-xs text-ink-muted">
                (a common implementation error)
              </span>
            </td>
            <td className="tabular px-4 py-2 text-right">
              [{result.tScaleLower.toFixed(3)}, {result.tScaleUpper.toFixed(3)}]
            </td>
            <td className={`px-4 py-2 ${tScaleContainsD ? '' : 'text-critical'}`}>
              {tScaleContainsD ? 'yes' : 'no'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
