#!/usr/bin/env node
/**
 * wiki-authoring.mjs — renders docs/wiki/** from docs/design-registry.json.
 *
 * WHY A SECOND RENDERER EXISTS
 *
 * `plugins/req/scripts/wiki.mjs` renders the PROJECT bundle from `spec.json`: requirements, rules,
 * examples, calculation contracts. Every one of its sections is shaped by that schema. This one
 * renders the AUTHORING bundle — concepts of the tooling itself (§5.1) — from a different truth
 * file with a different shape. Generalising one renderer over both would mean a module that knows
 * both schemas and neither well. What IS shared is imported, not re-implemented: the hash
 * (`doc-hash.mjs`), the frontmatter writer and the type/id tables (`doc-frontmatter.mjs`).
 *
 * THE RULE THIS FILE ENFORCES BY EXISTING
 *
 * docs/wiki/** is layer A (DOC-STANDARD §2): generated, hash-stamped, never hand-edited. Writing
 * that bundle by hand and stamping hashes onto it would produce a fingerprint of nothing — the
 * exact dishonesty the layer split exists to prevent. So the registry is the truth and this is the
 * only thing allowed to write the pages.
 *
 * DETERMINISM — no clock, no randomness. A node's `timestamp` comes from the registry (per node, or
 * the registry's `reviewed` date), never from `Date.now()`. A renderer whose output depends on when
 * it ran can never be idempotent, and an idempotent render is what makes a stale page detectable.
 *
 * Usage:  node scripts/wiki-authoring.mjs [--root <repo-root>] [--write]
 * Exit:   0 = bundle matches the registry (or was written) | 1 = drift found in dry-run | 2 = bad input
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, relative, dirname, posix } from "node:path";
import { parseArgs, orExit2 } from "../plugins/req/scripts/state-dir.mjs";
import { sha256 } from "../plugins/req/scripts/doc-hash.mjs";
import { AUTHORING_TYPES, renderFrontmatter, isScaffold } from "../plugins/req/scripts/doc-frontmatter.mjs";
import { WIKI_DIR } from "../plugins/req/scripts/wiki.mjs";
// loading, validity, page paths and the hash closure live in ONE place, shared with the gate that
// checks this bundle — see registry.mjs for why they may not be re-implemented here.
import { REGISTRY_FILE as REGISTRY, loadRegistry, validateRegistry, pathOfNode, nodeHash } from "./registry.mjs";

// ── args ────────────────────────────────────────────────────────────────────
const { values, flags, positional } = orExit2(() => parseArgs(process.argv.slice(2)));
if (positional.length) {
  console.error(`CONFIG-ERROR unexpected argument "${positional[0]}" — pass the repo as --root <dir>`);
  process.exit(2);
}
const ROOT = resolve(values["--root"] ?? ".");
const WRITE = flags.has("--write");
const REGISTRY_PATH = join(ROOT, REGISTRY);

let registry;
try {
  ({ registry } = loadRegistry(ROOT));
} catch (e) {
  console.error(e.message);
  process.exit(2);
}

// ── validate the registry before rendering anything ─────────────────────────
// A renderer that writes half a bundle and then fails leaves the gate red for a reason that has
// nothing to do with the bundle. Everything is checked first; nothing is written until it passes.
const nodes = registry.nodes ?? [];
const byId = new Map(nodes.map((n) => [n.id, n]));
const problems = validateRegistry(registry, ROOT);
if (problems.length) {
  console.error(`REGISTRY-ERROR ${REGISTRY_PATH}`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(2);
}

/**
 * A registry may forbid its own bundle being written. This exists for the `dirty/` fixture, whose
 * pages are planted violations: it needs a registry so the gate has a divisor to judge D4 and D7
 * against, but one `--write` would repair every planted page and quietly drop the fixture's pinned
 * numbers toward zero. A comment in EXPECTED.md asking people not to do it is not a guard — this is.
 * Dry runs stay allowed: reading is what the fixture is for.
 */
