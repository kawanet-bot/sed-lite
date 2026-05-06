// Test entry for `make test-shim`. Each `await import()` is its own
// task: the imported module's top-level `it()` calls schedule a
// microtask, which drains before the next iteration's import begins.
// The shim resets its bucket state at end-of-drain so each file's
// suites are exercised cleanly.
//
// argv layout from the Makefile target:
//   process.argv[0] = node
//   process.argv[1] = .../builder/run-shim.ts (this file)
//   process.argv[2..] = test/*.test.ts (paths relative to cwd, which
//                       the Makefile sets to the repo root via `cd ..`)

import {pathToFileURL} from "node:url";
import {resolve} from "node:path";

for (const f of process.argv.slice(2)) {
    await import(pathToFileURL(resolve(f)).href);
}
