import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourceDirectories = [
  path.join(rootDir, 'public', 'images'),
  path.join(rootDir, 'public', 'project-assets'),
];
const imageExtensions = new Set(['.avif', '.jpg', '.jpeg', '.png', '.webp']);

function toPlaceholderPath(filePath) {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}-placeholder.webp`);
}

async function listImageFiles(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (!imageExtensions.has(extension) || entry.name.endsWith('-placeholder.webp')) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function createPlaceholder(sourcePath) {
  const placeholderPath = toPlaceholderPath(sourcePath);
  await sharp(sourcePath)
    .rotate()
    .resize({ width: 48, withoutEnlargement: true })
    .webp({ quality: 58 })
    .toFile(placeholderPath);

  return placeholderPath;
}

async function main() {
  const allFiles = [];

  for (const directoryPath of sourceDirectories) {
    allFiles.push(...(await listImageFiles(directoryPath)));
  }

  let generatedCount = 0;

  for (const filePath of allFiles) {
    await createPlaceholder(filePath);
    generatedCount += 1;
  }

  console.log(`Generated ${generatedCount} image placeholders.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
