#!/usr/bin/env node
/**
 * nfr.mjs — the deterministic half of /design:nfr.
 *
 * Spec §7.1: non-functional requirements (§11 section 4).
 * DoD: "Every NFR carries a measurable number" — V9 restates it as an Error.
 *
 * MISMATCH #5 — §6.1 GIVES `NFR-###` TO DESIGN; req ALREADY MINTS IT
 *
 * §6.1 lists `NFR-###` under owner `design`. On a real project that identifier is already taken:
 * req's PUBLISHED schema (schemas/spec.schema.json) defines `requirements[].nfr[]` with
 * `"pattern": "^NFR-[a-z0-9-]+-[0-9]{3}$"` and a closed `kind` enum, and aeon-miniloan carries ten
 * of them. This is the same shape as the RULE-### / BR-xxx collision settled on 2026-08-20: minting
 * a design-side id beside req's would be two sources of truth for one requirement, which §5.4 W3
 * forbids, and only req has a versioning path when one changes.
 *
 * So `nfr.json` REFERENCES req's ids and never mints one. NF2 rejects an id req does not have.
 *
 * WHO SUPPLIES THE NUMBER — owner decision, 2026-08-20
 *
 * req's NFR carries `statement` + `kind` + `verified_by` and NO number, while design's DoD demands
 * one. Two readings were live: req owns the number (design records the gap and routes it back), or
 * design drafts it with the owner. The owner chose **design drafts it with the owner**, the same
 * authoring flow /design:function already uses for FN/UC — §1.2 forbids this plugin from eliciting
 * new REQUIREMENTS, and a measurable target for a statement req already captured is not a new one.
 *
 * Consequence, deliberately: there is no `unmeasured[]` escape hatch. An NFR with no number is an
 * ERROR (NF3), not a warning to be carried forward, because "the system must be fast" surviving to
 * the client document is the exact failure §10 V9 exists to stop.
 *
 * WHAT IS DERIVED RATHER THAN AUTHORED (drift has to be impossible, not discouraged)
 *   - the REQ an NFR belongs to  — read from req's nesting, never restated in nfr.json
 *   - `kind`                     — read from req; if nfr.json states a different one, NF6 rejects it
 *   - `verification.method`      — defaults to req's `verified_by`; a contradiction is NF5, not a
 *                                  silent override
 *
 * Exit codes:
 *   0  nfr.json satisfies the DoD (and was rendered, with --write)
 *   1  it exists but fails a check — findings listed per rule with the offending ids
 *   2  cannot run: prerequisite missing (function not done, req output absent, nfr.json absent)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, designDirPath, statePath, docsDesignDir } from "./state-dir.mjs";
import { readReqContract } from "./req-contract.mjs";
import { buildDesignTrace, nfrOwnerMap, TRACE_FILE } from "./trace-design.mjs";

export const NFR_FILE = "nfr.json";

export const CHECKS = {
  NF1: "every NFR in req output is either given a target here, or declared notApplicable with a reason",
  NF2: "every id in nfrs[] exists in req output — design references NFR ids, it never mints them",
  NF3: "every NFR carries a measurable NUMBER (V9 — bare adjectives are rejected)",
  NF4: "the number is interpretable: known operator, non-empty unit and name, and a range with a real upper bound",
  NF5: "verification method is declared and does not contradict req's verified_by",
  NF6: "kind does not contradict the kind req recorded",
  NF0: "req captured at least one NFR — an empty section 4 is an acceptable answer only when it is a stated one",
};
// NF0 warns rather than fails: a project genuinely without non-functional requirements is possible,
// and a red that can never be cleared teaches everyone to stop reading warnings (CLAUDE.md §7, third rule).
const WARN_ONLY = new Set(["NF0"]);

/** req's own enum (schemas/spec.schema.json). Reused verbatim rather than re-invented here. */
export const KINDS = ["performance", "security", "availability", "usability", "compliance", "other"];
export const OPERATORS = ["<=", "<", ">=", ">", "==", "between"];
const ID_SHAPE = /^NFR-[a-z0-9-]+-[0-9]{3}$/;

export function emptyNfr(module) {
  return { schemaVersion: "1.0", module: module ?? null, nfrs: [], notApplicable: [], extensions: {} };
}

/** Everything req knows about NFRs, flattened once so the checks never walk requirements again. */
export function readReqNfrs(spec) {
  const out = new Map();
  for (const r of spec.requirements ?? []) {
    for (const n of r.nfr ?? []) {
      if (n?.id) out.set(n.id, { ...n, req: r.id });
    }
  }
  return out;
}

