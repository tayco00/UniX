const sharp = require("sharp");
const { readFile } = require("node:fs/promises");
const { join } = require("node:path");

async function main() {
  const root = join(__dirname, "..");
  const svg = await readFile(join(root, "assets", "brand", "unix-mark.svg"));
  const render = (size, output, opaque = false) => {
    let pipeline = sharp(svg).resize(size, size);
    if (opaque) pipeline = pipeline.flatten({ background: "#3157E5" });
    return pipeline.png().toFile(output);
  };

  await render(512, join(root, "assets", "brand", "unix.png"));
  await render(32, join(root, "web", "favicon.png"));
  for (const size of [192, 512]) {
    await render(size, join(root, "web", "icons", `Icon-${size}.png`));
    await render(size, join(root, "web", "icons", `Icon-maskable-${size}.png`), true);
  }

  const iosDirectory = join(root, "ios", "Runner", "Assets.xcassets", "AppIcon.appiconset");
  const iosSizes = new Map([
    ["Icon-App-20x20@1x.png", 20], ["Icon-App-20x20@2x.png", 40],
    ["Icon-App-20x20@3x.png", 60], ["Icon-App-29x29@1x.png", 29],
    ["Icon-App-29x29@2x.png", 58], ["Icon-App-29x29@3x.png", 87],
    ["Icon-App-40x40@1x.png", 40], ["Icon-App-40x40@2x.png", 80],
    ["Icon-App-40x40@3x.png", 120], ["Icon-App-60x60@2x.png", 120],
    ["Icon-App-60x60@3x.png", 180], ["Icon-App-76x76@1x.png", 76],
    ["Icon-App-76x76@2x.png", 152], ["Icon-App-83.5x83.5@2x.png", 167],
    ["Icon-App-1024x1024@1x.png", 1024],
  ]);
  for (const [name, size] of iosSizes) {
    await render(size, join(iosDirectory, name), true);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
