const { execSync } = require('child_process');
const { writeFileSync, mkdirSync } = require('fs');

let sha = process.env.GIT_SHA;
if (!sha) {
  try {
    sha = execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    sha = 'unknown';
  }
}

mkdirSync('dist', { recursive: true });
writeFileSync('dist/version.json', JSON.stringify({ sha }) + '\n');
console.log(`[embed-sha] ${sha}`);
