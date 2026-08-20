#!/usr/bin/env node
/**
 * context.mjs — the deterministic half of /design:overview.
 *
 * Spec §7.1: introduction + system overview (§11 sections 1-2).
 * DoD: "Scope, assumptions, constraints present; context diagram produced".
 *
 * WHAT IS A SCRIPT HERE AND WHAT IS NOT
 *
 * Deciding the scope of a system is judgement and belongs to the model plus the owner. Deciding
 * whether the scope was actually WRITTEN DOWN is arithmetic and belongs here. This script never
 * authors content: it validates context.json against the DoD and renders what context.json says.
 * Spec P4 — the exit condition is an exit code, never a model announcing it is finished.
 *
 * THE §11.1 CONFLICT, AND HOW IT WAS SETTLED
 *
 * §11.1 says the context diagram is "generate, then allow human refinement". CLAUDE.md §7 rule 1
 * forbids hand-editing generated documents and forbids "edit inside this marker" blocks, because
 * someone eventually edits outside the marker, a regeneration eats it silently, and after that
 * nobody on the team trusts regeneration again.
 *
 * Owner decision 2026-08-20: refinement happens by editing context.json, never the rendered file.
 * Both rules then hold at once, and P2 is preserved — JSON is the source of truth, the document is
 * a rendering. Every file this script writes carries a header saying so.
 *
 * Exit codes:
 *   0  context.json satisfies the DoD (and was rendered, with --write)
 *   1  context.json exists but fails the DoD — findings listed per rule with the offending ids
 *   2  cannot run: prerequisite missing (init not run, req output absent, context.json absent)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, designDirPath, statePath, docsDesignDir } from "./state-dir.mjs";
import { readReqContract } from "./req-contract.mjs";

export const CONTEXT_FILE = "context.json";
export const CONTEXT_SCHEMA_VERSION = "1.0";

/** Every check this command gates on. Namespaced OV so it can never collide with V1-V27 or D1-D12b. */
export const CHECKS = {
  OV1: "purpose is present",
  OV2: "scope.in is present and non-empty",
  OV3: "constraints are present (DoD)",
  OV4: "assumptions are present (DoD)",
  OV5: "context diagram is producible: system + at least one external + at least one flow",
  OV6: "every flow endpoint resolves to the system or a declared external",
  OV7: "every constraint and assumption traces to a REQ that exists in req output",
  OV8: "users are present (warn only: req records no stakeholders)",
};
const WARN_ONLY = new Set(["OV8"]);

/** Shape written by the model, validated here. `extensions` per spec §3.3. */
export function emptyContext(module) {
  return {
    schemaVersion: CONTEXT_SCHEMA_VERSION,
    module: module ?? null,
    purpose: "",
    scope: { in: [], out: [] },
    references: [],
    productView: "",
    users: [],
    constraints: [],
    assumptions: [],
    diagram: { system: { id: "SYS", label: "" }, externals: [], flows: [] },
    extensions: {},
  };
}

export function validateContext(ctx, reqIds) {
  const f = [];
  const add = (check, id, message) =>
    f.push({ check, level: WARN_ONLY.has(check) ? "warn" : "error", id, message });

  if (!ctx.purpose || !String(ctx.purpose).trim()) {
    add("OV1", "purpose", "empty — section 1 of the client document has no opening paragraph to render");
  }
  if (!Array.isArray(ctx.scope?.in) || ctx.scope.in.length === 0) {
    add("OV2", "scope.in", "empty — a document that does not say what is IN scope cannot be signed against");
  }
  if (!Array.isArray(ctx.constraints) || ctx.constraints.length === 0) {
    add("OV3", "constraints", "empty — the DoD for this command names constraints explicitly");
  }
  if (!Array.isArray(ctx.assumptions) || ctx.assumptions.length === 0) {
    add("OV4", "assumptions", "empty — an unstated assumption is the thing that gets argued about at UAT");
  }

  const d = ctx.diagram ?? {};
  const externals = Array.isArray(d.externals) ? d.externals : [];
  const flows = Array.isArray(d.flows) ? d.flows : [];
  if (!d.system?.id || externals.length === 0 || flows.length === 0) {
    add("OV5", "diagram", "cannot render DFD 0: system=" + (d.system?.id ? "yes" : "no") +
      " externals=" + externals.length + " flows=" + flows.length);
  }
  const known = new Set([d.system?.id, ...externals.map((e) => e.id)].filter(Boolean));
  for (const fl of flows) {
    for (const end of ["from", "to"]) {
      if (fl[end] && !known.has(fl[end])) {
        add("OV6", "flow " + fl.from + "->" + fl.to,
          end + " " + JSON.stringify(fl[end]) + " is not the system and not a declared external");
      }
    }
  }

  for (const kind of ["constraints", "assumptions"]) {
    for (const item of Array.isArray(ctx[kind]) ? ctx[kind] : []) {
      const traces = Array.isArray(item.traces) ? item.traces : [];
      if (traces.length === 0) {
        add("OV7", item.id ?? kind, "no traces[] — spec P3 requires every artifact to trace up to a REQ");
        continue;
      }
      for (const t of traces) {
        if (!reqIds.has(t)) add("OV7", item.id ?? kind, "traces to " + t + ", which does not exist in req output");
      }
    }
  }

  if (!Array.isArray(ctx.users) || ctx.users.length === 0) {
    add("OV8", "users",
      "empty — §11 section 2 wants a user list and a stakeholder map, but req records no stakeholders " +
      "(Q-STAKEHOLDERS). Not blocking here; it is an error at /design:rbac.");
  }
  return f;
}

