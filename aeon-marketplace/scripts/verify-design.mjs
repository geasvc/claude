#!/usr/bin/env node
/**
 * verify-design.mjs — deterministic gate for the AUTHORING side of this marketplace.
 *
 * The twin of `plugins/req/scripts/verify-rules.mjs`. That one asks "which rule has nobody proved
 * yet" about a CUSTOMER's project; this one asks "does the tooling's own documentation still hold
 * together" about THIS repo. Same shape on purpose: no LLM judgement anywhere, exit 0/1/2, and a
 * fixture pair where `dirty/` violates every check.
 *
 * Checks — DOC-STANDARD §9. Counts per check are pinned in scripts/fixtures/dirty/EXPECTED.md:
 *   D1   every page in docs/wiki/** has frontmatter with a `type`          [error]  shared
 *   D2   `type` is in the CLOSED list of this bundle's scope (§5.1)        [error]  shared
 *   D3   `id` matches the pattern for that type                            [error]  shared
 *   D4   layer-A page hashes match the registry (or, with no registry,
 *        carry a well-formed marker)                                       [error]  shared
 *   D5   internal links reach a real file (code blocks skipped)            [warn]   shared
 *   D6   every bundle directory has index.md, and it lists its pages       [warn]
 *   D7   no orphan pages — every page has a node in the registry           [warn]   needs a registry
 *   D8   SKILL.md <= 500 lines and frontmatter holds only name/description [error]
 *   D9   every plugin has commands/help.md and USER-GUIDE.md               [error]
 *   D10  layer-B documents carry an owner and a review date                [warn]
 *   D11  help.md mentions every command in commands/                       [error]
 *   D12a help.md and USER-GUIDE.md contain Thai                            [error]
 *   D12b Thai prose outside code/quotes in SKILL.md and references/        [warn, permanent]
 *
 * D1–D5 are imported from doc-frontmatter.mjs TOGETHER WITH THEIR SEVERITY, because §9 forbids the
 * two gates from answering the same rule differently. This file may rename a finding (D3 vs "ค")
 * but may not re-level it — which is why nothing below writes "error"/"warn" for those five by hand.
 *
 * D4 AND D7 DEPEND ON A DIVISOR, AND SAY SO EITHER WAY
 *
 * Both need docs/design-registry.json: D4 to recompute the hash a page should carry, D7 to know
 * which pages are supposed to exist at all. With a registry, both run and the header prints LIVE.
 * Without one, D4 falls back to presence-and-form, D7 does not run, and the header prints LIMIT —
 * never a silent zero, which would read as "checked and clean".
 *
 * The hash closure is IMPORTED from registry.mjs, the same module the renderer writes from. A gate
 * that recomputed it its own way would be policing its own arithmetic instead of the renderer's —
 * the drift §9 forbids, and the reason doc-frontmatter.mjs exists for the document rules.
 *
 * An invalid registry is exit 2, not a finding: judging a bundle against a broken divisor produces
 * findings nobody can act on.
 *
 * Usage:  node scripts/verify-design.mjs [--root <repo-root>] [--json]
 * Exit:   0 = green | 1 = violations printed | 2 = unreadable file / bad arguments
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, relative, dirname, posix } from "node:path";
// argv parsing lives in ONE place for this repo's scripts — see state-dir.mjs
import { parseArgs, orExit2 } from "../plugins/req/scripts/state-dir.mjs";
// the five shared document rules AND their severity (DOC-STANDARD §9)
import {
  checkPage,
  isScaffold,
  readPageHash,
  parseFrontmatter,
  SHARED_LEVEL,
  AUTHORING_TYPES,
} from "../plugins/req/scripts/doc-frontmatter.mjs";
// "docs/wiki" is written once, in the renderer that produces it
import { WIKI_DIR } from "../plugins/req/scripts/wiki.mjs";
// the registry's page paths and hash closure — the SAME module the renderer writes from, so this
// gate compares against the renderer's arithmetic rather than a second copy of it
import { REGISTRY_FILE, hasRegistry, loadRegistry, validateRegistry, pageIndex } from "./registry.mjs";

// ── args ────────────────────────────────────────────────────────────────────
const { values, flags, positional } = orExit2(() => parseArgs(process.argv.slice(2)));
if (positional.length) {
  console.error(`CONFIG-ERROR unexpected argument "${positional[0]}" — pass the repo as --root <dir>`);
  process.exit(2);
}
const ROOT = resolve(values["--root"] ?? ".");
const AS_JSON = flags.has("--json");
if (!existsSync(ROOT)) {
  console.error(`NOT-FOUND ${ROOT} — --root must point at a marketplace repo`);
  process.exit(2);
}

// ── findings ────────────────────────────────────────────────────────────────
/** Declaration order == report order. A check with no entry here would print unsorted. */
const CHECKS = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12a", "D12b"];
const CHECK_NAMES = {
  D1: "page frontmatter", D2: "type in closed list", D3: "id pattern", D4: "hash marker",
  D5: "internal links", D6: "index.md coverage", D7: "orphan pages", D8: "SKILL.md shape",
  D9: "help + USER-GUIDE exist", D10: "layer B owner + review date",
  D11: "help covers every command", D12a: "Thai where people read", D12b: "Thai where Claude reads",
};
/** The shared five carry the module's level; the rest carry the level DOC-STANDARD §9 assigns. */
const OWN_LEVEL = { D6: "warn", D7: "warn", D8: "error", D9: "error", D10: "warn", D11: "error", D12a: "error", D12b: "warn" };
/** D1–D5 map onto the module's rule keys — this is where severity comes from, never a literal. */
const SHARED_RULE = { D1: "frontmatter", D2: "type", D3: "id", D4: "hash", D5: "link" };
const levelOf = (check) => (SHARED_RULE[check] ? SHARED_LEVEL[SHARED_RULE[check]] : OWN_LEVEL[check]);