if (WRITE && registry.do_not_render === true) {
  console.error(`REFUSED ${REGISTRY_PATH} sets "do_not_render": true — this bundle is hand-planted test data.`);
  console.error(`  Writing it would repair the violations its numbers are pinned to (see EXPECTED.md).`);
  console.error(`  Drop --write to inspect it, or remove the flag deliberately if the fixture is being rebuilt.`);
  process.exit(2);
}

// ── page paths ──────────────────────────────────────────────────────────────
const dirOf = (type) => AUTHORING_TYPES[type].dir;
const pathOf = pathOfNode;
const DEFAULT_TS = `${registry.reviewed ?? "1970-01-01"}T00:00:00+07:00`;
const hashOf = (n) => nodeHash(n, byId);

const relLink = (fromPath, toPath) => {
  const r = posix.relative(posix.dirname(fromPath), toPath);
  return r.startsWith(".") ? r : `./${r}`;
};

// ── render one concept page ─────────────────────────────────────────────────
function renderPage(n) {
  const self = pathOf(n);
  const fm = renderFrontmatter({
    type: n.type,
    title: n.title,
    description: n.description,
    resource: n.resource,
    tags: Array.isArray(n.tags) ? n.tags : undefined,
    timestamp: n.timestamp ?? DEFAULT_TS,
    id: n.id,
    lifecycle: n.lifecycle ?? "built",
    owner: n.owner ?? registry.owner,
    spec_hash: hashOf(n),
  });
  const out = [fm, "", `# ${n.title}`, ""];
  out.push("> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่", "");
  out.push("## ทำอะไร", "", n.summary ?? n.description, "");
  if (n.notes?.length) {
    out.push("## เกร็ดที่ต้องรู้", "");
    for (const note of n.notes) out.push(`- ${note}`);
    out.push("");
  }
  if (n.links?.length) {
    out.push("## ของที่มันแตะ", "");
    for (const id of n.links) {
      const t = byId.get(id);
      out.push(`- [${id}](${relLink(self, pathOf(t))}) — ${t.title}`);
    }
    out.push("");
  }
  out.push("## ของจริงอยู่ที่ไหน", "", `\`${n.resource}\``, "");
  return out.join("\n");
}

// ── render an index ─────────────────────────────────────────────────────────
/** §6: a catalogue that only lists filenames does nothing `ls` cannot. Each index answers the
 *  question people open that directory to ask — for this bundle, "built or still on paper". */
function renderDirIndex(dir, members) {
  const type = members[0].type;
  const fm = renderFrontmatter({ type, title: dir });
  const out = [fm, "", `# ${dir}`, "", "> generate จาก `docs/design-registry.json` — ห้ามแก้ด้วยมือ", ""];
  out.push("| หน้า | คืออะไร | สร้างแล้วหรือยัง |", "|---|---|---|");
  for (const n of members) out.push(`| [${n.id}.md](${n.id}.md) | ${n.description} | ${n.lifecycle ?? "built"} |`);
  out.push("");
  return out.join("\n");
}

/** คำถามหลักของแต่ละไดเรกทอรี — ใช้ทั้งสารบัญรวมและหน้าสัญญา จึงอยู่ที่เดียว */
const ASKS = {
  marketplace: "ตลาดนี้คืออะไร ประกอบด้วยอะไร",
  plugins: "plugin ตัวไหนสร้างแล้ว ตัวไหนยังเป็นแบบ",
  skills: "skill ไหนถือ doctrine ของคำสั่งไหน",
  schemas: "สัญญาโครงสร้างของ JSON แต่ละไฟล์คืออะไร",
  checkpoints: "ด่านไหนบล็อกอะไร",
  commands: "คำสั่งไหนเขียนไฟล์ ไหนอ่านอย่างเดียว",
  scripts: "ตัวตรวจกับตัวเรนเดอร์ตัวไหนเป็นเจ้าของเรื่องอะไร",
  adr: "เรื่องไหนเคาะไปแล้ว ห้ามเปิดถามซ้ำ",
  "field-notes": "ใช้จริงแล้วเจออะไร",
  standards: "มาตรฐานที่ทุกอย่างในนี้ผูกอยู่",
};

