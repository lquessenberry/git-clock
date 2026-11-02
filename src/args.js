export function parseArgs(argv) {
  const options = {
    maxGap: 120,
    minSession: 30,
    since: null,
    author: null,
    histogram: false,
    histogramPeriod: 'week',
    storePath: '.git-clock.json',
    configPath: '.git-clockrc.json',
    exportHtml: null,
    exportCsv: null,
    reset: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--histogram' || arg === '-h') options.histogram = true;
    else if (arg === '--period' && argv[i + 1]) options.histogramPeriod = argv[++i];
    else if (arg === '--max-gap' && argv[i + 1]) options.maxGap = Number(argv[++i]);
    else if (arg === '--min-session' && argv[i + 1]) options.minSession = Number(argv[++i]);
    else if (arg === '--since' && argv[i + 1]) options.since = argv[++i];
    else if (arg === '--author' && argv[i + 1]) options.author = argv[++i];
    else if (arg === '--store' && argv[i + 1]) options.storePath = argv[++i];
    else if (arg === '--config' && argv[i + 1]) options.configPath = argv[++i];
    else if (arg === '--html' && argv[i + 1]) options.exportHtml = argv[++i];
    else if (arg === '--csv' && argv[i + 1]) options.exportCsv = argv[++i];
    else if (arg === '--reset') options.reset = true;
    else if (arg === '--help') {
      console.log(`
git-clock — team effort & velocity from git timestamps

Usage:
  git-clock [options]

Options:
  --histogram, -h           Show histogram (default: weekly)
  --period <week|day>       Histogram period (default: week)
  --max-gap <minutes>       Max gap to stay in same session (default: 120)
  --min-session <min>       Minimum session length (default: 30)
  --since <date>            First-run cutoff (e.g. 2026-09-01)
  --author <name>           Filter to one author
  --store <path>            State file (default: .git-clock.json)
  --config <path>           Aliases/config file (default: .git-clockrc.json)
  --html <file>             Write HTML report
  --csv <file>              Write CSV of sessions
  --reset                   Clear stored state and reprocess
  --help                    This message

Examples:
  git-clock
  git-clock --histogram --period day
  git-clock --html report.html --csv sessions.csv
  git-clock --reset --since 2026-01-01
`);
      process.exit(0);
    }
  }

  return options;
}
