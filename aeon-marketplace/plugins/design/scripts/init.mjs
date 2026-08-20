#!/usr/bin/env node
/**
 * init.mjs — the deterministic half of /design:init.
 *
 * Spec §7.1: bootstrap, validate req inputs. DoD = "inputs complete; state file created".
 * Spec P4/PNFR-6: the exit condition is this script's exit code, never a model saying "done".
 *
 * WRITES NOTHING WITHOUT --write. Dry run is the default and prints exactly what would change,
 * matching scripts/wiki-authoring.mjs. A command that mutates the project on a bare invocation
 * cannot be safely explored, and CLAUDE.md §6 requires every command to stop for approval.
 *
 * IDEMPOTENT (spec P5). Re-running never duplicates a step and never resets progress: statuses,
 * attempts and artifacts already recorded are preserved; only genuinely absent steps are added.
 * This matters because the agent loop retries, and a retry that silently reset `done` to
 * `pending` would send the whole phase around again.
 *
 * Exit codes — a caller must be able to tell "cannot run" from "ran and found problems":
 *   0  state file is present and correct (written, or already matching)
 *   1  ran, but something needs a human (currently: nothing — reserved)
 *   2  cannot run: req's mandatory output is missing or malformed (spec §3.1 hard rule)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, designDirPath, statePath, resolveStateDir } from "./state-dir.mjs";
import { readReqContract } from "./req-contract.mjs";
import { STEPS } from "./steps.mjs";

export const STATE_SCHEMA_VERSION = "1.0";

// The step graph lives in steps.mjs and is NOT re-exported from here: this module runs main() on
// load, so anything importing the catalogue through init.mjs would execute the command as a side
// effect. Import { STEPS } from "./steps.mjs" instead.

/** Subdirectories spec §5.1 puts under the design state directory. */
export const SUBDIRS = ["modules"];

/** Build the state object, preserving anything already recorded. */
export function buildState({ existing, module, now }) {
  const prior = new Map((existing?.steps ?? []).map((s) => [s.id, s]));
  const steps = STEPS.map((def) => {
    const was = prior.get(def.id);
    return {
      id: def.id,
      command: def.command,
      kind: def.kind,
      status: was?.status ?? "pending",
      requires: def.requires,
      artifacts: was?.artifacts ?? [],
      attempts: was?.attempts ?? 0,
      ...(was?.updatedAt ? { updatedAt: was.updatedAt } : {}),
    };
  });
  // init itself is done the moment this script succeeds — it is the step that runs now.
  const initStep = steps.find((s) => s.id === "init");
  initStep.status = "done";
  initStep.attempts = (prior.get("init")?.attempts ?? 0) + 1;
  initStep.artifacts = ["design.state.json"];
  initStep.updatedAt = now;

  // Questions raised by absent upstream data. Kept keyed by id so a rerun updates, never appends.
  const priorQ = new Map((existing?.openQuestions ?? []).map((q) => [q.id, q]));
  const openQuestions = [...priorQ.values()].filter((q) => q.id !== "Q-STAKEHOLDERS");
  openQuestions.unshift({
    id: "Q-STAKEHOLDERS",
    text: "req records no stakeholders, but §13.3 A4 and V23 require every RBAC role to originate from one. Decide the source before /design:rbac.",
    blocks: ["rbac"],
    raisedBy: "/design:init",
    ...(priorQ.get("Q-STAKEHOLDERS")?.raisedAt ? { raisedAt: priorQ.get("Q-STAKEHOLDERS").raisedAt } : { raisedAt: now }),
  });

  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    project: module ?? existing?.project ?? null,
    phase: "design",
    steps,
    openQuestions,
  };
}

function main() {
  const { values, flags } = parseArgs(process.argv.slice(2));
  const root = values["--root"] ?? ".";
  const write = flags.has("--write");

  const contract = readReqContract({ root, values });

  console.log(`req spec      : ${contract.specPath}`);
  if (!contract.exists || contract.malformed.length || contract.missing.length) {
    console.error("");
    console.error("HALT — req's mandatory output is missing or malformed. Nothing was written.");
    console.error("Spec §3.1: the plugin MUST NOT infer the missing content and proceed.");
    for (const m of contract.missing) console.error(`  MISSING    ${m.what}\n             at ${m.path}\n             fix: ${m.fix}`);
    for (const m of contract.malformed) console.error(`  MALFORMED  ${m.what}\n             at ${m.path}\n             ${m.detail}`);
    process.exit(2);
  }

  console.log(`req schema    : ${contract.schemaVersion}${contract.schemaSupported ? "" : "  ** UNTESTED — this plugin has only been run against " + "0.3.0" + " **"}`);
  console.log(`module        : ${contract.module}`);
  for (const [k, v] of Object.entries(contract.sections)) console.log(`  ${k.padEnd(12)}: ${v.count}`);
  for (const n of contract.noSource) {
    console.log(`  ${n.key.padEnd(12)}: NO SOURCE IN req — ${n.why}${n.blocks ? `  (blocks: ${n.blocks})` : ""}`);
  }

  const dir = designDirPath({ root, values });
  const file = statePath({ root, values });
  const existing = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
  const next = buildState({ existing, module: contract.module, now: new Date().toISOString() });

  // Compare ignoring the timestamp we just stamped, so an unchanged rerun reports "already matches".
  const strip = (s) => JSON.stringify({ ...s, steps: s.steps.map(({ updatedAt, ...r }) => r), openQuestions: s.openQuestions.map(({ raisedAt, ...r }) => r) });
  const unchanged = existing && strip(existing) === strip(next);

  console.log("");
  console.log(`state dir     : ${resolveStateDir({ values })}/design`);
  console.log(`state file    : ${file}`);
  console.log(`steps         : ${next.steps.length}  (done ${next.steps.filter((s) => s.status === "done").length})`);
  console.log(`openQuestions : ${next.openQuestions.length}`);

  if (!write) {
    console.log("");
    console.log(unchanged ? "DRY RUN — state already matches; --write would change nothing." : "DRY RUN — nothing written. Re-run with --write to create the state file.");
    process.exit(0);
  }

  mkdirSync(dir, { recursive: true });
  for (const sub of SUBDIRS) mkdirSync(join(dir, sub), { recursive: true });
  writeFileSync(file, JSON.stringify(next, null, 2) + "\n");
  console.log("");
  console.log(unchanged ? "WROTE (unchanged content, timestamp refreshed)" : "WROTE");
  process.exit(0);
}

main();
