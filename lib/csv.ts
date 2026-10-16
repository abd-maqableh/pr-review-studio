import type { Coverage } from './types';

/** Quoting alone does not stop spreadsheet formulas; prefix dangerous cells with an apostrophe. */
export function escapeCsvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function coverageToCsv(rows: Coverage[]): string {
  const lines = [
    ['Date', 'Outlet', 'Headline', 'Sentiment', 'Excerpt'],
    ...rows.map((row) => [row.date, row.outlet, row.headline, row.sentiment, row.excerpt]),
  ];
  return `\uFEFF${lines.map((line) => line.map(escapeCsvCell).join(',')).join('\r\n')}\r\n`;
}
