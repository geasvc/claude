#!/usr/bin/env node
/**
 * functions.mjs — the deterministic half of /design:function.
 *
 * Spec §7.1: functional requirements (§11 section 3).
 * DoD: "Every functional REQ mapped; every UC has main + alternate + exception flows".
 *
 * WHY `governedBy` POINTS AT req's BR AND NOT AT A DESIGN-OWNED RULE-###
 *
 * §6.1 assigns `RULE-###` to design. On a real project that identifier has nothing to name: `req`
 * already carries business rules as `BR-xxx@vN`, complete with statement, examples, test_design and
 * provenance, and `REQ.rules[]` already points at them. Minting RULE-### beside them would create
 * two competing sources of truth for one rule within a week — precisely what §5.4 W3 forbids
 * ("reference, do not copy") — and the two would drift the moment `/req:change` moved a rule to @v2,
 * because only one side has a versioning path.
 *
 * Owner decision 2026-08-20: reference `BR-xxx@vN` directly; retire RULE-### from §6.1. A rule
 * design discovers that `req` never captured does NOT get minted here either — §1.2 forbids this
 * plugin from eliciting requirements, so it goes back through the §19.3 back-channel.
 *
 * WHY THE TRACE FILE IS GENERATED, NEVER HAND-WRITTEN
 *
 * §7.2 rule 5 requires trace to be updated whenever an artifact is created. Asking a model to keep
 * an edge list in step with two JSON files by hand is asking for the edge list to be wrong. Every
 * edge here is DERIVED from functions.json and statemachines.json, so the graph cannot disagree
 * with the artifacts it describes. Written to `trace.design.json`, not `trace.json`: §6.2 splits the
 * graph by author so `qa` and `dev` can append their own edges without any regeneration eating them
 * (§19.2 leak L1). §5.1 still draws a single `trace.json`; §6.2 is the later decision and carries
 * the reasoning, so it wins.
 *
 * Exit codes:
 *   0  functions.json and statemachines.json satisfy the DoD (and were rendered, with --write)
 *   1  they exist but fail a check — findings listed per rule with the offending ids
 *   2  cannot run: prerequisite missing (overview not done, req output absent, files absent)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, designDirPath, statePath, docsDesignDir } from "./state-dir.mjs";
import { readReqContract } from "./req-contract.mjs";

export const FUNCTIONS_FILE = "functions.json";
export const STATEMACHINES_FILE = "statemachines.json";
export const TRACE_FILE = "trace.design.json";

export const CHECKS = {
  FU1: "every REQ maps to a FN, or is explicitly declared not-functional with a reason",
  FU2: "every FN traces to at least one REQ that exists in req output",
  FU3: "every FN is realized by at least one UC",
  FU4: "every UC has actor, preconditions, main flow, alternate flow and exception flow (V3)",
  FU5: "every governedBy reference resolves to a current BR in req output",
  FU6: "every STM declares states, transitions, and an initial state that exists",
  FU7: "no dead state: every non-final state has an outgoing transition (V4)",
  FU8: "ids are unique and well formed (FN-*, UC-*, STM-*)",
};
const WARN_ONLY = new Set();

const ID_SHAPE = { FN: /^FN-[A-Za-z0-9-]+$/, UC: /^UC-[A-Za-z0-9-]+$/, STM: /^STM-[A-Za-z0-9-]+$/ };

export function emptyFunctions(module) {
  return { schemaVersion: "1.0", module: module ?? null, notFunctional: [], functions: [], extensions: {} };
}
export function emptyStateMachines(module) {
  return { schemaVersion: "1.0", module: module ?? null, machines: [], extensions: {} };
}

export function validate(fns, stms, req) {
  const f = [];
  const add = (check, id, message) =>
    f.push({ check, level: WARN_ONLY.has(check) ? "warn" : "error", id, message });

  const functions = Array.isArray(fns.functions) ? fns.functions : [];
  const machines = Array.isArray(stms.machines) ? stms.machines : [];

  // ── FU8 · identity first: every later check reports by id, so ids must be trustworthy ──
  const seen = new Map();
  const claim = (kind, id, where) => {
    if (!id || !ID_SHAPE[kind].test(id)) { add("FU8", id || "(missing)", `not a well-formed ${kind} id, in ${where}`); return; }
    if (seen.has(id)) add("FU8", id, `duplicate id — also used in ${seen.get(id)}`);
    else seen.set(id, where);
  };
  for (const fn of functions) {
    claim("FN", fn.id, "functions[]");
    for (const uc of fn.useCases ?? []) claim("UC", uc.id, `${fn.id}.useCases[]`);
  }
  for (const m of machines) claim("STM", m.id, "machines[]");

  // ── FU1 · coverage: silence is not an answer ──
  const mapped = new Set(functions.flatMap((fn) => fn.traces ?? []));
  const declaredNotFunctional = new Map((fns.notFunctional ?? []).map((x) => [x.req, x.reason]));
  for (const r of req.requirements) {
    if (mapped.has(r.id)) continue;
    const reason = declaredNotFunctional.get(r.id);
    if (reason === undefined) {
      add("FU1", r.id, `no FN maps to it, and it is not listed in notFunctional[] — an unmapped REQ must be an explicit decision, not an omission`);
    } else if (!String(reason).trim()) {
      add("FU1", r.id, "listed in notFunctional[] with an empty reason — say why, or map it");
    }
  }
  for (const [reqId] of declaredNotFunctional) {
    if (!req.reqIds.has(reqId)) add("FU1", reqId, "listed in notFunctional[] but does not exist in req output");
    else if (mapped.has(reqId)) add("FU1", reqId, "listed in notFunctional[] AND mapped to a FN — decide which");
  }

  for (const fn of functions) {
    // ── FU2 · no scope creep (V2) ──
    const traces = fn.traces ?? [];
    if (traces.length === 0) add("FU2", fn.id, "no traces[] — a function tracing to no requirement is scope creep (V2)");
    for (const t of traces) if (!req.reqIds.has(t)) add("FU2", fn.id, `traces to ${t}, which does not exist in req output`);

    // ── FU3 · a function nobody can walk through is not specified ──
    const ucs = fn.useCases ?? [];
    if (ucs.length === 0) add("FU3", fn.id, "no useCases[] — the DoD requires every function to be realized by at least one use case");

    // ── FU5 · rules are referenced, never copied ──
    for (const br of fn.governedBy ?? []) {
      if (!req.ruleIds.has(br)) add("FU5", fn.id, `governedBy ${br}, which is not a rule id in req output`);
      else if (!req.currentRuleIds.has(br)) add("FU5", fn.id, `governedBy ${br}, which is not is_current — a superseded rule must not govern a function`);
    }

    // ── FU4 · V3, the check the DoD names outright ──
    for (const uc of ucs) {
      const need = [["actor", uc.actor], ["preconditions", uc.preconditions], ["mainFlow", uc.mainFlow],
        ["alternateFlows", uc.alternateFlows], ["exceptionFlows", uc.exceptionFlows]];
      for (const [name, v] of need) {
        const empty = v === undefined || v === null || (Array.isArray(v) ? v.length === 0 : !String(v).trim());
        if (empty) {
          add("FU4", uc.id ?? fn.id, `${name} is empty — V3 and the DoD both require it. An alternate or exception flow nobody wrote is a behaviour nobody built and nobody tested.`);
        }
      }
    }
  }

  // ── FU6 · FU7 · state machines (V4) ──
  for (const m of machines) {
    const states = Array.isArray(m.states) ? m.states : [];
    const trans = Array.isArray(m.transitions) ? m.transitions : [];
    if (states.length === 0) { add("FU6", m.id, "no states[]"); continue; }
    if (trans.length === 0) add("FU6", m.id, "no transitions[]");
    const ids = new Set(states.map((s) => s.id));
    if (!m.initial) add("FU6", m.id, "no initial state declared");
    else if (!ids.has(m.initial)) add("FU6", m.id, `initial state ${m.initial} is not in states[]`);
    for (const t of trans) {
      for (const end of ["from", "to"]) {
        if (t[end] && !ids.has(t[end])) add("FU6", m.id, `transition ${end} ${JSON.stringify(t[end])} is not a declared state`);
      }
      for (const br of t.governedBy ?? []) {
        if (!req.ruleIds.has(br)) add("FU5", `${m.id}:${t.from}->${t.to}`, `governedBy ${br}, which is not a rule id in req output`);
      }
    }
    const hasExit = new Set(trans.map((t) => t.from));
    for (const s of states) {
      if (!s.final && !hasExit.has(s.id)) {
        add("FU7", `${m.id}:${s.id}`, "dead state — not final and nothing leaves it (V4). A record that reaches it can never move again.");
      }
    }
  }
  return f;
}

/** Derived, never authored. §7.2 rule 5 without asking anyone to remember. */
export function buildTrace(fns, stms) {
  const edges = [];
  for (const fn of fns.functions ?? []) {
    for (const r of fn.traces ?? []) edges.push({ from: r, rel: "satisfiedBy", to: fn.id });
    for (const uc of fn.useCases ?? []) edges.push({ from: fn.id, rel: "realizedBy", to: uc.id });
    for (const br of fn.governedBy ?? []) edges.push({ from: fn.id, rel: "governedBy", to: br });
    for (const e of fn.operatesOn ?? []) edges.push({ from: fn.id, rel: "operatesOn", to: e });
  }
  for (const m of stms.machines ?? []) {
    if (m.entity) edges.push({ from: m.entity, rel: "hasState", to: m.id });
    for (const t of m.transitions ?? []) {
      for (const br of t.governedBy ?? []) edges.push({ from: m.id, rel: "governedBy", to: br });
    }
  }
  // Stable order so a rerun produces a byte-identical file (P5).
  edges.sort((a, b) => (a.from + a.rel + a.to).localeCompare(b.from + b.rel + b.to));
  return { schemaVersion: "1.0", owner: "design", edges };
}

