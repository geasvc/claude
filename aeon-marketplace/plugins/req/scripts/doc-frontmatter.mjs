#!/usr/bin/env node
/**
 * doc-frontmatter.mjs — the ONE definition of the five rules both document gates share.
 *
 * DOC-STANDARD §9 puts two gates on the same rules:
 *   · authoring bundle -> ../../../scripts/verify-design.mjs  D1 D2 D3 D4 D5
 *   · project bundle   -> verify-rules.mjs   check #12 ก ข ค ง จ
 * and forbids them from disagreeing: "a rule that answers differently in two places is what makes
 * people stop believing the checker". So the SEVERITY LIVES HERE, not in the callers. A caller
 * renames the finding (D3 vs "ค") but may not re-level it.
 *
 * Scope matters: §5.1 (tool concepts) and §5.2 (customer-work concepts) are two CLOSED lists and
 * D2 checks against the list of the bundle the page is in — never the union.
 *
 * Usage as CLI:  node doc-frontmatter.mjs --verify-against <spec.schema.json>
 *                proves PROJECT_TYPES id patterns still equal the schema's $defs. See ID_PATTERN_OWNER.
 * Exit:  0 = patterns agree | 1 = drift, printed per type | 2 = file/parse error
 */
import { readFileSync } from "node:fs";

// ── severity — shared, not per-gate ─────────────────────────────────────────
/** Keys are the shared rules; values are the only levels either gate may report. */
export const SHARED_LEVEL = {
  frontmatter: "error", // ก / D1 — page has frontmatter and a type
  type: "error",        // ข / D2 — type is in the closed list of this bundle's scope
  id: "error",          // ค / D3 — id matches the pattern for that type
  hash: "error",        // ง / D4 — page hash equals the recomputed one
  link: "warn",         // จ / D5 — internal links reach a real file (warn first, promote together)
};

/**
 * ID_PATTERN_OWNER — spec.schema.json owns these patterns (CLAUDE.md §2: schema beats the standard
 * on id and enum). The copies below exist because this module must run inside a customer project
 * where the schema file is not on a predictable path. `--verify-against` is how the copy is kept
 * honest: it is a command, so drift is caught by running something, not by remembering.
 */
export const PROJECT_TYPES = {
  "Requirement":          { dir: "requirements", def: "reqId",          re: /^REQ-[a-z0-9-]+-[0-9]{3}$/ },
  "Business Rule":        { dir: "rules",        def: "ruleVersionId",  re: /^BR-[a-z0-9-]+-[0-9]{3}@v[0-9]+$/ },
  "Calculation Contract": { dir: "calculations", def: "calcVersionId",  re: /^CALC-[a-z0-9-]+-[0-9]{3}@v[0-9]+$/ },
  "Example":              { dir: "examples",     def: "exId",           re: /^EX-[a-z0-9-]+-[0-9]{3}$/ },
  "Golden Dataset":       { dir: "golden",       def: "gdId",           re: /^GD-[a-z0-9-]+-[0-9]{3}$/ },
  "Change Set":           { dir: "changes",      def: "chgId",          re: /^CHG-[a-z0-9-]+-[0-9]{3}$/ },
  "Glossary Term":        { dir: "glossary",     def: "ulId",           re: /^UL-[a-z0-9-]+-[0-9]{3}$/ },
  "Open Question":        { dir: "questions",    def: "qId",            re: /^Q-[a-z0-9-]+-[0-9]{3}$/ },
  "Deferred Question":    { dir: "questions",    def: "dqId",           re: /^DQ-[a-z0-9-]+-[0-9]{3}$/ },
  // nfr[] is nested under requirements[] — the pattern lives inline in the schema, not in $defs
  "NFR":                  { dir: "nfr",          def: null,             re: /^NFR-[a-z0-9-]+-[0-9]{3}$/ },
  // DOC-STANDARD §5.2: SRC has no module segment. Declared exception — do not "fix" it.
  "Source":               { dir: "sources",      def: "srcId",          re: /^SRC-[0-9]{3}$/ },
};

/** §5.1 — concepts of the TOOLING. Consumed by scripts/verify-design.mjs (D2 for the authoring scope). */
export const AUTHORING_TYPES = {
  "Marketplace": { dir: "marketplace",  re: /^MKT-[a-z0-9-]+$/ },        // singleton: no number
  "Plugin":      { dir: "plugins",      re: /^PLG-[a-z0-9-]+$/ },
  "Skill":       { dir: "skills",       re: /^SKL-[a-z0-9-]+$/ },
  "Schema":      { dir: "schemas",      re: /^SCH-[a-z0-9-]+$/ },
  "Checkpoint":  { dir: "checkpoints",  re: /^CP[1-6]$/ },               // keeps the name the system already uses
  "Command":     { dir: "commands",     re: /^CMD-[a-z0-9-]+-[0-9]{3}$/ },
  "Script":      { dir: "scripts",      re: /^SCR-[a-z0-9-]+-[0-9]{3}$/ },
  // dir is "adr", not "decisions": DOC-STANDARD owns structure (CLAUDE.md §2), and both its §3.1
  // tree and its §12 template write `adr/`. Aligned here 2026-08-13 so the bundle and the module
  // cannot name the same directory two ways.
  "Decision":    { dir: "adr",          re: /^ADR-[a-z0-9-]+-[0-9]{3}$/ },
  "Field Note":  { dir: "field-notes",  re: /^FN-[a-z0-9-]+-[0-9]{3}$/ },
  "Standard":    { dir: "standards",    re: /^STD-[a-z0-9-]+-[0-9]{3}$/ },
};

