import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'public', 'projects');
const outputAssetDir = path.join(rootDir, 'public', 'project-assets');
const outputDataPath = path.join(rootDir, 'src', 'data', 'generatedProjects.json');

const categoryFolders = ['Academic', 'Professional'];
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const sectionHeadings = [
  'BASIC PROJECT INFORMATION',
  'KEYWORDS',
  'TAGS',
  'SHORT DESCRIPTION',
  'OVERVIEW',
  'CONCEPT',
  'FUNCTIONS',
  'ARCHITECTURAL SOLUTION',
  'SUSTAINABILITY / RESEARCH FOCUS',
  'REFLECTION',
  'PROJECT CARD TEXT',
  'IMAGE NOTES',
];

function normalizeText(text) {
  return text
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitCommaList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toPublicPath(filePath) {
  const relativePath = path.relative(path.join(rootDir, 'public'), filePath);
  return `/${relativePath.split(path.sep).join('/')}`;
}

function extractSections(text) {
  const lines = normalizeText(text).split('\n').map((line) => line.trim());
  const sections = {};
  let activeSection = 'INTRO';

  for (const line of lines) {
    if (!line) {
      continue;
    }

    const heading = sectionHeadings.find((item) => item === line.toUpperCase());

    if (heading) {
      activeSection = heading;
      sections[activeSection] = [];
      continue;
    }

    if (!sections[activeSection]) {
      sections[activeSection] = [];
    }

    sections[activeSection].push(line);
  }

  return sections;
}

function parseBasicInfo(lines = []) {
  const info = {};

  for (const line of lines) {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    info[key] = value;
  }

  return info;
}

function sectionText(sections, heading) {
  return (sections[heading] ?? []).join(' ').trim();
}

async function listProjectFolders() {
  const projects = [];

  for (const categoryFolder of categoryFolders) {
    const categoryPath = path.join(sourceDir, categoryFolder);
    const folders = await fs.readdir(categoryPath, { withFileTypes: true });

    for (const folder of folders) {
      if (folder.isDirectory()) {
        projects.push({
          categoryFolder,
          folderName: folder.name,
          folderPath: path.join(categoryPath, folder.name),
        });
      }
    }
  }

  return projects;
}

async function renameAcademicPdf(projectFolder) {
  if (projectFolder.categoryFolder !== 'Academic') {
    return null;
  }

  const files = await fs.readdir(projectFolder.folderPath, { withFileTypes: true });
  const pdfFile = files.find(
    (file) => file.isFile() && path.extname(file.name).toLowerCase() === '.pdf',
  );

  if (!pdfFile) {
    return null;
  }

  const currentPath = path.join(projectFolder.folderPath, pdfFile.name);
  const targetPath = path.join(projectFolder.folderPath, `${projectFolder.folderName}.pdf`);

  if (currentPath !== targetPath) {
    try {
      await fs.rename(currentPath, targetPath);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  return targetPath;
}

async function optimizeImage(sourcePath, outputPath, width, quality) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
}

async function getProjectImages(projectFolder, slug) {
  const files = await fs.readdir(projectFolder.folderPath, { withFileTypes: true });
  const imageFiles = files
    .filter((file) => file.isFile() && imageExtensions.has(path.extname(file.name).toLowerCase()))
    .map((file) => file.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const heroFile =
    imageFiles.find((file) => path.parse(file).name.toLowerCase() === 'hero-image') ??
    imageFiles[0];
  const galleryFiles = imageFiles.filter((file) => file !== heroFile);
  const outputDir = path.join(outputAssetDir, projectFolder.categoryFolder, slug);

  const heroFullPath = path.join(outputDir, 'hero.webp');
  const heroThumbPath = path.join(outputDir, 'hero-thumb.webp');

  if (heroFile) {
    const sourcePath = path.join(projectFolder.folderPath, heroFile);
    await optimizeImage(sourcePath, heroFullPath, 1800, 84);
    await optimizeImage(sourcePath, heroThumbPath, 760, 78);
  }

  const gallery = [];

  for (const [index, file] of galleryFiles.entries()) {
    const sourcePath = path.join(projectFolder.folderPath, file);
    const imageName = `image-${index + 1}`;
    const fullPath = path.join(outputDir, `${imageName}.webp`);
    const thumbPath = path.join(outputDir, `${imageName}-thumb.webp`);

    await optimizeImage(sourcePath, fullPath, 1800, 84);
    await optimizeImage(sourcePath, thumbPath, 760, 78);

    gallery.push({
      id: imageName,
      src: toPublicPath(fullPath),
      thumbnail: toPublicPath(thumbPath),
      caption: `Project visual ${index + 1}`,
    });
  }

  return {
    image: heroFile ? toPublicPath(heroThumbPath) : '',
    heroImage: heroFile ? toPublicPath(heroFullPath) : '',
    gallery,
  };
}

async function parseProject(projectFolder) {
  const docxPath = path.join(projectFolder.folderPath, 'project.info.docx');
  const docx = await mammoth.extractRawText({ path: docxPath });
  const sections = extractSections(docx.value);
  const basicInfo = parseBasicInfo(sections['BASIC PROJECT INFORMATION']);
  const title = basicInfo.Title || projectFolder.folderName;
  const slug = basicInfo.Slug || slugify(title);
  const normalizedCategory = projectFolder.categoryFolder;
  const pdfPath = await renameAcademicPdf(projectFolder);
  const images = await getProjectImages(projectFolder, slug);
  const tags = splitCommaList(sectionText(sections, 'TAGS'));

  return {
    slug,
    title,
    originalTitle: basicInfo['Original Title'] || '',
    category: normalizedCategory,
    year: basicInfo.Year || '',
    location: basicInfo.Location || '',
    role: basicInfo.Role || '',
    developedWith: basicInfo['Developed With'] || '',
    tools: splitCommaList(basicInfo.Tools),
    keywords: splitCommaList(sectionText(sections, 'KEYWORDS')),
    shortDescription:
      sectionText(sections, 'PROJECT CARD TEXT') || sectionText(sections, 'SHORT DESCRIPTION'),
    overview: sectionText(sections, 'OVERVIEW'),
    concept: sectionText(sections, 'CONCEPT'),
    functions: sectionText(sections, 'FUNCTIONS'),
    architecturalSolution: sectionText(sections, 'ARCHITECTURAL SOLUTION'),
    sustainabilityFocus: sectionText(sections, 'SUSTAINABILITY / RESEARCH FOCUS'),
    reflection: sectionText(sections, 'REFLECTION'),
    tags: tags.includes(normalizedCategory) ? tags : [normalizedCategory, ...tags],
    featured: /^yes$/i.test(basicInfo['Featured on Homepage'] || ''),
    sourceFolder: `/projects/${projectFolder.categoryFolder}/${projectFolder.folderName}`,
    presentationBoard: pdfPath ? toPublicPath(pdfPath) : '',
    theme: normalizedCategory === 'Academic' ? 'terrace' : 'housing',
    image: images.image,
    heroImage: images.heroImage,
    gallery: images.gallery,
  };
}

async function main() {
  const projectFolders = await listProjectFolders();
  const projects = [];

  for (const projectFolder of projectFolders) {
    projects.push(await parseProject(projectFolder));
  }

  projects.sort((a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title));

  await fs.mkdir(path.dirname(outputDataPath), { recursive: true });
  await fs.writeFile(outputDataPath, `${JSON.stringify(projects, null, 2)}\n`);

  console.log(`Synced ${projects.length} projects.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
