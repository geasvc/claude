#!/usr/bin/env node
/**
 * verify-rules.mjs — deterministic CP1/CP2 checker for spec.json (req @ aeon)
 *
 * Answers the question the whole system exists for — "which rule has nobody proved yet?" —
 * by counting from files. No LLM judgment anywhere in this file.
 *
 * Checks — the expected counts per check are pinned in scripts/fixtures/dirty/EXPECTED.md:
 *   1.  every REQ has actor + goal
 *   2.  every is_current rule has >= 1 example                          [CP1]
 *   3.  open questions (red cards) == 0                                 [CP1]
 *   4.  every reference resolves (proves / raised_by / supersedes / superseded_by /
 *       questions / examples / belongs_to / traces_down / constrains / constrained_by)
 *   5.  open deferred_questions == 0                                    [CP2 only — never CP1]
 *   6.  status consistency: superseded <-> superseded_by <-> is_current
 *   7.  rule refs carry @v; exactly one is_current per base_id
 *   8.  sources: path under docs/, file exists, hash matches
 *   9.  rollup equals recomputed values (is_current rules only)
 *   10. docs/requirements/REQ-xxx.md exists and is in sync
 *   11. ubiquitous language: domain_concepts resolve, terms have definitions   [WARN only]
 *   12. docs/wiki/** is complete and in sync with spec.json (7 lettered sub-checks) [CP1]
 *   13. every is_current kind=calculation rule has a human-verified golden dataset [WARN only]
 *   14. change-set integrity: superseded nodes are recorded by a CHG, every CHG is approved,
 *       invalidated answer keys have a verified replacement                        [WARN only]
 *
 * Usage:  node verify-rules.mjs [--root <project-root>] [--state-dir <name>] [--spec <path>]
 *                              [--cp1|--cp2] [--json]
 *         root = CWD · state dir resolved by state-dir.mjs (--state-dir > $AEON_STATE_DIR > .aeon)
 * Exit:   0 = green (for the requested gate) | 1 = violations printed | 2 = file/parse error
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
// single source of truth for where spec.json lives, and for argv parsing
import { parseArgs, resolveSpecPath, orExit2 } from "./state-dir.mjs";
// single source of truth for the generated-doc hash — never reimplement it inline
import { reqDocHash, sha256, SPEC_HASH_RE, nodeDocHash, enumerateNodes } from "./doc-hash.mjs";
// the five rules this gate shares with verify-design.mjs — including their SEVERITY, which is why
// they are imported rather than restated (DOC-STANDARD §9: the two gates may not disagree)
import { checkPage, extractLinks, pagePath, isScaffold, SHARED_LEVEL } from "./doc-frontmatter.mjs";
import { WIKI_DIR } from "./wiki.mjs";
// single source of truth for rollup{} — same rule: the checker must not own a second copy
import { computeRollup } from "./rollup.mjs";

// ── args ────────────────────────────────────────────────────────────────────
const { values, flags, positional } = orExit2(() => parseArgs(process.argv.slice(2)));
if (positional.length) {
  console.error(`CONFIG-ERROR unexpected argument "${positional[0]}" — pass a file as --spec <path>`);
  process.exit(2);
}
const ROOT = resolve(values["--root"] ?? ".");
const { specPath: SPEC_PATH } = orExit2(() => resolveSpecPath({ root: ROOT, values }));
const AS_JSON = flags.has("--json");
const GATE = flags.has("--cp2") ? "CP2" : flags.has("--cp1") ? "CP1" : "ALL";

// ── load ────────────────────────────────────────────────────────────────────
let spec;
try {
  spec = JSON.parse(readFileSync(SPEC_PATH, "utf8"));
} catch (e) {
  console.error(`PARSE-ERROR ${SPEC_PATH}: ${e.message}`);
  process.exit(2);
}

const findings = []; // { check, gate, level, id, message }
const add = (check, gate, level, id, message) => findings.push({ check, gate, level, id, message });
const err = (check, gate, id, message) => add(check, gate, "error", id, message);
const warn = (check, gate, id, message) => add(check, gate, "warn", id, message);

const sources = spec.sources ?? [];
const glossary = spec.glossary ?? [];
const requirements = spec.requirements ?? [];
const rules = spec.rules ?? [];
const examples = spec.examples ?? [];
const calculations = spec.calculations ?? [];
const goldens = spec.golden_datasets ?? [];
const changes = spec.changes ?? [];
const questions = spec.questions ?? [];
const deferred = spec.deferred_questions ?? [];

const byId = (arr) => new Map(arr.map((x) => [x.id, x]));
const srcMap = byId(sources);
const reqMap = byId(requirements);
const ruleMap = byId(rules);
const exMap = byId(examples);
const calcMap = byId(calculations);
const gdMap = byId(goldens);
const chgMap = byId(changes);
const ulMap = byId(glossary);
const qMap = byId(questions);
const dqMap = byId(deferred);

const RULE_VERSION_RE = /^BR-[a-z0-9-]+-\d{3}@v\d+$/;
const RULE_BASE_RE = /^BR-[a-z0-9-]+-\d{3}$/;

// ── 1. every REQ has actor + goal ───────────────────────────────────────────
for (const r of requirements) {
  if (!r.actor?.trim()) err(1, "CP1", r.id, "requirement has no actor");
  if (!r.goal?.trim()) err(1, "CP1", r.id, "requirement has no goal");
}

// ── 2. every is_current rule has >= 1 example ───────────────────────────────
const currentRules = rules.filter((r) => r.is_current === true);
for (const r of currentRules) {
  if (!Array.isArray(r.examples) || r.examples.length === 0) {
    err(2, "CP1", r.id, `rule has no example — nobody proves it: "${r.statement ?? ""}"`);
  }
}

// ── 3. open red cards == 0 ──────────────────────────────────────────────────
for (const q of questions) {
  if (q.state === "open") err(3, "CP1", q.id, `red card still open: "${q.question}"`);
}

// ── 4. every reference resolves ─────────────────────────────────────────────
const refCheck = (holderId, field, value, exists, kind) => {
  if (!exists) err(4, "ALL", holderId, `${field} -> ${value} does not resolve (${kind} not found)`);
};
for (const r of requirements) {
  for (const base of r.rules ?? []) {
    const hasAny = rules.some((rv) => rv.base_id === base);
    refCheck(r.id, "rules[]", base, hasAny, "rule base_id");
  }
  for (const p of r.provenance ?? []) refCheck(r.id, "provenance.source", p.source, srcMap.has(p.source), "source");
}
for (const rv of rules) {
  refCheck(rv.id, "belongs_to", rv.belongs_to, reqMap.has(rv.belongs_to), "requirement");
  for (const ex of rv.examples ?? []) refCheck(rv.id, "examples[]", ex, exMap.has(ex), "example");
  for (const q of rv.questions ?? []) refCheck(rv.id, "questions[]", q, qMap.has(q), "question");
  for (const p of rv.provenance ?? []) refCheck(rv.id, "provenance.source", p.source, srcMap.has(p.source), "source");
  if (rv.supersedes) refCheck(rv.id, "supersedes", rv.supersedes, ruleMap.has(rv.supersedes), "rule version");
  if (rv.superseded_by) refCheck(rv.id, "superseded_by", rv.superseded_by, ruleMap.has(rv.superseded_by), "rule version");
  if (rv.constrained_by) refCheck(rv.id, "constrained_by", rv.constrained_by, calcMap.has(rv.constrained_by), "calculation");
  for (const gd of rv.golden ?? []) refCheck(rv.id, "golden[]", gd, gdMap.has(gd), "golden dataset");
}
// calculation contracts (round 2). Reference resolution only — CALC versioning and the
// one-CALC-per-rule-version check belong to round 4 with the rest of CALC consistency.
for (const c of calculations) {
  refCheck(c.id, "constrains", c.constrains, ruleMap.has(c.constrains), "rule version");
  for (const q of c.questions ?? []) refCheck(c.id, "questions[]", q, qMap.has(q), "question");
  for (const dq of c.deferred_questions ?? []) refCheck(c.id, "deferred_questions[]", dq, dqMap.has(dq), "deferred question");
  for (const p of c.provenance ?? []) refCheck(c.id, "provenance.source", p.source, srcMap.has(p.source), "source");
}
// golden datasets (round 3). proves[] accepts a rule version OR a calculation contract.
for (const gd of goldens) {
  for (const p of gd.proves ?? []) {
    refCheck(gd.id, "proves[]", p, ruleMap.has(p) || calcMap.has(p), "rule version or calculation");
  }
  if (gd.source) refCheck(gd.id, "source", gd.source, srcMap.has(gd.source), "source");
}
// change sets (round 4). affects[] points at the NEW versions the change produced.
for (const chg of changes) {
  for (const a of chg.affects ?? []) {
    refCheck(chg.id, "affects[]", a, ruleMap.has(a) || calcMap.has(a), "rule version or calculation version");
  }
  for (const gd of chg.invalidates ?? []) refCheck(chg.id, "invalidates[]", gd, gdMap.has(gd), "golden dataset");
  for (const s of chg.triggered_by ?? []) refCheck(chg.id, "triggered_by[]", s, srcMap.has(s), "source");
}
for (const ex of examples) {
  for (const p of ex.proves ?? []) refCheck(ex.id, "proves[]", p, ruleMap.has(p), "rule version");
  if (!Array.isArray(ex.proves) || ex.proves.length === 0) {
    err(4, "ALL", ex.id, "example proves nothing — an example that proves no rule is noise");
  }
}
for (const q of questions) {
  const ok = srcMap.has(q.raised_by) || ruleMap.has(q.raised_by);
  refCheck(q.id, "raised_by", q.raised_by, ok, "source or rule version");
}
for (const dq of deferred) refCheck(dq.id, "raised_by", dq.raised_by, ruleMap.has(dq.raised_by), "rule version");

// source.interpretation.validation.question must resolve
for (const s of sources) {
  const v = s.interpretation?.validation;
  if (v?.state === "deferred") {
    if (!v.question) err(4, "CP1", s.id, "interpretation deferred but no question minted — a deferred reading MUST become a red card");
    else refCheck(s.id, "validation.question", v.question, qMap.has(v.question), "question");
  }
}

// ── 5. open deferred questions == 0 (CP2, never CP1) ────────────────────────
for (const dq of deferred) {
  if (dq.state === "open") {
    err(5, "CP2", dq.id, `spillover question still open (answer at /${dq.answer_phase}:ask): "${dq.question}"`);
  }
}

// ── 6. status consistency ───────────────────────────────────────────────────
for (const rv of rules) {
  if (rv.status === "superseded") {
    if (rv.is_current !== false) err(6, "ALL", rv.id, "status=superseded but is_current is not false");
    if (!rv.superseded_by) err(6, "ALL", rv.id, "status=superseded but superseded_by is empty");
  }
  if (rv.superseded_by && rv.status !== "superseded") {
    err(6, "ALL", rv.id, `has superseded_by but status is "${rv.status}" (expected superseded)`);
  }
  if (rv.version > 1 && !rv.supersedes) err(6, "ALL", rv.id, `version ${rv.version} but supersedes is empty`);
  if (rv.version > 1 && !rv.change_reason) err(6, "ALL", rv.id, `version ${rv.version} but no change_reason — cannot answer why the rule changed`);
  // reciprocity
  if (rv.supersedes) {
    const prev = ruleMap.get(rv.supersedes);
    if (prev && prev.superseded_by !== rv.id) {
      err(6, "ALL", rv.id, `supersedes ${rv.supersedes} but that version's superseded_by is "${prev.superseded_by ?? "(empty)"}"`);
    }
  }
}
// same supersession rules for calculation contracts (design §7.6 — #6 widened, not a new check).
// A contract that changed without saying why is worse than a rule that did: the statement can look
// identical while every number produced under it moved.
for (const c of calculations) {
  if (c.status === "superseded") {
    if (c.is_current !== false) err(6, "ALL", c.id, "status=superseded but is_current is not false");
    if (!c.superseded_by) err(6, "ALL", c.id, "status=superseded but superseded_by is empty");
  }
  if (c.superseded_by && c.status !== "superseded") {
    err(6, "ALL", c.id, `has superseded_by but status is "${c.status}" (expected superseded)`);
  }
  if (c.version > 1 && !c.supersedes) err(6, "ALL", c.id, `version ${c.version} but supersedes is empty`);
  if (c.version > 1 && !c.change_reason) err(6, "ALL", c.id, `version ${c.version} but no change_reason — cannot answer why the contract changed`);
  if (c.supersedes) {
    const prev = calcMap.get(c.supersedes);
    if (prev && prev.superseded_by !== c.id) {
      err(6, "ALL", c.id, `supersedes ${c.supersedes} but that version's superseded_by is "${prev.superseded_by ?? "(empty)"}"`);
    }
  }
}
for (const r of [...requirements, ...examples]) {
  if (r.status && !["draft", "validated", "locked", "superseded"].includes(r.status)) {
    err(6, "ALL", r.id, `unknown status "${r.status}"`);
  }
}

// ── 7. @v discipline + exactly one is_current per base_id ───────────────────
for (const rv of rules) {
  if (!RULE_VERSION_RE.test(rv.id)) err(7, "ALL", rv.id, "rule id must carry @v (e.g. BR-job-011@v2)");
  if (!RULE_BASE_RE.test(rv.base_id ?? "")) err(7, "ALL", rv.id, `base_id "${rv.base_id}" malformed`);
  if (rv.id && rv.base_id && !rv.id.startsWith(rv.base_id + "@v")) {
    err(7, "ALL", rv.id, `id does not match base_id "${rv.base_id}"`);
  }
}
const bareRuleRef = (holderId, field, value) => {
  if (RULE_BASE_RE.test(value)) {
    err(7, "ALL", holderId, `${field} -> "${value}" has no @v — a bare rule id silently re-points when current moves`);
  }
};
for (const ex of examples) for (const p of ex.proves ?? []) bareRuleRef(ex.id, "proves[]", p);
for (const dq of deferred) bareRuleRef(dq.id, "raised_by", dq.raised_by);

const byBase = new Map();
for (const rv of rules) {
  if (!rv.base_id) continue;
  if (!byBase.has(rv.base_id)) byBase.set(rv.base_id, []);
  byBase.get(rv.base_id).push(rv);
}
for (const [base, versions] of byBase) {
  const cur = versions.filter((v) => v.is_current === true);
  if (cur.length === 0) err(7, "ALL", base, `no version marked is_current (${versions.length} version(s)) — current rule unknown`);
  if (cur.length > 1) err(7, "ALL", base, `${cur.length} versions marked is_current: ${cur.map((v) => v.id).join(", ")}`);
}

// same "exactly one current" invariant for calculation contracts, now that they carry @v (§7.4)
const calcByBase = new Map();
for (const c of calculations) {
  if (c.id && c.base_id && !c.id.startsWith(c.base_id + "@v")) {
    err(7, "ALL", c.id, `id does not match base_id "${c.base_id}"`);
  }
  if (!c.base_id) continue;
  if (!calcByBase.has(c.base_id)) calcByBase.set(c.base_id, []);
  calcByBase.get(c.base_id).push(c);
}
for (const [base, versions] of calcByBase) {
  const cur = versions.filter((v) => v.is_current === true);
  if (cur.length === 0) err(7, "ALL", base, `no calculation version marked is_current (${versions.length} version(s))`);
  if (cur.length > 1) err(7, "ALL", base, `${cur.length} calculation versions marked is_current: ${cur.map((v) => v.id).join(", ")}`);
}

// one current contract per rule version. Deferred from round 2 and closed here: two contracts
// pinning the same rule mean two official answers to "how is this number produced", both green.
const calcByConstrains = new Map();
for (const c of calculations) {
  if (c.is_current !== true || !c.constrains) continue;
  if (!calcByConstrains.has(c.constrains)) calcByConstrains.set(c.constrains, []);
  calcByConstrains.get(c.constrains).push(c.id);
}
for (const [ruleId, ids] of calcByConstrains) {
  if (ids.length > 1) {
    err(7, "ALL", ruleId, `${ids.length} current calculation contracts constrain this rule version: ${ids.join(", ")} — a rule has one contract or none`);
  }
}

// ── 8. sources: docs/ path, file exists, hash matches ───────────────────────
for (const s of sources) {
  if (s.kind === "chat") {
    if (!s.content?.trim()) err(8, "CP1", s.id, "kind=chat but content is empty");
    continue;
  }
  if (!s.path) {
    err(8, "CP1", s.id, `kind=${s.kind} but no path`);
    continue;
  }
  if (!s.path.startsWith("docs/")) {
    err(8, "CP1", s.id, `path "${s.path}" is not under docs/ — every source must live under docs/ (§4.6)`);
    continue;
  }
  const abs = join(ROOT, s.path);
  if (!existsSync(abs)) {
    err(8, "CP1", s.id, `file not found: ${s.path} — provenance chain is broken`);
    continue;
  }
  if (s.hash_at_import) {
    const actual = sha256(readFileSync(abs));
    const recorded = s.hash_at_import;
    const truncated = recorded.length < actual.length;
    const same = truncated ? actual.startsWith(recorded.replace(/\.+$/, "")) : actual === recorded;
    if (!same) {
      warn(8, "CP1", s.id, `file changed since import (${s.path}) — provenance quotes may no longer match the file`);
    }
  }
}

// ── 9. rollup equals recomputed ─────────────────────────────────────────────
// The counting lives in rollup.mjs so the commands that WRITE spec.json and the gate that CHECKS
// it agree by construction. Do not recount inline here — a checker holding its own second copy of
// a derived number ends up policing its own bug. This also covers ready_for_next_step, which the
// schema has always required but no check ever verified.
const computed = computeRollup(spec);

const rollup = spec.rollup ?? {};
for (const [k, v] of Object.entries(computed)) {
  if (rollup[k] === undefined) {
    err(9, "ALL", "rollup", `missing "${k}" (computed: ${v})`);
  } else if (rollup[k] !== v) {
    err(9, "ALL", "rollup", `"${k}" says ${rollup[k]} but file computes ${v}`);
  }
}

// ── 10. generated docs exist and are in sync ────────────────────────────────
for (const req of requirements) {
  const docPath = `docs/requirements/${req.id}.md`;
  const abs = join(ROOT, docPath);
  if (!existsSync(abs)) {
    err(10, "CP1", req.id, `generated doc missing: ${docPath} — run /req:capture to regenerate`);
    continue;
  }
  const body = readFileSync(abs, "utf8");
  const m = body.match(SPEC_HASH_RE);
  if (!m) {
    err(10, "CP1", req.id, `${docPath} has no spec-hash marker — cannot verify it is in sync`);
    continue;
  }
  const expected = reqDocHash(spec, req);
  if (m[1] !== expected) {
    err(10, "CP1", req.id, `${docPath} is stale (doc ${m[1].slice(0, 15)}... vs spec ${expected.slice(0, 15)}...) — regenerate`);
  }
}

// ── 11. ubiquitous language (WARN level — see bootstrap §5.4) ───────────────
// Deliberately a warning, not an error: blocking CP1 on unconfirmed vocabulary would stall every
// rule referencing a term, and there is no evidence yet that it pays. Promote after real use.
for (const req of requirements) {
  for (const c of req.domain_concepts ?? []) {
    if (!ulMap.has(c)) warn(11, "CP1", req.id, `domain_concepts -> ${c} is not defined in glossary[]`);
  }
}
for (const t of glossary) {
  if (!t.definition?.trim()) warn(11, "CP1", t.id, `term "${t.term_th}" has no definition — an undefined term produces ambiguous rules`);
  for (const other of t.not_to_confuse_with ?? []) {
    if (!ulMap.has(other)) warn(11, "CP1", t.id, `not_to_confuse_with -> ${other} does not resolve`);
  }
}
const termsUsed = new Set(requirements.flatMap((r) => r.domain_concepts ?? []));
for (const t of glossary) {
  if (!termsUsed.has(t.id)) warn(11, "CP1", t.id, `term "${t.term_th}" is defined but no requirement references it`);
}

// ── 12. wiki bundle complete and in sync ────────────────────────────────────
// Seven sub-checks, lettered as in design §6.1 so a line of output maps back to the spec:
//   ก frontmatter+type · ข type in the closed list · ค id shape · ง hash · จ links   (shared module)
//   ฉ every node has a page · ช no orphan page                                        (project only)
// (ก)–(จ) come from doc-frontmatter.mjs together with their levels — verify-design.mjs will import
// the same five, and a rule that answers differently in two gates is what makes people stop
// believing both. (ฉ)(ช) live here because they need spec.json as the divisor; the authoring gate
// has no equivalent until design-registry.json exists.
//
// GRANULARITY, decided before writing rather than after seeing the number: a bundle that is absent
// ENTIRELY is ONE error, not one per node. Per-node would make the count swing by dozens on a single
// missing directory, and EXPECTED.md's contract is that a number must be traceable back to a node.
const WIKI_ABS = join(ROOT, WIKI_DIR);
const wikiFiles = (dir, base) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) out.push(...wikiFiles(abs, base));
    else if (name.endsWith(".md")) out.push(abs.slice(base.length + 1).replace(/\\/g, "/"));
  }
  return out;
};

if (!existsSync(WIKI_ABS)) {
  err(12, "CP1", WIKI_DIR, "wiki bundle does not exist — the agent-readable render of spec.json is missing entirely (node scripts/wiki.mjs --write)");
} else {
  const expected = new Set();
  for (const n of enumerateNodes(spec)) {
    const rel = pagePath(n.type, n.id);
    expected.add(rel);
    const abs = join(WIKI_ABS, rel);
    if (!existsSync(abs)) {
      err(12, "CP1", n.id, `ฉ: no page for this node — ${WIKI_DIR}/${rel} is missing`);
      continue;
    }
    const text = readFileSync(abs, "utf8");
    for (const f of checkPage({
      text,
      relPath: `${WIKI_DIR}/${rel}`,
      scope: "project",
      expectedHash: nodeDocHash(spec, n.node),
      linkExists: (t) => existsSync(resolve(dirname(abs), t)),
    })) {
      const letter = { frontmatter: "ก", type: "ข", id: "ค", hash: "ง", link: "จ" }[f.rule];
      add(12, "CP1", f.level, f.id, `${letter}: ${f.message}`);
    }
  }

  for (const rel of wikiFiles(WIKI_ABS, WIKI_ABS)) {
    const abs = join(WIKI_ABS, rel);
    if (isScaffold(rel)) {
      // index.md / log.md / BUNDLE.md are the bundle's bones, not concept pages (DOC-STANDARD §6):
      // no type, no id, no hash — so only the link rule can apply to them. It still must: an index
      // pointing at a page that was renamed is exactly the rot this bundle exists to prevent.
      for (const { target, line } of extractLinks(readFileSync(abs, "utf8"))) {
        if (!existsSync(resolve(dirname(abs), target))) {
          add(12, "CP1", SHARED_LEVEL.link, `${WIKI_DIR}/${rel}`, `จ: line ${line}: link -> ${target} reaches no file`);
        }
      }
      continue;
    }
    if (!expected.has(rel)) {
      warn(12, "CP1", `${WIKI_DIR}/${rel}`, "ช: orphan page — no node in spec.json produces this file (a deleted or renamed id leaves the old page behind, green forever)");
    }
  }
}

// ── 13. calculation rules need a HUMAN-VERIFIED answer key ──────────────────
// Warn, not error, on purpose (design §6): the very first calculation rule captured would block CP1
// before anyone has had a chance to run /req:golden, and a gate that is red from birth teaches people
// to ignore it. Promote to error once the command has been used in anger.
//
// Reads golden_datasets[] directly rather than through a rollup counter. rollup is
// additionalProperties:false and check #9 compares every key exactly, so a new counter means editing
// schema + rollup.mjs + both fixtures in one change — deferred until #13 is promoted (design §9).
const verifiedGoldenFor = (id) =>
  goldens.filter((gd) => (gd.proves ?? []).includes(id) && gd.verified_by && gd.verified_at);
const anyGoldenFor = (id) => goldens.filter((gd) => (gd.proves ?? []).includes(id));

for (const rv of currentRules) {
  if (rv.kind !== "calculation") continue;
  // an answer key may be attached to the rule version or to the contract that pins its arithmetic
  const ids = [rv.id, ...(rv.constrained_by ? [rv.constrained_by] : [])];
  const verified = ids.flatMap(verifiedGoldenFor);
  if (verified.length) continue;
  const unverified = ids.flatMap(anyGoldenFor);
  if (unverified.length) {
    warn(13, "CP1", rv.id, `golden dataset ${unverified.map((g) => g.id).join(", ")} exists but nobody signed it — numbers from a script are a proposal until verified_by/verified_at are filled in`);
  } else {
    warn(13, "CP1", rv.id, `kind=calculation with no golden dataset — the formula is agreed but nobody has run the numbers (/req:golden ${rv.id})`);
  }
}

// ── 14. change-set integrity ────────────────────────────────────────────────
// Warn, not error (design §7.6): a spec written before /req:change existed has superseded nodes with
// no CHG, and turning that into a blocker would make every existing file red for history it cannot
// retroactively acquire. What it buys is the question change_reason cannot answer — "what did the
// 13 Aug round change, who asked, and which document caused it".
const affected = new Set(changes.flatMap((c) => c.affects ?? []));
for (const node of [...rules, ...calculations]) {
  if (node.status !== "superseded") continue;
  // the CHG records the NEW version, so look for the successor rather than this node
  const successor = node.superseded_by;
  if (successor && !affected.has(successor)) {
    warn(14, "CP1", node.id, `superseded by ${successor} but no change set records it — "why did this change and who asked" is unanswerable (/req:change writes CHG-xxx)`);
  }
}
for (const chg of changes) {
  if (!chg.approved_by) {
    warn(14, "CP1", chg.id, "no approved_by — a change nobody signed off is a change nobody owns");
  }
  for (const gdId of chg.invalidates ?? []) {
    const replaced = goldens.some(
      (g) => g.id !== gdId && g.verified_by && g.verified_at && (g.proves ?? []).some((p) => (chg.affects ?? []).includes(p))
    );
    if (!replaced) {
      warn(14, "CP1", chg.id, `invalidates ${gdId} and no verified replacement exists for ${(chg.affects ?? []).join(", ")} — the numbers are stale (/req:golden)`);
    }
  }
}

// ── report ──────────────────────────────────────────────────────────────────
const inGate = (f) => GATE === "ALL" || f.gate === "ALL" || f.gate === GATE;
const relevant = findings.filter(inGate);
const errors = relevant.filter((f) => f.level === "error");
const warnings = relevant.filter((f) => f.level === "warn");

if (AS_JSON) {
  console.log(JSON.stringify({ spec: SPEC_PATH, gate: GATE, computed, errors, warnings }, null, 2));
  process.exit(errors.length ? 1 : 0);
}

const CHECK_NAMES = {
  1: "REQ actor+goal", 2: "rule has example", 3: "red cards", 4: "references resolve",
  5: "spillover queue", 6: "status consistency", 7: "@v discipline", 8: "sources on disk",
  9: "rollup accuracy", 10: "generated docs", 11: "ubiquitous language",
  12: "wiki bundle", 13: "golden dataset verified", 14: "change-set integrity",
};

console.log(`verify-rules — ${SPEC_PATH}`);
console.log(`gate: ${GATE} · module: ${spec.meta?.module ?? "?"} · schema ${spec.meta?.schema_version ?? "?"}`);
console.log(
  `rules(current) ${computed.rules_total} · with example ${computed.rules_with_example} · ` +
  `coverage ${(computed.rule_coverage * 100).toFixed(0)}% · red cards ${computed.open_questions} · spillover ${computed.open_deferred}`
);
console.log("");

if (!errors.length && !warnings.length) {
  console.log(`PASS — no violations for ${GATE}`);
  process.exit(0);
}

const groupBy = (list) => {
  const g = new Map();
  for (const f of list) {
    if (!g.has(f.check)) g.set(f.check, []);
    g.get(f.check).push(f);
  }
  return [...g.entries()].sort((a, b) => a[0] - b[0]);
};

for (const [check, list] of groupBy(errors)) {
  console.log(`FAIL  #${check} ${CHECK_NAMES[check]}  [${list[0].gate}]`);
  for (const f of list) console.log(`        ${f.id}: ${f.message}`);
}
for (const [check, list] of groupBy(warnings)) {
  console.log(`WARN  #${check} ${CHECK_NAMES[check]}`);
  for (const f of list) console.log(`        ${f.id}: ${f.message}`);
}

console.log("");
console.log(`${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
