# git-clock

Estimate team effort and velocity from git commit timestamps. The
command is local, progressive, and has no dependencies. Use it on any
git project.

The hours are an estimate of commit activity. They are not a timesheet.

## Install

Node.js 18 or newer.

```bash
npm install -g git+https://github.com/lquessenberry/git-clock.git
```

Or clone and link:

```bash
git clone https://github.com/lquessenberry/git-clock.git
cd git-clock
npm link
```

`git-clock --help` prints the options. Run the command from the root
of the project you want to measure.

## Use it on a project

```bash
git-clock
git-clock --histogram
git-clock --histogram --period day
git-clock --html velocity.html --csv sessions.csv
```

`git-clock` prints hours and session counts per person. `--histogram`
adds a weekly bar chart. `--period day` makes that chart daily. The
HTML file is the report to read. The CSV is one row per session, for
a spreadsheet or a later billing conversation.

Run `git-clock` again after new commits. It counts only commits that
are not already in the state file.

## Team names

Commit a `.git-clockrc.json` in the project. Aliases collapse more
than one git name or email into one person. Start from
`.git-clockrc.example.json`.

```json
{
  "aliases": {
    "Lee Quessenberry": "Lee",
    "lquessenberry@gmail.com": "Lee",
    "Josh Tate": "Josh",
    "josh@onesimplespark.com": "Josh"
  },
  "maxGap": 120,
  "minSession": 30
}
```

A key can be the author name, the email, or `Name <email>`.
`maxGap` is the quiet time, in minutes, that ends a session. The
default is 120. `minSession` is the shortest session, in minutes. The
default is 30. When the config file sets either value, that value
wins over `--max-gap` and `--min-session` for the run.

## What a session is

git-clock reads `git log` and skips merge commits. It keeps the
author, email, time, and subject. Commits by the same person stay in
one session while the gap between them is within `maxGap`. A longer
gap starts a new session. Each session is at least `minSession`
minutes, plus a 15 minute buffer.

## Reports

| Command | Result |
|---|---|
| `git-clock` | Hours and sessions by person |
| `git-clock --histogram` | Weekly hours |
| `git-clock --histogram --period day` | Daily hours |
| `git-clock --html velocity.html` | One HTML report |
| `git-clock --csv sessions.csv` | One row per session |
| `git-clock --author "Lee"` | Passed to `git log --author` before aliases |
| `git-clock --since 2026-01-01` | First-run cutoff. Ignored after the state file has a commit |
| `git-clock --reset` | Clear the state file and count again |
| `git-clock --config path` | Config file other than `.git-clockrc.json` |
| `git-clock --store path` | State file other than `.git-clock.json` |

## State

`.git-clock.json` remembers the last commit that was counted and the
sessions so far. Gitignore it when each person keeps a private view.
Commit it when the team wants one shared total. This repository
ignores `.git-clock.json`, `report.html`, and `sessions.csv`.

On a project, ignore the state file and the generated reports unless
you have chosen to share the clock in git.

## Add it to a project

1. Install git-clock with one of the commands above.
2. Commit a `.git-clockrc.json` with the people on that project.
3. Ignore `.git-clock.json`, `velocity.html`, and `sessions.csv`, or commit the state file for a shared clock.
4. Run `git-clock --html velocity.html --csv sessions.csv` when you need the report.
5. Run `git-clock` after later commits. It adds only the new ones.

`--reset` starts that project over. `--reset --since 2026-01-01`
limits the new count to commits after a date.

## Requests

`docs/session-timer.md` asks for a session timer that records saves
and autosave next to the commit clock. It is not built. Commit hours
stay the hours until that request is implemented.

`docs/premium.md` asks for the premium planning clocks: a story-point
quantizer, the Murphy, Unknown, and MacGyver calculator, burndown, and
an optimization factor of clock hours against billed hours and a rate.
Those commands stay out of the default report. Clock hours are not a
billing rate.
