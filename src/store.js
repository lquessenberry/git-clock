import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const DEFAULT_STORE = {
  version: 1,
  lastProcessedCommit: null,
  authors: {},
  updated: null,
};

export async function loadStore(path = '.git-clock.json') {
  if (!existsSync(path)) return { ...DEFAULT_STORE };
  try {
    const raw = await readFile(path, 'utf8');
    return { ...DEFAULT_STORE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export async function saveStore(store, path = '.git-clock.json') {
  const data = {
    ...store,
    updated: new Date().toISOString(),
  };
  await writeFile(path, JSON.stringify(data, null, 2));
}

export function mergeSessions(store, newSessions, lastHash) {
  const authors = { ...store.authors };

  for (const session of newSessions) {
    const key = session.author;
    if (!authors[key]) {
      authors[key] = { totalHours: 0, sessions: [] };
    }
    authors[key].sessions.push(session);
    authors[key].totalHours = +(authors[key].totalHours + session.hours).toFixed(2);
  }

  return {
    ...store,
    authors,
    lastProcessedCommit: lastHash || store.lastProcessedCommit,
  };
}
