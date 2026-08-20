#!/usr/bin/env node
/**
 * state-dir.mjs — the ONE definition, for THIS plugin, of (a) where the state directory lives
 * and (b) how argv is parsed.
 *
 * WHY THIS FILE IS A SECOND COPY, AND WHY THAT IS THE RIGHT CALL
 *
 * `plugins/req/scripts/state-dir.mjs` already exists and says the same thing. Duplication is
 * normally the exact failure this repo's doctrine forbids (one fact, one home). It is accepted
 * here for a reason that is structural, not stylistic:
 *
 *   A plugin is installed on its own. At runtime `${CLAUDE_PLUGIN_ROOT}` resolves to THIS
 *   plugin's directory, and there is no supported path from here to another plugin's scripts —
 *   a user may install `design` without `req` at all. An import across plugins would be a
 *   dependency the marketplace does not offer, and it would fail at the customer's machine
 *   rather than here.
 *
 * So the shared fact is deliberately NOT this code. The shared fact is the RESOLUTION PROTOCOL
 * below, which both plugins implement identically:
 *
 *   1. --spec <path>        explicit file, ends the discussion
 *   2. --state-dir <name>   this run only
 *   3. $AEON_STATE_DIR      this shell / this project
 *   4. ".aeon"              default
 *
 * The env var is the actual contract between plugins. Two implementations of one protocol is a
 * different thing from two copies of one fact: if `req` and `design` ever disagree about where
 * `.aeon` is, they disagree about $AEON_STATE_DIR, and that is visible from either side.
 *
 * There is deliberately no auto-detection ("find the folder that has a spec.json"). A location
 * that changes as files appear on disk is precisely the drift this doctrine exists to prevent.
 * Missing target -> exit 2 naming the path it looked for. Never a guess.
 *
 * Usage as CLI:  node state-dir.mjs [--root <dir>] [--state-dir <name>] [--path|--design-dir]
 *                prints the resolved directory NAME (default), the full spec.json path (--path),
 *                or this plugin's own state subdirectory (--design-dir), for callers that cannot
 *                import JS.
 */
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The default, written exactly once in this plugin. Everything else calls resolveStateDir(). */
export const DEFAULT_STATE_DIR = ".aeon";
export const ENV_VAR = "AEON_STATE_DIR";

/** This plugin's own subdirectory inside the state directory (spec §5.1). */
export const DESIGN_SUBDIR = "design";

/** The state file this plugin owns. No other plugin may write it (spec §5.4 W1). */
export const STATE_FILE = "design.state.json";

/** Flags that consume the next token as their value. */
const VALUE_FLAGS = new Set(["--root", "--state-dir", "--spec"]);

/**
 * The ONE argv parser for this plugin's scripts.
 *
 * Consuming a flag's value BY INDEX is the point: a parser that filters the value out by
 * comparing against `argv[rootIdx + 1]` resolves to `argv[0]` when --root is absent, so a lone
 * positional argument silently deletes itself. One parser, one place for that bug to not exist.
 */
export function parseArgs(argv) {
  const values = Object.create(null);
  const flags = new Set();
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (VALUE_FLAGS.has(a)) {
      if (i + 1 >= argv.length) throw new Error(`${a} needs a value`);
      values[a] = argv[++i];
    } else if (a.startsWith("--")) {
      flags.add(a);
    } else {
      positional.push(a);
    }
  }
  return { values, flags, positional };
}

/** Resolve the state directory NAME (not a path) by the declared order above. */
export function resolveStateDir({ values = {}, env = process.env } = {}) {
  const fromFlag = values["--state-dir"];
  if (fromFlag) return fromFlag;
  const fromEnv = env[ENV_VAR];
  if (fromEnv) return fromEnv;
  return DEFAULT_STATE_DIR;
}

/** Absolute path of the state directory. */
export function stateDirPath({ root = ".", values = {}, env = process.env } = {}) {
  return resolve(root, resolveStateDir({ values, env }));
}

/** Absolute path of req's spec.json — the file this plugin READS but never writes. */
export function specPath({ root = ".", values = {}, env = process.env } = {}) {
  if (values["--spec"]) return resolve(values["--spec"]);
  return join(stateDirPath({ root, values, env }), "spec.json");
}

/** Absolute path of this plugin's own state subdirectory. */
export function designDirPath({ root = ".", values = {}, env = process.env } = {}) {
  return join(stateDirPath({ root, values, env }), DESIGN_SUBDIR);
}

/** Absolute path of design.state.json. */
export function statePath({ root = ".", values = {}, env = process.env } = {}) {
  return join(designDirPath({ root, values, env }), STATE_FILE);
}

/**
 * Exit 2 naming the path we looked for. Exit 2 means "cannot run", distinct from exit 1
 * ("ran, found problems") — a caller must be able to tell a missing input from a failing check.
 */
export function orExit2(message) {
  console.error(message);
  process.exit(2);
}

// ── CLI ─────────────────────────────────────────────────────────────────────────
// Compare resolved paths rather than URL strings: a Windows argv path and a file:// URL differ
// in separator and drive-letter case, so string equality is wrong on the platform this repo runs on.
const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  const { values, flags } = parseArgs(process.argv.slice(2));
  const root = values["--root"] ?? ".";
  if (flags.has("--path")) console.log(specPath({ root, values }));
  else if (flags.has("--design-dir")) console.log(designDirPath({ root, values }));
  else console.log(resolveStateDir({ values }));
}
