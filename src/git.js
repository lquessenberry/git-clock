import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function getCommits({ since, author, afterHash } = {}) {
  const args = [
    'log',
    '--pretty=format:%H%x09%an%x09%ae%x09%at%x09%s',
    '--no-merges',
  ];

  if (afterHash) {
    args.push(`${afterHash}..HEAD`);
  } else if (since) {
    args.push(`--since=${since}`);
  }

  if (author) {
    args.push(`--author=${author}`);
  }

  try {
    const { stdout } = await execFileAsync('git', args, { maxBuffer: 10 * 1024 * 1024 });
    if (!stdout.trim()) return [];

    return stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [hash, name, email, timestamp, ...messageParts] = line.split('\t');
        return {
          hash,
          author: name,
          email,
          timestamp: Number(timestamp) * 1000,
          message: messageParts.join('\t'),
        };
      })
      .filter((c) => c.hash && c.timestamp)
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch (err) {
    if (err.code === 128) return [];
    throw new Error(`git log failed: ${err.message}`);
  }
}
