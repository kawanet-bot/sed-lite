// Module resolution hook (Node 20.6+ module.register API). Aliases
// the `node:test` / `node:assert` / `node:assert/strict` specifiers
// to the local browser-side shim files so that the same test sources
// that real `node --test` consumes can also be exercised through the
// shims. Only the test-shim path uses this; real `node --test` is
// untouched.

import {dirname, resolve as joinPath} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ALIAS: Record<string, string> = {
    "node:test": joinPath(here, "node-test.shim.ts"),
    "node:assert": joinPath(here, "node-assert.shim.ts"),
    "node:assert/strict": joinPath(here, "node-assert.shim.ts"),
};

// `nextResolve` is the next hook in the chain (or Node's default
// resolver). We forward to it with the rewritten file URL when the
// specifier is one of the three aliased names.
export const resolve = (
    specifier: string,
    context: unknown,
    nextResolve: (s: string, c: unknown) => unknown,
): unknown => {
    const target = ALIAS[specifier];
    if (target) return nextResolve(pathToFileURL(target).href, context);
    return nextResolve(specifier, context);
};
