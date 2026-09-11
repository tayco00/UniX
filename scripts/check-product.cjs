const { readFileSync, readdirSync, statSync } = require("node:fs");
const { extname, join, relative } = require("node:path");

const root = join(__dirname, "..");
const sourceRoots = ["lib", "test", "desktop", "scripts"];
const extensions = new Set([".dart", ".cjs", ".ps1"]);
const files = [];

function visit(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) visit(path);
    else if (extensions.has(extname(path))) files.push(path);
  }
}
for (const directory of sourceRoots) visit(join(root, directory));

for (const path of files) {
  const lineCount = readFileSync(path, "utf8").split(/\r?\n/).length;
  if (lineCount > 500) throw new Error(`${relative(root, path)} has ${lineCount} lines`);
}

const dart = files
  .filter((path) => extname(path) === ".dart" && !path.includes(join("test", "")))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
for (const phrase of [
  "Ohne Konto startklar",
  "Funktioniert vollständig offline",
  "Deine Daten bleiben bei dir",
]) {
  if (dart.includes(phrase)) throw new Error(`Forbidden product copy: ${phrase}`);
}
if (/\bLokal\b/i.test(dart)) throw new Error('Product copy must not use "Lokal"');
if (/\boptional\b/i.test(dart.replaceAll("(optional)", ""))) {
  throw new Error('Visible optional labels must use "(optional)"');
}
if (/LinearGradient|RadialGradient|SweepGradient/.test(dart)) {
  throw new Error("Gradients are outside the design system");
}

function luminance(hex) {
  const values = hex.match(/[a-f\d]{2}/gi).map((value) => parseInt(value, 16) / 255);
  const linear = values.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(foreground, background) {
  const [bright, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (bright + 0.05) / (dark + 0.05);
}
const contrastPairs = [
  ["17202A", "F6F7F9", 4.5, "ink/canvas"],
  ["5C6673", "F6F7F9", 4.5, "muted/canvas"],
  ["5C6673", "FFFFFF", 4.5, "muted/surface"],
  ["3157E5", "FFFFFF", 4.5, "brand/surface"],
  ["B43C2D", "FFFFFF", 4.5, "danger/surface"],
  ["8A95A3", "FFFFFF", 3, "edge/surface"],
];
for (const [foreground, background, minimum, label] of contrastPairs) {
  const ratio = contrast(foreground, background);
  if (ratio < minimum) throw new Error(`${label} contrast is ${ratio.toFixed(2)}:1`);
}

console.log(`Product checks passed: ${files.length} source files, contrast and copy verified.`);
