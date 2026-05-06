// Test entry for `make test-shim` — parallels `browser/tests.html`.
// Aliases node:test / node:assert to the local shims via
// module.registerHooks() (same-thread, single-file), then dynamic-
// imports each test file in argv. Dynamic import is required
// because Node only evaluates the entry script — extra positionals
// land in process.argv unused — and each `await` boundary lets the
// shim drain state cleanly between files.

import {registerHooks} from "node:module";
import {dirname, resolve as joinPath} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ALIAS: Record<string, string> = {
    "node:test": joinPath(here, "node-test.shim.ts"),
    "node:assert": joinPath(here, "node-assert.shim.ts"),
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