function renderRootIndex(groups) {
  const fm = renderFrontmatter({ type: "Marketplace", title: registry.nodes[0]?.title ?? "aeon" });
  const out = [fm, "", "# authoring bundle — สารบัญรวม", "", "> generate จาก `docs/design-registry.json` — ห้ามแก้ด้วยมือ", ""];
  out.push(`concept ของ **เครื่องมือ** (DOC-STANDARD §5.1) · ${nodes.length} โหนด · ${groups.size} ไดเรกทอรี`, "");
  out.push("| ไดเรกทอรี | มีกี่หน้า | ตอบคำถามหลักว่า |", "|---|---|---|");
  const asks = ASKS;
  for (const [dir, members] of [...groups].sort()) {
    out.push(`| [${dir}](${dir}/index.md) | ${members.length} | ${asks[dir] ?? "—"} |`);
  }
  out.push("", "- [log.md](log.md) — ไทม์ไลน์ ต่อท้ายอย่างเดียว ไม่เคยถูกเขียนทับ", "- [BUNDLE.md](BUNDLE.md) — สัญญาของ bundle นี้", "");
  return out.join("\n");
}

function renderBundleContract(groups) {
  const fm = renderFrontmatter({ type: "Marketplace", title: "bundle contract" });
  // Rows come from the directories this bundle ACTUALLY has. A fixed list was tried and shipped a
  // dead link to adr/ in a two-node bundle — D5 caught it, which is the whole point of D5, but a
  // renderer that emits links to files it did not write is a renderer that manufactures its own
  // violations.
  const rows = [...groups.keys()].sort().map((dir) => `| ${ASKS[dir] ?? dir} | [${dir}/index.md](${dir}/index.md) |`);
  return [
    fm, "",
    "# bundle นี้อ่านยังไง", "",
    "> generate จาก `docs/design-registry.json` — ห้ามแก้ด้วยมือ", "",
    "**หนึ่งโหนด หนึ่งไฟล์ ชื่อไฟล์คือ id** — เริ่มที่ [index.md](index.md) แล้วเดินตามลิงก์",
    "ไม่ต้องอ่านทั้ง bundle เพื่อตอบคำถามบรรทัดเดียว", "",
    "| อยากรู้ | เปิดที่ |",
    "|---|---|",
    "| ทั้ง bundle มีอะไรบ้าง | [index.md](index.md) |",
    ...rows, "",
    "**ทุกหน้าเป็นเอกสารชั้น A** — มี `spec_hash` ของโหนดที่มันเรนเดอร์มา แก้ registry แล้วไม่ render ใหม่",
    "ตัวตรวจ `scripts/verify-design.mjs` จะเห็นทันที (D4) · แก้หน้าด้วยมือแล้ว render ใหม่ = งานหาย", "",
    "**ความจริงอยู่ที่ `docs/design-registry.json`** ไม่ใช่ที่นี่ · ที่นี่คือร่างของมันที่ agent เดินได้", "",
  ].join("\n");
}

const INITIAL_LOG = [
  renderFrontmatter({ type: "Marketplace", title: "log" }), "",
  "# log — ชั้น C ต่อท้ายอย่างเดียว", "",
  "ไฟล์นี้ **ไม่ถูกเขียนทับ** โดยตัวเรนเดอร์ สร้างให้ครั้งเดียวตอนยังไม่มี แล้วต่อท้ายด้วยมือหรือด้วยคำสั่ง", "",
  "| เมื่อ | ใคร/คำสั่ง | เข้ามา | ผล |",
  "|---|---|---|---|",
  `| ${DEFAULT_TS} | \`wiki-authoring.mjs --write\` | docs/design-registry.json | สร้าง bundle ครั้งแรก ${nodes.length} โหนด |`,
  "",
].join("\n");