/** Mermaid label: only the quote character needs neutralising inside a "..." node label. */
const esc = (s) => String(s ?? "").split('"').join("&quot;");

/**
 * Markdown TABLE CELL. A pipe inside a cell silently splits the row into phantom columns, and the
 * client document then shows garbage in a section §11 makes mandatory — with every OV check green,
 * because the JSON was perfectly valid. Glossary definitions and constraint text are free-form Thai
 * written by a person, so a pipe is ordinary, not exotic. Newlines break the row outright.
 */
const cell = (s) => String(s ?? "").split("\n").join(" ").split("|").join("\\|");

export function renderDiagram(ctx) {
  const d = ctx.diagram ?? {};
  const lines = ["flowchart TB"];
  lines.push("  " + d.system.id + '["' + esc(d.system.label || ctx.module || "system") + '"]');
  for (const e of d.externals ?? []) {
    const open = e.kind === "actor" ? '(["' : '["';
    const close = e.kind === "actor" ? '"])' : '"]';
    lines.push("  " + e.id + open + esc(e.label) + close);
  }
  for (const fl of d.flows ?? []) {
    lines.push(fl.label
      ? "  " + fl.from + ' -->|"' + esc(fl.label) + '"| ' + fl.to
      : "  " + fl.from + " --> " + fl.to);
  }
  return lines.join("\n");
}

const GENERATED_HEADER = (source) => [
  "> ⚠️ **ไฟล์นี้ถูก generate ทั้งไฟล์ ห้ามแก้ด้วยมือ**",
  "> แก้ที่ `" + source + "` แล้วสั่ง `/design:overview` ใหม่ · แก้ตรงนี้จะโดนทับรอบหน้าโดยไม่มีคำเตือน",
  "> (CLAUDE.md §7 กติกา 1 · สเปก P2 — JSON คือความจริง เอกสารเป็นแค่ภาพฉาย)",
].join("\n");

function frontMatter({ id, traces, updated }) {
  return ["---", "id: " + id, "type: phase.document", "owner: design", "contributors: []",
    'readers: ["*"]', "scope: project", "traces: [" + traces.join(", ") + "]", "status: draft",
    "version: 1", "updated: " + updated, "---"].join("\n");
}

const allTraces = (ctx) => [...new Set(
  [...(ctx.constraints ?? []), ...(ctx.assumptions ?? [])].flatMap((x) => x.traces ?? [])
)];

export function renderIntroduction(ctx, glossary, today) {
  const out = [frontMatter({ id: "DOC-DESIGN-01", traces: allTraces(ctx), updated: today }), "",
    "# 1. บทนำ", "", GENERATED_HEADER("context.json"), "",
    "## 1.1 วัตถุประสงค์", "", ctx.purpose, "",
    "## 1.2 ขอบเขต", "", "**อยู่ในขอบเขต**", ""];
  for (const s of ctx.scope?.in ?? []) out.push("- " + s);
  out.push("", "**ไม่อยู่ในขอบเขต**", "");
  const outs = ctx.scope?.out ?? [];
  if (outs.length) for (const s of outs) out.push("- " + s);
  else out.push("- _ยังไม่ได้ระบุ — สิ่งที่จงใจไม่ทำรอบนี้ ควรเขียนไว้ให้ลูกค้าเห็น_");

  out.push("", "## 1.3 เอกสารอ้างอิง", "");
  const refs = ctx.references ?? [];
  if (refs.length) {
    out.push("| อ้างอิง | ที่มา |", "|---|---|");
    for (const r of refs) out.push("| " + cell(r.title ?? r.id) + " | " + cell(r.where ?? "—") + " |");
  } else {
    out.push("_ไม่มี_");
  }

  out.push("", "## 1.4 อภิธานศัพท์", "",
    "_มาจาก `glossary[]` ของ `req` ทั้งหมด " + glossary.length + " คำ — ไม่คัดลอกมาแก้ที่นี่ (§5.4 W3)_", "");
  if (glossary.length) {
    out.push("| คำ | ความหมาย |", "|---|---|");
    for (const g of glossary) {
      out.push("| " + cell(g.term ?? g.id) + " | " + cell(g.definition) + " |");
    }
  }
  return out.join("\n") + "\n";
}