const findings = [];
const notes = []; // declared limitations — printed even when everything passes
const report = (check, id, message) => findings.push({ check, level: levelOf(check), id, message });

const readOrExit2 = (path) => {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    console.error(`READ-ERROR ${path}: ${e.message}`);
    process.exit(2);
  }
};

/** Recursive *.md listing, bundle-relative, POSIX separators so messages match on every platform. */
function listMarkdown(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(full, base));
    else if (entry.name.endsWith(".md")) out.push(relative(base, full).split(/[\\/]/).join("/"));
  }
  return out;
}

const listDirs = (dir) =>
  existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];

const THAI = /[฀-๿]/;

// ── D1–D5 · the authoring bundle ────────────────────────────────────────────
const BUNDLE = join(ROOT, WIKI_DIR);
const bundlePages = listMarkdown(BUNDLE);

/**
 * The registry is the divisor D4-equality and D7 both need. Absent -> those two halves stay off and
 * say so. Present but INVALID -> exit 2: judging a bundle against a registry that is itself broken
 * would produce findings nobody can act on, and "2 = unreadable input" is exactly that case. The
 * validity rules come from the same module the renderer uses, so the two can never disagree about
 * what "valid" means.
 */
let REG = null;
if (hasRegistry(ROOT)) {
  let registry;
  try {
    ({ registry } = loadRegistry(ROOT));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  const problems = validateRegistry(registry, ROOT);
  if (problems.length) {
    console.error(`REGISTRY-ERROR ${join(ROOT, REGISTRY_FILE)} — cannot judge a bundle against a registry that is itself invalid`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(2);
  }
  REG = pageIndex(registry);
}

if (!existsSync(BUNDLE)) {
  // Not an error: DOC-STANDARD §11 records the authoring bundle as not built yet (task 6). But a
  // silent zero would read as "checked and clean", which is the failure this whole repo is about.
  //
  // There ARE docs/wiki/ trees elsewhere in this repo (plugins/req/scripts/fixtures/clean/docs/wiki
  // has 37 pages) and widening the search to find them would be a BUG, not a fix: those are PROJECT
  // bundles under §5.2, and D2 judges against the authoring list of §5.1 only. Pointed at them, this
  // gate would reject every one of the 37 for a `type` that is correct for what they are.
  notes.push(`SKIP  D1–D6 · no authoring bundle at ${WIKI_DIR}/ — nothing to check, NOT a pass (project bundles elsewhere in the repo are §5.2 and are NOT this gate's business)`);
} else {
  const pageSet = new Set(bundlePages);
  const linkExists = (from) => (target) => {
    if (target.startsWith("/")) return false; // absolute paths do not survive a moved bundle
    const rel = posix.normalize(posix.join(posix.dirname(from), target));
    if (rel.startsWith("..")) return existsSync(resolve(BUNDLE, dirname(from), target)); // may leave the bundle
    return pageSet.has(rel) || existsSync(join(BUNDLE, rel));
  };

  for (const rel of bundlePages) {
    const text = readOrExit2(join(BUNDLE, rel));

    // The shared module owns D1 D2 D3 D5 — and D4 too, once a registry exists to recompute from.
    // With a registry, `expectedHash` is the renderer's own hash for this page and the module does
    // the comparison at the severity it owns. Without one, expectedHash stays null and the reduced
    // presence-and-form check below runs instead.
    const expectedHash = REG?.index.get(rel)?.hash ?? null;
    const shared = checkPage({ text, relPath: rel, scope: "authoring", expectedHash, linkExists: linkExists(rel) });
    const RULE_TO_CHECK = { frontmatter: "D1", type: "D2", id: "D3", hash: "D4", link: "D5" };
    for (const f of shared) {
      const check = RULE_TO_CHECK[f.rule];
      if (!check) continue;
      // scaffolding files (index/log/CLAUDE) are not concept pages: §5 exempts them from D1–D4,
      // and the module is told about it here rather than being taught two vocabularies.
      if (isScaffold(rel) && check !== "D5") continue;
      findings.push({ check, level: f.level, id: f.id, message: f.message });
    }

    if (isScaffold(rel)) continue;
    // A page D1/D2/D3 already rejected cannot be matched to a registry node, and one with no
    // frontmatter has nowhere to carry a hash. Charging it again under D4 or D7 would bill one
    // broken page twice and make the fixture counts untraceable to a cause.
    const alreadyBroken = shared.some((f) => ["frontmatter", "type", "id"].includes(f.rule));
    if (alreadyBroken) continue;

    // ── D7 · orphan pages ─────────────────────────────────────────────────
    // Only answerable with a divisor. §9 puts D7 on whichever gate HAS one; the authoring
    // divisor is the registry, so this runs only when it exists.
    if (REG && !REG.index.has(rel)) {
      report("D7", rel, "no node in docs/design-registry.json renders this page — either it was renamed and the old page stayed, or someone added a page by hand");
      continue; // an orphan has no expected hash; D4 below would be judging it against nothing
    }

    if (expectedHash === null) {
      // No registry: keep the reduced check, which is still worth something — a layer A page with
      // no fingerprint at all cannot be told from a hand-edited one.
      const { fm } = parseFrontmatter(text);
      const hash = readPageHash(fm, text);
      if (!hash) report("D4", rel, "no hash marker — a layer A page with no fingerprint cannot be told from a hand-edited one");
      else if (!/^sha256:[0-9a-f]{64}$/.test(hash)) report("D4", rel, `hash marker malformed: "${hash}"`);
    }
  }

  // ── D6 · index.md in every directory, listing its pages ──────────────────
  const dirsWithPages = new Set(bundlePages.map((p) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : ".")));
  for (const dir of [...dirsWithPages].sort()) {
    const indexRel = dir === "." ? "index.md" : `${dir}/index.md`;
    if (!bundlePages.includes(indexRel)) {
      report("D6", indexRel, "directory has no index.md — progressive disclosure needs an entry point per directory");
      continue;
    }
    const indexText = readOrExit2(join(BUNDLE, indexRel));
    for (const page of bundlePages) {
      const inThisDir = (page.includes("/") ? page.slice(0, page.lastIndexOf("/")) : ".") === dir;
      if (!inThisDir || page === indexRel || isScaffold(page)) continue;
      const name = page.slice(page.lastIndexOf("/") + 1);
      if (!indexText.includes(name)) report("D6", indexRel, `does not list ${name} — a catalogue that skips a page is worse than no catalogue`);
    }
  }
}

if (REG) {
  notes.push(`LIVE  D4 · hash compared against ${REGISTRY_FILE} — the renderer's own closure, imported not re-implemented`);
  notes.push(`LIVE  D7 · orphan pages judged against ${REGISTRY_FILE} (${REG.index.size} node page(s) expected)`);
} else if (existsSync(BUNDLE)) {
  notes.push(`LIMIT D4 · presence and form only — no ${REGISTRY_FILE} to recompute a hash against`);
  notes.push(`LIMIT D7 · not run — "orphan" needs a divisor and ${REGISTRY_FILE} does not exist here (§9)`);
}

// ── D8–D12b · plugin structure ──────────────────────────────────────────────
const PLUGINS_DIR = join(ROOT, "plugins");
const pluginNames = listDirs(PLUGINS_DIR);
if (!pluginNames.length) notes.push(`SKIP  D8–D12b · no plugins/ directory under ${ROOT} — nothing to check, NOT a pass`);

for (const name of pluginNames) {
  const pluginDir = join(PLUGINS_DIR, name);
  const at = (...p) => join(pluginDir, ...p);
  const has = (...p) => existsSync(at(...p));

  // ── D9 · the two documents §3.5 makes mandatory ──────────────────────────
  const helpPath = at("commands", "help.md");
  const guidePath = at("USER-GUIDE.md");
  if (!has("commands", "help.md")) report("D9", name, "no commands/help.md — §3.5: a plugin without help is not ready to ship");
  if (!has("USER-GUIDE.md")) report("D9", name, "no USER-GUIDE.md");

  // ── D11 · help mentions every command ────────────────────────────────────
  const commandFiles = existsSync(at("commands"))
    ? readdirSync(at("commands")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3))
    : [];
  if (existsSync(helpPath)) {
    const helpText = readOrExit2(helpPath);
    for (const cmd of commandFiles) {
      if (cmd === "help") continue; // help documents itself by existing
      // Deterministic on purpose: presence, not "is the explanation good enough" (§9 on D11).
      // ONLY the `/plugin:command` form counts. A looser fallback (a backticked bare word) was
      // tried and measured: 6 of req's 7 commands matched it through incidental prose — `calc`,
      // `capture`, `change`, `check`, `example`, `golden` all appear in sentences about something
      // else. A check that a passing help file satisfies by accident is not a check.
      if (!helpText.includes(`/${name}:${cmd}`)) {
        report("D11", `${name}:${cmd}`, `commands/${cmd}.md exists but help.md never mentions it — the failure this check exists for is adding a command and forgetting help`);
      }
    }
    // ── D12a · help is for people ─────────────────────────────────────────
    if (!THAI.test(helpText)) report("D12a", `${name}/commands/help.md`, "contains no Thai — §3.4: documents people open are Thai");
  }
  if (existsSync(guidePath) && !THAI.test(readOrExit2(guidePath))) {
    report("D12a", `${name}/USER-GUIDE.md`, "contains no Thai — §3.4: documents people open are Thai");
  }

  // ── D8 · SKILL.md shape ─────────────────────────────────────────────────
  for (const skill of listDirs(at("skills"))) {
    const skillPath = at("skills", skill, "SKILL.md");
    if (!existsSync(skillPath)) {
      report("D8", `${name}/${skill}`, "skill directory has no SKILL.md");
      continue;
    }
    const text = readOrExit2(skillPath);
    const lines = text.replace(/\r\n/g, "\n").split("\n").length;
    if (lines > 500) report("D8", `${name}/${skill}/SKILL.md`, `${lines} lines > 500 — move detail into references/ (§3.3)`);
    const { ok, fm } = parseFrontmatter(text);
    if (!ok) report("D8", `${name}/${skill}/SKILL.md`, "no frontmatter — Claude Code needs name + description");
    else {
      const extra = Object.keys(fm).filter((k) => k !== "name" && k !== "description");
      if (extra.length) {
        report("D8", `${name}/${skill}/SKILL.md`, `frontmatter carries ${extra.join(", ")} — §4: this frontmatter is a contract with Claude Code, OKF fields do not belong in it`);
      }
    }
  }

  // ── D12b · Thai prose where Claude reads, reported as a list ─────────────
  const claudeReads = [];
  for (const skill of listDirs(at("skills"))) {
    const skillPath = at("skills", skill, "SKILL.md");
    if (existsSync(skillPath)) claudeReads.push([`${name}/${skill}/SKILL.md`, skillPath]);
    const refDir = at("skills", skill, "references");
    if (existsSync(refDir)) {
      for (const f of readdirSync(refDir).filter((f) => f.endsWith(".md"))) {
        claudeReads.push([`${name}/${skill}/references/${f}`, join(refDir, f)]);
      }
    }
  }
  for (const [label, path] of claudeReads) {
    const hits = thaiProseLines(readOrExit2(path));
    if (hits.length) {
      report("D12b", label, `${hits.length} line(s) of Thai outside code and quotes: ${hits.slice(0, 8).join(", ")}${hits.length > 8 ? ", …" : ""} — a LIST, not a verdict (§9: the script cannot tell prose from a Thai string that must stay Thai)`);
    }
  }
}

