#!/usr/bin/env node
/**
 * doc-hash.mjs — the ONE definition of a generated document's spec-hash.
 *
 * `verify-rules.mjs` check #10 imports this, and every command that regenerates
 * docs/requirements/REQ-xxx.md must call it too. Do not reimplement the algorithm inline:
 * a different key order, sort comparator, or stringify spacing yields a different hash, which
 * would make every generated document stale from birth and check #10 fail forever.
 *
 * Usage as CLI:  node doc-hash.mjs [--root <dir>] [--state-dir <name>] [--spec <path>] [REQ-id]
 *                prints "<REQ-id> <sha256:...>" per requirement
 *                state dir resolved by state-dir.mjs (--state-dir > $AEON_STATE_DIR > .aeon)
 *
 * The CLI branch below is the ONLY part that knows about paths. The exported reqDocHash / sha256 /
 * SPEC_HASH_RE take a parsed spec and stay pure — check #10 of verify-rules.mjs imports them, so a
 * change in there moves the gate's numbers.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
// single source of truth for where spec.json lives, and for argv parsing
import { parseArgs, resolveSpecPath, orExit2 } from "./state-dir.mjs";

export const sha256 = (buf) => "sha256:" + createHash("sha256").update(buf).digest("hex");

const byId = (a, b) => a.id.localeCompare(b.id);

/**
 * Hash covers the requirement, the glossary terms it references, its rules, and the examples
 * proving those rules — everything the generated document renders.
 * Key order is significant and matches the document layout:
 *   requirement -> glossary -> rules -> examples
 */
export function reqDocHash(spec, req) {
  const glossary = (spec.glossary ?? [])
    .filter((t) => (req.domain_concepts ?? []).includes(t.id))
    .sort(byId);
  const rules = (spec.rules ?? []).filter((rv) => rv.belongs_to === req.id).sort(byId);
  const examples = (spec.examples ?? [])
    .filter((ex) => (ex.proves ?? []).some((p) => rules.some((rv) => rv.id === p)))
    .sort(byId);
  return sha256(Buffer.from(JSON.stringify({ requirement: req, glossary, rules, examples }), "utf8"));
}

/** Marker written into the generated document header and read back by check #10. */
export const SPEC_HASH_RE = /spec-hash:\s*(sha256:[0-9a-f]{64})/;

// ── per-node hashes for the wiki bundle (round 5) ───────────────────────────
/**
 * reqDocHash is per-REQUIREMENT because docs/requirements/REQ-xxx.md is one file per requirement.
 * The wiki bundle is one file per NODE, so a REQ-level hash cannot answer "is BR-job-011@v2.md
 * stale on its own". Hence a second export here rather than a second hash algorithm elsewhere.
 *
 * SCOPE RULE — the thing that makes this correct or silently useless (design §6.1):
 * the closure must cover everything the page renders, never less. A hash of the bare node stays
 * green while the page goes wrong, e.g. a rule page quotes a source that later gets marked
 * `corrected` — page wrong, rule node untouched.
 *
 * Applied consistently as: a page that renders another node's CONTENT hashes that whole node;
 * a page that only renders a LINK to it hashes just the id. Over-covering costs a needless
 * regeneration; under-covering costs a lie, so ties go to over-covering.
 *
 * ANTI-RECURSION (design §6.1): closures include the DATA of related nodes, never their HASH.
 * A rule page shows its change sets and a change-set page shows its rules; going through hashes
 * would not terminate.
 */
const PREFIX_TYPES = [
  ["REQ-", "Requirement"],
  ["BR-", "Business Rule"],
  ["CALC-", "Calculation Contract"],
  ["EX-", "Example"],
  ["GD-", "Golden Dataset"],
  ["CHG-", "Change Set"],
  ["UL-", "Glossary Term"],
  ["DQ-", "Deferred Question"], // before Q- : DQ ids would otherwise never be reached
  ["Q-", "Open Question"],
  ["NFR-", "NFR"],
  ["SRC-", "Source"],
];

/** Type name for an id, or null. Prefix order matters — see DQ above. */
export function nodeTypeOf(id) {
  for (const [p, t] of PREFIX_TYPES) if (typeof id === "string" && id.startsWith(p)) return t;
  return null;
}

/**
 * Every node the wiki bundle must have a page for, in a stable order.
 * NFR is NESTED under requirements[].nfr[] — it has no top-level array, and check #12 (ฉ) would
 * silently never ask for its page if this walked spec keys generically.
 */
export function enumerateNodes(spec) {
  const out = [];
  const push = (type, list) => {
    for (const node of list ?? []) out.push({ type, id: node.id, node });
  };
  push("Requirement", spec.requirements);
  push("Business Rule", spec.rules);
  push("Calculation Contract", spec.calculations);
  push("Example", spec.examples);
  push("Golden Dataset", spec.golden_datasets);
  push("Change Set", spec.changes);
  push("Glossary Term", spec.glossary);
  push("Open Question", spec.questions);
  push("Deferred Question", spec.deferred_questions);
  for (const r of spec.requirements ?? []) push("NFR", r.nfr);
  push("Source", spec.sources);
  return out;
}

/** Change sets that name any of these ids — the "## ประวัติ" table on a versioned page. */
const changesTouching = (spec, idSet) =>
  (spec.changes ?? [])
    .filter((c) => [...(c.affects ?? []), ...(c.invalidates ?? [])].some((x) => idSet.has(x)))
    .sort(byId);

