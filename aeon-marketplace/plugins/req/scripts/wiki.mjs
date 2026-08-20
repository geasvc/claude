#!/usr/bin/env node
/**
 * wiki.mjs — renders docs/wiki/** (the OKF bundle) from spec.json.
 *
 * spec.json stays the single truth; the wiki is the THIRD render of it, next to
 * docs/requirements/REQ-xxx.md (for people) and the SRS .docx (for the customer) — design §5.1.
 * "Never build a second extraction path": nothing here reads a .md file to learn a fact.
 *
 * Why a script and not prose in a command file: the pages carry a spec_hash that check #12 (ง)
 * compares. If a model wrote these pages freehand the bytes would differ per run while the hash
 * would not, and every page would be stale from birth — the same failure doc-hash.mjs was created
 * to prevent for REQ-xxx.md.
 *
 * FREEZING NEEDS NO CODE HERE. Design §7.7 defines a frozen REQ as "nothing is written to that REQ
 * at all", not "written but not rendered" — so its nodes do not move, its hashes do not move, and
 * regenerating is a no-op. A --skip-frozen flag would create exactly the "waiting to be
 * regenerated" state the design set out to make impossible.
 *
 * log.md is layer C, append-only: created when missing, NEVER overwritten. One regeneration
 * would otherwise erase the whole timeline, and the timeline is the part that records what was
 * left undecided.
 *
 * Usage:  node wiki.mjs [--root <dir>] [--state-dir <name>] [--spec <path>] [--out <dir>] [--write]
 *         default is a dry run that reports drift; --write is what touches disk (same shape as
 *         rollup.mjs, so the two scripts behave the same way under the same flag)
 * Exit:   0 = bundle already matches spec | 1 = pages missing/stale (listed) | 2 = file/parse error
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { parseArgs, resolveSpecPath, orExit2 } from "./state-dir.mjs";
import { nodeDocHash, enumerateNodes } from "./doc-hash.mjs";
import { renderFrontmatter, pagePath, PROJECT_TYPES } from "./doc-frontmatter.mjs";

export const WIKI_DIR = "docs/wiki";

// ── timestamps ──────────────────────────────────────────────────────────────
/**
 * DOC-STANDARD §8 rule 8 wants RFC 3339 with seconds and a real offset, never `Z`. Live data has
 * `2026-08-01T12:10+07:00` (no seconds) and bare dates, so the value CANNOT be copied out of spec
 * straight into frontmatter — the standard says so in as many words. Normalising here keeps that
 * one conversion in one place.
 */
export function normalizeTimestamp(value, fallback) {
  const v = (value ?? "").toString().trim() || (fallback ?? "").toString().trim();
  if (!v) return "";
  let m = v.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (m) return `${m[1]}T00:00:00+07:00`;
  m = v.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(:\d{2})?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/);
  if (!m) return v; // unrecognised shapes pass through rather than being silently mangled
  const [, date, hm, sec, off] = m;
  const seconds = sec ?? ":00";
  if (off === "Z") {
    // shift onto the +07:00 the rest of the data uses — dropping the Z without moving the clock
    // would change what the timestamp means
    const d = new Date(`${date}T${hm}${seconds}Z`);
    d.setUTCHours(d.getUTCHours() + 7);
    return `${d.toISOString().slice(0, 19)}+07:00`;
  }
  return `${date}T${hm}${seconds}${off ?? "+07:00"}`;
}

// ── small helpers ───────────────────────────────────────────────────────────
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ");
const dash = (s) => (s === undefined || s === null || s === "" ? "—" : s);
const dirOf = (type) => PROJECT_TYPES[type].dir;

/** Link from a page in `fromType`'s directory to the page of `toId`. */
function link(fromType, toId, spec, text) {
  const t = typeOfId(toId, spec);
  const label = text ?? toId;
  if (!t) return `\`${label}\``; // unresolvable ids stay visible as text, and check #4 reports them
  const from = dirOf(fromType);
  const to = dirOf(t);
  const rel = from === to ? `${toId}.md` : `../${to}/${toId}.md`;
  return `[${label}](${rel})`;
}

/** Type of an id, resolved against the spec so a dangling id renders as text, not a broken link. */
function typeOfId(id, spec) {
  for (const n of enumerateNodes(spec)) if (n.id === id) return n.type;
  return null;
}

const tagsFor = (spec, extra = []) => [spec.meta?.module ?? "module", ...extra].filter(Boolean);

