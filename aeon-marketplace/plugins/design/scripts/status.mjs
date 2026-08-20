#!/usr/bin/env node
/**
 * status.mjs — the loop exit condition for Phase 2. READ-ONLY: writes nothing, ever.
 *
 * Spec §8.2 is unusually specific about this one, because it is the thing an agent loop asks
 * "am I finished?" and a model answering that question about its own work is the failure the whole
 * design is built to avoid:
 *
 *   - MUST be deterministic; MUST NOT rely on LLM self-assessment
 *   - exit 0 = all steps complete and validation passes · 1 = work remains · 2 = blocked
 *   - output MUST ALWAYS name the next command to run
 *   - loop guard: attempts above 3 on one step means blocked, and a human is needed
 *
 * Two further rules make 0 harder to reach than "all steps say done", and both exist because a
 * green light that is not true is worse than a red one:
 *   §9.2 rule 6  — MUST NOT return 0 while any artifact is stale
 *   §19.3        — MUST NOT return 0 while any open question has a non-empty blocks[]
 *
 * WHY "blocked" IS NOT SIMPLY "SOMETHING IS BLOCKED"
 *
 * Exit 2 means the loop cannot make progress without a human. If one far-off step is waiting on an
 * answer but three other steps are ready to run, the honest code is 1 — there is work to do. 2 is
 * reserved for the case where NOTHING is runnable. Reporting 2 while work remains teaches everyone
 * to ignore 2.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, statePath, stateDirPath, designDirPath } from "./state-dir.mjs";

export const MAX_ATTEMPTS = 3;
export const TERMINAL = new Set(["done"]);

/** Artifacts a step is expected to have produced, used to detect a `done` step whose file vanished. */
export function computePlan(state) {
  const steps = state.steps ?? [];
  const byId = new Map(steps.map((s) => [s.id, s]));
  const questions = (state.openQuestions ?? []).filter((q) => !q.resolved);
  const blockedByQuestion = new Map();
  for (const q of questions) {
    for (const stepId of q.blocks ?? []) {
      if (!blockedByQuestion.has(stepId)) blockedByQuestion.set(stepId, []);
      blockedByQuestion.get(stepId).push(q.id);
    }
  }

  const rows = steps.map((s) => {
    const missingReqs = (s.requires ?? []).filter((r) => byId.get(r)?.status !== "done");
    const qs = blockedByQuestion.get(s.id) ?? [];
    const overAttempts = (s.attempts ?? 0) > MAX_ATTEMPTS;
    let state_ = s.status;
    let why = null;
    if (s.status === "done") {
      // nothing
    } else if (overAttempts) {
      state_ = "blocked"; why = `attempts ${s.attempts} exceeds ${MAX_ATTEMPTS} — a human must look (§8.2 loop guard)`;
    } else if (qs.length) {
      state_ = "blocked"; why = `open question ${qs.join(", ")}`;
    } else if (s.status === "blocked") {
      why = (s.blocked_by ?? []).join(", ") || "marked blocked with no reason recorded";
    } else if (missingReqs.length) {
      state_ = "waiting"; why = `needs ${missingReqs.join(", ")}`;
    }
    return { ...s, effective: state_, why, missingReqs, questions: qs };
  });

  const stale = rows.filter((r) => r.status === "stale");
  const blockingQuestions = questions.filter((q) => (q.blocks ?? []).length > 0);
  // `stale` counts as runnable: §9.2 marks an artifact stale so its own command can regenerate it.
  // Treating it as un-runnable would report BLOCKED when the fix is simply to run that command again.
  const runnable = rows.filter((r) => ["pending", "in_progress", "stale"].includes(r.effective));
  const remaining = rows.filter((r) => !TERMINAL.has(r.status));

  return { rows, stale, questions, blockingQuestions, runnable, remaining };
}

export function decide(plan) {
  // Order matters: a stale artifact or an open blocking question must not be masked by "all done".
  if (plan.remaining.length === 0 && plan.stale.length === 0 && plan.blockingQuestions.length === 0) {
    return { code: 0, verdict: "COMPLETE" };
  }
  if (plan.runnable.length > 0) return { code: 1, verdict: "WORK REMAINS" };
  return { code: 2, verdict: "BLOCKED" };
}