/** Sources cited by a node, reduced to what a page actually shows about the source itself. */
const citedSources = (spec, node) =>
  (node.provenance ?? [])
    .map((p) => (spec.sources ?? []).find((s) => s.id === p.source))
    .filter(Boolean)
    .map((s) => ({ id: s.id, interpretation: s.interpretation ?? null }))
    .sort(byId);

/**
 * @param {object} spec  parsed spec.json
 * @param {object} node  the node itself (not an id) — nfr nodes are nested, so ids are not enough
 * @returns {string} sha256:...
 */
export function nodeDocHash(spec, node) {
  const type = nodeTypeOf(node?.id);
  const rules = spec.rules ?? [];
  const calcs = spec.calculations ?? [];
  const examples = spec.examples ?? [];
  const goldens = spec.golden_datasets ?? [];
  const H = (o) => sha256(Buffer.from(JSON.stringify(o), "utf8"));

  switch (type) {
    // design §6.1: "same as reqDocHash — call it again". Not re-derived: if the two ever disagreed,
    // check #10 and check #12 would give different answers about the same requirement.
    case "Requirement":
      return reqDocHash(spec, node);

    case "Business Rule": {
      const siblings = rules.filter((r) => r.base_id === node.base_id).sort(byId);
      const sibIds = new Set(siblings.map((r) => r.id));
      return H({
        node,
        versions: siblings,
        calculations: calcs.filter((c) => c.constrains === node.id).sort(byId),
        examples: examples.filter((e) => (e.proves ?? []).includes(node.id)).sort(byId),
        golden: goldens.filter((g) => (g.proves ?? []).includes(node.id)).sort(byId),
        sources: citedSources(spec, node),
        changes: changesTouching(spec, sibIds),
      });
    }

    case "Calculation Contract": {
      const siblings = calcs.filter((c) => c.base_id === node.base_id).sort(byId);
      const sibIds = new Set(siblings.map((c) => c.id));
      return H({
        node,
        versions: siblings,
        rules: rules.filter((r) => r.id === node.constrains).sort(byId),
        golden: goldens.filter((g) => (g.proves ?? []).includes(node.id)).sort(byId),
        sources: citedSources(spec, node),
        changes: changesTouching(spec, sibIds),
      });
    }

    case "Example":
      return H({
        node,
        rules: rules.filter((r) => (node.proves ?? []).includes(r.id)).sort(byId),
      });

    case "Golden Dataset":
      return H({
        node,
        proves: [...rules, ...calcs].filter((n) => (node.proves ?? []).includes(n.id)).sort(byId),
        source: (spec.sources ?? []).find((s) => s.id === node.source) ?? null,
      });

    case "Change Set":
      return H({
        node,
        affects: [...rules, ...calcs].filter((n) => (node.affects ?? []).includes(n.id)).sort(byId),
        invalidates: goldens.filter((g) => (node.invalidates ?? []).includes(g.id)).sort(byId),
      });

    // ── link-only pages: the page lists ids, so the closure carries ids ──────
    case "Glossary Term":
      return H({
        node,
        used_by: (spec.requirements ?? []).filter((r) => (r.domain_concepts ?? []).includes(node.id)).map((r) => r.id).sort(),
      });

    case "Open Question":
    case "Deferred Question":
      return H({
        node,
        raised_on: [...rules, ...calcs]
          .filter((n) => [...(n.questions ?? []), ...(n.deferred_questions ?? [])].includes(node.id))
          .map((n) => n.id)
          .sort(),
      });

    case "NFR": {
      const parent = (spec.requirements ?? []).find((r) => (r.nfr ?? []).some((n) => n.id === node.id));
      return H({ node, requirement: parent?.id ?? null });
    }

    case "Source": {
      const citers = [...(spec.requirements ?? []), ...rules, ...calcs]
        .filter((n) => (n.provenance ?? []).some((p) => p.source === node.id))
        .map((n) => n.id);
      const gd = goldens.filter((g) => g.source === node.id).map((g) => g.id);
      const chg = (spec.changes ?? []).filter((c) => (c.triggered_by ?? []).includes(node.id)).map((c) => c.id);
      return H({ node, cited_by: [...citers, ...gd, ...chg].sort() });
    }

    default:
      throw new Error(`nodeDocHash: no closure defined for id "${node?.id}" — add the type or fix the id`);
  }
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("doc-hash.mjs")) {
  const { values, positional } = orExit2(() => parseArgs(process.argv.slice(2)));
  const ROOT = resolve(values["--root"] ?? ".");
  const { specPath } = orExit2(() => resolveSpecPath({ root: ROOT, values }));
  let spec;
  try {
    spec = JSON.parse(readFileSync(specPath, "utf8"));
  } catch (e) {
    console.error(`PARSE-ERROR ${specPath}: ${e.message}`);
    process.exit(2);
  }
  const only = positional[0];
  if (values["--nodes"] !== undefined || process.argv.includes("--nodes")) {
    const nodes = enumerateNodes(spec).filter((n) => !only || n.id === only);
    if (nodes.length === 0) {
      console.error(only ? `no node ${only}` : "no nodes in spec");
      process.exit(2);
    }
    for (const n of nodes) console.log(`${n.id.padEnd(18)} ${nodeDocHash(spec, n.node)}  (${n.type})`);
    process.exit(0);
  }
  const reqs = (spec.requirements ?? []).filter((r) => !only || r.id === only);
  if (reqs.length === 0) {
    console.error(only ? `no requirement ${only}` : "no requirements in spec");
    process.exit(2);
  }
  for (const r of reqs) console.log(`${r.id} ${reqDocHash(spec, r)}`);
}