// ── build the full file set ─────────────────────────────────────────────────
const groups = new Map();
for (const n of nodes) {
  const d = dirOf(n.type);
  if (!groups.has(d)) groups.set(d, []);
  groups.get(d).push(n);
}
for (const list of groups.values()) list.sort((a, b) => a.id.localeCompare(b.id));

const files = new Map(); // bundle-relative path -> content
for (const n of nodes) files.set(pathOf(n), renderPage(n));
for (const [dir, members] of groups) files.set(`${dir}/index.md`, renderDirIndex(dir, members));
files.set("index.md", renderRootIndex(groups));
// BUNDLE.md, not CLAUDE.md — Claude Code loads any CLAUDE.md as instructions, and this page is
// generated. See SCAFFOLD_FILES in doc-frontmatter.mjs for the full reason.
files.set("BUNDLE.md", renderBundleContract(groups));

// ── compare with what is on disk ────────────────────────────────────────────
const BUNDLE = join(ROOT, WIKI_DIR);
const listExisting = (dir, base = dir) => {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...listExisting(full, base));
    else if (e.name.endsWith(".md")) out.push(relative(base, full).split(/[\\/]/).join("/"));
  }
  return out;
};
const existing = new Set(listExisting(BUNDLE));

const stale = [], missing = [], orphan = [];
for (const [rel, content] of files) {
  const full = join(BUNDLE, rel);
  if (!existsSync(full)) missing.push(rel);
  else if (readFileSync(full, "utf8").replace(/\r\n/g, "\n") !== content) stale.push(rel);
}
for (const rel of existing) {
  // log.md is layer C: this renderer creates it once and never touches it again, so it is neither
  // a rendered file nor an orphan.
  if (rel === "log.md") continue;
  if (!files.has(rel)) orphan.push(rel);
}

console.log(`wiki-authoring — ${REGISTRY_PATH}`);
console.log(`${nodes.length} node(s) · ${files.size} rendered file(s) · bundle: ${WIKI_DIR}/`);
console.log("");

if (WRITE) {
  for (const rel of [...missing, ...stale]) {
    const full = join(BUNDLE, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, files.get(rel), "utf8");
    console.log(`${missing.includes(rel) ? "CREATE" : "UPDATE"}  ${rel}`);
  }
  const logPath = join(BUNDLE, "log.md");
  if (!existsSync(logPath)) {
    mkdirSync(BUNDLE, { recursive: true });
    writeFileSync(logPath, INITIAL_LOG, "utf8");
    console.log("CREATE  log.md (ชั้น C — ต่อท้ายอย่างเดียว จากนี้ตัวเรนเดอร์จะไม่แตะอีก)");
  }
  for (const rel of orphan) console.log(`ORPHAN  ${rel} — ไม่มีโหนดในทะเบียนแล้ว · **ไม่ลบให้** การลบไฟล์เป็นการตัดสินใจ`);
  if (!missing.length && !stale.length) console.log("bundle already matches the registry — nothing to write");
  process.exit(0);
}

for (const rel of missing) console.log(`MISSING ${rel}`);
for (const rel of stale) console.log(`STALE   ${rel}`);
for (const rel of orphan) console.log(`ORPHAN  ${rel} — ไม่มีโหนดในทะเบียนแล้ว`);
if (!missing.length && !stale.length && !orphan.length) {
  console.log("bundle already matches the registry — nothing to write");
  process.exit(0);
}
console.log("");
console.log(`${stale.length} stale · ${missing.length} missing · ${orphan.length} orphan — สั่งซ้ำด้วย --write`);
process.exit(1);
