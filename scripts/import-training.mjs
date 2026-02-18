import sharp from "sharp";
import { readdir, stat, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

const SRC_DIR = "public/verschiedenes_Training";
const OUT_DIR = "public";
const MAX_WIDTH = 1920;
const QUALITY = 75;

async function run() {
  const files = await readdir(SRC_DIR);
  const images = files.filter((f) => {
    const lower = f.toLowerCase();
    return lower.endsWith(".jpg") || lower.endsWith(".jpeg");
  });

  images.sort();
  console.log(`Found ${images.length} training images.\n`);

  let idx = 1;
  const outputNames = [];

  for (const file of images) {
    const srcPath = join(SRC_DIR, file);
    const outName = `Training_${String(idx).padStart(2, "0")}.jpg`;
    const outPath = join(OUT_DIR, outName);

    try {
      const before = (await stat(srcPath)).size;
      await sharp(srcPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(outPath);

      const after = (await stat(outPath)).size;
      console.log(`${file} -> ${outName} (${(before/1024).toFixed(0)}KB -> ${(after/1024).toFixed(0)}KB)`);
      outputNames.push(outName);
      idx++;
    } catch (err) {
      console.error(`${file}: ERROR - ${err.message}`);
    }
  }

  console.log(`\nCreated ${outputNames.length} optimized images.`);
  console.log("\nFilenames for HTML:");
  outputNames.forEach((name, i) => console.log(`  ${i}: /${name}`));
}

run().catch(console.error);
