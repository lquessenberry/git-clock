import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export async function loadConfig(path = '.git-clockrc.json') {
  if (!existsSync(path)) return { aliases: {} };

  try {
    const raw = await readFile(path, 'utf8');
    const data = JSON.parse(raw);
    return {
      aliases: data.aliases || {},
      maxGap: data.maxGap,
      minSession: data.minSession,
    };
  } catch {
    return { aliases: {} };
  }
}

export function resolveAuthor(name, email, aliases) {
  const key = `${name} <${email}>`;
  if (aliases[key]) return aliases[key];
  if (aliases[name]) return aliases[name];
  if (aliases[email]) return aliases[email];
  return name;
}
