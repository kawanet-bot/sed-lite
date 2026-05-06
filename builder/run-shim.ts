// Test entry for `make test-shim`. Registers a same-thread resolve
// hook via `module.registerHooks()` so that `node:test` /
// `node:assert` / `node:assert/strict` resolve to the local
// browser-side shim files, then `await import()`s each test file
// listed in argv.
//
// Why `registerHooks()` and not `register()`: registerHooks accepts
// hook callbacks directly and runs them on the main thread, so the
// hook can live in this same file. `register()` would force a
// separate hook module loaded in a worker thread (a string
// specifier is the only API). The whole runner collapses to one
// file at the cost of pinning to Node ≥22.15 — which we already
// require anyway for strip-only TypeScript (>=22.18) on the test
// path. Stability tag is `1.2 - Release candidate`, but the API has
// been frozen across v22/v23/v24/v25/v26 majors with no breaking
// change, so it is effectively stable.
//
// Why dynamic imports per argv entry: `node script.js a b c` only
// loads `script.js`; `a` / `b` / `c` are exposed on `process.argv`
// but never evaluated. So we walk argv and import each test file
// ourselves. Each `await` is its own task, and the shim resets its
// bucket state at end-of-drain → every file gets a clean cycle.
//
// argv layout from the Makefile target:
//   process.argv[0] = node
//   process.argv[1] = .../builder/run-shim.ts (this file)
//   process.argv[2..] = test/*.test.ts (paths relative to cwd, which
//                       the Makefile sets to the repo root via `cd ..`)

import {registerHooks} from "node:module";
import {dirname, resolve as joinPath} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ALIAS: Record<string, string> = {
    "node:test": joinPath(here, "node-test.shim.ts"),
    "node:assert": joinPath(here, "node-assert.shim.ts"),
    "node:assert/strict": joinPath(here, "node-assert.shim.ts"),
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        const target = ALIAS[specifier];
        if (target) return nextResolve(pathToFileURL(target).href, context);
        return nextResolve(specifier, context);
    },
});

for (const f of process.argv.slice(2)) {
    await import(pathToFileURL(joinPath(process.cwd(), f)).href);
}
