import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface TableColumn<Row> {
  key: string;
  header: string;
  render: (row: Row) => string;
  /** Numeric columns get tabular figures and right alignment. */
  numeric?: boolean;
}

interface DataTableProps<Row> {
  caption: string;
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  /** Rendered collapsed by default; the summary stays keyboard-operable. */
  defaultOpen?: boolean;
}

/**
 * The table view that accompanies every chart.
 *
 * Two jobs. It is the accessible equivalent of the plot for anyone who cannot
 * read it visually, and it is the documented "relief" for chart colours that
 * sit below 3:1 contrast against the light surface — the aqua and yellow slots
 * do, so shipping the numbers in text is not optional here.
 *
 * `<details>`/`<summary>` rather than a hand-rolled disclosure: collapsible,
 * keyboard-operable and announced as an expandable region with no JavaScript
 * and no ARIA of our own to get wrong.
 */
export default function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  defaultOpen = false,
}: DataTableProps<Row>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
      className="rounded-xl border border-hairline bg-surface"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-sm font-medium text-ink-secondary">
        {open ? (
          <ChevronDown size={16} aria-hidden />
        ) : (
          <ChevronRight size={16} aria-hidden />
        )}
        {caption}
      </summary>
      <div className="max-h-96 overflow-auto border-t border-hairline">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-surface">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`border-b border-hairline px-4 py-2 font-medium text-ink-muted ${
                    column.numeric ? 'text-right' : 'text-left'
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-hairline last:border-0">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-1.5 ${
                      column.numeric ? 'tabular text-right' : 'text-left'
                    }`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
