import fs from "fs";
import path from "path";
import sharp from "sharp";

const [, , inDir, outDir, maxW = "1400", quality = "82"] = process.argv;

if (!inDir || !outDir) {
    console.log("Usage: node tools/compress-images.mjs <inputDir> <outputDir> [maxWidth=1400] [quality=82]");
    process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : [p];
    });

let before = 0;
let after = 0;

for (const file of walk(inDir)) {
    if (!/\.(png|jpe?g)$/i.test(file)) continue;

    const rel = path.relative(inDir, file).replace(/\.(png|jpe?g)$/i, ".webp");
    const out = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });

    await sharp(file)
        .resize({ width: Number(maxW), withoutEnlargement: true })
        .webp({ quality: Number(quality), alphaQuality: 90 })
        .toFile(out);

    const a = fs.statSync(file).size;
    const b = fs.statSync(out).size;
    before += a;
    after += b;
    console.log(`${rel}  ${(a / 1024).toFixed(0)} KB → ${(b / 1024).toFixed(0)} KB`);
}

console.log(`\nTotal: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`);