const cell = (s) => String(s ?? "").split("\n").join(" ").split("|").join("\\|");
const esc = (s) => String(s ?? "").split('"').join("&quot;");
/**
 * Mermaid node ids, made collision-free on purpose.
 *
 * A naive `replace(/[^A-Za-z0-9_]/g, "_")` destroys Thai entirely — "ผู้สมัคร" becomes a row of
 * underscores — so ANY TWO Thai labels of the same length collapse onto the same node and the
 * diagram silently merges two actors, or two states, into one. Actor names and state labels are
 * Thai on every real project here, so that is the normal case, not an edge case.
 *
 * A factory per diagram: ids are assigned in first-seen order, so the output stays byte-identical
 * across runs (P5), and a label that sanitises to nothing still gets a distinct id.
 */
function idFactory(prefix) {
  const map = new Map();
  const used = new Set();
  let n = 0;
  return (raw) => {
    const key = String(raw ?? "");
    if (map.has(key)) return map.get(key);
    let base = key.replace(/[^A-Za-z0-9_]/g, "_").replace(/^_+/, "").replace(/_+$/, "");
    if (!base || /^[0-9]/.test(base)) base = prefix + ++n;
    let cand = base;
    while (used.has(cand)) cand = base + "_" + ++n;
    used.add(cand);
    map.set(key, cand);
    return cand;
  };
}

