const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const source = readFileSync(
  join(__dirname, "..", "docs", "m2-acceptance-criteria.md"),
  "utf8",
);
const rows = [...source.matchAll(/^\| ([A-Z]{2})-(\d{2}) \| (✅|⏳) \|/gm)];
const ids = rows.map((match) => `${match[1]}-${match[2]}`);
const categories = new Set(rows.map((row) => row[1]));
const complete = rows.filter((row) => row[3] === "✅").length;

if (rows.length !== 130) {
  throw new Error(`Expected 130 M2 criteria, found ${rows.length}`);
}
if (new Set(ids).size !== ids.length) {
  throw new Error("M2 criterion IDs must be unique");
}
if (categories.size !== 13) {
  throw new Error(`Expected 13 M2 categories, found ${categories.size}`);
}
if (complete !== 62) {
  throw new Error(`Expected 62 evidenced M2.1 criteria, found ${complete}`);
}

console.log(`M2 plan valid: ${complete}/130 evidenced, ${130 - complete} planned.`);
