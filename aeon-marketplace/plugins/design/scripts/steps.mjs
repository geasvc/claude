/**
 * steps.mjs — the ONE catalogue of Phase 2 steps, their prerequisites, and their KIND.
 *
 * WHY `kind` EXISTS (this was a real bug, found by asking whether exit 0 is reachable)
 *
 * The first version treated all fourteen commands as one list of things to finish. Four of them
 * are not things you finish:
 *
 *   status  — read-only. It reports. Nothing marks it done, and marking it done is meaningless.
 *   check   — read-only validation. You re-run it after every change; it never becomes past tense.
 *   trace   — read-only query. Asked whenever someone has a question.
 *   change  — event-driven. It runs when `req` sends a change-set, which may be never, or weekly.
 *
 * Leaving them in the milestone list made `status` permanently report WORK REMAINS on a project
 * where every artifact-producing step was done, and — worse — name `/design:change` as the next
 * command when there was nothing to change. Exit 0 was unreachable, so the agent loop could never
 * terminate. The `status-done` fixture hid it by force-marking every step done, including `status`
 * itself: a fixture asserting a state the real system cannot reach.
 *
 * `milestone` steps gate exit 0. The others are always available and never block completion.
 *
 * This catalogue lives in its own module because init.mjs runs main() on load — importing it to
 * borrow the list would execute the command.
 */

/** Steps that must reach `done` before Phase 2 is complete. Order is the recommended run order. */
export const STEPS = [
  { id: "init", command: "/design:init", requires: [], kind: "milestone" },
  { id: "overview", command: "/design:overview", requires: ["init"], kind: "milestone" },
  { id: "function", command: "/design:function", requires: ["overview"], kind: "milestone" },
  { id: "nfr", command: "/design:nfr", requires: ["function"], kind: "milestone" },
  { id: "datamodel", command: "/design:datamodel", requires: ["function"], kind: "milestone" },
  { id: "interface", command: "/design:interface", requires: ["function", "datamodel"], kind: "milestone" },
  // §13.4: rbac AFTER function+datamodel and BEFORE sitemap, so no screen can exist unbound.
  { id: "rbac", command: "/design:rbac", requires: ["function", "datamodel"], kind: "milestone" },
  { id: "sitemap", command: "/design:sitemap", requires: ["function", "rbac"], kind: "milestone" },
  { id: "scenario", command: "/design:scenario", requires: ["function", "nfr", "datamodel", "sitemap"], kind: "milestone" },
  { id: "export", command: "/design:export", requires: ["scenario", "sitemap", "interface", "nfr", "rbac"], kind: "milestone" },

  // `requires` on a non-milestone step is INERT today: these four never appear in the READY /
  // WAITING / BLOCKED lists, so nothing reads it. It is kept truthful anyway — the day a command
  // refuses to answer a trace query before the graph exists, the rule is already written down here.
  { id: "status", command: "/design:status", requires: ["init"], kind: "diagnostic" },
  { id: "check", command: "/design:check", requires: ["init"], kind: "diagnostic" },
  { id: "trace", command: "/design:trace", requires: ["scenario"], kind: "diagnostic" },
  { id: "change", command: "/design:change", requires: ["init"], kind: "on-demand" },
];

export const KIND_BY_ID = new Map(STEPS.map((s) => [s.id, s.kind]));

/**
 * Kind for a step read off disk. A state file written before `kind` existed has none, so fall back
 * to this catalogue rather than defaulting to "milestone" — defaulting would resurrect the bug for
 * every project that ran /design:init before today.
 */
export function kindOf(step) {
  return step.kind ?? KIND_BY_ID.get(step.id) ?? "milestone";
}

/** Only these gate completion. */
export const gatesCompletion = (step) => kindOf(step) === "milestone";