export function renderUseCaseDiagram(fns) {
  const lines = ["flowchart LR"];
  const nid = idFactory("n");
  const actors = new Map();
  for (const fn of fns.functions ?? []) {
    for (const uc of fn.useCases ?? []) {
      if (uc.actor && !actors.has(uc.actor)) actors.set(uc.actor, nid("actor_" + uc.actor));
    }
  }
  for (const [label, id] of actors) lines.push(`  ${id}(["${esc(label)}"])`);
  for (const fn of fns.functions ?? []) {
    lines.push(`  subgraph ${nid("g_" + fn.id)}["${esc(fn.id + " " + (fn.title ?? ""))}"]`);
    for (const uc of fn.useCases ?? []) lines.push(`    ${nid(uc.id)}("${esc(uc.id + " " + (uc.title ?? ""))}")`);
    lines.push("  end");
  }
  for (const fn of fns.functions ?? []) {
    for (const uc of fn.useCases ?? []) {
      if (uc.actor) lines.push(`  ${actors.get(uc.actor)} --> ${nid(uc.id)}`);
    }
  }
  return lines.join("\n");
}

export function renderStateDiagram(m) {
  const lines = ["stateDiagram-v2"];
  const sid = idFactory("s");
  // Assign ids in declaration order first, so a transition can never invent a node the state list
  // did not declare — FU6 already guarantees both endpoints exist.
  for (const s of m.states ?? []) sid(s.id);
  if (m.initial) lines.push(`  [*] --> ${sid(m.initial)}`);
  for (const s of m.states ?? []) {
    if (s.label) lines.push(`  ${sid(s.id)} : ${esc(s.label)}`);
  }
  for (const t of m.transitions ?? []) {
    lines.push(t.on ? `  ${sid(t.from)} --> ${sid(t.to)} : ${esc(t.on)}` : `  ${sid(t.from)} --> ${sid(t.to)}`);
  }
  for (const s of m.states ?? []) if (s.final) lines.push(`  ${sid(s.id)} --> [*]`);
  return lines.join("\n");
}