/**
 * Lines carrying Thai after fenced blocks, inline code and quoted spans are removed. Quotes are
 * stripped because §9 measured exactly this way, and because a quoted Thai string is usually the
 * literal a template or an error message must emit — the thing that must NOT be translated.
 */
function thaiProseLines(text) {
  const out = [];
  let fence = null;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const f = lines[i].match(/^\s*(```+|~~~+)/);
    if (f) {
      if (fence && lines[i].trim().startsWith(fence)) fence = null;
      else if (!fence) fence = f[1];
      continue;
    }
    if (fence) continue;
    const bare = lines[i]
      .replace(/`[^`]*`/g, "")
      .replace(/"[^"]*"/g, "")
      .replace(/“[^”]*”/g, "")
      .replace(/'[^']*'/g, "")
      .replace(/\*"[^"]*"\*/g, "");
    if (THAI.test(bare)) out.push(String(i + 1));
  }
  return out;
}

// ── D10 · layer B documents ─────────────────────────────────────────────────
/**
 * Which files are layer B is decided by position, not by reading: everything under docs/ that is
 * not the generated bundle and does not carry a generated-doc hash marker, plus the gateway file.
 * DOC-STANDARD §11 enumerates exactly this set. Plugin-level layer B (SKILL.md, USER-GUIDE.md) is
 * covered by D8/D9/D12 and is deliberately not double-reported here.
 *
 * Fixture trees are out of scope BY DESIGN, not by accident: scripts/fixtures/** holds documents
 * that violate these rules on purpose. Widening this scan to cover them would import the dirty
 * fixture's planted warnings into the repo's own result — do not "fix" the scope.
 */
const layerB = [];
if (existsSync(join(ROOT, "CLAUDE.md"))) layerB.push("CLAUDE.md");
for (const rel of listMarkdown(join(ROOT, "docs"))) {
  const relFromRoot = `docs/${rel}`;
  if (relFromRoot.startsWith(`${WIKI_DIR}/`)) continue;
  const text = readOrExit2(join(ROOT, "docs", rel));
  if (/spec-hash:\s*sha256:/.test(text)) continue; // layer A lives by different rules (§2)
  layerB.push(relFromRoot);
}
for (const rel of layerB) {
  const text = readOrExit2(join(ROOT, rel));
  const head = text.replace(/\r\n/g, "\n").split("\n").slice(0, 40).join("\n");
  const hasOwner = /owner\s*[:：]/i.test(head) || /เจ้าของ\s*[:：]/.test(head);
  const hasDate = /\b20\d\d-\d\d-\d\d\b/.test(head);
  if (!hasOwner || !hasDate) {
    const miss = [!hasOwner && "owner", !hasDate && "review date"].filter(Boolean).join(" + ");
    report("D10", rel, `layer B document with no ${miss} in its first 40 lines (§2) — nobody can tell who answers for it or how stale it is`);
  }
}

// ── report ──────────────────────────────────────────────────────────────────
const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warn");

if (AS_JSON) {
  console.log(JSON.stringify({ root: ROOT, bundle: existsSync(BUNDLE) ? WIKI_DIR : null, plugins: pluginNames, notes, errors, warnings }, null, 2));
  process.exit(errors.length ? 1 : 0);
}

console.log(`verify-design — ${ROOT}`);
console.log(`plugins: ${pluginNames.length ? pluginNames.join(", ") : "(none)"} · authoring bundle: ${existsSync(BUNDLE) ? `${WIKI_DIR}/ (${bundlePages.length} file(s))` : "not built"}`);
console.log("");
for (const n of notes) console.log(n);
console.log("");

const groupBy = (list) => {
  const g = new Map();
  for (const f of list) {
    if (!g.has(f.check)) g.set(f.check, []);
    g.get(f.check).push(f);
  }
  return [...g.entries()].sort((a, b) => CHECKS.indexOf(a[0]) - CHECKS.indexOf(b[0]));
};

if (!errors.length && !warnings.length) {
  console.log("PASS — no violations");
  process.exit(0);
}
for (const [check, list] of groupBy(errors)) {
  console.log(`FAIL  ${check} ${CHECK_NAMES[check]}`);
  for (const f of list) console.log(`        ${f.id}: ${f.message}`);
}
for (const [check, list] of groupBy(warnings)) {
  console.log(`WARN  ${check} ${CHECK_NAMES[check]}`);
  for (const f of list) console.log(`        ${f.id}: ${f.message}`);
}
console.log("");
console.log(`${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
