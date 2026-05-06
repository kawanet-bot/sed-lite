// Test entry for `make test-shim`. Registers the resolve hook
// (`shim-hooks.ts`) via `module.register()` so that `node:test` /
// `node:assert` / `node:assert/strict` resolve to the local
// browser-side shim files, then `await import()`s each test file
// listed in argv.
//
// Why a single file (no `--import=loader.ts`): `register()` only
// has to be active before the imports we care about happen. Static
// imports at the top of this file are bound to real `node:*`
// builtins (we don't import `node:test` here), and the test files
// are loaded via dynamic `import()` *after* `register()` runs — by
// then the hook is in place and `node:test` / `node:assert` in the
// test sources route to the shims.
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

import {register} from "node:module";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";

register("./shim-hooks.ts", import.meta.url);

for (const f of process.argv.slice(2)) {
    await import(pathToFileURL(resolve(f)).href);
}