export function validate(doc, reqNfrs) {
  const f = [];
  const add = (check, id, message) =>
    f.push({ check, level: WARN_ONLY.has(check) ? "warn" : "error", id, message });

  const nfrs = Array.isArray(doc.nfrs) ? doc.nfrs : [];
  const notApplicable = Array.isArray(doc.notApplicable) ? doc.notApplicable : [];

  // ── NF0 · an empty section 4 must be visibly empty, never quietly empty ──
  // Without this, a project where req captured no NFR at all renders a section 4 holding a title and
  // the sentence "everything here carries a number" over nothing, at exit 0. §11 makes the section
  // mandatory, so that page reaches the client either way, and the reader cannot tell "nothing was
  // required" from "somebody forgot".
  if (reqNfrs.size === 0) {
    add("NF0", "(req)", "req captured no NFR at all, so section 4 will contain no targets. If that is wrong, the gap is upstream in req — §1.2 forbids filling it here.");
  }

  // ── NF2 · identity first: every later finding reports by id, so ids must be trustworthy ──
  const seen = new Set();
  for (const n of nfrs) {
    const id = n?.id;
    if (!id || !ID_SHAPE.test(id)) {
      add("NF2", id || "(missing)", "not a well-formed NFR id — req's schema requires NFR-<module>-###");
      continue;
    }
    if (seen.has(id)) { add("NF2", id, "duplicate entry in nfrs[]"); continue; }
    seen.add(id);
    if (!reqNfrs.has(id)) {
      add("NF2", id, "does not exist in req output — design references NFR ids, it never mints them. A non-functional requirement req never captured goes back through the §19.3 back-channel, not into this file.");
    }
  }

  // ── NF1 · coverage: silence is not an answer ──
  const excused = new Map(notApplicable.map((x) => [x?.nfr, x?.reason]));
  for (const [id] of reqNfrs) {
    if (seen.has(id)) continue;
    const reason = excused.get(id);
    if (reason === undefined) {
      add("NF1", id, "req captured it, but it has no target here and is not listed in notApplicable[] — dropping a non-functional requirement must be a decision someone signed, not an omission");
    } else if (!String(reason).trim()) {
      add("NF1", id, "listed in notApplicable[] with an empty reason — say why, or give it a target");
    }
  }
  for (const x of notApplicable) {
    const id = x?.nfr;
    if (!reqNfrs.has(id)) add("NF1", id ?? "(missing)", "listed in notApplicable[] but does not exist in req output");
    else if (seen.has(id)) add("NF1", id, "listed in notApplicable[] AND given a target in nfrs[] — decide which");
  }

  for (const n of nfrs) {
    const id = n?.id ?? "(missing)";
    const known = reqNfrs.get(id);
    const m = n?.metric;

    // ── NF3 · V9, the check the DoD names outright ──
    if (!m || typeof m !== "object") {
      add("NF3", id, "no metric{} — V9: an NFR without a number cannot be tested, and \"the system must be fast\" is not a requirement anyone can fail");
    } else if (typeof m.value !== "number" || !Number.isFinite(m.value)) {
      add("NF3", id, "metric.value is " + JSON.stringify(m.value) + ", not a finite number (V9)");
    }

    // ── NF4 · a number nobody can read is not measurable either ──
    if (m && typeof m === "object") {
      if (!OPERATORS.includes(m.operator)) {
        add("NF4", id, "metric.operator " + JSON.stringify(m.operator ?? null) + " is not one of " + OPERATORS.join(" "));
      }
      if (!String(m.unit ?? "").trim()) add("NF4", id, "metric.unit is empty — 3 what? seconds, percent, requests?");
      if (!String(m.name ?? "").trim()) add("NF4", id, "metric.name is empty — say what is being measured, not only the threshold");
      if (m.operator === "between") {
        if (typeof m.max !== "number" || !Number.isFinite(m.max)) add("NF4", id, "operator is between but metric.max is not a finite number");
        else if (typeof m.value === "number" && m.max <= m.value) add("NF4", id, "operator is between but max (" + m.max + ") is not above value (" + m.value + ")");
      }
    }

    // ── NF5 · verification: declared here, never contradicting req ──
    const method = String(n?.verification?.method ?? "").trim();
    if (!method) {
      add("NF5", id, "verification.method is empty — an NFR nobody can check is a sentence, not a requirement" + (known?.verified_by ? " (req recorded " + known.verified_by + ")" : ""));
    } else if (known?.verified_by && method !== known.verified_by) {
      add("NF5", id, "verification.method " + JSON.stringify(method) + " contradicts req's verified_by " + JSON.stringify(known.verified_by) + " — change it in req, or match it here; two answers is the one outcome that is always wrong");
    }

    // ── NF6 · classification belongs to req ──
    if (n?.kind !== undefined && known && n.kind !== known.kind) {
      add("NF6", id, "kind " + JSON.stringify(n.kind) + " contradicts req's " + JSON.stringify(known.kind) + " — design does not reclassify what req classified");
    }
    if (n?.kind !== undefined && !KINDS.includes(n.kind)) {
      add("NF6", id, "kind " + JSON.stringify(n.kind) + " is not one of " + KINDS.join(" "));
    }
  }
  return f;
}

