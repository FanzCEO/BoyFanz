import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROPRIETARY_HEADER = `> **PROPRIETARY** - Owned by Joshua Stone (Wyatt Cole) and Licensed Usage to FANZ Group Holdings LLC.
> 30 N GOULD STREET SHERIDAN, WY 82801
> (tm) FANZ patent pending 2025

---

`;

const TARGET_DIR = path.join(__dirname, '..');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    // Skip node_modules, .git, and dist
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.md')) {
      callback(filePath);
    }
  }
}

let updated = 0;
let skipped = 0;

walkDir(TARGET_DIR, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has proprietary header
  if (content.includes('PROPRIETARY') && content.includes('Joshua Stone')) {
    skipped++;
    return;
  }

  // Add header at the top
  const newContent = PROPRIETARY_HEADER + content;
  fs.writeFileSync(filePath, newContent);
  console.log('Updated:', filePath.replace(TARGET_DIR, ''));
  updated++;
});

console.log('');
console.log('Done! Updated: ' + updated + ', Skipped: ' + skipped);