export const SCOPES = { project: PROJECT_TYPES, authoring: AUTHORING_TYPES };

/**
 * Bundle-relative path of a concept page. One node = one file = one concept, and the id IS the
 * filename, so `@v` versions land on separate paths and an old version is never overwritten
 * (design §5.5 — path is identity). `@` is legal on both Windows and POSIX.
 */
export function pagePath(type, id, scope = "project") {
  const spec = SCOPES[scope]?.[type];
  if (!spec) throw new Error(`pagePath: unknown ${scope} type "${type}"`);
  return `${spec.dir}/${id}.md`;
}

/**
 * The bundle's bones, not concept pages (DOC-STANDARD §6 treats them as a separate category).
 * They carry no `type`/`id`/`spec_hash`, so the five shared rules do not apply and orphan
 * detection must not claim them — a scaffolding file has no node to map back to by definition.
 */
/**
 * The contract page is `BUNDLE.md`, NOT `CLAUDE.md` — renamed 2026-08-13 by the owner's call.
 * Claude Code loads every CLAUDE.md in a tree as INSTRUCTIONS. A bundle's contract page is
 * generated by a renderer, so leaving it under that name turns a script's output into standing
 * instructions for every session in the repo — including the customer's repo, since /req:capture
 * writes this bundle there. A descriptive page must not sit in an instruction channel.
 */
export const SCAFFOLD_FILES = new Set(["index.md", "log.md", "BUNDLE.md"]);
export const isScaffold = (relPath) => SCAFFOLD_FILES.has(relPath.split("/").pop());

// ── frontmatter ─────────────────────────────────────────────────────────────
/**
 * Deliberately a small, fixed YAML subset — `key: value`, `key: [a, b]`, and block sequences.
 * The renderer is the only producer of these pages, so an exotic construct arriving here means
 * someone hand-edited a generated file, which is already forbidden. A full YAML parser would
 * accept that edit silently; this one reports it.
 *
 * Inline `#` comments are NOT stripped: provenance values legitimately contain `#` (SRC-002#p3-§5.6).
 * Whole-line comments are.
 */
export function parseFrontmatter(text) {
  const norm = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  if (!norm.startsWith("---\n")) return { ok: false, fm: {}, body: norm, bodyOffset: 0 };
  const end = norm.indexOf("\n---", 3);
  if (end === -1) return { ok: false, fm: {}, body: norm, bodyOffset: 0 };
  const raw = norm.slice(4, end + 1);
  const body = norm.slice(end + 4).replace(/^\n+/, "");
  // Lines consumed before the body starts, so a caller can report a FILE line number. Reporting a
  // body-relative one sends the reader to the wrong line of the file they are about to open.
  const bodyOffset = norm.slice(0, norm.length - body.length).split("\n").length - 1;

  const fm = {};
  let key = null;
  for (const line of raw.split("\n")) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const seq = line.match(/^\s*-\s+(.*)$/);
    if (seq && key) {
      if (!Array.isArray(fm[key])) fm[key] = fm[key] ? [fm[key]] : [];
      fm[key].push(unquote(seq[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1];
    const v = kv[2].trim();
    if (v === "") fm[key] = "";
    else if (v.startsWith("[") && v.endsWith("]")) {
      const inner = v.slice(1, -1).trim();
      fm[key] = inner === "" ? [] : inner.split(",").map((s) => unquote(s.trim()));
    } else fm[key] = unquote(v);
  }
  return { ok: true, fm, body, bodyOffset };
}

const unquote = (s) =>
  (s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")) ? s.slice(1, -1) : s;

/**
 * Serialise back out. The renderer uses this so producer and parser cannot drift apart.
 * Empty values are omitted rather than written as `key:` with a trailing space — an editor or
 * linter that trims trailing whitespace would otherwise make every page differ from what the
 * renderer produces, i.e. permanently "stale" for a reason nobody can see.
 */
export function renderFrontmatter(obj) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) lines.push(`${k}: [${v.join(", ")}]`);
    else lines.push(`${k}: ${v}`);
  }
  lines.push("---");
  return lines.join("\n");
}

// ── hash marker — two accepted forms (DOC-STANDARD §9, D4) ──────────────────
/** HTML-comment form, hyphen key. Owned by doc-hash.mjs; repeated as a doc-layer reader only. */
export const HASH_COMMENT_RE = /spec-hash:\s*(sha256:[0-9a-f]{64})/;

/** Frontmatter form (underscore key) first, HTML comment second. Returns null when neither exists. */
export function readPageHash(fm, text) {
  const inFm = typeof fm?.spec_hash === "string" ? fm.spec_hash.trim() : "";
  if (/^sha256:[0-9a-f]{64}$/.test(inFm)) return inFm;
  const m = text.match(HASH_COMMENT_RE);
  return m ? m[1] : null;
}