/** Always produce a next action, even when the answer is "a person has to do something". */
export function nextAction(plan, decision) {
  if (decision.code === 0) return { command: null, text: "nothing — Phase 2 is complete" };
  if (plan.runnable.length) {
    const n = plan.runnable[0];
    return { command: n.command, text: n.command };
  }
  if (plan.blockingQuestions.length) {
    const q = plan.blockingQuestions[0];
    return { command: null, text: `answer ${q.id} (blocks ${(q.blocks ?? []).join(", ")}) — no command can proceed until a person decides: ${q.text}` };
  }
  const b = plan.rows.find((r) => r.effective === "blocked");
  if (b) return { command: null, text: `unblock ${b.id}: ${b.why}` };
  if (plan.stale.length) return { command: "/design:change", text: "/design:change — stale artifacts must be revised before status can return 0" };
  return { command: null, text: "no runnable step and no recorded reason — design.state.json is inconsistent" };
}

function main() {
  const { values } = parseArgs(process.argv.slice(2));
  const root = values["--root"] ?? ".";

  const sp = statePath({ root, values });
  if (!existsSync(sp)) {
    console.error("BLOCKED — /design:init has not run.");
    console.error("  expected " + sp);
    console.error("\nnext: /design:init");
    process.exit(2);
  }
  const state = JSON.parse(readFileSync(sp, "utf8"));
  const plan = computePlan(state);
  const decision = decide(plan);
  const next = nextAction(plan, decision);

  const done = plan.rows.filter((r) => r.status === "done").length;
  console.log("project   : " + (state.project ?? "(unnamed)") + "   phase: " + (state.phase ?? "?"));
  console.log("state     : " + sp);
  console.log("progress  : " + done + "/" + plan.rows.length + " steps done");

  // §8.2 step 2: navigate via the index, never by walking every file.
  const wikiIndex = join(stateDirPath({ root, values }), "wiki", "wiki-index.json");
  console.log("wiki index: " + (existsSync(wikiIndex) ? wikiIndex : "absent — no command creates it yet (§8.2 step 2 cannot be honoured)"));

  const show = (label, rows) => {
    if (!rows.length) return;
    console.log("\n" + label);
    for (const r of rows) console.log("  " + r.id.padEnd(12) + (r.command ?? "").padEnd(20) + (r.why ? "— " + r.why : ""));
  };
  show("DONE", plan.rows.filter((r) => r.status === "done"));
  show("READY", plan.runnable);
  show("WAITING", plan.rows.filter((r) => r.effective === "waiting"));
  show("BLOCKED", plan.rows.filter((r) => r.effective === "blocked"));
  show("STALE", plan.stale);

  if (plan.questions.length) {
    console.log("\nOPEN QUESTIONS");
    for (const q of plan.questions) {
      const blocks = (q.blocks ?? []).length ? "blocks " + q.blocks.join(", ") : "blocks nothing";
      console.log("  " + q.id + "  (" + blocks + ")");
      console.log("      " + q.text);
    }
    console.log("  note: nothing routes these back to `req` yet — D16 (the back-channel) is still open,");
    console.log("        so an answer has to be carried by a person, not by a command.");
  }

  console.log("\n" + decision.verdict + "  (exit " + decision.code + ")");
  console.log("next: " + next.text);
  if (decision.code !== 0) {
    const reasons = [];
    if (plan.stale.length) reasons.push(plan.stale.length + " stale artifact(s) — §9.2 rule 6 forbids exit 0");
    if (plan.blockingQuestions.length) reasons.push(plan.blockingQuestions.length + " blocking question(s) — §19.3 forbids exit 0");
    if (plan.remaining.length) reasons.push(plan.remaining.length + " step(s) not done");
    console.log("why not 0: " + reasons.join(" · "));
  }
  process.exit(decision.code);
}

main();