const cell = (s) => String(s ?? "").split("\n").join(" ").split("|").join("\\|");

/** The threshold as one readable string. `between` is the only two-number form. */
export function targetText(m) {
  if (!m || typeof m !== "object") return "";
  const unit = String(m.unit ?? "").trim();
  if (m.operator === "between") return `${m.value}–${m.max} ${unit}`.trim();
  return `${m.operator} ${m.value} ${unit}`.trim();
}

const GENERATED_HEADER = [
  "> ⚠️ **ไฟล์นี้ถูก generate ทั้งไฟล์ ห้ามแก้ด้วยมือ**",
  "> แก้ที่ `nfr.json` แล้วสั่ง `/design:nfr` ใหม่ · แก้ตรงนี้จะโดนทับรอบหน้าโดยไม่มีคำเตือน",
  "> (CLAUDE.md §7 กติกา 1 · สเปก P2 — JSON คือความจริง เอกสารเป็นแค่ภาพฉาย)",
].join("\n");

const KIND_TH = {
  performance: "สมรรถนะ",
  security: "ความปลอดภัย",
  availability: "ความพร้อมใช้",
  usability: "ความง่ายในการใช้",
  compliance: "การปฏิบัติตามข้อกำหนด",
  other: "อื่น ๆ",
};

export function renderDocument(doc, reqNfrs, today) {
  const nfrs = doc.nfrs ?? [];
  const traces = [...new Set(nfrs.map((n) => reqNfrs.get(n.id)?.req).filter(Boolean))];
  const out = ["---", "id: DOC-DESIGN-04", "type: phase.document", "owner: design", "contributors: []",
    'readers: ["*"]', "scope: project", "traces: [" + traces.join(", ") + "]", "status: draft",
    "version: 1", "updated: " + today, "---", "",
    "# 4. ความต้องการที่ไม่ใช่หน้าที่", "", GENERATED_HEADER, ""];

  if (nfrs.length) {
    out.push("_ทุกข้อในหัวข้อนี้มีตัวเลขที่วัดได้ — ถ้าวัดไม่ได้ ด่าน NF3 (V9) จะไม่ปล่อยให้เอกสารนี้ถูกสร้างขึ้นมา_", "");
  } else {
    // Say it out loud, in the document. A blank section 4 that looks like an oversight is worse than
    // none at all, because §11 makes the section mandatory and the reader cannot tell the two apart.
    out.push("**หัวข้อนี้ไม่มีรายการ** — " + (reqNfrs.size === 0
      ? "`req` ยังไม่ได้เก็บข้อกำหนดที่ไม่ใช่หน้าที่ไว้เลยแม้แต่ข้อเดียว"
      : "ข้อกำหนดที่ `req` เก็บไว้ ถูกประกาศว่าไม่กำหนดเป้าหมายทั้งหมด (ดูหัวข้อ 4.7)"), "",
      "_ช่องว่างนี้ถูกเขียนออกมาตรง ๆ ไม่ใช่หน้าว่างที่ดูเหมือนมีคนลืม · ถ้าไม่ถูกต้อง ต้องแก้ที่ `req` เพราะ §1.2 ห้าม `design` เก็บ requirement เอง_", "");
  }

  // Grouped by req's own kind, in req's enum order, so the table of contents does not reshuffle
  // between runs (P5) and does not depend on the order somebody typed the entries.
  for (const kind of KINDS) {
    const rows = nfrs.filter((n) => (reqNfrs.get(n.id)?.kind ?? n.kind) === kind);
    if (!rows.length) continue;
    // Numbered by the kind's position in req's enum, NOT sequentially: a project carrying only
    // `security` and `compliance` renders 4.2 then 4.5, on purpose. The same category keeps the same
    // number on every project and across every rerun, so a cross-reference written today still
    // resolves after a category is added or emptied.
    out.push("## 4." + (KINDS.indexOf(kind) + 1) + " " + (KIND_TH[kind] ?? kind), "");
    out.push("| NFR | ข้อกำหนด | สิ่งที่วัด | เป้าหมาย | วิธีพิสูจน์ | มาจาก |", "|---|---|---|---|---|---|");
    for (const n of rows) {
      const k = reqNfrs.get(n.id);
      out.push("| " + cell(n.id) + " | " + cell(k?.statement) + " | " + cell(n.metric?.name) +
        " | **" + cell(targetText(n.metric)) + "** | " + cell(n.verification?.method) +
        " | " + cell(k?.req) + " |");
    }
    out.push("");
    for (const n of rows) {
      if (n.metric?.condition || n.verification?.evidence || n.notes) {
        out.push("- **" + cell(n.id) + "**" +
          (n.metric?.condition ? " — เงื่อนไขที่วัด: " + cell(n.metric.condition) : "") +
          (n.verification?.evidence ? " · หลักฐาน: " + cell(n.verification.evidence) : "") +
          (n.notes ? " · หมายเหตุ: " + cell(n.notes) : ""));
      }
    }
    if (rows.some((n) => n.metric?.condition || n.verification?.evidence || n.notes)) out.push("");
  }

  const na = doc.notApplicable ?? [];
  if (na.length) {
    out.push("## 4.7 ข้อที่จงใจไม่กำหนดเป้าหมาย", "",
      "_อยู่ตรงนี้เพราะการไม่ทำต้องเป็นการตัดสินใจที่มีคนเซ็น ไม่ใช่ของที่หายไปเงียบ ๆ_", "",
      "| NFR | ข้อกำหนดจาก req | เหตุผล |", "|---|---|---|");
    for (const x of na) out.push("| " + cell(x.nfr) + " | " + cell(reqNfrs.get(x.nfr)?.statement) + " | " + cell(x.reason) + " |");
    out.push("");
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
  const fnStep = (state.steps ?? []).find((s) => s.id === "function");
  if (!fnStep || fnStep.status !== "done") {
    console.error("HALT — /design:function is not done (status: " + (fnStep?.status ?? "absent") + ").");
    console.error("  §7.2 rule 2: a command must halt when a preceding command has not run.");
    console.error("  NFRs are targets ON the functions; writing them first means writing them about nothing.");
    process.exit(2);
  }

  const contract = readReqContract({ root, values });
  if (!contract.ok) {
    console.error("HALT — req output unusable. Run /design:init to see the detail.\n  " + contract.specPath);
    process.exit(2);
  }
  const spec = JSON.parse(readFileSync(contract.specPath, "utf8"));
  const reqNfrs = readReqNfrs(spec);

  const dir = designDirPath({ root, values });
  const nf = join(dir, NFR_FILE);
  if (!existsSync(nf)) {
    console.error("HALT — " + NFR_FILE + " does not exist yet.\n  expected " + nf);
    console.error("  This script validates and renders; it does not author. /design:nfr drafts it with the owner first.");
    console.error("  req carries " + reqNfrs.size + " NFR statement(s) to give targets to: " + [...reqNfrs.keys()].join(", "));
    console.error("  Starting shape: " + JSON.stringify(emptyNfr(contract.module)));
    process.exit(2);
  }
  const doc = JSON.parse(readFileSync(nf, "utf8"));

  const findings = validate(doc, reqNfrs);
  const errors = findings.filter((x) => x.level === "error");
  const warns = findings.filter((x) => x.level === "warn");

  console.log("nfr            : " + nf);
  console.log("req spec       : " + contract.specPath + "  (NFR in req " + reqNfrs.size + ")");
  console.log("counted        : targets " + (doc.nfrs ?? []).length + " · notApplicable " + (doc.notApplicable ?? []).length);
  for (const x of findings) console.log((x.level === "error" ? "ERROR" : "WARN ") + " " + x.check + "  " + x.id + ": " + x.message);
  console.log("\n" + errors.length + " error(s), " + warns.length + " warning(s)");

  if (errors.length) {
    console.error("\nNOT RENDERED — fix the JSON, then run again. Nothing was written.");
    process.exit(1);
  }

  const { graph: trace, skipped } = buildDesignTrace(dir, { nfrOwner: nfrOwnerMap(spec) });
  for (const s of skipped) console.log("WARN  trace  " + s.file + " could not be parsed, its edges are missing: " + s.detail);
  const rendered = renderDocument(doc, reqNfrs, today);
  console.log("\ntrace edges    : " + trace.edges.length + " (derived from every design artifact present, never hand-written)");
  if (!write) {
    console.log("DRY RUN — would write " + TRACE_FILE + " and docs/design/04-non-functional-requirements.md. Re-run with --write.");
    process.exit(0);
  }
  writeFileSync(join(dir, TRACE_FILE), JSON.stringify(trace, null, 2) + "\n");
  const docDir = docsDesignDir({ root });
  mkdirSync(docDir, { recursive: true });
  writeFileSync(join(docDir, "04-non-functional-requirements.md"), rendered);
  console.log("WROTE " + TRACE_FILE + " · 04-non-functional-requirements.md");
  process.exit(0);
}

main();