// ── links ───────────────────────────────────────────────────────────────────
/**
 * Markdown links outside code. Fenced blocks and inline spans are skipped because the templates in
 * DOC-STANDARD §12 contain example links to files that will never exist — not skipping them makes a
 * permanent false positive, which §9 forbids outright.
 */
export function extractLinks(body) {
  const out = [];
  let fence = null;
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (fence && line.trim().startsWith(fence)) fence = null;
      else if (!fence) fence = f[1];
      continue;
    }
    if (fence) continue;
    const bare = line.replace(/`[^`]*`/g, ""); // drop inline code spans
    for (const m of bare.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      out.push({ target: target.split("#")[0], line: i + 1 });
    }
  }
  return out.filter((l) => l.target !== "");
}

// ── the shared five ─────────────────────────────────────────────────────────
/**
 * @param {object}   p
 * @param {string}   p.text          raw file contents
 * @param {string}   p.relPath       path shown in messages (bundle-relative)
 * @param {"project"|"authoring"} p.scope
 * @param {string?}  p.expectedHash  recomputed hash, or null to skip rule (ง) — e.g. orphan pages,
 *                                   where "which node do I hash" has no answer
 * @param {(target: string) => boolean} p.linkExists
 * @returns {{rule: string, level: string, id: string, message: string}[]}
 */
export function checkPage({ text, relPath, scope, expectedHash, linkExists }) {
  const types = SCOPES[scope];
  if (!types) throw new Error(`unknown scope "${scope}"`);
  const out = [];
  const at = (rule, message, id = relPath) => out.push({ rule, level: SHARED_LEVEL[rule], id, message });

  const { ok, fm, body, bodyOffset } = parseFrontmatter(text);
  if (!ok) {
    at("frontmatter", "no YAML frontmatter — an OKF page without frontmatter is unreadable to every consumer");
    return out; // nothing below can be judged
  }
  if (!fm.type) {
    at("frontmatter", "frontmatter has no `type` — the one field OKF requires");
    return out;
  }

  const spec = types[fm.type];
  if (!spec) {
    at("type", `type "${fm.type}" is not in the closed list for the ${scope} bundle (DOC-STANDARD §5) — allowed: ${Object.keys(types).join(", ")}`);
  }
  const id = typeof fm.id === "string" ? fm.id.trim() : "";
  if (!id) at("id", `no id`);
  else if (spec && !spec.re.test(id)) {
    at("id", `id "${id}" does not match the pattern for type "${fm.type}" (${spec.re.source})`, id);
  }

  if (expectedHash !== null && expectedHash !== undefined) {
    const found = readPageHash(fm, text);
    // "the source" rather than "spec.json": this module serves both bundles, and the authoring
    // side's source is docs/design-registry.json. A message naming the wrong file sends the reader
    // to the wrong place at the exact moment they are trying to fix something.
    if (!found) at("hash", `no spec_hash — cannot tell whether the page still matches the source it was rendered from`, id || relPath);
    else if (found !== expectedHash) {
      at("hash", `stale (page ${found.slice(0, 15)}... vs spec ${expectedHash.slice(0, 15)}...) — regenerate, do not hand-edit`, id || relPath);
    }
  }

  if (linkExists) {
    for (const { target, line } of extractLinks(body)) {
      if (!linkExists(target)) at("link", `line ${line + bodyOffset}: link -> ${target} reaches no file`, id || relPath);
    }
  }
  return out;
}

// ── CLI: prove the id patterns still equal the schema's ─────────────────────
if (process.argv[1]?.replace(/\\/g, "/").endsWith("doc-frontmatter.mjs")) {
  const i = process.argv.indexOf("--verify-against");
  if (i === -1 || !process.argv[i + 1]) {
    console.error("usage: node doc-frontmatter.mjs --verify-against <spec.schema.json>");
    process.exit(2);
  }
  let schema;
  try {
    schema = JSON.parse(readFileSync(process.argv[i + 1], "utf8"));
  } catch (e) {
    console.error(`PARSE-ERROR ${process.argv[i + 1]}: ${e.message}`);
    process.exit(2);
  }
  const defs = schema.$defs ?? {};
  let bad = 0;
  for (const [type, { def, re }] of Object.entries(PROJECT_TYPES)) {
    if (!def) {
      console.log(`SKIP  ${type.padEnd(22)} pattern is inline in the schema, not in $defs`);
      continue;
    }
    const want = defs[def]?.pattern;
    if (want === undefined) {
      console.log(`FAIL  ${type.padEnd(22)} $defs.${def} does not exist`);
      bad++;
    } else if (want !== re.source) {
      console.log(`FAIL  ${type.padEnd(22)} schema ${want}  !=  module ${re.source}`);
      bad++;
    } else {
      console.log(`ok    ${type.padEnd(22)} ${want}`);
    }
  }
  console.log("");
  console.log(bad ? `${bad} pattern(s) drifted from the schema` : "all id patterns match the schema");
  process.exit(bad ? 1 : 0);
}