const GENERATED_HEADER = [
  "> ⚠️ **ไฟล์นี้ถูก generate ทั้งไฟล์ ห้ามแก้ด้วยมือ**",
  "> แก้ที่ `functions.json` / `statemachines.json` แล้วสั่ง `/design:function` ใหม่ · แก้ตรงนี้จะโดนทับรอบหน้าโดยไม่มีคำเตือน",
  "> (CLAUDE.md §7 กติกา 1 · สเปก P2 — JSON คือความจริง เอกสารเป็นแค่ภาพฉาย)",
].join("\n");

export function renderDocument(fns, stms, ruleById, today) {
  const traces = [...new Set((fns.functions ?? []).flatMap((f) => f.traces ?? []))];
  const out = ["---", "id: DOC-DESIGN-03", "type: phase.document", "owner: design", "contributors: []",
    'readers: ["*"]', "scope: project", "traces: [" + traces.join(", ") + "]", "status: draft",
    "version: 1", "updated: " + today, "---", "",
    "# 3. ความต้องการเชิงหน้าที่", "", GENERATED_HEADER, ""];

  const nf = fns.notFunctional ?? [];
  if (nf.length) {
    out.push("## 3.0 requirement ที่จงใจไม่ทำเป็นหน้าที่", "",
      "_อยู่ตรงนี้เพราะการไม่ทำต้องเป็นการตัดสินใจที่มีคนเซ็น ไม่ใช่ของที่หายไปเงียบ ๆ_", "",
      "| REQ | เหตุผล |", "|---|---|");
    for (const x of nf) out.push("| " + cell(x.req) + " | " + cell(x.reason) + " |");
    out.push("");
  }

  out.push("## 3.1 แผนภาพ use case", "", "```mermaid", renderUseCaseDiagram(fns), "```", "");

  out.push("## 3.2 รายละเอียดหน้าที่", "");
  for (const fn of fns.functions ?? []) {
    out.push("### " + fn.id + " " + (fn.title ?? ""), "");
    out.push("| | |", "|---|---|");
    out.push("| มาจาก | " + cell((fn.traces ?? []).join(", ")) + " |");
    if ((fn.governedBy ?? []).length) out.push("| กฎที่กำกับ | " + cell(fn.governedBy.join(", ")) + " |");
    if ((fn.operatesOn ?? []).length) out.push("| ทำงานกับข้อมูล | " + cell(fn.operatesOn.join(", ")) + " |");
    out.push("");
    for (const br of fn.governedBy ?? []) {
      const r = ruleById.get(br);
      if (r) out.push("- **" + cell(br) + "** — " + cell(r.statement));
    }
    if ((fn.governedBy ?? []).length) out.push("");
    for (const uc of fn.useCases ?? []) {
      out.push("#### " + uc.id + " " + (uc.title ?? ""), "");
      out.push("**ผู้กระทำ:** " + cell(uc.actor), "");
      out.push("**เงื่อนไขก่อนเริ่ม**", "");
      for (const p of uc.preconditions ?? []) out.push("- " + p);
      out.push("", "**ทางหลัก**", "");
      (uc.mainFlow ?? []).forEach((s, i) => out.push(`${i + 1}. ${s}`));
      out.push("", "**ทางเลือก**", "");
      for (const a of uc.alternateFlows ?? []) {
        out.push("- **" + cell(a.id ?? "") + "** เมื่อ " + cell(a.when ?? "") + (a.steps ? " → " + cell(a.steps.join(" → ")) : ""));
      }
      out.push("", "**ทางยกเว้น**", "");
      for (const e of uc.exceptionFlows ?? []) {
        out.push("- **" + cell(e.id ?? "") + "** เมื่อ " + cell(e.when ?? "") + (e.steps ? " → " + cell(e.steps.join(" → ")) : ""));
      }
      if ((uc.postconditions ?? []).length) {
        out.push("", "**เงื่อนไขหลังจบ**", "");
        for (const p of uc.postconditions) out.push("- " + p);
      }
      out.push("");
    }
  }

  out.push("## 3.3 แผนภาพสถานะ", "");
  const machines = stms.machines ?? [];
  if (!machines.length) out.push("_ยังไม่มีเครื่องสถานะ_", "");
  for (const m of machines) {
    out.push("### " + m.id + (m.entity ? " — " + m.entity : ""), "");
    out.push("```mermaid", renderStateDiagram(m), "```", "");
  }
  return out.join("\n") + "\n";
}

