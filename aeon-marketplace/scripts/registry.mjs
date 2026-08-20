#!/usr/bin/env node
/**
 * registry.mjs — the ONE definition of the authoring registry: how it is loaded, what makes it
 * valid, where each node's page lives, and what a page's hash covers.
 *
 * WHY IT IS ITS OWN MODULE
 *
 * Two consumers need the same three answers and must not disagree about them:
 *   · scripts/wiki-authoring.mjs — WRITES docs/wiki/** from the registry
 *   · scripts/verify-design.mjs  — CHECKS docs/wiki/** against the registry (D4 hash, D7 orphan)
 * DOC-STANDARD §9 already forced this shape once for the document rules (doc-frontmatter.mjs) with
 * the reason spelled out: "a rule that answers differently in two places is what makes people stop
 * believing the checker". A gate that recomputed the hash its own way would be policing its own
 * arithmetic, not the renderer's.
 *
 * No CLI, no side effects on import — both consumers import it mid-run.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "../plugins/req/scripts/doc-hash.mjs";
import { AUTHORING_TYPES } from "../plugins/req/scripts/doc-frontmatter.mjs";

/** Bundle-relative on purpose: the registry sits next to the bundle it describes. */
export const REGISTRY_FILE = "docs/design-registry.json";

export const registryPath = (root) => join(root, REGISTRY_FILE);
export const hasRegistry = (root) => existsSync(registryPath(root));

/** Throws with a message the caller can print verbatim; callers decide the exit code. */
export function loadRegistry(root) {
  const path = registryPath(root);
  try {
    return { registry: JSON.parse(readFileSync(path, "utf8")), path };
  } catch (e) {
    throw new Error(`PARSE-ERROR ${path}: ${e.message}`);
  }
}

/**
 * Everything that must hold before a single page is written. Returns a list of human-readable
 * problems — empty means valid. `resource` existence is checked against the same root the bundle
 * will be written into, which is what makes "the registry records what IS" enforceable rather than
 * aspirational.
 */
export function validateRegistry(registry, root) {
  const nodes = registry.nodes ?? [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const problems = [];
  for (const n of nodes) {
    const spec = AUTHORING_TYPES[n.type];
    if (!spec) {
      problems.push(`${n.id}: type "${n.type}" is not in DOC-STANDARD §5.1 — allowed: ${Object.keys(AUTHORING_TYPES).join(", ")}`);
      continue;
    }
    if (!spec.re.test(n.id)) problems.push(`${n.id}: id does not match the pattern for "${n.type}" (${spec.re.source})`);
    if (!n.title) problems.push(`${n.id}: no title`);
    if (!n.resource) problems.push(`${n.id}: no resource — a concept page must point at the real file it is about`);
    else if (!existsSync(join(root, n.resource))) {
      problems.push(`${n.id}: resource "${n.resource}" does not exist — the registry records what IS, never what is planned`);
    }
    for (const l of n.links ?? []) if (!byId.has(l)) problems.push(`${n.id}: links -> ${l}, which is not a node in the registry`);
  }
  const dupes = nodes.map((n) => n.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dupes.length) problems.push(`duplicate id(s): ${[...new Set(dupes)].join(", ")}`);
  return problems;
}

/** One node = one file = one concept, and the id IS the filename (design §5.5: path is identity). */
export const pathOfNode = (n) => `${AUTHORING_TYPES[n.type].dir}/${n.id}.md`;

/**
 * Hash closure. The page renders the node's own fields AND the title of every node it links to, so
 * the closure covers both — the same rule doc-hash.mjs applies to the project bundle: a page that
 * renders another node's CONTENT covers it, a page that renders only a LINK covers just the id.
 * Renaming a linked node therefore moves this page's hash, because the page's text really does change.
 */
export function nodeHash(node, byId) {
  const linked = (node.links ?? [])
    .map((id) => ({ id, title: byId.get(id)?.title }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return sha256(Buffer.from(JSON.stringify({ node, linked }), "utf8"));
}

/**
 * The single answer both consumers ask for: bundle-relative page path -> { node, hash }.
 * The renderer writes these paths; the gate looks pages up in it — D4 compares the hash it finds
 * on disk with the one here, and D7 calls any non-scaffold page missing from it an orphan.
 */
export function pageIndex(registry) {
  const nodes = registry.nodes ?? [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const index = new Map();
  for (const n of nodes) index.set(pathOfNode(n), { node: n, hash: nodeHash(n, byId) });
  return { index, byId, nodes };
}
