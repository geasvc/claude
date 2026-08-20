#!/usr/bin/env node
/**
 * CALC-job-001@v1 — answer key generator for BR-job-016@v1 (total = base_fee + surcharge).
 *
 * The filename carries @v on purpose. A contract version is frozen once numbers have gone out under
 * it, so the script that produced those numbers must be frozen too — @v2 gets its own file rather
 * than overwriting this one, exactly like BR-job-011@v1 stays readable after @v2 exists.
 *
 * Kept in the state directory, not thrown away after one run, because a number nobody can
 * re-derive is a number nobody can defend six months later. Re-run it any time:
 *
 *     node <state-dir>/golden/CALC-job-001@v1.mjs
 *
 * Contract implemented here, field by field — if this file and CALC-job-001 ever disagree,
 * the file is wrong:
 *   numeric_type     decimal   → integer satang throughout, never a float baht
 *   rounding_mode    HALF_UP
 *   rounding_points  every money value, not once at the end
 *   surcharge bands  <=40 → 0 · 41-50 → 120 · 51-60 → 150
 */

/** HALF_UP to 2 decimals, done in integer satang so 0.1 is exact. */
const toSatang = (baht) => {
  const scaled = baht * 100;
  const floor = Math.floor(scaled);
  return scaled - floor >= 0.5 ? floor + 1 : floor;
};
const toBaht = (satang) => (satang / 100).toFixed(2);

/** boundary_behavior: 0 km is 0 surcharge, not an error. Above 60 has no agreed band yet. */
function surchargeSatang(distanceKm) {
  if (distanceKm < 0) throw new Error(`negative distance: ${distanceKm}`);
  if (distanceKm <= 40) return toSatang(0);
  if (distanceKm <= 50) return toSatang(120);
  if (distanceKm <= 60) return toSatang(150);
  throw new Error(`distance ${distanceKm} km is above the agreed bands — ask the owner before computing`);
}

export function total(baseFeeBaht, distanceKm) {
  const base = toSatang(baseFeeBaht);
  const sur = surchargeSatang(distanceKm);
  return { base_fee: toBaht(base), surcharge: toBaht(sur), total: toBaht(base + sur) };
}

// Three cases carried over from the customer's own extract (SRC-004) so our answers can be diffed
// against numbers they already believe, plus the band edges nobody thinks to check by hand.
const CASES = [
  { base_fee: 300, distance_km: 12, from_source_row: "SRC-004 row J-1001" },
  { base_fee: 300, distance_km: 48, from_source_row: "SRC-004 row J-1002" },
  { base_fee: 300, distance_km: 51, from_source_row: "SRC-004 row J-1003" },
  { base_fee: 300, distance_km: 40, note: "ขอบบนของช่วงไม่มีส่วนเพิ่ม" },
  { base_fee: 300, distance_km: 41, note: "ขอบล่างของช่วง 41-50" },
  { base_fee: 300, distance_km: 60, note: "ขอบบนของช่วงที่ตกลงไว้" },
  { base_fee: 0, distance_km: 45, note: "boundary_behavior: base_fee = 0 ต้องไม่ถูกปฏิเสธ" },
];

if (process.argv[1]?.endsWith("CALC-job-001@v1.mjs")) {
  const rows = CASES.map((c) => {
    const r = total(c.base_fee, c.distance_km);
    return {
      input: { base_fee: c.base_fee, distance_km: c.distance_km },
      expected: { surcharge: r.surcharge, total: r.total },
      ...(c.from_source_row ? { from_source_row: c.from_source_row } : {}),
      ...(c.note ? { note: c.note } : {}),
    };
  });
  console.log(JSON.stringify(rows, null, 2));
}
