import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

function loadGitSha(): string {
  if (process.env.GIT_SHA) return process.env.GIT_SHA;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dir = dirname(__filename);
    const raw = readFileSync(join(__dir, '..', 'version.json'), 'utf8');
    const parsed = JSON.parse(raw) as { sha?: string };
    if (parsed.sha) return parsed.sha;
  } catch {}
  return 'unknown';
}

export const GIT_SHA = loadGitSha();
