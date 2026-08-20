#!/usr/bin/env node
/**
 * req-contract.mjs — the ONE place in this plugin that knows the SHAPE of req's output.
 *
 * WHY THIS MODULE EXISTS (read before changing anything here)
 *
 * The design specification §3.1 states the inbound contract as five separate files:
 *   req/requirements.json · req/glossary.json · req/stakeholders.json · req/okr.json ·
 *   req/change-set.json
 *
 * None of those files exist. `req` v0.3.0 produces exactly one artifact, `<state-dir>/spec.json`,
 * with requirements / glossary / changes as ARRAYS INSIDE it. Written literally, §3.1 would make
 * /design:init halt on 100% of real projects — the command could never succeed even once.
 *
 * Decision (owner, 2026-08-20): read spec.json, and correct §3.1 to match reality rather than
 * pretend. §3.1's real intent — "bind to a contract, never to another plugin's internals" — is
 * still honoured, because spec.json is not an internal structure: it carries a published $id
 * (schemas/spec.schema.json) and a pinned meta.schema_version. A versioned, schema'd file IS a
 * contract. This module is the seam: if req ever does emit the five files, only this file changes.
 *
 * WHAT HAS NO SOURCE AT ALL — deliberately not invented here:
 *   stakeholders  — `req` has no such concept. §13.3 A4 and V23 require every RBAC role to
 *                   originate from a stakeholder recorded by req, so this becomes an ERROR at
 *                   S12 (/design:rbac), not here. Deferred by the owner on 2026-08-20; init
 *                   records it as an openQuestion blocking `rbac` so it surfaces before S12
 *                   rather than during it.
 *   okr           — same: no concept in req. Recommended, not mandatory; absence is reported.
 *
 * Guessing content for either would violate spec §3.1 and CLAUDE.md §6 ("ห้ามเดา").
 */
import { readFileSync, existsSync } from "node:fs";
import { specPath } from "./state-dir.mjs";

/** The req schema versions this plugin has actually been run against. */
export const SUPPORTED_REQ_SCHEMA = ["0.3.0"];

/**
 * Sections of spec.json that stand in for §3.1's contract files.
 * `required: true` means /design:init MUST halt when it is missing or not an array.
 */
export const CONTRACT_SECTIONS = [
  { key: "requirements", specFile: "requirements.json", required: true },
  { key: "glossary", specFile: "glossary.json", required: true },
  { key: "changes", specFile: "change-set.json", required: false },
];

/** §3.1 entries that have no producer anywhere in req. Reported, never fabricated. */
export const NO_SOURCE_YET = [
  {
    key: "stakeholders",
    specFile: "stakeholders.json",
    blocks: "rbac",
    why: "req has no stakeholder concept; §13.3 A4 and V23 require RBAC roles to originate from one",
  },
  {
    key: "okr",
    specFile: "okr.json",
    blocks: null,
    why: "req has no OKR concept; used downstream as a test oracle, recommended not mandatory",
  },
];

/**
 * Read and validate req's output.
 *
 * Returns a report rather than throwing, so the caller decides the exit code and the wording.
 * `ok` is false when anything mandatory is absent or malformed — never "absent so assume empty".
 */
export function readReqContract({ root = ".", values = {}, env = process.env } = {}) {
  const path = specPath({ root, values, env });
  const report = {
    specPath: path,
    ok: false,
    exists: false,
    schemaVersion: null,
    schemaSupported: false,
    module: null,
    sections: {},
    missing: [],
    malformed: [],
    noSource: NO_SOURCE_YET.map((n) => ({ ...n })),
  };

  if (!existsSync(path)) {
    report.missing.push({
      what: "spec.json",
      path,
      fix: "run /req:capture in the project first — this plugin reads req's output and never creates it",
    });
    return report;
  }
  report.exists = true;

  let spec;
  try {
    spec = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    report.malformed.push({ what: "spec.json", path, detail: e.message });
    return report;
  }

  report.schemaVersion = spec?.meta?.schema_version ?? null;
  report.module = spec?.meta?.module ?? null;
  report.schemaSupported = SUPPORTED_REQ_SCHEMA.includes(report.schemaVersion);

  for (const s of CONTRACT_SECTIONS) {
    const v = spec[s.key];
    if (v === undefined) {
      // Absent is only fatal for mandatory sections; either way it is REPORTED, never defaulted.
      report.sections[s.key] = { present: false, count: 0 };
      if (s.required) report.missing.push({ what: `${s.key}[] (stands in for ${s.specFile})`, path, fix: "run /req:capture" });
      continue;
    }
    if (!Array.isArray(v)) {
      report.sections[s.key] = { present: true, count: 0, malformed: true };
      report.malformed.push({ what: `${s.key} is ${typeof v}, expected array`, path, detail: "spec.json does not match schemas/spec.schema.json" });
      continue;
    }
    report.sections[s.key] = { present: true, count: v.length };
    // An empty MANDATORY section is a halt: design has nothing to design from.
    if (s.required && v.length === 0) {
      report.missing.push({ what: `${s.key}[] is empty (stands in for ${s.specFile})`, path, fix: "capture at least one requirement with /req:capture" });
    }
  }

  report.ok = report.missing.length === 0 && report.malformed.length === 0;
  return report;
}
