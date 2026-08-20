#!/usr/bin/env node
/**
 * state-dir.mjs — the ONE definition of (a) where spec.json lives and (b) how argv is parsed.
 *
 * WHY THIS FILE EXISTS
 *
 * The state directory name is a PARAMETER, not a constant. `.aeon` is only the default: a project
 * may rename it, and the marketplace itself may be renamed later. Before this module the string
 * ".aeon/spec.json" was typed into three scripts, five commands, three skill references and the
 * user guide — a rename meant a repo-wide find-and-replace, which is exactly the class of change
 * that gets done 95% and then rots.
 *
 * Resolution order — ALL DECLARED, NOTHING DISCOVERED (top wins):
 *   1. --spec <path>        explicit file, ends the discussion
 *   2. --state-dir <name>   this run only
 *   3. $AEON_STATE_DIR      this shell / this project
 *   4. ".aeon"              default
 *
 * There is deliberately no auto-detection ("find the folder that has a spec.json"). A resolved
 * location that changes as files appear on disk is the drift this repo's whole doctrine exists to
 * prevent: rename `.aeon` to `.foo` while a stale `.aeon/spec.json` is still lying around, and
 * auto-detection would silently read the wrong file. Missing file -> exit 2 naming the path it
 * looked for. Never a guess.
 *
 * Usage as CLI:  node state-dir.mjs [--root <dir>] [--state-dir <name>] [--path]
 *                prints the resolved directory NAME (default) or the full spec.json path (--path)
 *                for callers that cannot import JS — the ajv line in /req:check, and /req:capture
 *                which has to tell the model which directory to write into.
 */
import { resolve, join } from "node:path";

/** The default, written exactly once in this repo. Everything else calls resolveStateDir(). */
export const DEFAULT_STATE_DIR = ".aeon";
export const ENV_VAR = "AEON_STATE_DIR";

/** Flags that consume the next token as their value. */
const VALUE_FLAGS = new Set(["--root", "--state-dir", "--spec"]);

/**
 * The ONE argv parser for this plugin's scripts.
 *
 * Consuming a flag's value BY INDEX is the point. The previous per-script parsers filtered the
 * value out by comparing against `argv[rootIdx + 1]`, which resolves to `argv[0]` when --root is
 * absent — so a lone positional argument silently deleted itself and the script fell back to the
 * default path. One parser, one place for that bug to not exist.
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

/**
 * Resolve the state directory NAME plus which channel declared it.
 * Throws on a name that is not a name — the caller turns that into exit 2.
 */
export function resolveStateDir({ values = {}, env = process.env } = {}) {
  const fromFlag = values["--state-dir"];
  const fromEnv = env[ENV_VAR];
  const raw = fromFlag ?? fromEnv ?? DEFAULT_STATE_DIR;
  const source = fromFlag != null ? "--state-dir" : fromEnv != null ? `$${ENV_VAR}` : "default";
  const name = String(raw).trim();

  if (name === "") throw new Error(`state dir from ${source} is empty`);
  if (/[\\/]/.test(name)) throw new Error(`state dir from ${source} is "${name}" — expected a NAME, not a path`);
  if (name === "." || name === "..") throw new Error(`state dir from ${source} is "${name}" — not a usable directory name`);

  return { name, source };
}

/**
 * Resolve the absolute path of spec.json for a run.
 * `--spec <path>` short-circuits everything; otherwise <root>/<state-dir>/spec.json.
 */
export function resolveSpecPath({ root = ".", values = {}, env = process.env } = {}) {
  const explicit = values["--spec"];
  if (explicit != null) {
    if (String(explicit).trim() === "") throw new Error("--spec is empty");
    return { specPath: resolve(explicit), stateDir: null, source: "--spec" };
  }
  const { name, source } = resolveStateDir({ values, env });
  return { specPath: resolve(join(root, name, "spec.json")), stateDir: name, source };
}

/** Shared exit-2 wrapper so all three scripts report a bad configuration identically. */
export function orExit2(fn) {
  try {
    return fn();
  } catch (e) {
    console.error(`CONFIG-ERROR ${e.message}`);
    process.exit(2);
  }
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1]?.endsWith("state-dir.mjs")) {
  const { values, flags } = orExit2(() => parseArgs(process.argv.slice(2)));
  const ROOT = resolve(values["--root"] ?? ".");
  if (flags.has("--path")) {
    console.log(orExit2(() => resolveSpecPath({ root: ROOT, values })).specPath);
  } else {
    console.log(orExit2(() => resolveStateDir({ values })).name);
  }
}
