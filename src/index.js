import { parseArgs } from './args.js';
import { loadConfig, resolveAuthor } from './config.js';
import { getCommits } from './git.js';
import { buildSessions } from './sessions.js';
import { loadStore, saveStore, mergeSessions } from './store.js';
import { printReport, printHistogram, writeHtml, writeCsv } from './report.js';

export async function run(argv) {
  const options = parseArgs(argv);
  const config = await loadConfig(options.configPath);

  if (options.reset) {
    await saveStore({ version: 1, lastProcessedCommit: null, authors: {}, updated: null }, options.storePath);
    console.log('State reset.\n');
  }

  console.log('git-clock — analyzing commit history...\n');

  const store = await loadStore(options.storePath);
  const commits = await getCommits({
    since: store.lastProcessedCommit ? null : options.since,
    author: options.author,
    afterHash: store.lastProcessedCommit,
  });

  // Apply aliases
  for (const commit of commits) {
    commit.author = resolveAuthor(commit.author, commit.email, config.aliases);
  }

  if (commits.length === 0) {
    console.log('No new commits found.');
    if (Object.keys(store.authors || {}).length > 0) {
      printReport(store);
      if (options.histogram) printHistogram(store, options.histogramPeriod);
      if (options.exportHtml) await writeHtml(store, options.exportHtml);
      if (options.exportCsv) await writeCsv(store, options.exportCsv);
    }
    return;
  }

  const sessions = buildSessions(commits, {
    maxGapMinutes: config.maxGap ?? options.maxGap,
    minSessionMinutes: config.minSession ?? options.minSession,
  });

  const updated = mergeSessions(store, sessions, commits.at(-1)?.hash);

  await saveStore(updated, options.storePath);

  printReport(updated);
  if (options.histogram) printHistogram(updated, options.histogramPeriod);
  if (options.exportHtml) await writeHtml(updated, options.exportHtml);
  if (options.exportCsv) await writeCsv(updated, options.exportCsv);

  console.log(`\nProcessed ${commits.length} new commits. State saved to ${options.storePath}`);
}