function main() {
  const { values, flags } = parseArgs(process.argv.slice(2));
  const root = values["--root"] ?? ".";
  const write = flags.has("--write");
  const today = new Date().toISOString().slice(0, 10);

  const sp = statePath({ root, values });
  if (!existsSync(sp)) {
    console.error("HALT — /design:init has not run.\n  expected " + sp + "\n  fix: run /design:init first (spec §7.2 rule 2)");
    process.exit(2);
  }
  const state = JSON.parse(readFileSync(sp, "utf8"));
  const overview = (state.steps ?? []).find((s) => s.id === "overview");
  if (!overview || overview.status !== "done") {
    console.error("HALT — /design:overview is not done (status: " + (overview?.status ?? "absent") + ").");
    console.error("  §7.2 rule 2: a command must halt when a preceding command has not run.");
    process.exit(2);
  }

  const contract = readReqContract({ root, values });
  if (!contract.ok) {
    console.error("HALT — req output unusable. Run /design:init to see the detail.\n  " + contract.specPath);
    process.exit(2);
  }
  const spec = JSON.parse(readFileSync(contract.specPath, "utf8"));
  const rules = spec.rules ?? [];
  const req = {
    requirements: spec.requirements ?? [],
    reqIds: new Set((spec.requirements ?? []).map((r) => r.id)),
    ruleIds: new Set(rules.map((r) => r.id)),
    currentRuleIds: new Set(rules.filter((r) => r.is_current).map((r) => r.id)),
  };
  const ruleById = new Map(rules.map((r) => [r.id, r]));

  const dir = designDirPath({ root, values });
  const ff = join(dir, FUNCTIONS_FILE), sf = join(dir, STATEMACHINES_FILE);
  for (const [p, name, shape] of [[ff, FUNCTIONS_FILE, emptyFunctions(contract.module)], [sf, STATEMACHINES_FILE, emptyStateMachines(contract.module)]]) {
    if (!existsSync(p)) {
      console.error("HALT — " + name + " does not exist yet.\n  expected " + p);
      console.error("  This script validates and renders; it does not author. /design:function drafts it with the owner first.");
      console.error("  Starting shape: " + JSON.stringify(shape));
      process.exit(2);
    }
  }
  const fns = JSON.parse(readFileSync(ff, "utf8"));
  const stms = JSON.parse(readFileSync(sf, "utf8"));

  const findings = validate(fns, stms, req);
  const errors = findings.filter((x) => x.level === "error");
  const warns = findings.filter((x) => x.level === "warn");

  console.log("functions      : " + ff);
  console.log("statemachines  : " + sf);
  console.log("req spec       : " + contract.specPath + "  (REQ " + req.reqIds.size + " · BR " + req.ruleIds.size + " current " + req.currentRuleIds.size + ")");
  const nFn = (fns.functions ?? []).length;
  const nUc = (fns.functions ?? []).reduce((a, f) => a + (f.useCases ?? []).length, 0);
  console.log("counted        : FN " + nFn + " · UC " + nUc + " · STM " + (stms.machines ?? []).length + " · notFunctional " + (fns.notFunctional ?? []).length);
  for (const x of findings) console.log((x.level === "error" ? "ERROR" : "WARN ") + " " + x.check + "  " + x.id + ": " + x.message);
  console.log("\n" + errors.length + " error(s), " + warns.length + " warning(s)");

  if (errors.length) {
    console.error("\nNOT RENDERED — fix the JSON, then run again. Nothing was written.");
    process.exit(1);
  }

  const trace = buildTrace(fns, stms);
  const doc = renderDocument(fns, stms, ruleById, today);
  console.log("\ntrace edges    : " + trace.edges.length + " (derived, never hand-written)");
  if (!write) {
    console.log("DRY RUN — would write " + TRACE_FILE + " and docs/design/03-functional-requirements.md. Re-run with --write.");
    process.exit(0);
  }
  writeFileSync(join(dir, TRACE_FILE), JSON.stringify(trace, null, 2) + "\n");
  const docDir = docsDesignDir({ root });
  mkdirSync(docDir, { recursive: true });
  writeFileSync(join(docDir, "03-functional-requirements.md"), doc);
  console.log("WROTE " + TRACE_FILE + " · 03-functional-requirements.md");
  process.exit(0);
}

main();
