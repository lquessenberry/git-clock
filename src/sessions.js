const HOUR = 60 * 60 * 1000;

export function buildSessions(commits, { maxGapMinutes = 120, minSessionMinutes = 30 } = {}) {
  if (!commits.length) return [];

  const maxGap = maxGapMinutes * 60 * 1000;
  const minSession = minSessionMinutes * 60 * 1000;

  const byAuthor = new Map();
  for (const commit of commits) {
    if (!byAuthor.has(commit.author)) byAuthor.set(commit.author, []);
    byAuthor.get(commit.author).push(commit);
  }

  const sessions = [];

  for (const [author, authorCommits] of byAuthor) {
    authorCommits.sort((a, b) => a.timestamp - b.timestamp);

    let current = null;

    for (const commit of authorCommits) {
      if (!current || commit.timestamp - current.end > maxGap) {
        if (current) sessions.push(finalize(current, minSession));
        current = {
          author,
          start: commit.timestamp,
          end: commit.timestamp,
          commits: [commit.hash],
        };
      } else {
        current.end = commit.timestamp;
        current.commits.push(commit.hash);
      }
    }

    if (current) sessions.push(finalize(current, minSession));
  }

  return sessions.sort((a, b) => a.start - b.start);
}

function finalize(session, minSession) {
  const duration = Math.max(session.end - session.start, minSession);
  // Add a small buffer for first commit of session
  const buffered = duration + 15 * 60 * 1000;
  return {
    ...session,
    durationMs: buffered,
    hours: +(buffered / HOUR).toFixed(2),
    date: new Date(session.start).toISOString().slice(0, 10),
  };
}
