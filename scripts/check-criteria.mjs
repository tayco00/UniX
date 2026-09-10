import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const document = await readFile(new URL("../docs/acceptance-criteria.md", import.meta.url), "utf8");
const criteria = [...document.matchAll(/^\| ((?:Q|F|UX|A|D|S|T|P|O)-\d{2}) \| ([^|]+) \|/gm)];
const identifiers = criteria.map((match) => match[1]);
const statusCounts = { "✅": 0, "🔎": 0, "⏳": 0 };

assert.equal(criteria.length, 108, `Erwartet: 108 Kriterien, gefunden: ${criteria.length}`);
assert.equal(new Set(identifiers).size, 108, "Kriterien-IDs müssen eindeutig sein");

for (const prefix of ["Q", "F", "UX", "A", "D", "S", "T", "P", "O"]) {
  const expected = Array.from({ length: 12 }, (_, index) => `${prefix}-${String(index + 1).padStart(2, "0")}`);
  assert.deepEqual(identifiers.filter((id) => id.startsWith(`${prefix}-`)).sort(), expected, `${prefix} benötigt IDs 01 bis 12`);
}

for (const [, id, rawStatus] of criteria) {
  const status = rawStatus.trim();
  assert.ok(Object.hasOwn(statusCounts, status), `${id}: unbekannter Status ${status}`);
  statusCounts[status] += 1;
}

console.log(`Abnahmematrix strukturell gültig: 108 eindeutige Kriterien, 9 Kategorien. Ausgeführt: ${statusCounts["✅"]}; Quellcode-/Dokumentnachweis: ${statusCounts["🔎"]}; offen: ${statusCounts["⏳"]}.`);
console.log("Dies ist eine Strukturprüfung, kein Nachweis von 108 bestandenen Funktionstests.");
