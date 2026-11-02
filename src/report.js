import { writeFile } from 'node:fs/promises';

export function printReport(store) {
  const authors = Object.entries(store.authors || {});
  if (!authors.length) {
    console.log('No sessions recorded yet.');
    return;
  }

  console.log('Effort by author\n');
  console.log('Author'.padEnd(32) + 'Hours'.padStart(8) + '  Sessions');
  console.log('-'.repeat(54));

  let total = 0;
  for (const [name, data] of authors) {
    console.log(
      name.padEnd(32) +
        data.totalHours.toFixed(1).padStart(8) +
        `  ${data.sessions.length}`
    );
    total += data.totalHours;
  }

  console.log('-'.repeat(54));
  console.log('Total'.padEnd(32) + total.toFixed(1).padStart(8));
}

export function printHistogram(store, period = 'week') {
  const buckets = new Map();

  for (const data of Object.values(store.authors || {})) {
    for (const session of data.sessions) {
      const key = period === 'day'
        ? new Date(session.start).toISOString().slice(0, 10)
        : getWeekStart(new Date(session.start)).toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) || 0) + session.hours);
    }
  }

  if (!buckets.size) return;

  console.log(`\n${period === 'day' ? 'Daily' : 'Weekly'} histogram\n`);
  const max = Math.max(...buckets.values());
  const sorted = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  for (const [label, hours] of sorted) {
    const barLen = Math.round((hours / max) * 32);
    const bar = '█'.repeat(barLen).padEnd(32);
    console.log(`${label}  ${bar}  ${hours.toFixed(1)}h`);
  }
}

export async function writeHtml(store, path) {
  const authors = Object.entries(store.authors || {});
  const rows = authors
    .map(([name, data]) => `<tr><td>${escape(name)}</td><td>${data.totalHours.toFixed(1)}</td><td>${data.sessions.length}</td></tr>`)
    .join('\n');

  const total = authors.reduce((sum, [, d]) => sum + d.totalHours, 0);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>git-clock report</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f6f6f6; }
    .total { font-weight: bold; }
  </style>
</head>
<body>
  <h1>git-clock report</h1>
  <p>Generated ${new Date().toISOString()}</p>
  <table>
    <thead><tr><th>Author</th><th>Hours</th><th>Sessions</th></tr></thead>
    <tbody>
      ${rows}
      <tr class="total"><td>Total</td><td>${total.toFixed(1)}</td><td></td></tr>
    </tbody>
  </table>
</body>
</html>`;

  await writeFile(path, html);
  console.log(`HTML report written to ${path}`);
}

export async function writeCsv(store, path) {
  const lines = ['author,start,end,hours,commits'];
  for (const [author, data] of Object.entries(store.authors || {})) {
    for (const s of data.sessions) {
      lines.push([
        `"${author.replace(/"/g, '""')}"`,
        new Date(s.start).toISOString(),
        new Date(s.end).toISOString(),
        s.hours,
        s.commits.length,
      ].join(','));
    }
  }
  await writeFile(path, lines.join('\n'));
  console.log(`CSV written to ${path}`);
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;',
  }[c]));
}