// ── page bodies, one per type ───────────────────────────────────────────────
const PAGES = {
  "Requirement"(spec, req) {
    const rules = (spec.rules ?? []).filter((r) => r.belongs_to === req.id && r.is_current).sort(byId);
    const terms = (spec.glossary ?? []).filter((t) => (req.domain_concepts ?? []).includes(t.id)).sort(byId);
    const L = [];
    L.push(`## เป้าหมาย`, req.goal ?? "—", "");
    L.push(`**actor:** ${dash(req.actor)} · **ความสำคัญ:** ${dash(req.priority)} · **มีหน้าจอ:** ${req.has_ui ? "ใช่" : "ไม่"}`, "");
    if (req.business_value) L.push(`## คุณค่าทางธุรกิจ`, req.business_value, "");
    L.push(`## กฎที่ยังใช้อยู่`, "");
    L.push(`| กฎ | ชนิด | ข้อความ | ตัวอย่าง |`, `|---|---|---|---|`);
    for (const r of rules) {
      L.push(`| ${link("Requirement", r.id, spec)} | ${dash(r.kind)} | ${esc(r.statement)} | ${(r.examples ?? []).length || "🔴 0"} |`);
    }
    if (!rules.length) L.push(`| — | | ยังไม่มีกฎที่ is_current | |`);
    L.push("");
    if (terms.length) {
      L.push(`## คำศัพท์ที่ผูกกับ requirement นี้`, "");
      for (const t of terms) L.push(`- ${link("Requirement", t.id, spec, `${t.id} · ${t.term_th}`)}`);
      L.push("");
    }
    const nfr = (req.nfr ?? []).sort(byId);
    if (nfr.length) {
      L.push(`## NFR`, "");
      for (const n of nfr) L.push(`- ${link("Requirement", n.id, spec)} — ${esc(n.statement)}`);
      L.push("");
    }
    L.push(`## ฉบับที่คนอ่าน`, `[docs/requirements/${req.id}.md](../../requirements/${req.id}.md) — เนื้อความเต็มภาษาไทย`);
    return {
      fm: {
        title: req.title ?? req.id,
        description: req.goal ?? "",
        resource: `../../requirements/${req.id}.md`,
        tags: tagsFor(spec, ["requirement"]),
        id: req.id,
        status: req.status ?? "draft",
        actor: req.actor ?? "",
        rules: (req.rules ?? []),
        domain_concepts: (req.domain_concepts ?? []),
      },
      body: L.join("\n"),
    };
  },

  "Business Rule"(spec, rv) {
    const siblings = (spec.rules ?? []).filter((r) => r.base_id === rv.base_id).sort(byId);
    const sibIds = new Set(siblings.map((r) => r.id));
    const changes = (spec.changes ?? [])
      .filter((c) => [...(c.affects ?? []), ...(c.invalidates ?? [])].some((x) => sibIds.has(x)))
      .sort(byId);
    const L = [];
    L.push(`## ข้อความของกฎ`, rv.statement ?? "—", "");
    if (rv.constrained_by) {
      L.push(`คำนวณตามสัญญา ${link("Business Rule", rv.constrained_by, spec)}`, "");
    }
    L.push(`## ที่มา`, "");
    for (const p of rv.provenance ?? []) {
      const src = (spec.sources ?? []).find((s) => s.id === p.source);
      const val = src?.interpretation?.validation;
      const badge = !val ? "" : val.state === "confirmed" ? " · ✅ confirmed" : ` · ⚠️ ${val.state}`;
      const loc = p.locator ? ` หน้า ${dash(p.locator.page)} §${dash(p.locator.section)}` : "";
      if (p.quote) L.push(`> "${p.quote}"`);
      L.push(`> — ${link("Business Rule", p.source, spec)}${loc}${badge}`, "");
    }
    if (!(rv.provenance ?? []).length) L.push(`ยังไม่มี provenance — กฎที่ไม่มีที่มาคือกฎที่ยันกับลูกค้าไม่ได้`, "");
    L.push(`## พิสูจน์โดย`, "");
    const exs = (spec.examples ?? []).filter((e) => (e.proves ?? []).includes(rv.id)).sort(byId);
    for (const e of exs) L.push(`- ${link("Business Rule", e.id, spec)} — ${dash(e.kind)}: ${esc(e.then)}`);
    const gds = (spec.golden_datasets ?? []).filter((g) => (g.proves ?? []).includes(rv.id)).sort(byId);
    for (const g of gds) {
      const signed = g.verified_by ? `✅ ${g.verified_by} ${(g.verified_at ?? "").slice(0, 10)}` : "🔴 ยังไม่มีใครเซ็น";
      L.push(`- ${link("Business Rule", g.id, spec)} — เลขเฉลย ${(g.rows ?? []).length} แถว · ${signed}`);
    }
    if (!exs.length && !gds.length) L.push(`🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้`);
    L.push("");
    if (rv.supersedes) {
      const prev = (spec.rules ?? []).find((r) => r.id === rv.supersedes);
      L.push(`## แทนที่`, `${link("Business Rule", rv.supersedes, spec)} — *เหตุผล: ${esc(rv.change_reason) || "ไม่ได้ระบุ"}*`, "");
      if (prev) L.push(`> เดิม: ${esc(prev.statement)}`, "");
    }
    L.push(`## ประวัติ`, "");
    L.push(`| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |`, `|---|---|---|---|`);
    for (const s of siblings) {
      const chg = changes.filter((c) => (c.affects ?? []).includes(s.id)).map((c) => link("Business Rule", c.id, spec)).join(" ") || "—";
      const label = s.id === rv.id ? `**${s.id}** (หน้านี้)` : link("Business Rule", s.id, spec);
      const mark = s.is_current ? " ✅" : s.status === "superseded" ? " ❄️" : "";
      L.push(`| ${label}${mark} | ${dash(s.effective_from)} | ${esc(s.change_reason) || "ตั้งต้น"} | ${chg} |`);
    }
    return {
      fm: {
        title: (rv.statement ?? rv.id).slice(0, 80),
        description: rv.statement ?? "",
        resource: `../requirements/${rv.belongs_to}.md`,
        tags: tagsFor(spec, [rv.kind]),
        id: rv.id,
        status: rv.status ?? "draft",
        belongs_to: rv.belongs_to ?? "",
        kind: rv.kind ?? "",
        is_current: rv.is_current === true,
        effective_from: rv.effective_from ?? "",
        test_design: rv.test_design ?? [],
        constrained_by: rv.constrained_by ?? "",
        proven_by: (rv.examples ?? []),
        golden: gds.map((g) => g.id),
        supersedes: rv.supersedes ?? "",
        superseded_by: rv.superseded_by ?? "",
        provenance: (rv.provenance ?? []).map((p) => p.source),
      },
      body: L.join("\n"),
    };
  },

  "Calculation Contract"(spec, c) {
    const siblings = (spec.calculations ?? []).filter((x) => x.base_id === c.base_id).sort(byId);
    const L = [];
    L.push(`## สูตร`, "", "```", c.formula ?? "", "```", "");
    L.push(`ผูกกับกฎ ${link("Calculation Contract", c.constrains, spec)}`, "");
    L.push(`## ตัวแปรเข้า`, "", `| ชื่อ | ชนิด | ความหมาย |`, `|---|---|---|`);
    for (const i of c.inputs ?? []) L.push(`| \`${i.name}\` | ${dash(i.type)} | ${esc(i.description)} |`);
    L.push("");
    L.push(`## การปัดเศษ — ส่วนที่ทำให้ตัวเลขต่างกันได้ทั้งที่สูตรเหมือนกัน`, "");
    L.push(`| เรื่อง | ค่า |`, `|---|---|`);
    L.push(`| ชนิดตัวเลข | ${dash(c.numeric_type)} |`);
    L.push(`| วิธีปัด | ${dash(c.rounding_mode)} |`);
    L.push(`| ปัดตรงไหน | ${esc(dash(c.rounding_points))} |`);
    L.push(`| เศษที่เหลือ | ${esc(dash(c.residual_policy))} |`, "");
    if ((c.boundary_behavior ?? []).length) {
      L.push(`## พฤติกรรมที่ขอบ`, "");
      for (const b of c.boundary_behavior) L.push(`- ${esc(b)}`);
      L.push("");
    }
    const gds = (spec.golden_datasets ?? []).filter((g) => (g.proves ?? []).includes(c.id)).sort(byId);
    L.push(`## เลขเฉลย`, "");
    if (gds.length) for (const g of gds) L.push(`- ${link("Calculation Contract", g.id, spec)} — ${(g.rows ?? []).length} แถว · ${g.verified_by ? `✅ ${g.verified_by}` : "🔴 ยังไม่มีใครเซ็น"}`);
    else L.push(`🔴 ยังไม่มีเลขเฉลย — สูตรตกลงแล้วแต่ไม่มีใครลองคำนวณ (\`/req:golden ${c.id}\`)`);
    L.push("");
    if ((c.questions ?? []).length || (c.deferred_questions ?? []).length) {
      L.push(`## คำถามที่ผูกอยู่`, "");
      for (const q of [...(c.questions ?? []), ...(c.deferred_questions ?? [])].sort()) {
        L.push(`- ${link("Calculation Contract", q, spec)}`);
      }
      L.push("");
    }
    L.push(`## ประวัติ`, "", `| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล |`, `|---|---|---|`);
    for (const s of siblings) {
      const label = s.id === c.id ? `**${s.id}** (หน้านี้)` : link("Calculation Contract", s.id, spec);
      L.push(`| ${label}${s.is_current ? " ✅" : ""} | ${dash(s.effective_from)} | ${esc(s.change_reason) || "ตั้งต้น"} |`);
    }
    if (c.notes) L.push("", `## หมายเหตุ`, esc(c.notes));
    return {
      fm: {
        title: `สัญญาการคำนวณของ ${c.constrains}`,
        description: c.formula ?? "",
        resource: `../rules/${c.constrains}.md`,
        tags: tagsFor(spec, ["calculation"]),
        id: c.id,
        status: c.status ?? "draft",
        constrains: c.constrains ?? "",
        is_current: c.is_current === true,
        effective_from: c.effective_from ?? "",
        numeric_type: c.numeric_type ?? "",
        rounding_mode: c.rounding_mode ?? "",
        golden: gds.map((g) => g.id),
        supersedes: c.supersedes ?? "",
        superseded_by: c.superseded_by ?? "",
      },
      body: L.join("\n"),
    };
  },

  "Example"(spec, ex) {
    const rules = (spec.rules ?? []).filter((r) => (ex.proves ?? []).includes(r.id)).sort(byId);
    const L = [];
    L.push(`## กำหนดให้ (given)`, esc(ex.given), "");
    L.push(`## เมื่อ (when)`, esc(ex.when), "");
    L.push(`## แล้ว (then)`, esc(ex.then), "");
    L.push(`## พิสูจน์กฎ`, "");
    for (const r of rules) L.push(`- ${link("Example", r.id, spec)}${r.is_current ? " ✅ ปัจจุบัน" : " ❄️"} — ${esc(r.statement)}`);
    if (!rules.length) L.push(`🔴 ตัวอย่างนี้ไม่ได้พิสูจน์กฎข้อไหนเลย`);
    return {
      fm: {
        title: `${dash(ex.kind)} — ${(ex.then ?? ex.id).slice(0, 60)}`,
        description: esc(ex.then),
        resource: rules[0] ? `../rules/${rules[0].id}.md` : "",
        tags: tagsFor(spec, ["example", ex.kind]),
        id: ex.id,
        status: ex.status ?? "draft",
        kind: ex.kind ?? "",
        proves: ex.proves ?? [],
        has_ui: ex.has_ui === true,
      },
      body: L.join("\n"),
    };
  },

  "Golden Dataset"(spec, gd) {
    const proves = [...(spec.rules ?? []), ...(spec.calculations ?? [])]
      .filter((n) => (gd.proves ?? []).includes(n.id)).sort(byId);
    const L = [];
    L.push(`## สถานะการยืนยัน`, "");
    L.push(gd.verified_by
      ? `✅ **${gd.verified_by}** ยืนยันเมื่อ ${dash(gd.verified_at)} — ตัวเลขชุดนี้ใช้ยันกับลูกค้าได้`
      : `🔴 **ยังไม่มีใครเซ็น** — เลขที่ออกจากสคริปต์เป็นข้อเสนอ ไม่ใช่คำตอบ จนกว่าจะมี \`verified_by\``, "");
    L.push(`คำนวณโดย \`${dash(gd.computed_by)}\` เมื่อ ${dash(gd.computed_at)}`, "");
    L.push(`## พิสูจน์`, "");
    for (const n of proves) L.push(`- ${link("Golden Dataset", n.id, spec)} — ${esc(n.statement ?? n.formula)}`);
    L.push("");
    if (gd.source) L.push(`ข้อมูลตั้งต้นจาก ${link("Golden Dataset", gd.source, spec)}`, "");
    L.push(`## ตาราง (${(gd.rows ?? []).length} แถว)`, "");
    const rows = gd.rows ?? [];
    const inKeys = [...new Set(rows.flatMap((r) => Object.keys(r.input ?? {})))];
    const outKeys = [...new Set(rows.flatMap((r) => Object.keys(r.expected ?? {})))];
    L.push(`| ${[...inKeys, ...outKeys, "มาจากแถวไหน"].join(" | ")} |`);
    L.push(`|${[...inKeys, ...outKeys, ""].map(() => "---|").join("")}`);
    for (const r of rows) {
      const cells = [...inKeys.map((k) => dash(r.input?.[k])), ...outKeys.map((k) => dash(r.expected?.[k])), dash(r.from_source_row)];
      L.push(`| ${cells.map(esc).join(" | ")} |`);
    }
    L.push("");
    if ((gd.mismatches ?? []).length) {
      L.push(`## ไม่ตรงกัน — ห้ามแก้เลขเฉลยให้เข้ากับสูตร ให้ย้อนไปแก้สูตร (loop L2)`, "");
      for (const m of gd.mismatches) L.push(`- ${esc(JSON.stringify(m))}`);
      L.push("");
    }
    if (gd.notes) L.push(`## หมายเหตุ`, esc(gd.notes));
    return {
      fm: {
        title: `เลขเฉลยของ ${(gd.proves ?? []).join(" · ")}`,
        description: `${(gd.rows ?? []).length} แถว · ${gd.verified_by ? "ยืนยันแล้ว" : "ยังไม่มีใครเซ็น"}`,
        resource: proves[0] ? `../${dirOf(typeOfId(proves[0].id, spec))}/${proves[0].id}.md` : "",
        tags: tagsFor(spec, ["golden"]),
        id: gd.id,
        status: gd.status ?? "draft",
        proves: gd.proves ?? [],
        verified_by: gd.verified_by ?? "",
        verified_at: gd.verified_at ?? "",
        source: gd.source ?? "",
      },
      body: L.join("\n"),
    };
  },

  "Change Set"(spec, chg) {
    const L = [];
    L.push(`## ทำไมถึงเปลี่ยน`, esc(chg.reason), "");
    L.push(`| เรื่อง | ค่า |`, `|---|---|`);
    L.push(`| ใครขอ | ${esc(dash(chg.requested_by))} |`);
    L.push(`| ใครอนุมัติ | ${chg.approved_by ? esc(chg.approved_by) : "🔴 ยังไม่มีใครเซ็น"} |`);
    L.push(`| มีผลตั้งแต่ | ${dash(chg.effective_from)} |`);
    L.push(`| เอกสารที่ทำให้เปลี่ยน | ${(chg.triggered_by ?? []).map((s) => link("Change Set", s, spec)).join(" · ") || "—"} |`, "");
    L.push(`## เปลี่ยนอะไร`, "", `| โหนด | จาก | เป็น |`, `|---|---|---|`);
    for (const id of (chg.affects ?? []).slice().sort()) {
      const node = [...(spec.rules ?? []), ...(spec.calculations ?? [])].find((n) => n.id === id);
      const prevId = node?.supersedes;
      const prev = prevId ? [...(spec.rules ?? []), ...(spec.calculations ?? [])].find((n) => n.id === prevId) : null;
      L.push(`| ${link("Change Set", id, spec)} | ${prev ? `${link("Change Set", prev.id, spec)} ${esc((prev.statement ?? prev.formula ?? "").slice(0, 60))}` : "— (ของใหม่)"} | ${esc((node?.statement ?? node?.formula ?? "").slice(0, 60))} |`);
    }
    L.push("");
    if ((chg.invalidates ?? []).length) {
      L.push(`## ต้องทำต่อ`, "");
      for (const id of chg.invalidates.slice().sort()) {
        L.push(`- 🔴 ${link("Change Set", id, spec)} ใช้ไม่ได้แล้ว — ต้องคำนวณเลขเฉลยใหม่ (\`/req:golden\`)`);
      }
      L.push("");
    }
    if (chg.notes) L.push(`## หมายเหตุ`, esc(chg.notes));
    return {
      fm: {
        title: (chg.reason ?? chg.id).slice(0, 80),
        description: `กระทบ ${(chg.affects ?? []).length} โหนด · มีผล ${dash(chg.effective_from)}`,
        resource: (chg.affects ?? [])[0] ? `../rules/${chg.affects[0]}.md` : "",
        tags: tagsFor(spec, ["change"]),
        id: chg.id,
        requested_by: chg.requested_by ?? "",
        approved_by: chg.approved_by ?? "",
        effective_from: chg.effective_from ?? "",
        affects: chg.affects ?? [],
        invalidates: chg.invalidates ?? [],
        triggered_by: chg.triggered_by ?? [],
      },
      body: L.join("\n"),
    };
  },

  "Glossary Term"(spec, t) {
    const used = (spec.requirements ?? []).filter((r) => (r.domain_concepts ?? []).includes(t.id)).sort(byId);
    const L = [];
    L.push(`## นิยาม`, t.definition || `🔴 ยังไม่มีนิยาม — คำที่ไม่มีนิยามผลิตกฎที่ตีความได้หลายทาง`, "");
    L.push(`| เรื่อง | ค่า |`, `|---|---|`);
    L.push(`| คำไทย | ${esc(t.term_th)} |`);
    L.push(`| ชื่อในระบบ | ${esc(dash(t.term_en))} |`);
    L.push(`| เรียกอีกอย่างว่า | ${(t.aka ?? []).map(esc).join(" · ") || "—"} |`);
    L.push(`| กลายเป็น entity | ${esc(dash(t.becomes_entity))} |`, "");
    if ((t.not_to_confuse_with ?? []).length) {
      L.push(`## ห้ามสับสนกับ`, "");
      for (const o of t.not_to_confuse_with) L.push(`- ${link("Glossary Term", o, spec)}`);
      L.push("");
    }
    L.push(`## ใช้ที่ไหน`, "");
    for (const r of used) L.push(`- ${link("Glossary Term", r.id, spec, `${r.id} · ${r.title ?? ""}`)}`);
    if (!used.length) L.push(`⚠️ ไม่มี requirement ไหนอ้างถึงคำนี้`);
    return {
      fm: {
        title: `${t.term_th}${t.term_en ? ` (${t.term_en})` : ""}`,
        description: t.definition ?? "",
        resource: used[0] ? `../requirements/${used[0].id}.md` : "",
        tags: tagsFor(spec, ["glossary"]),
        id: t.id,
        status: t.status ?? "draft",
        term_th: t.term_th ?? "",
        term_en: t.term_en ?? "",
        not_to_confuse_with: t.not_to_confuse_with ?? [],
      },
      body: L.join("\n"),
    };
  },

  "Open Question"(spec, q) {
    return questionPage(spec, q, "Open Question", "การ์ดแดง");
  },
  "Deferred Question"(spec, q) {
    return questionPage(spec, q, "Deferred Question", "คำถามที่เลื่อนไป");
  },

  "NFR"(spec, n) {
    const parent = (spec.requirements ?? []).find((r) => (r.nfr ?? []).some((x) => x.id === n.id));
    const L = [];
    L.push(`## ข้อกำหนด`, esc(n.statement), "");
    L.push(`| เรื่อง | ค่า |`, `|---|---|`);
    L.push(`| ชนิด | ${dash(n.kind)} |`);
    L.push(`| พิสูจน์ด้วย | ${esc(dash(n.verified_by))} |`);
    L.push(`| อยู่ใต้ | ${parent ? link("NFR", parent.id, spec) : "—"} |`);
    return {
      fm: {
        title: (n.statement ?? n.id).slice(0, 80),
        description: n.statement ?? "",
        resource: parent ? `../requirements/${parent.id}.md` : "",
        tags: tagsFor(spec, ["nfr", n.kind]),
        id: n.id,
        kind: n.kind ?? "",
        belongs_to: parent?.id ?? "",
        verified_by: n.verified_by ?? "",
      },
      body: L.join("\n"),
    };
  },

  "Source"(spec, s) {
    const citers = [...(spec.requirements ?? []), ...(spec.rules ?? []), ...(spec.calculations ?? [])]
      .filter((n) => (n.provenance ?? []).some((p) => p.source === s.id)).map((n) => n.id);
    const gds = (spec.golden_datasets ?? []).filter((g) => g.source === s.id).map((g) => g.id);
    const chgs = (spec.changes ?? []).filter((c) => (c.triggered_by ?? []).includes(s.id)).map((c) => c.id);
    const cited = [...citers, ...gds, ...chgs].sort();
    const L = [];
    L.push(`## ต้นฉบับ`, "");
    L.push(`| เรื่อง | ค่า |`, `|---|---|`);
    L.push(`| ชนิด | ${dash(s.kind)} |`);
    // only a path under docs/ can be linked from inside the bundle. An absolute or outside path is
    // shown as text: emitting ../../../C:/Users/... would be a link that is broken by construction,
    // and check #8 already reports the real problem (the source is not under docs/).
    const linkable = s.path && s.path.startsWith("docs/");
    L.push(`| ไฟล์ | ${!s.path ? "— (แชท ไม่มีไฟล์)" : linkable ? `[${s.path}](../../../${s.path})` : `\`${esc(s.path)}\` ⚠️ อยู่นอก \`docs/\` จึงลิงก์จาก bundle ไม่ได้`} |`);
    L.push(`| เก็บเมื่อ | ${dash(s.captured_at)} |`);
    L.push(`| เก็บด้วย | \`${dash(s.captured_by)}\` |`);
    L.push(`| hash ตอน import | \`${(s.hash_at_import ?? "—").slice(0, 22)}…\` |`, "");
    if (s.content) L.push(`## เนื้อความ`, "", `> ${esc(s.content)}`, "");
    if (s.extracted?.text) L.push(`## ที่สกัดออกมา (${dash(s.extracted.by)})`, "", `> ${esc(s.extracted.text)}`, "");
    if (s.interpretation) {
      const v = s.interpretation.validation;
      L.push(`## การตีความ`, "");
      L.push(`> ${esc(s.interpretation.transcript ?? "")}`, "");
      L.push(`ตีความโดย \`${dash(s.interpretation.by)}\` · ความมั่นใจ ${dash(s.interpretation.confidence)}`, "");
      if (v) {
        L.push(v.state === "confirmed"
          ? `✅ ลูกค้ายืนยันเมื่อ ${dash(v.at)}`
          : `⚠️ **${v.state}**${v.corrected_to ? ` — แก้เป็น: ${esc(v.corrected_to)}` : ""}${v.question ? ` · ${link("Source", v.question, spec)}` : ""}`, "");
      }
    }
    L.push(`## ใครอ้างถึง`, "");
    for (const id of cited) L.push(`- ${link("Source", id, spec)}`);
    if (!cited.length) L.push(`⚠️ ยังไม่มีโหนดไหนอ้างถึงแหล่งนี้`);
    return {
      fm: {
        title: s.path ? s.path.split("/").pop() : `${s.kind} ${s.id}`,
        description: (s.extracted?.text ?? s.content ?? "").slice(0, 120),
        resource: s.path?.startsWith("docs/") ? `../../../${s.path}` : "",
        tags: tagsFor(spec, ["source", s.kind]),
        id: s.id,
        kind: s.kind ?? "",
        captured_at: s.captured_at ?? "",
        hash_at_import: s.hash_at_import ?? "",
        cited_by: cited,
      },
      body: L.join("\n"),
    };
  },
};