export function renderOverview(ctx, today) {
  const out = [frontMatter({ id: "DOC-DESIGN-02", traces: allTraces(ctx), updated: today }), "",
    "# 2. ภาพรวมระบบ", "", GENERATED_HEADER("context.json"), "",
    "## 2.1 มุมมองผลิตภัณฑ์", "", ctx.productView || "_ยังไม่ได้ระบุ_", "",
    "## 2.2 ผู้ใช้งาน", ""];
  const users = ctx.users ?? [];
  if (users.length) {
    out.push("| ผู้ใช้ | หน้าที่ |", "|---|---|");
    for (const u of users) out.push("| " + cell(u.label ?? u.id) + " | " + cell(u.role ?? "—") + " |");
  } else {
    out.push("> 🛑 **ยังไม่มีข้อมูลผู้ใช้** เพราะ `req` ไม่ได้บันทึก stakeholder ไว้ (`Q-STAKEHOLDERS`)", ">",
      "> ผังผู้เกี่ยวข้อง (stakeholder map) ที่ §11 หัวข้อ 2 ต้องมี จึงยังสร้างไม่ได้",
      "> และจะกลายเป็น **error** ตอน `/design:rbac` ตาม §13.3 A4 กับ V23");
  }

  out.push("", "## 2.3 ข้อจำกัด", "", "| รหัส | ข้อจำกัด | มาจาก |", "|---|---|---|");
  for (const c of ctx.constraints ?? []) {
    out.push("| " + cell(c.id) + " | " + cell(c.text) + " | " + cell((c.traces ?? []).join(", ")) + " |");
  }
  out.push("", "## 2.4 ข้อสมมติ", "", "| รหัส | ข้อสมมติ | มาจาก |", "|---|---|---|");
  for (const a of ctx.assumptions ?? []) {
    out.push("| " + cell(a.id) + " | " + cell(a.text) + " | " + cell((a.traces ?? []).join(", ")) + " |");
  }

  out.push("", "## 2.5 แผนภาพบริบท (DFD 0)", "", "```mermaid", renderDiagram(ctx), "```", "",
    "## 2.6 ผังกระบวนการ As-Is / To-Be", "",
    "_เขียนด้วยมือเป็น Mermaid swimlane เก็บใน `docs/wiki/` แล้วอ้างด้วย id — ไม่ generate จากที่นี่ (D6 เคาะ 2026-08-20)_",
    "_Mermaid ไม่รองรับ BPMN จึงใช้ flowchart ที่มี subgraph แทน lane_");
  return out.join("\n") + "\n";
}

function main() {
  const { values, flags } = parseArgs(process.argv.slice(2));
  const root = values["--root"] ?? ".";
  const write = flags.has("--write");
  const today = new Date().toISOString().slice(0, 10);

  const sp = statePath({ root, values });
  if (!existsSync(sp)) {
    console.error("HALT — /design:init has not run.");
    console.error("  expected " + sp);
    console.error("  fix: run /design:init first (spec §7.2 rule 2)");
    process.exit(2);
  }

  const contract = readReqContract({ root, values });
  if (!contract.ok) {
    console.error("HALT — req output unusable. Run /design:init to see the detail.");
    console.error("  " + contract.specPath);
    process.exit(2);
  }
  const spec = JSON.parse(readFileSync(contract.specPath, "utf8"));
  const reqIds = new Set((spec.requirements ?? []).map((r) => r.id));
  const glossary = spec.glossary ?? [];

  const cf = join(designDirPath({ root, values }), CONTEXT_FILE);
  if (!existsSync(cf)) {
    console.error("HALT — " + CONTEXT_FILE + " does not exist yet.");
    console.error("  expected " + cf);
    console.error("  This script validates and renders; it does not author. /design:overview drafts it with the owner first.");
    console.error("  Starting shape: " + JSON.stringify(emptyContext(contract.module)));
    process.exit(2);
  }

  const ctx = JSON.parse(readFileSync(cf, "utf8"));
  const findings = validateContext(ctx, reqIds);
  const errors = findings.filter((x) => x.level === "error");
  const warns = findings.filter((x) => x.level === "warn");

  console.log("context   : " + cf);
  console.log("req spec  : " + contract.specPath + "  (REQ " + reqIds.size + " · glossary " + glossary.length + ")");
  for (const x of findings) {
    console.log((x.level === "error" ? "ERROR" : "WARN ") + " " + x.check + "  " + x.id + ": " + x.message);
  }
  console.log("\n" + errors.length + " error(s), " + warns.length + " warning(s)");

  if (errors.length) {
    console.error("\nNOT RENDERED — fix context.json, then run again. Nothing was written.");
    process.exit(1);
  }

  const dir = docsDesignDir({ root });
  const files = [
    ["01-introduction.md", renderIntroduction(ctx, glossary, today)],
    ["02-system-overview.md", renderOverview(ctx, today)],
  ];
  if (!write) {
    console.log("\nDRY RUN — would write " + files.length + " file(s) into " + dir + ". Re-run with --write.");
    process.exit(0);
  }
  mkdirSync(dir, { recursive: true });
  for (const [name, body] of files) writeFileSync(join(dir, name), body);
  console.log("\nWROTE " + files.map((x) => x[0]).join(" · ") + "  ->  " + dir);
  process.exit(0);
}

main();
