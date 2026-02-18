import sharp from "sharp";
import { readdir, stat, mkdir } from "fs/promises";
import { join, resolve } from "path";
import { execSync } from "child_process";

const PUBLIC_DIR = "public";
const TMP_DIR = "public/_optimized";
const MAX_WIDTH = 1920;
const QUALITY = 75;

const GALLERY_PREFIXES = [
  "WinterCamp_",
  "Group_Arrach_",
  "Bergcamp_",
  "Kihon",
  "Fight",
  "Gruppe",
  "jugend",
  "Dojo",
];

async function run() {
  await mkdir(TMP_DIR, { recursive: true });

  const files = await readdir(PUBLIC_DIR);
  const images = files.filter((f) => {
    const lower = f.toLowerCase();
    if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) return false;
    return GALLERY_PREFIXES.some((prefix) => f.startsWith(prefix));
  });

  console.log(`Found ${images.length} images to optimize.\n`);
  let totalBefore = 0, totalAfter = 0;

  for (const file of images) {
    const srcPath = join(PUBLIC_DIR, file);
    const outPath = join(TMP_DIR, file);
    const before = (await stat(srcPath)).size;
    const beforeKB = (before / 1024).toFixed(0);
    totalBefore += before;

    try {
      await sharp(srcPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(outPath);

      const after = (await stat(outPath)).size;
      const afterKB = (after / 1024).toFixed(0);
      totalAfter += after;
      console.log(`${file}: ${beforeKB}KB -> ${afterKB}KB`);
    } catch (err) {
      console.error(`${file}: ERROR - ${err.message}`);
      totalAfter += before;
    }
  }

  console.log(`\nOptimization complete. Now moving files...`);

  for (const file of images) {
    const outPath = resolve(TMP_DIR, file);
    const destPath = resolve(PUBLIC_DIR, file);
    try {
      execSync(`cmd /c move /Y "${outPath}" "${destPath}"`, { stdio: "ignore" });
    } catch {
      console.error(`Could not move ${file}`);
    }
  }

  try { execSync(`cmd /c rmdir "${resolve(TMP_DIR)}"`, { stdio: "ignore" }); } catch {}

  const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
  console.log(`Total: ${(totalBefore/1024/1024).toFixed(1)}MB -> ${(totalAfter/1024/1024).toFixed(1)}MB (saved ${savedMB}MB)`);
}

run().catch(console.error);