function questionPage(spec, q, type, heading) {
  const L = [];
  L.push(`## ${heading}`, esc(q.question), "");
  L.push(`| เรื่อง | ค่า |`, `|---|---|`);
  L.push(`| สถานะ | ${q.state === "open" ? "🛑 **open** — ยังไม่มีคำตอบ" : `✅ ${q.state}`} |`);
  L.push(`| ตั้งขึ้นจาก | ${link(type, q.raised_by, spec)} |`);
  if (q.category) L.push(`| หมวด | ${dash(q.category)} |`);
  if (q.answer_phase) L.push(`| ตอบตอนไหน | \`/${q.answer_phase}:ask\` |`);
  if (q.blocked_until) L.push(`| ติดอยู่ที่ | \`${esc(q.blocked_until)}\` |`);
  L.push("");
  if (q.answer) L.push(`## คำตอบ`, esc(q.answer), "", `ตอบเมื่อ ${dash(q.answered_at)}`, "");
  if ((q.resulted_in ?? []).length) {
    L.push(`## ผลที่ตามมา`, "");
    for (const r of q.resulted_in) L.push(`- \`${esc(r)}\``);
  }
  return {
    fm: {
      title: (q.question ?? q.id).slice(0, 80),
      description: q.answer ?? q.question ?? "",
      resource: `../rules/${q.raised_by}.md`,
      tags: tagsFor(spec, ["question", q.category].filter(Boolean)),
      id: q.id,
      state: q.state ?? "open",
      raised_by: q.raised_by ?? "",
      answer_phase: q.answer_phase ?? "",
    },
    body: L.join("\n"),
  };
}

