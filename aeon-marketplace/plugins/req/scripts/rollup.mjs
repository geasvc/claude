#!/usr/bin/env node
/**
 * rollup.mjs — the ONE definition of spec.json's rollup{} block.
 *
 * Exists for the same reason as doc-hash.mjs: a derived number the model recomputes by hand is a
 * number the model must hold the WHOLE FILE in context to produce. Field-test round 1 (durian:
 * 30 rules, 107 KB spec.json) burned ~449k tokens on Phase 1 alone, because every one of ~35
 * command invocations re-read and rewrote the entire file just to recount `rollup`. Counting is
 * not judgment — it belongs in a script. Every command that writes spec.json calls this instead.
 *
 * `verify-rules.mjs` check #9 imports computeRollup() rather than reimplementing it: two copies
 * of a derived number drift, and a rollup nobody believes is worse than no rollup at all.
 *
 * Usage:  node rollup.mjs [--root <project-root>] [--state-dir <name>] [--spec <path>] [--write]
 *         root = CWD · state dir resolved by state-dir.mjs (--state-dir > $AEON_STATE_DIR > .aeon)
 *         READ-ONLY by default — prints the correct block so /req:check stays a 👁 command.
 *         Pass --write to correct the file in place.
 * Exit:   0 = already correct, or written | 1 = drift found (read-only) | 2 = file/parse error
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
// single source of truth for where spec.json lives, and for argv parsing
import { parseArgs, resolveSpecPath, orExit2 } from "./state-dir.mjs";

/**
 * Derived counts, recomputed from the file. Three rules that are easy to half-remember wrong:
 *   - rules_* count is_current versions ONLY. Counting every version drops coverage every time a
 *     rule changes, and people stop believing the number (bootstrap §5).
 *   - open_deferred is reported but never gates CP1 — DQ needs entities to answer, so it blocks
 *     CP2 instead.
 *   - ready_for_next_step is the CP1 condition, which is exactly: rules exist, every current rule
 *     has an example, no open red card. Spillover (DQ) does not hold CP1 back.
 */
export function computeRollup(spec) {
  const current = (spec.rules ?? []).filter((r) => r.is_current === true);
  const rules_total = current.length;
  const rules_with_example = current.filter((r) => (r.examples ?? []).length > 0).length;
  // green-ness is proven at CP5 by verify; here it means "has any test case attached"
  const rules_with_green_test = current.filter((r) => (r.traces_down?.test_cases ?? []).length > 0).length;
  const open_questions = (spec.questions ?? []).filter((q) => q.state === "open").length;
  const open_deferred = (spec.deferred_questions ?? []).filter((d) => d.state === "open").length;
  return {
    rules_total,
    rules_with_example,
    rules_with_green_test,
    open_questions,
    open_deferred,
    rule_coverage: rules_total === 0 ? 0 : +(rules_with_example / rules_total).toFixed(4),
    ready_for_next_step: rules_total > 0 && rules_with_example === rules_total && open_questions === 0,
  };
}

/** Fields whose stored value disagrees with the recomputed one. */
export function rollupDrift(spec) {
  const want = computeRollup(spec);
  const have = spec.rollup ?? {};
  return Object.entries(want)
    .filter(([k, v]) => have[k] !== v)
    .map(([k, v]) => ({ key: k, stored: have[k], computed: v }));
}

// Rollup holds only numbers and booleans, so [^{}]* cannot swallow a nested object, and anchoring
// on a line start keeps a stray "rollup" inside a quote string from matching.
const ROLLUP_BLOCK_RE = /\n([ \t]*)"rollup"[ \t]*:[ \t]*\{[^{}]*\}/;

/**
 * Replace ONLY the rollup block in the raw text. Deliberately surgical rather than
 * JSON.stringify(spec): the spec files keep blank lines between top-level sections and inline
 * short arrays, and re-stringifying would reflow the whole file into an unreviewable diff.
 * Returns the new text, or null if no rollup block is present.
 */
export function renderWithRollup(raw, rollup) {
  if (!ROLLUP_BLOCK_RE.test(raw)) return null;
  return raw.replace(ROLLUP_BLOCK_RE, (_m, indent) => {
    const body = Object.entries(rollup)
      .map(([k, v]) => `${indent}  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
      .join(",\n");
    return `\n${indent}"rollup": {\n${body}\n${indent}}`;
  });
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1]?.endsWith("rollup.mjs")) {
  const { values, flags, positional } = orExit2(() => parseArgs(process.argv.slice(2)));
  if (positional.length) {
    console.error(`CONFIG-ERROR unexpected argument "${positional[0]}" — pass a file as --spec <path>`);
    process.exit(2);
  }
  const ROOT = resolve(values["--root"] ?? ".");
  const { specPath: SPEC_PATH } = orExit2(() => resolveSpecPath({ root: ROOT, values }));
  const WRITE = flags.has("--write");

  let raw, spec;
  try {
    raw = readFileSync(SPEC_PATH, "utf8");
    spec = JSON.parse(raw);
  } catch (e) {
    console.error(`PARSE-ERROR ${SPEC_PATH}: ${e.message}`);
    process.exit(2);
  }

  const rollup = computeRollup(spec);
  const drift = rollupDrift(spec);
  console.log(JSON.stringify(rollup, null, 2));

  if (drift.length === 0) {
    console.log(`\nrollup is already correct — ${SPEC_PATH}`);
    process.exit(0);
  }

  // Never correct silently: drift means a command skipped this script or someone hand-edited the
  // file, and that is worth seeing (the owner's standing pattern is fail-loudly over swallow).
  console.log("");
  for (const d of drift) console.log(`DRIFT  ${d.key}: file says ${JSON.stringify(d.stored)} · computed ${JSON.stringify(d.computed)}`);

  if (!WRITE) {
    console.log(`\n${drift.length} field(s) out of date — rerun with --write to correct`);
    process.exit(1);
  }

  const next = renderWithRollup(raw, rollup);
  if (next === null) {
    console.error(`\nno "rollup" block found in ${SPEC_PATH} — add one, then rerun`);
    process.exit(2);
  }
  // Safety net: nothing but rollup may change. Compare the reparsed result against the original
  // with only rollup swapped in — assigning to an existing key keeps its position, so key order
  // is part of what this compares.
  const expected = JSON.parse(raw);
  expected.rollup = rollup;
  let after;
  try {
    after = JSON.parse(next);
  } catch (e) {
    console.error(`\nrefusing to write — result is not valid JSON: ${e.message}`);
    process.exit(2);
  }
  if (JSON.stringify(after) !== JSON.stringify(expected)) {
    console.error("\nrefusing to write — the edit would have changed something other than rollup");
    process.exit(2);
  }

  writeFileSync(SPEC_PATH, next, "utf8");
  console.log(`\nwrote ${drift.length} corrected field(s) to ${SPEC_PATH}`);
  process.exit(0);
}
