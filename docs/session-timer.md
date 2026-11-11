# Session timer

Request. This is not built. The commit clock stays the clock until this
request is accepted and implemented.

git-clock builds a session from commit timestamps. A gap longer than
`maxGap` starts a new session. Each session is at least `minSession`
minutes, plus a 15 minute buffer. A save in the project, or an autosave
from an editor, leaves no mark until someone commits.

The session timer is a second clock. It records time signals while the
work is happening. Commit hours stay on their own total. Activity hours
are the signal total. Reports, the histogram, and the CSV show both.
They do not add activity hours into commit hours.

A later switch may stretch one commit session back to the first signal
inside the same `maxGap`. That switch is off. Turning it on changes
history, so it stays opt-in.

## Signals

A signal is one mark:

```json
{
  "at": "2026-11-11T15:04:00.000Z",
  "author": "Lee",
  "kind": "autosave",
  "ref": "court-brief.docx"
}
```

`at` is the file’s modification time, or the time of a manual mark.
`author` is the person running the timer. Autosave files have no git
author. The timer takes `git config user.name` and `user.email`, runs
them through the project aliases, and uses `--author` when that override
is set. `ref` is the file name. It is not a path and it is not the file
contents.

| Kind | When it is written |
|---|---|
| `autosave` | A known editor wrote a recovery file for something inside the project |
| `save` | A file in the project tree, or the git index, changed and is not a new commit yet |
| `mark` | The user ran `git-clock mark` |

The timer stats modification time and size. It does not read file
bodies. An open file that is not changing writes nothing. Quiet time
still ends the session at `maxGap`. The same floor and 15 minute buffer
apply to a session made only of signals.

## Where the timer looks

The timer watches the project root. It also stats a fixed set of
autosave layouts, and it keeps a hit only when that file belongs to the
project. It does not watch the home directory.

| Source | What it stats |
|---|---|
| Project tree | Saves under the repo. Skip `.git`, `node_modules`, and `vendor` |
| Word, Excel, PowerPoint | AutoRecovery, and `~/Library/Autosave Information` on macOS |
| Pages, Numbers, Keynote | That app’s container autosave directory on macOS |
| LibreOffice | Profile backups, and `.~lock` files in the project |
| Cursor and VS Code | Local History entries whose file sits inside the project |
| Vim and Emacs | Swap and backup files next to a project file |

The macOS versions store at `/.DocumentRevisions-V100` stays off. It
needs privileged access and it holds documents from outside the project.

## Commands

```bash
git-clock timer
git-clock timer stop
git-clock mark "brief"
git-clock
```

`git-clock timer` starts the sampler in the project. `git-clock timer
stop` closes it. `git-clock mark` writes one manual signal and can be
used while the timer is running or on its own. The next `git-clock` run
merges the journal with new commits and prints commit hours and activity
hours.

`git-clock timer commit` appends the journal to the local state file.
That state stays in `.git-clock.json`. A shared commit, when a team
wants one, is counts and time ranges for each author. It does not
include file names.

## Files

The journal is `.git-clock/signals.jsonl`, one signal per line. Ignore
it, the same way the state file is ignored:

```
.git-clock.json
.git-clock/
```

## What stays put

- Commit hours, session grouping, and the 15 minute buffer stay as they
  are for commits.
- `--reset` clears commit state. It also clears stored signals.
- The timer does not deploy, push, or commit the project by itself.
- Activity hours are an estimate of file activity. They are not a
  timesheet, and they are not the commit clock.
