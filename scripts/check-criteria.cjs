const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const source = readFileSync(join(__dirname, "..", "docs", "acceptance-criteria.md"), "utf8");
const rows = [...source.matchAll(/^\| ([A-Z]{2})-(\d{2}) \| (✅|⏳) \|/gm)];
const ids = rows.map((match) => `${match[1]}-${match[2]}`);
if (rows.length !== 156) throw new Error(`Expected 156 criteria, found ${rows.length}`);
if (new Set(ids).size !== ids.length) throw new Error("Criterion IDs must be unique");
if (new Set(rows.map((row) => row[1])).size !== 13) throw new Error("Expected 13 categories");
const pending = rows.filter((row) => row[3] === "⏳").length;
if (pending) throw new Error(`${pending} acceptance criteria are pending`);
console.log("Acceptance matrix complete: 156 criteria in 13 categories.");