const byId = (a, b) => a.id.localeCompare(b.id);

// ── index pages ─────────────────────────────────────────────────────────────
/**
 * DOC-STANDARD §6: an index must carry the column that answers the question people open that
 * directory to ask. A list of filenames is what `ls` already does.
 */
const INDEXES = {
  "requirements": (spec, nodes) => [
    `| requirement | actor | กฎที่ยังใช้ | ยังไม่มีตัวอย่าง |`, `|---|---|---|---|`,
    ...nodes.map(({ node: r }) => {
      const rules = (spec.rules ?? []).filter((x) => x.belongs_to === r.id && x.is_current);
      const naked = rules.filter((x) => !(x.examples ?? []).length).length;
      return `| [${r.id}](${r.id}.md) ${esc(r.title)} | ${esc(dash(r.actor))} | ${rules.length} | ${naked ? `🔴 ${naked}` : "0"} |`;
    }),
  ],
  "rules": (spec) => {
    const bases = [...new Set((spec.rules ?? []).map((r) => r.base_id))].sort();
    return [
      `| base id | ปัจจุบัน | เรื่อง | มีตัวอย่าง | เวอร์ชันทั้งหมด |`, `|---|---|---|---|---|`,
      ...bases.map((b) => {
        const vs = (spec.rules ?? []).filter((r) => r.base_id === b).sort(byId);
        const cur = vs.find((r) => r.is_current);
        const n = (cur?.examples ?? []).length;
        return `| \`${b}\` | ${cur ? `[\`@v${cur.version}\`](${cur.id}.md)` : "🔴 ไม่มี"} | ${esc(cur?.statement ?? "")} | ${n ? `✅ ${n}` : "🔴 0"} | ${vs.map((v) => `[@v${v.version}](${v.id}.md)`).join(" ")} |`;
      }),
    ];
  },
  "calculations": (spec, nodes) => [
    `| สัญญา | ผูกกฎ | ปัดเศษ | เลขเฉลย |`, `|---|---|---|---|`,
    ...nodes.map(({ node: c }) => {
      const gds = (spec.golden_datasets ?? []).filter((g) => (g.proves ?? []).includes(c.id));
      const signed = gds.filter((g) => g.verified_by).length;
      return `| [${c.id}](${c.id}.md)${c.is_current ? " ✅" : ""} | [${c.constrains}](../rules/${c.constrains}.md) | ${dash(c.rounding_mode)} | ${signed ? `✅ ${signed}` : gds.length ? "⚠️ ยังไม่เซ็น" : "🔴 ไม่มี"} |`;
    }),
  ],
  "examples": (spec, nodes) => [
    `| ตัวอย่าง | ชนิด | พิสูจน์กฎ | ผลที่คาด |`, `|---|---|---|---|`,
    ...nodes.map(({ node: e }) =>
      `| [${e.id}](${e.id}.md) | ${dash(e.kind)} | ${(e.proves ?? []).map((p) => `[${p}](../rules/${p}.md)`).join(" ")} | ${esc(e.then)} |`),
  ],
  "golden": (spec, nodes) => [
    `| ชุดเลข | พิสูจน์ | แถว | ใครเซ็น |`, `|---|---|---|---|`,
    ...nodes.map(({ node: g }) =>
      `| [${g.id}](${g.id}.md) | ${(g.proves ?? []).join(" · ")} | ${(g.rows ?? []).length} | ${g.verified_by ? `✅ ${esc(g.verified_by)} ${(g.verified_at ?? "").slice(0, 10)}` : "🔴 ยังไม่มีใครเซ็น"} |`),
  ],
  "changes": (spec, nodes) => [
    `| change set | เมื่อ | ใครขอ | ใครอนุมัติ | กระทบ |`, `|---|---|---|---|---|`,
    ...nodes.map(({ node: c }) =>
      `| [${c.id}](${c.id}.md) | ${dash(c.at)} | ${esc(dash(c.requested_by))} | ${c.approved_by ? esc(c.approved_by) : "🔴 ไม่มี"} | ${(c.affects ?? []).join(" · ") || "—"} |`),
  ],
  "glossary": (spec, nodes) => [
    `| คำ | ชื่อในระบบ | นิยาม | ใช้ที่ |`, `|---|---|---|---|`,
    ...nodes.map(({ node: t }) => {
      const used = (spec.requirements ?? []).filter((r) => (r.domain_concepts ?? []).includes(t.id));
      return `| [${t.id}](${t.id}.md) ${esc(t.term_th)} | ${esc(dash(t.term_en))} | ${esc(t.definition) || "🔴 ไม่มีนิยาม"} | ${used.map((r) => r.id).join(" ") || "⚠️ ไม่มี"} |`;
    }),
  ],
  "questions": (spec, nodes) => [
    `| คำถาม | ชนิด | สถานะ | ตั้งจาก |`, `|---|---|---|---|`,
    ...nodes.map(({ node: q, type }) =>
      `| [${q.id}](${q.id}.md) ${esc(q.question)} | ${type === "Open Question" ? "การ์ดแดง" : "เลื่อนไป"} | ${q.state === "open" ? "🛑 open" : `✅ ${q.state}`} | ${q.raised_by} |`),
  ],
  "nfr": (spec, nodes) => [
    `| NFR | ชนิด | ข้อกำหนด | พิสูจน์ด้วย |`, `|---|---|---|---|`,
    ...nodes.map(({ node: n }) => `| [${n.id}](${n.id}.md) | ${dash(n.kind)} | ${esc(n.statement)} | ${esc(dash(n.verified_by))} |`),
  ],
  "sources": (spec, nodes) => [
    `| แหล่ง | ชนิด | ที่อยู่ | ใครอ้างถึง |`, `|---|---|---|---|`,
    ...nodes.map(({ node: s }) => {
      const cited = [...(spec.requirements ?? []), ...(spec.rules ?? []), ...(spec.calculations ?? [])]
        .filter((n) => (n.provenance ?? []).some((p) => p.source === s.id)).length
        + (spec.golden_datasets ?? []).filter((g) => g.source === s.id).length
        + (spec.changes ?? []).filter((c) => (c.triggered_by ?? []).includes(s.id)).length;
      return `| [${s.id}](${s.id}.md) | ${dash(s.kind)} | ${esc(dash(s.path))} | ${cited || "⚠️ 0"} |`;
    }),
  ],
};

const DIR_TITLES = {
  requirements: "Requirement — ลูกค้าอยากได้อะไร",
  rules: "Business Rule — กฎที่ระบบต้องบังคับ (หนึ่งไฟล์ต่อหนึ่งเวอร์ชัน)",
  calculations: "Calculation Contract — ตัวเลขถูกผลิตยังไง",
  examples: "Example — ใครพิสูจน์กฎข้อไหน",
  golden: "Golden Dataset — เลขเฉลยที่คนยืนยันแล้ว",
  changes: "Change Set — เปลี่ยนอะไร ใครสั่ง เมื่อไหร่",
  glossary: "Glossary — คำที่ตกลงกันแล้ว",
  questions: "Question — สิ่งที่ยังไม่ตัดสิน",
  nfr: "NFR — ข้อกำหนดที่ไม่ใช่ฟังก์ชัน",
  sources: "Source — ต้นฉบับที่ทุกอย่างสาวกลับไปได้",
};

// ── bundle ──────────────────────────────────────────────────────────────────
/**
 * @returns {Map<string, string>} bundle-relative path -> file contents.
 * log.md is NOT in here: it is append-only and the caller creates it only when missing.
 */
export function renderBundle(spec) {
  const stamp = normalizeTimestamp(spec.meta?.updated_at, spec.meta?.created_at);
  const out = new Map();
  const nodes = enumerateNodes(spec);

  for (const n of nodes) {
    const build = PAGES[n.type];
    if (!build) throw new Error(`renderBundle: no page renderer for type "${n.type}"`);
    const { fm, body } = build(spec, n.node);
    const head = renderFrontmatter({
      type: n.type,
      ...fm,
      timestamp: stamp,
      spec_hash: nodeDocHash(spec, n.node),
    });
    out.set(pagePath(n.type, n.id), `${head}\n\n# ${n.id}\n\n${body}\n`);
  }

  // one index per directory that has pages
  const byDir = new Map();
  for (const n of nodes) {
    const d = dirOf(n.type);
    if (!byDir.has(d)) byDir.set(d, []);
    byDir.get(d).push(n);
  }
  for (const [dir, list] of byDir) {
    list.sort((a, b) => a.id.localeCompare(b.id));
    const rows = INDEXES[dir](spec, list);
    out.set(`${dir}/index.md`, [
      `# ${DIR_TITLES[dir]}`,
      "",
      `> สารบัญนี้ถูก generate จาก \`spec.json\` — **ห้ามแก้ด้วยมือ** · ${list.length} หน้า`,
      "",
      ...rows,
      "",
    ].join("\n"));
  }

  out.set("index.md", renderRootIndex(spec, byDir));
  // BUNDLE.md, not CLAUDE.md: this file lands in the CUSTOMER's repo, where Claude Code would load
  // it as instructions on every session. See SCAFFOLD_FILES in doc-frontmatter.mjs.
  out.set("BUNDLE.md", renderBundleContract(spec));
  return out;
}

function renderRootIndex(spec, byDir) {
  const r = spec.rollup ?? {};
  const L = [
    `# ${spec.meta?.module ?? "?"} — requirement bundle`,
    "",
    `> generate จาก \`spec.json\` (schema ${dash(spec.meta?.schema_version)}) — **ห้ามแก้ไฟล์ใดในนี้ด้วยมือ**`,
    `> อยากแก้ข้อความ → แก้ \`spec.json\` แล้วสั่ง \`/req:capture\` ใหม่`,
    "",
    `## คำถามหลักตอบได้ทันทีจากตรงนี้`,
    "",
    `| คำถาม | คำตอบ |`, `|---|---|`,
    `| กฎที่ยังใช้อยู่มีกี่ข้อ | ${dash(r.rules_total)} |`,
    `| กฎที่มีตัวอย่างพิสูจน์ | ${dash(r.rules_with_example)} (${Math.round((r.rule_coverage ?? 0) * 100)}%) |`,
    `| การ์ดแดงที่ยังเปิดอยู่ | ${r.open_questions ? `🛑 ${r.open_questions}` : "0"} |`,
    `| คำถามที่เลื่อนไปเฟสหน้า | ${dash(r.open_deferred)} |`,
    `| ไปต่อเฟสหน้าได้ไหม | ${r.ready_for_next_step ? "✅ ได้" : "🔴 ยัง"} |`,
    "",
    `## หมวด`,
    "",
    `| หมวด | จำนวน | เปิดมาถามอะไร |`, `|---|---|---|`,
  ];
  for (const dir of Object.keys(DIR_TITLES)) {
    if (!byDir.has(dir)) continue;
    L.push(`| [${dir}/](${dir}/index.md) | ${byDir.get(dir).length} | ${DIR_TITLES[dir].split(" — ")[1] ?? ""} |`);
  }
  L.push("", `## ไทม์ไลน์`, "", `[log.md](log.md) — ทุกครั้งที่มีคำสั่งเขียนอะไรลงไป ต่อท้ายอย่างเดียว ไม่เคยถูก generate ทับ`, "");
  return L.join("\n");
}

function renderBundleContract(spec) {
  return [
    `# สัญญาของ bundle นี้ — อ่านก่อนใช้`,
    "",
    `bundle นี้เป็น **render ตัวที่สาม** ของ \`spec.json\` ไม่ใช่ที่เก็บความจริงตัวที่สอง`,
    "",
    `| ชั้น | ที่อยู่ | แก้ได้ไหม |`, `|---|---|---|`,
    `| ความจริง | \`<state-dir>/spec.json\` | ✅ ผ่านคำสั่ง \`/req:*\` เท่านั้น |`,
    `| ต้นฉบับดิบ | \`docs/sources/\` | ❌ ห้ามแก้ (check #8 จับ hash) |`,
    `| render ให้คนอ่าน | \`docs/requirements/REQ-*.md\` | ❌ generate |`,
    `| render ให้ agent อ่าน | \`docs/wiki/**\` (ที่นี่) | ❌ generate |`,
    "",
    `## กติกา`,
    "",
    `1. **ห้ามแก้ไฟล์ในนี้ด้วยมือ** — และจงใจไม่มี marker block "แก้ตรงนี้ได้" เพราะเคยพิสูจน์แล้วว่าสุดท้ายจะมีคนแก้นอก marker แล้ว regenerate กินทิ้งเงียบ ๆ`,
    `2. ทุกหน้ามี \`spec_hash\` — check #12 เทียบกับ \`nodeDocHash\` ที่คำนวณสด หน้าไหนค้างจะแดง ไม่ใช่เงียบ`,
    `3. **หนึ่งโหนด = หนึ่งไฟล์ = หนึ่ง concept** · id คือชื่อไฟล์ · กฎหนึ่งเวอร์ชันหนึ่งไฟล์ ของเก่าไม่เคยถูกทับ`,
    `4. อ้างอิงกฎต้องมี \`@v\` เสมอ — id เปล่าจะเปลี่ยนความหมายเงียบ ๆ เมื่อ current ขยับ · ตัวที่บอกว่าอันไหน current คือ [rules/index.md](rules/index.md) เท่านั้น`,
    `5. ลิงก์ markdown ธรรมดาคือกราฟ traceability ทั้งหมด — ไม่มีรูปแบบพิเศษ เครื่องมืออะไรที่อ่าน markdown เป็นก็เดินได้`,
    "",
    `## เดินกราฟยังไง`,
    "",
    "```",
    `REQ ──belongs_to── BR@v ──constrained_by── CALC@v ──proves── GD`,
    `                    │                                   `,
    `                    ├──proven_by── EX                   `,
    `                    └──affects──── CHG ──triggered_by── SRC`,
    "```",
    "",
    `เริ่มที่ [index.md](index.md) · คำถาม *"กฎข้อไหนยังไม่มีใครพิสูจน์"* ตอบได้จาก [rules/index.md](rules/index.md) คอลัมน์สุดท้าย`,
    "",
  ].join("\n");
}

const LOG_SEED = [
  `# log — ต่อท้ายอย่างเดียว`,
  "",
  `> เอกสารชั้น C · **ไฟล์นี้ไม่เคยถูก generate ทับ** คำสั่งจะต่อบรรทัดใหม่ไว้บนสุดของตาราง`,
  `> สิ่งที่ต้องจดแม้ไม่มีอะไรเปลี่ยน: การตัดสินใจที่เลื่อนออกไป · คำถามที่ยังไม่ตอบ · การแจ้งเตือนที่ผู้ใช้ข้าม`,
  "",
  `| เมื่อ | คำสั่ง | เข้ามา | ผล |`,
  `|---|---|---|---|`,
  "",
].join("\n");

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1]?.replace(/\\/g, "/").endsWith("wiki.mjs")) {
  const { values, flags, positional } = orExit2(() => parseArgs(process.argv.slice(2)));
  if (positional.length) {
    console.error(`CONFIG-ERROR unexpected argument "${positional[0]}" — pass a file as --spec <path>`);
    process.exit(2);
  }
  const ROOT = resolve(values["--root"] ?? ".");
  const { specPath } = orExit2(() => resolveSpecPath({ root: ROOT, values }));
  const OUT = join(ROOT, values["--out"] ?? WIKI_DIR);
  const WRITE = flags.has("--write");

  let spec;
  try {
    spec = JSON.parse(readFileSync(specPath, "utf8"));
  } catch (e) {
    console.error(`PARSE-ERROR ${specPath}: ${e.message}`);
    process.exit(2);
  }

  let bundle;
  try {
    bundle = renderBundle(spec);
  } catch (e) {
    console.error(`RENDER-ERROR ${e.message}`);
    process.exit(2);
  }

  const drift = [];
  for (const [rel, content] of bundle) {
    const abs = join(OUT, rel);
    if (!existsSync(abs)) drift.push(["missing", rel]);
    else if (readFileSync(abs, "utf8").replace(/\r\n/g, "\n") !== content) drift.push(["stale", rel]);
  }
  // orphans: files the renderer would never produce. Scaffolding is exempt by definition.
  const onDisk = existsSync(OUT) ? walk(OUT, OUT) : [];
  for (const rel of onDisk) {
    if (!bundle.has(rel) && rel !== "log.md") drift.push(["orphan", rel]);
  }

  console.log(`wiki — ${specPath}`);
  console.log(`out:  ${OUT}`);
  console.log(`pages ${bundle.size} · module ${dash(spec.meta?.module)} · schema ${dash(spec.meta?.schema_version)}`);
  console.log("");

  if (!drift.length) {
    console.log(`bundle already matches spec — nothing to write`);
    process.exit(0);
  }
  for (const [kind, rel] of drift) console.log(`${kind.toUpperCase().padEnd(8)} ${rel}`);

  if (!WRITE) {
    console.log("");
    console.log(`${drift.length} page(s) out of date — rerun with --write to regenerate`);
    process.exit(1);
  }

  // Only the pages that actually drifted are written. A page whose bytes already match is left
  // untouched — that is what makes capture.md's freeze rule ("never regenerate the pages of a frozen
  // REQ") true by construction instead of by a flag someone has to remember to pass: a frozen REQ's
  // nodes do not move, so its pages do not drift, so nothing rewrites them.
  const written = drift.filter(([k]) => k !== "orphan");
  for (const [, rel] of written) {
    const abs = join(OUT, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, bundle.get(rel), "utf8");
  }
  const logPath = join(OUT, "log.md");
  if (!existsSync(logPath)) writeFileSync(logPath, LOG_SEED, "utf8"); // append-only: seed once, never rewrite
  const orphans = drift.filter(([k]) => k === "orphan");
  console.log("");
  console.log(`wrote ${written.length} page(s) to ${OUT}`);
  if (orphans.length) {
    console.log(`${orphans.length} orphan file(s) left in place on purpose — deleting a page is a decision, not a side effect of rendering:`);
    for (const [, rel] of orphans) console.log(`         ${rel}`);
  }
  process.exit(0);
}

function walk(dir, base) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) out.push(...walk(abs, base));
    else if (name.endsWith(".md")) out.push(abs.slice(base.length + 1).replace(/\\/g, "/"));
  }
  return out;
}
