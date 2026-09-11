import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../docs/acceptance-criteria.md", import.meta.url),
  "utf8",
);
const rows = [...source.matchAll(/^\| ([A-Z]+-\d{2}) \| (✅|⏳) \|/gm)];
const ids = rows.map((match) => match[1]);
if (rows.length !== 120)
  throw new Error(`Expected 120 criteria, found ${rows.length}`);
if (new Set(ids).size !== ids.length)
  throw new Error("Acceptance criterion IDs must be unique");
const categories = new Set(ids.map((id) => id.split("-")[0]));
if (categories.size !== 10)
  throw new Error(`Expected 10 categories, found ${categories.size}`);
const pending = rows.filter((match) => match[2] === "⏳").length;
if (pending)
  throw new Error(`${pending} acceptance criteria are still pending`);
console.log("Acceptance matrix complete: 120 criteria in 10 categories.");
